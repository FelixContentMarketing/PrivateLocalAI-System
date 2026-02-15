.PHONY: dev dev-backend dev-frontend build run setup models

VENV := .venv/bin

# Development
dev:
	@echo "Starte Backend und Frontend im Entwicklungsmodus..."
	@make dev-backend &
	@make dev-frontend

dev-backend:
	$(VENV)/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

dev-frontend:
	cd frontend && npm run dev

# Production
build:
	cd frontend && npm run build

run: build
	$(VENV)/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# Setup
setup:
	@echo "=== PrivateLocalAI Setup ==="
	@echo "1. Virtual Environment erstellen..."
	python3 -m venv .venv
	@echo "2. Python-Abhaengigkeiten installieren..."
	$(VENV)/pip install -r backend/requirements.txt
	@echo "3. Frontend-Abhaengigkeiten installieren..."
	cd frontend && npm install
	@echo "4. Frontend bauen..."
	cd frontend && npm run build
	@echo ""
	@echo "Setup abgeschlossen!"
	@echo "Starten mit: make run"

# Ollama
models:
	@echo "Installierte Ollama-Modelle:"
	ollama list

pull-default:
	@echo "Empfohlenes Modell herunterladen..."
	ollama pull llama3.1:8b
