#!/bin/bash
set -e

echo "================================================"
echo "  PrivateLocalAI -- Installationsassistent"
echo "  100% lokale KI-Dokumentenverarbeitung"
echo "================================================"
echo ""

# Check Python
if command -v python3 &> /dev/null; then
    PY_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
    echo "[OK] Python $PY_VERSION gefunden"
else
    echo "[FEHLER] Python 3.11+ wird benoetigt."
    echo "Installation: https://www.python.org/downloads/"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "[OK] Node.js $NODE_VERSION gefunden"
else
    echo "[FEHLER] Node.js 18+ wird benoetigt."
    echo "Installation: https://nodejs.org/"
    exit 1
fi

# Check Ollama
if command -v ollama &> /dev/null; then
    echo "[OK] Ollama gefunden"
else
    echo "[INFO] Ollama nicht gefunden."
    echo "Bitte Ollama installieren: https://ollama.com/download"
    echo ""
    read -p "Trotzdem fortfahren? (j/n): " CONTINUE
    if [ "$CONTINUE" != "j" ]; then
        exit 1
    fi
fi

# Backend Setup with virtual environment
echo ""
echo "[INFO] Python Virtual Environment wird erstellt..."
python3 -m venv .venv
source .venv/bin/activate
echo "[OK] Virtual Environment erstellt: .venv/"

echo "[INFO] Backend-Abhaengigkeiten werden installiert..."
pip install -r backend/requirements.txt

# Frontend Setup
echo ""
echo "[INFO] Frontend wird eingerichtet..."
cd frontend
npm install
npm run build
cd ..

# Model recommendation
echo ""
if command -v ollama &> /dev/null; then
    RAM_GB=$(python3 -c "
import os
try:
    import psutil
    print(psutil.virtual_memory().total // (1024**3))
except ImportError:
    # Fallback for macOS
    import subprocess
    result = subprocess.run(['sysctl', '-n', 'hw.memsize'], capture_output=True, text=True)
    print(int(result.stdout.strip()) // (1024**3))
" 2>/dev/null || echo "0")

    echo "Erkannter Arbeitsspeicher: ${RAM_GB} GB"

    if [ "$RAM_GB" -ge 32 ] 2>/dev/null; then
        RECOMMENDED="qwen2.5:14b"
    elif [ "$RAM_GB" -ge 16 ] 2>/dev/null; then
        RECOMMENDED="llama3.1:8b"
    else
        RECOMMENDED="llama3.2:3b"
    fi

    echo "Empfohlenes Modell: $RECOMMENDED"
    echo ""
    read -p "Modell '$RECOMMENDED' jetzt herunterladen? (j/n): " DOWNLOAD
    if [ "$DOWNLOAD" = "j" ]; then
        ollama pull "$RECOMMENDED"
    fi
fi

echo ""
echo "================================================"
echo "  Installation abgeschlossen!"
echo ""
echo "  Starten mit:  make run"
echo "  Oder im Entwicklungsmodus: make dev"
echo ""
echo "  Die Anwendung oeffnet sich unter:"
echo "  http://localhost:8000"
echo ""
echo "  Alle Daten werden ausschliesslich"
echo "  lokal verarbeitet. DSGVO-konform."
echo "================================================"
