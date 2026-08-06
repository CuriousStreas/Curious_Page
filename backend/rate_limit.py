from __future__ import annotations

import threading
import time
from collections.abc import Callable


class FixedWindowLimiter:
    def __init__(
        self,
        limit: int = 10,
        window_seconds: int = 60,
        *,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self.clock = clock
        self._windows: dict[str, tuple[float, int]] = {}
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        with self._lock:
            now = self.clock()
            started_at, count = self._windows.get(key, (now, 0))
            if now - started_at >= self.window_seconds:
                started_at, count = now, 0
            expired = [k for k, (st, _) in self._windows.items() if now - st >= self.window_seconds]
            for k in expired:
                del self._windows[k]
            if count >= self.limit:
                return False
            self._windows[key] = (started_at, count + 1)
            return True
        return True