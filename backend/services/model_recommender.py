MODEL_REGISTRY = [
    {
        "tier": 1,
        "model": "llama3.2:3b",
        "min_ram_gb": 8,
        "disk_size_gb": 2.0,
        "parameters": "3B",
        "quality_de": "ausreichend",
        "speed": "schnell",
        "description_de": "Kompaktes Modell fuer Systeme mit wenig RAM",
    },
    {
        "tier": 2,
        "model": "llama3.1:8b",
        "min_ram_gb": 16,
        "disk_size_gb": 4.7,
        "parameters": "8B",
        "quality_de": "gut",
        "speed": "mittel",
        "description_de": "Gute Balance aus Qualitaet und Geschwindigkeit",
    },
    {
        "tier": 3,
        "model": "qwen2.5:14b",
        "min_ram_gb": 32,
        "disk_size_gb": 8.9,
        "parameters": "14B",
        "quality_de": "sehr gut",
        "speed": "langsamer",
        "description_de": "Beste Qualitaet fuer anspruchsvolle juristische Texte",
    },
]


def recommend_model(hardware: dict, installed_models: list[str] | None = None) -> dict:
    """Recommend the best model based on detected hardware.

    Args:
        hardware: Output from detect_hardware()
        installed_models: List of already installed model names (optional)

    Returns:
        Dict with recommended model, reason, and all tiers.
    """
    ram_gb = hardware.get("ram_total_gb", 0)
    gpu_type = hardware.get("gpu", {}).get("type", "none")

    # Apple Silicon uses shared memory efficiently
    effective_ram = ram_gb
    if gpu_type == "nvidia":
        vram = hardware.get("gpu", {}).get("vram_gb", 0) or 0
        # For NVIDIA, model should fit in VRAM for GPU acceleration
        effective_ram = min(vram * 2, ram_gb) if vram > 0 else ram_gb

    # Select highest tier that fits
    recommended = MODEL_REGISTRY[0]
    for entry in MODEL_REGISTRY:
        if effective_ram >= entry["min_ram_gb"]:
            recommended = entry

    # Prefer an already-installed model of the same or higher tier
    if installed_models:
        for entry in reversed(MODEL_REGISTRY):
            if entry["min_ram_gb"] <= effective_ram:
                for installed in installed_models:
                    if entry["model"] in installed:
                        recommended = entry
                        break

    reason_parts = [f"{ram_gb} GB RAM erkannt"]
    if gpu_type == "apple_silicon":
        reason_parts.append("Apple Silicon mit Metal-Beschleunigung")
    elif gpu_type == "nvidia":
        vram = hardware.get("gpu", {}).get("vram_gb", 0)
        reason_parts.append(f"NVIDIA GPU mit {vram} GB VRAM")
    else:
        reason_parts.append("CPU-Modus (keine GPU erkannt)")

    return {
        "recommended_model": recommended["model"],
        "recommended_tier": recommended["tier"],
        "reason": " -- ".join(reason_parts),
        "quality_de": recommended["quality_de"],
        "all_tiers": MODEL_REGISTRY,
    }
