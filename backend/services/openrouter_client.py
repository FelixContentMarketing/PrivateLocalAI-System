"""Streaming OpenRouter API Client -- gleiche Yield-Signatur wie ollama_client."""

from __future__ import annotations

import json
import logging
import time
from typing import AsyncGenerator

import httpx

from backend.config import settings as cfg

logger = logging.getLogger(__name__)

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"


class OpenRouterClient:
    """Async streaming client fuer OpenRouter API."""

    async def generate_stream(
        self,
        model: str,
        prompt: str,
        system: str,
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> AsyncGenerator[dict, None]:
        """Stream generation tokens from OpenRouter.

        Yields dicts with either:
        - {"token": "...", "done": False}
        - {"done": True, "total_duration": ..., "eval_count": ...}
        """
        api_key = cfg.openrouter_api_key
        if not api_key:
            raise ValueError(
                "OpenRouter API-Key nicht konfiguriert. "
                "Bitte in den Einstellungen hinterlegen."
            )

        model_id = model or cfg.selected_model

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://kanzlei-kissling.de",
            "X-Title": "Kanzlei Kissling KI-Assistent",
        }

        payload = {
            "model": model_id,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            "stream": True,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": 0.9,
        }

        start = time.monotonic()
        token_count = 0

        async with httpx.AsyncClient(
            timeout=httpx.Timeout(connect=10.0, read=300.0, write=10.0, pool=5.0)
        ) as client:
            async with client.stream(
                "POST", OPENROUTER_API_URL, json=payload, headers=headers
            ) as response:
                if response.status_code != 200:
                    body = await response.aread()
                    raise RuntimeError(
                        f"OpenRouter API Fehler ({response.status_code}): {body.decode()[:200]}"
                    )

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    if not line.startswith("data: "):
                        continue

                    data_str = line[6:]  # Remove "data: " prefix
                    if data_str.strip() == "[DONE]":
                        elapsed_ms = int((time.monotonic() - start) * 1000)
                        yield {
                            "done": True,
                            "total_duration": elapsed_ms * 1_000_000,  # ns
                            "eval_count": token_count,
                        }
                        return

                    try:
                        chunk = json.loads(data_str)
                    except json.JSONDecodeError:
                        continue

                    choices = chunk.get("choices", [])
                    if not choices:
                        continue

                    delta = choices[0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        token_count += 1
                        yield {
                            "token": content,
                            "done": False,
                        }

        # Fallback if [DONE] was never received
        elapsed_ms = int((time.monotonic() - start) * 1000)
        yield {
            "done": True,
            "total_duration": elapsed_ms * 1_000_000,
            "eval_count": token_count,
        }


openrouter_client = OpenRouterClient()
