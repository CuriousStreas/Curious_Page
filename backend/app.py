from __future__ import annotations

import json
import time
from collections.abc import Callable, Iterable, Iterator
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, Response, jsonify, request
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.middleware.proxy_fix import ProxyFix

from .chat_service import DeepSeekClient, UpstreamError, UpstreamRateLimitError, UpstreamTimeoutError, build_messages
from .config import Settings
from .knowledge import load_sections, retrieve
from .rate_limit import FixedWindowLimiter


PUBLIC_ERRORS = {
    "invalid_request": "请求格式不正确。",
    "rate_limited": "请求过于频繁，请稍后再试。",
    "service_unconfigured": "对话服务暂未配置。",
    "upstream_unavailable": "对话服务暂时不可用，请稍后再试。",
    "stream_interrupted": "回答生成中断，请稍后重试。",
}


def format_sse(event: str, data: dict[str, str]) -> str:
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    return f"event: {event}\ndata: {payload}\n\n"


def _error(code: str, status: int):
    return jsonify({"error": {"code": code, "message": PUBLIC_ERRORS[code]}}), status


def _validate_messages(payload: object) -> tuple[list[dict[str, str]] | None, str | None]:
    if not isinstance(payload, dict):
        return None, "invalid_request"
    messages = payload.get("messages")
    if not isinstance(messages, list) or not 1 <= len(messages) <= 20:
        return None, "invalid_request"

    validated: list[dict[str, str]] = []
    for message in messages:
        if not isinstance(message, dict):
            return None, "invalid_request"
        role = message.get("role")
        content = message.get("content")
        if role not in {"user", "assistant"} or not isinstance(content, str):
            return None, "invalid_request"
        if not content.strip() or len(content) > 4000:
            return None, "invalid_request"
        validated.append({"role": role, "content": content})
    if validated[-1]["role"] != "user":
        return None, "invalid_request"
    return validated, None


def create_app(
    settings: Settings,
    chat_stream_factory: Callable[[list[dict[str, str]]], Iterable[str]],
    *,
    clock: Callable[[], float] = time.monotonic,
) -> Flask:
    app = Flask(__name__)
    if settings.trusted_proxy_count > 0:
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=settings.trusted_proxy_count)
    app.config["MAX_CONTENT_LENGTH"] = 32 * 1024
    limiter = FixedWindowLimiter(clock=clock)
    knowledge_path = Path(__file__).resolve().parent.parent / "knowledge" / "resume.md"
    sections = load_sections(knowledge_path)

    @app.after_request
    def add_cors_headers(response: Response) -> Response:
        origin = request.headers.get("Origin", "").rstrip("/")
        if origin in settings.allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Vary"] = "Origin"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type"
            response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        return response

    @app.get("/api/health")
    def health():
        return jsonify({"ok": True, "configured": bool(settings.api_key)})

    @app.errorhandler(RequestEntityTooLarge)
    def request_too_large(error: RequestEntityTooLarge):
        return _error("invalid_request", 400)

    @app.route("/api/chat/stream", methods=["POST", "OPTIONS"])
    def chat_stream():
        if request.method == "OPTIONS":
            return Response(status=204)
        payload = request.get_json(silent=True)
        messages, validation_error = _validate_messages(payload)
        if validation_error:
            return _error(validation_error, 400)
        if not settings.api_key:
            return _error("service_unconfigured", 503)
        client_ip = request.remote_addr or "unknown"
        if not limiter.allow(client_ip):
            return _error("rate_limited", 429)

        question = messages[-1]["content"]
        prompt = build_messages(messages, retrieve(question, sections))
        stream = iter(chat_stream_factory(prompt))
        try:
            first_delta = next(stream, None)
        except UpstreamRateLimitError:
            return _error("rate_limited", 429)
        except UpstreamTimeoutError:
            return _error("upstream_unavailable", 503)
        except UpstreamError:
            return _error("upstream_unavailable", 503)

        def events() -> Iterator[str]:
            if first_delta:
                yield format_sse("delta", {"content": first_delta})
            try:
                for delta in stream:
                    if delta:
                        yield format_sse("delta", {"content": delta})
            except UpstreamError:
                yield format_sse(
                    "error",
                    {"code": "stream_interrupted", "message": PUBLIC_ERRORS["stream_interrupted"]},
                )
                return
            yield format_sse("done", {})

        response = Response(events(), mimetype="text/event-stream")
        response.headers["Cache-Control"] = "no-cache"
        response.headers["X-Accel-Buffering"] = "no"
        return response

    return app


load_dotenv(Path(__file__).resolve().parent / ".env")
settings = Settings.from_env()
client = DeepSeekClient(settings)
app = create_app(settings, client.stream)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=settings.port)