import json
from typing import AsyncGenerator

import httpx

from backend.config import settings


class OllamaClient:
    """Async client for Ollama REST API. All communication is localhost-only."""

    def __init__(self, base_url: str | None = None):
        self.base_url = base_url or settings.ollama_base_url
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=httpx.Timeout(connect=5.0, read=300.0, write=10.0, pool=5.0),
            )
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def check_health(self) -> dict:
        """Check if Ollama is running and responsive."""
        try:
            client = await self._get_client()
            response = await client.get("/")
            return {
                "connected": response.status_code == 200,
                "url": self.base_url,
            }
        except httpx.ConnectError:
            return {"connected": False, "url": self.base_url, "error": "Ollama nicht erreichbar"}

    async def list_models(self) -> list[dict]:
        """List locally available models."""
        try:
            client = await self._get_client()
            response = await client.get("/api/tags")
            response.raise_for_status()
            data = response.json()
            return [
                {
                    "name": m["name"],
                    "size_bytes": m.get("size", 0),
                    "size_gb": round(m.get("size", 0) / (1024**3), 1),
                    "modified_at": m.get("modified_at", ""),
                    "details": m.get("details", {}),
                }
                for m in data.get("models", [])
            ]
        except (httpx.HTTPError, KeyError):
            return []

    async def generate_stream(
        self,
        model: str,
        prompt: str,
        system: str,
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> AsyncGenerator[dict, None]:
        """Stream generation tokens from Ollama via /api/chat.

        Yields dicts with either:
        - {"token": "...", "done": False}
        - {"done": True, "total_duration": ..., "eval_count": ...}
        """
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            "stream": True,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
                "top_p": 0.9,
                "repeat_penalty": 1.1,
            },
        }

        client = await self._get_client()
        async with client.stream("POST", "/api/chat", json=payload) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line:
                    continue
                chunk = json.loads(line)
                if chunk.get("done"):
                    yield {
                        "done": True,
                        "total_duration": chunk.get("total_duration", 0),
                        "eval_count": chunk.get("eval_count", 0),
                    }
                else:
                    yield {
                        "token": chunk.get("message", {}).get("content", ""),
                        "done": False,
                    }

    async def pull_model(self, model: str) -> AsyncGenerator[dict, None]:
        """Pull/download a model with progress streaming."""
        client = await self._get_client()
        async with client.stream(
            "POST", "/api/pull", json={"name": model}, timeout=None
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line:
                    yield json.loads(line)


ollama_client = OllamaClient()
