from __future__ import annotations

import json
import time
from collections.abc import Iterable, Iterator, Sequence
from pathlib import Path
from typing import Any

import requests

from .config import Settings


UNKNOWN_ANSWER = "这项信息未收录在公开简历资料中，你可以通过主页公开联系方式向本人确认。"


class UpstreamError(RuntimeError):
    pass


class UpstreamUnavailableError(UpstreamError):
    pass


class UpstreamRateLimitError(UpstreamError):
    pass


class UpstreamProtocolError(UpstreamError):
    pass


class UpstreamTimeoutError(UpstreamError):
    """Stream exceeded total wall-clock time or output limit."""


_BASE_PROFILE = """\
- 姓名：沈皓褀（CuriousTrea / thuwa）
- 27 届计算机硕士，浙江工业大学
- 方向：AI + 工程
- GitHub：CuriousStreas
- 主页：curioustrea.fun"""


def _load_prompt_template() -> str:
    prompt_path = Path(__file__).resolve().parent.parent / "prompt.txt"
    return prompt_path.read_text(encoding="utf-8")


def build_messages(
    history: Sequence[dict[str, str]],
    excerpts: Sequence[str],
    *,
    max_messages: int = 10,
) -> list[dict[str, str]]:
    safe_history = [
        {"role": message["role"], "content": message["content"]}
        for message in history
        if message.get("role") in {"user", "assistant"}
        and isinstance(message.get("content"), str)
    ][-max_messages:]
    context = "\n\n".join(excerpts) if excerpts else "(本次没有匹配到具体经历条目，仅凭基础画像回答。)"

    prompt_template = _load_prompt_template()
    system_prompt = prompt_template.format(base_profile=_BASE_PROFILE, context=context)
    return [{"role": "system", "content": system_prompt}, *safe_history]


class DeepSeekClient:
    def __init__(self, settings: Settings, *, session: Any | None = None) -> None:
        self.settings = settings
        self.session = session or requests.Session()

    def stream(self, messages: Iterable[dict[str, str]]) -> Iterator[str]:
        try:
            response = self.session.post(
                self.settings.chat_url,
                headers={
                    "Authorization": f"Bearer {self.settings.api_key}",
                    "Content-Type": "application/json",
                    "Accept": "text/event-stream",
                },
                json={
                    "model": self.settings.model,
                    "messages": list(messages),
                    "stream": True,
                    "max_tokens": self.settings.max_tokens,
                },
                stream=True,
                timeout=(5, self.settings.read_timeout),
            )
            if response.status_code == 429:
                raise UpstreamRateLimitError("DeepSeek request was rate limited")
            response.raise_for_status()
        except UpstreamError:
            raise
        except Exception as error:
            raise UpstreamUnavailableError("DeepSeek request failed") from error

        started_at = time.monotonic()
        chunk_count = 0
        try:
            saw_done = False
            for line in response.iter_lines(decode_unicode=True):
                elapsed = time.monotonic() - started_at
                if elapsed > self.settings.stream_total_timeout:
                    raise UpstreamTimeoutError("Stream exceeded total time limit")
                if chunk_count >= self.settings.max_stream_chunks:
                    raise UpstreamTimeoutError("Stream exceeded output chunk limit")
                if not line or not line.startswith("data: "):
                    continue
                payload = line[6:]
                if payload.strip() == "[DONE]":
                    saw_done = True
                    break
                try:
                    data = json.loads(payload)
                    choice = (data.get("choices") or [{}])[0]
                    content = (choice.get("delta") or {}).get("content", "")
                except (AttributeError, IndexError, TypeError, json.JSONDecodeError) as error:
                    raise UpstreamProtocolError("DeepSeek stream payload was invalid") from error
                if content:
                    chunk_count += 1
                    yield content
            if not saw_done:
                raise UpstreamProtocolError("DeepSeek stream ended before completion")
        except UpstreamProtocolError:
            raise
        except UpstreamTimeoutError:
            raise
        except Exception as error:
            raise UpstreamUnavailableError("DeepSeek stream was interrupted") from error
        finally:
            response.close()