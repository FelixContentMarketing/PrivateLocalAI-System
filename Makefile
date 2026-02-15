.PHONY: dev dev-backend dev-frontend build run setup models

# Development
dev:
	@echo "Starte Backend und Frontend im Entwicklungsmodus..."
	@make dev-backend &
	@make dev-frontend

dev-backend:
	cd backend && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

dev-frontend:
	cd frontend && npm run dev

# Production
build:
	cd frontend && npm run build

run: build
	cd backend && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# Setup
setup:
	@echo "=== PrivateLocalAI Setup ==="
	@echo "1. Python-Abhaengigkeiten installieren..."
	cd backend && pip install -r requirements.txt
	@echo "2. Frontend-Abhaengigkeiten installieren..."
	cd frontend && npm install
	@echo "3. Frontend bauen..."
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
