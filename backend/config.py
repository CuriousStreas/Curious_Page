from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Mapping


def _bounded_int(raw: str | None, default: int, minimum: int, maximum: int) -> int:
    try:
        value = int(raw) if raw is not None else default
    except (TypeError, ValueError):
        value = default
    return max(minimum, min(value, maximum))


@dataclass(frozen=True)
class Settings:
    api_key: str
    base_url: str
    model: str
    allowed_origins: tuple[str, ...]
    max_tokens: int
    read_timeout: int
    stream_total_timeout: int
    max_stream_chunks: int
    port: int
    trusted_proxy_count: int

    @property
    def chat_url(self) -> str:
        return f"{self.base_url}/chat/completions"

    @classmethod
    def from_env(cls, env: Mapping[str, str] | None = None) -> "Settings":
        values = os.environ if env is None else env
        origins = values.get(
            "ALLOWED_ORIGINS",
            "http://127.0.0.1:4173,http://localhost:4173",
        )
        return cls(
            api_key=values.get("DEEPSEEK_API_KEY", "").strip(),
            base_url=(values.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com") or "https://api.deepseek.com").strip().rstrip("/"),
            model=(values.get("DEEPSEEK_MODEL", "deepseek-v4-flash") or "deepseek-v4-flash").strip(),
            allowed_origins=tuple(origin.strip().rstrip("/") for origin in origins.split(",") if origin.strip()),
            max_tokens=_bounded_int(values.get("DEEPSEEK_MAX_TOKENS"), 1000, 100, 2000),
            read_timeout=_bounded_int(values.get("DEEPSEEK_READ_TIMEOUT"), 60, 5, 120),
            stream_total_timeout=_bounded_int(values.get("DEEPSEEK_STREAM_TOTAL_TIMEOUT"), 60, 10, 240),
            max_stream_chunks=_bounded_int(values.get("DEEPSEEK_MAX_STREAM_CHUNKS"), 400, 50, 1000),
            port=_bounded_int(values.get("PORT"), 5000, 1, 65535),
            trusted_proxy_count=_bounded_int(values.get("TRUSTED_PROXY_COUNT"), 0, 0, 5),
        )