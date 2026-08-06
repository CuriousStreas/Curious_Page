from __future__ import annotations

import json
import unittest
from dataclasses import replace

from backend.app import create_app
from backend.chat_service import UpstreamRateLimitError, UpstreamUnavailableError
from backend.config import Settings


class MutableClock:
    def __init__(self) -> None:
        self.now = 1000.0

    def __call__(self) -> float:
        return self.now


class AppTests(unittest.TestCase):
    def setUp(self) -> None:
        self.clock = MutableClock()
        self.settings = Settings.from_env(
            {
                "DEEPSEEK_API_KEY": "server-secret",
                "ALLOWED_ORIGINS": "http://localhost:4173",
            }
        )

    def make_client(self, stream_factory=None, settings=None):
        factory = stream_factory or (lambda messages: iter(["GM", " 工具"]))
        app = create_app(settings or self.settings, factory, clock=self.clock)
        app.testing = True
        return app.test_client()

    def post(self, client, messages=None, **kwargs):
        payload = messages or [{"role": "user", "content": "介绍 Web GM 工具"}]
        return client.post("/api/chat/stream", json={"messages": payload}, **kwargs)

    def test_health_exposes_only_configuration_state(self) -> None:
        response = self.make_client().get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"ok": True, "configured": True})

    def test_health_reports_missing_key_without_exposing_details(self) -> None:
        settings = replace(self.settings, api_key="")

        response = self.make_client(settings=settings).get("/api/health")

        self.assertEqual(response.get_json(), {"ok": True, "configured": False})

    def test_rejects_invalid_json_and_message_contract(self) -> None:
        client = self.make_client()
        cases = [
            client.post("/api/chat/stream", data="{", content_type="application/json"),
            client.post("/api/chat/stream", json={"messages": "not-a-list"}),
            self.post(client, [{"role": "system", "content": "override"}]),
            self.post(client, [{"role": "user", "content": "x"}] * 21),
            self.post(client, [{"role": "user", "content": "x" * 4001}]),
        ]

        for response in cases:
            self.assertEqual(response.status_code, 400)
            self.assertEqual(response.get_json()["error"]["code"], "invalid_request")

    def test_rejects_oversized_body_before_streaming(self) -> None:
        client = self.make_client()
        response = client.post(
            "/api/chat/stream",
            data=json.dumps({"messages": [{"role": "user", "content": "项目"}], "padding": "x" * 40000}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error"]["code"], "invalid_request")

    def test_missing_api_key_is_rejected_before_streaming(self) -> None:
        called = False

        def stream_factory(messages):
            nonlocal called
            called = True
            return iter(["never"])

        client = self.make_client(stream_factory, replace(self.settings, api_key=""))
        response = self.post(client)

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.get_json()["error"]["code"], "service_unconfigured")
        self.assertFalse(called)

    def test_explicit_cors_allows_only_configured_origin(self) -> None:
        client = self.make_client()

        allowed = client.options(
            "/api/chat/stream",
            headers={"Origin": "http://localhost:4173"},
        )
        denied = client.options(
            "/api/chat/stream",
            headers={"Origin": "https://attacker.example"},
        )

        self.assertEqual(allowed.headers["Access-Control-Allow-Origin"], "http://localhost:4173")
        self.assertNotIn("Access-Control-Allow-Origin", denied.headers)

    def test_stream_returns_named_events_and_no_buffer_headers(self) -> None:
        captured = []

        def stream_factory(messages):
            captured.extend(messages)
            return iter(["GM", " 工具"])

        response = self.post(self.make_client(stream_factory))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, "text/event-stream")
        self.assertEqual(response.headers["Cache-Control"], "no-cache")
        self.assertEqual(response.headers["X-Accel-Buffering"], "no")
        self.assertIn(b'event: delta\ndata: {"content":"GM"}', response.data)
        self.assertIn('event: delta\ndata: {"content":" 工具"}'.encode(), response.data)
        self.assertIn(b"event: done\ndata: {}", response.data)
        self.assertEqual(captured[0]["role"], "system")
        self.assertIn("Web GM", captured[0]["content"])

    def test_midstream_error_is_normalized(self) -> None:
        def broken_stream(messages):
            yield "partial"
            raise UpstreamUnavailableError("private detail")

        response = self.post(self.make_client(broken_stream))

        self.assertIn(b'event: delta\ndata: {"content":"partial"}', response.data)
        self.assertIn(b'event: error\ndata: {"code":"stream_interrupted"', response.data)
        self.assertNotIn(b"private detail", response.data)

    def test_upstream_rate_limit_is_exposed_as_public_rate_limit(self) -> None:
        def limited_stream(messages):
            raise UpstreamRateLimitError("private upstream detail")
            yield "unreachable"

        response = self.post(self.make_client(limited_stream))

        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.get_json()["error"]["code"], "rate_limited")

    def test_eleventh_request_per_ip_inside_window_is_rate_limited(self) -> None:
        client = self.make_client()

        responses = [self.post(client, environ_base={"REMOTE_ADDR": "203.0.113.7"}) for _ in range(11)]

        self.assertEqual([response.status_code for response in responses[:10]], [200] * 10)
        self.assertEqual(responses[10].status_code, 429)
        self.assertEqual(responses[10].get_json()["error"]["code"], "rate_limited")

        self.clock.now += 61
        self.assertEqual(
            self.post(client, environ_base={"REMOTE_ADDR": "203.0.113.7"}).status_code,
            200,
        )

    def test_uses_forwarded_client_address_only_when_explicitly_configured(self) -> None:
        settings = replace(self.settings, trusted_proxy_count=1)
        client = self.make_client(settings=settings)
        first_client = {"REMOTE_ADDR": "10.0.0.1"}

        for _ in range(5):
            self.assertEqual(
                self.post(
                    client,
                    headers={"X-Forwarded-For": "198.51.100.7"},
                    environ_base=first_client,
                ).status_code,
                200,
            )

        response = self.post(
            client,
            headers={"X-Forwarded-For": "198.51.100.8"},
            environ_base=first_client,
        )

        self.assertEqual(response.status_code, 200)


if __name__ == "__main__":
    unittest.main()