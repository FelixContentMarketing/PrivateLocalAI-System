import platform
import subprocess

import psutil


def detect_hardware() -> dict:
    """Detect system hardware capabilities for LLM model recommendation."""
    mem = psutil.virtual_memory()
    ram_total_gb = round(mem.total / (1024**3), 1)
    ram_available_gb = round(mem.available / (1024**3), 1)

    cpu_cores = psutil.cpu_count(logical=True)
    cpu_name = _get_cpu_name()

    gpu_info = _detect_gpu()

    return {
        "ram_total_gb": ram_total_gb,
        "ram_available_gb": ram_available_gb,
        "cpu_cores": cpu_cores,
        "cpu_name": cpu_name,
        "gpu": gpu_info,
        "os": platform.system().lower(),
        "arch": platform.machine(),
    }


def _get_cpu_name() -> str:
    system = platform.system()
    if system == "Darwin":
        try:
            result = subprocess.run(
                ["sysctl", "-n", "machdep.cpu.brand_string"],
                capture_output=True, text=True, timeout=5,
            )
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip()
        except (subprocess.SubprocessError, FileNotFoundError):
            pass
        if platform.machine() == "arm64":
            return "Apple Silicon"
    elif system == "Linux":
        try:
            result = subprocess.run(
                ["grep", "-m1", "model name", "/proc/cpuinfo"],
                capture_output=True, text=True, timeout=5,
            )
            if result.returncode == 0:
                return result.stdout.split(":")[-1].strip()
        except (subprocess.SubprocessError, FileNotFoundError):
            pass
    return platform.processor() or "Unbekannt"


def _detect_gpu() -> dict:
    machine = platform.machine()
    system = platform.system()

    # Apple Silicon (unified memory)
    if system == "Darwin" and machine == "arm64":
        return {
            "available": True,
            "name": "Apple Silicon (Metal)",
            "vram_gb": None,
            "type": "apple_silicon",
        }

    # NVIDIA GPU
    try:
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=name,memory.total", "--format=csv,noheader,nounits"],
            capture_output=True, text=True, timeout=10,
        )
        if result.returncode == 0 and result.stdout.strip():
            parts = result.stdout.strip().split(",")
            name = parts[0].strip()
            vram_mb = int(parts[1].strip()) if len(parts) > 1 else 0
            return {
                "available": True,
                "name": name,
                "vram_gb": round(vram_mb / 1024, 1),
                "type": "nvidia",
            }
    except (subprocess.SubprocessError, FileNotFoundError, ValueError):
        pass

    return {
        "available": False,
        "name": None,
        "vram_gb": None,
        "type": "none",
    }
