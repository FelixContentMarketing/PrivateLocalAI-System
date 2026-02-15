from pathlib import Path

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

FORMAT_CONFIG = {
    "zusammenfassung": {
        "template": "zusammenfassung.txt",
        "temperature": 0.2,
        "max_tokens": 2048,
        "label_de": "Zusammenfassung",
    },
    "besprechungsprotokoll": {
        "template": "besprechungsprotokoll.txt",
        "temperature": 0.15,
        "max_tokens": 4096,
        "label_de": "Besprechungsprotokoll",
    },
    "schriftsatz_entwurf": {
        "template": "schriftsatz_entwurf.txt",
        "temperature": 0.25,
        "max_tokens": 6144,
        "label_de": "Schriftsatz-Entwurf",
    },
    "mandantenanschreiben": {
        "template": "mandantenanschreiben.txt",
        "temperature": 0.4,
        "max_tokens": 3072,
        "label_de": "Mandantenanschreiben",
    },
}


def _load_template(filename: str) -> str:
    return (PROMPTS_DIR / filename).read_text(encoding="utf-8")


def get_available_formats() -> list[dict]:
    return [
        {"key": key, "label_de": cfg["label_de"]}
        for key, cfg in FORMAT_CONFIG.items()
    ]


def build_prompt(format_key: str, transcript: str) -> tuple[str, str, dict]:
    """Build system prompt, user prompt, and generation options.

    Returns:
        (system_prompt, user_prompt, options_dict)
    """
    if format_key not in FORMAT_CONFIG:
        raise ValueError(f"Unbekanntes Format: {format_key}")

    config = FORMAT_CONFIG[format_key]
    common = _load_template("common_instructions.txt")
    template = _load_template(config["template"])

    system_prompt = f"{common}\n\n{template}"
    user_prompt = f"TRANSKRIPT:\n\n{transcript}"

    options = {
        "temperature": config["temperature"],
        "max_tokens": config["max_tokens"],
    }

    return system_prompt, user_prompt, options
