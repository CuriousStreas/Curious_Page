from __future__ import annotations

import unittest

from backend.rate_limit import FixedWindowLimiter


class MutableClock:
    def __init__(self) -> None:
        self.now = 1000.0

    def __call__(self) -> float:
        return self.now


class FixedWindowLimiterTests(unittest.TestCase):
    def test_discards_expired_buckets_while_serving_requests(self) -> None:
        clock = MutableClock()
        limiter = FixedWindowLimiter(clock=clock)

        self.assertTrue(limiter.allow("expired-client"))
        clock.now += 61
        self.assertTrue(limiter.allow("active-client"))

        self.assertNotIn("expired-client", limiter._windows)
        self.assertIn("active-client", limiter._windows)


if __name__ == "__main__":
    unittest.main()