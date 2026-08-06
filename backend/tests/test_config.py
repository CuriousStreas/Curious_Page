from __future__ import annotations

import unittest

from backend.config import Settings


class SettingsTests(unittest.TestCase):
    def test_defaults_use_server_owned_deepseek_configuration(self) -> None:
        settings = Settings.from_env({"DEEPSEEK_API_KEY": "secret"})

        self.assertEqual(settings.api_key, "secret")
        self.assertEqual(settings.model, "deepseek-v4-flash")
        self.assertEqual(settings.chat_url, "https://api.deepseek.com/chat/completions")
        self.assertEqual(settings.max_tokens, 1000)

    def test_base_url_and_origins_are_normalized(self) -> None:
        settings = Settings.from_env(
            {
                "DEEPSEEK_BASE_URL": "https://example.test/v1/",
                "ALLOWED_ORIGINS": " http://127.0.0.1:4173, https://curioustrea.fun ",
            }
        )

        self.assertEqual(settings.chat_url, "https://example.test/v1/chat/completions")
        self.assertEqual(
            settings.allowed_origins,
            ("http://127.0.0.1:4173", "https://curioustrea.fun"),
        )

    def test_numeric_settings_are_bounded(self) -> None:
        settings = Settings.from_env(
            {"DEEPSEEK_MAX_TOKENS": "99999", "DEEPSEEK_READ_TIMEOUT": "0"}
        )

        self.assertEqual(settings.max_tokens, 2000)
        self.assertEqual(settings.read_timeout, 5)

    def test_trusted_proxy_count_defaults_to_zero_and_is_bounded(self) -> None:
        self.assertEqual(Settings.from_env({}).trusted_proxy_count, 0)
        self.assertEqual(Settings.from_env({"TRUSTED_PROXY_COUNT": "999"}).trusted_proxy_count, 5)


if __name__ == "__main__":
    unittest.main()