import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from backend.auth import AuthUser, get_current_user
from backend.services.ollama_client import ollama_client
from backend.services.openrouter_client import openrouter_client
from backend.services.prompt_engine import build_prompt, FORMAT_CONFIG

router = APIRouter()

# In-memory task store (no persistence by design for DSGVO)
_tasks: dict[str, dict] = {}


class GenerateRequest(BaseModel):
    transcript: str
    format: str
    model: str | None = None
    mode: str = "local"  # "local" (Ollama) or "cloud" (OpenRouter)
    cloud_model: str | None = None
    temperature: float | None = None
    max_tokens: int | None = None


@router.post("/generate")
async def start_generation(
    req: GenerateRequest,
    _user: AuthUser = Depends(get_current_user),
):
    if req.format not in FORMAT_CONFIG:
        raise HTTPException(status_code=400, detail=f"Unbekanntes Format: {req.format}")

    if not req.transcript.strip():
        raise HTTPException(status_code=400, detail="Transkript darf nicht leer sein")

    system_prompt, user_prompt, options = build_prompt(req.format, req.transcript)

    if req.temperature is not None:
        options["temperature"] = req.temperature
    if req.max_tokens is not None:
        options["max_tokens"] = req.max_tokens

    mode = req.mode

    if mode == "cloud":
        from backend.config import settings as cfg

        if not cfg.openrouter_api_key:
            raise HTTPException(
                status_code=400,
                detail="OpenRouter API-Key nicht konfiguriert. Bitte in den Einstellungen hinterlegen.",
            )
        model = req.cloud_model or cfg.selected_model
    else:
        # Local / Ollama
        model = req.model
        if not model:
            models = await ollama_client.list_models()
            if models:
                model = models[0]["name"]
            else:
                raise HTTPException(
                    status_code=503,
                    detail="Kein Ollama-Modell verfuegbar. Bitte installieren Sie ein Modell mit: ollama pull llama3.1:8b",
                )

    task_id = str(uuid.uuid4())
    _tasks[task_id] = {
        "status": "started",
        "mode": mode,
        "model": model,
        "format": req.format,
        "system_prompt": system_prompt,
        "user_prompt": user_prompt,
        "options": options,
    }

    return {
        "task_id": task_id,
        "status": "started",
        "mode": mode,
        "model": model,
        "format": req.format,
    }


@router.get("/generate/stream/{task_id}")
async def stream_generation(task_id: str):
    if task_id not in _tasks:
        raise HTTPException(status_code=404, detail="Task nicht gefunden")

    task = _tasks[task_id]

    async def event_generator():
        try:
            full_text = []

            if task["mode"] == "cloud":
                stream = openrouter_client.generate_stream(
                    model=task["model"],
                    prompt=task["user_prompt"],
                    system=task["system_prompt"],
                    temperature=task["options"]["temperature"],
                    max_tokens=task["options"]["max_tokens"],
                )
            else:
                stream = ollama_client.generate_stream(
                    model=task["model"],
                    prompt=task["user_prompt"],
                    system=task["system_prompt"],
                    temperature=task["options"]["temperature"],
                    max_tokens=task["options"]["max_tokens"],
                )

            async for chunk in stream:
                if chunk.get("done"):
                    yield {
                        "event": "complete",
                        "data": json.dumps({
                            "done": True,
                            "full_text": "".join(full_text),
                            "eval_count": chunk.get("eval_count", 0),
                        }),
                    }
                else:
                    token = chunk.get("token", "")
                    full_text.append(token)
                    yield {
                        "event": "token",
                        "data": json.dumps({"token": token, "done": False}),
                    }
        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)}),
            }
        finally:
            # Clean up task data (DSGVO: no persistence)
            _tasks.pop(task_id, None)

    return EventSourceResponse(event_generator())
