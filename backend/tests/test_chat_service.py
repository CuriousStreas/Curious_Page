from __future__ import annotations

import unittest

from backend.chat_service import (
    DeepSeekClient,
    UpstreamProtocolError,
    UpstreamRateLimitError,
    UpstreamUnavailableError,
    build_messages,
)
from backend.config import Settings


class FakeResponse:
    def __init__(self, lines, *, ok=True, status_code=200) -> None:
        self.lines = lines
        self.ok = ok
        self.status_code = status_code

    def iter_lines(self, decode_unicode=True):
        return iter(self.lines)

    def raise_for_status(self) -> None:
        if not self.ok:
            raise RuntimeError(f"HTTP {self.status_code}: private upstream body")

    def close(self) -> None:
        pass


class FakeSession:
    def __init__(self, response=None, error=None) -> None:
        self.response = response
        self.error = error
        self.calls = []

    def post(self, url, **kwargs):
        self.calls.append((url, kwargs))
        if self.error:
            raise self.error
        return self.response


class ChatServiceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.settings = Settings.from_env({"DEEPSEEK_API_KEY": "server-secret"})

    def test_build_messages_uses_server_prompt_and_bounded_history(self) -> None:
        history = [
            {"role": "system", "content": "browser system text"},
            *(
                {"role": "user" if index % 2 == 0 else "assistant", "content": str(index)}
                for index in range(12)
            ),
        ]

        messages = build_messages(history, ["### 项目\n- verified excerpt"], max_messages=10)

        self.assertEqual(messages[0]["role"], "system")
        self.assertIn("verified excerpt", messages[0]["content"])
        self.assertNotIn("browser system text", str(messages))
        self.assertEqual(len(messages), 11)
        self.assertEqual(messages[1]["content"], "2")

    def test_build_messages_includes_base_profile_when_no_excerpts(self) -> None:
        messages = build_messages([{"role": "user", "content": "他是谁"}], [])

        self.assertEqual(messages[0]["role"], "system")
        self.assertIn("沈皓褀", messages[0]["content"])
        self.assertIn("浙江工业大学", messages[0]["content"])
        self.assertIn("基础画像", messages[0]["content"])

    def test_stream_parses_deepseek_deltas_and_done_marker(self) -> None:
        response = FakeResponse(
            [
                'data: {"model":"deepseek-v4-flash","choices":[{"delta":{"content":"GM"}}]}',
                'data: {"choices":[{"delta":{"content":" 工具"}}]}',
                "data: [DONE]",
            ]
        )
        session = FakeSession(response)
        client = DeepSeekClient(self.settings, session=session)

        result = list(client.stream([{"role": "user", "content": "介绍项目"}]))

        self.assertEqual(result, ["GM", " 工具"])
        url, request = session.calls[0]
        self.assertEqual(url, "https://api.deepseek.com/chat/completions")
        self.assertEqual(request["headers"]["Authorization"], "Bearer server-secret")
        self.assertEqual(request["json"]["model"], "deepseek-v4-flash")
        self.assertTrue(request["json"]["stream"])
        self.assertEqual(request["json"]["max_tokens"], 1000)

    def test_stream_rejects_malformed_upstream_json(self) -> None:
        client = DeepSeekClient(
            self.settings,
            session=FakeSession(FakeResponse(["data: not-json"])),
        )

        with self.assertRaises(UpstreamProtocolError):
            list(client.stream([{"role": "user", "content": "项目"}]))

    def test_stream_rejects_eof_before_done_marker(self) -> None:
        client = DeepSeekClient(
            self.settings,
            session=FakeSession(
                FakeResponse(['data: {"choices":[{"delta":{"content":"partial"}}]}'])
            ),
        )

        with self.assertRaises(UpstreamProtocolError):
            list(client.stream([{"role": "user", "content": "项目"}]))

    def test_stream_maps_upstream_429_to_rate_limit_error(self) -> None:
        client = DeepSeekClient(
            self.settings,
            session=FakeSession(FakeResponse([], ok=False, status_code=429)),
        )

        with self.assertRaises(UpstreamRateLimitError):
            list(client.stream([{"role": "user", "content": "项目"}]))

    def test_stream_normalizes_request_failure(self) -> None:
        client = DeepSeekClient(
            self.settings,
            session=FakeSession(error=OSError("private network detail")),
        )

        with self.assertRaises(UpstreamUnavailableError):
            list(client.stream([{"role": "user", "content": "项目"}]))


if __name__ == "__main__":
    unittest.main()