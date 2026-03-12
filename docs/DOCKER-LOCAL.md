# Lokale Docker-Installation

## Voraussetzungen

- Docker Desktop (macOS/Windows) oder Docker Engine (Linux)
- Optional: Ollama lokal installiert

## Schnellstart

```bash
# 1. Repository klonen
git clone https://github.com/FelixContentMarketing/PrivateLocalAI-System.git
cd PrivateLocalAI-System

# 2. Konfiguration erstellen
cp .env.example .env
# .env bearbeiten: JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD setzen

# 3. Starten
docker compose up -d

# 4. Oeffnen
open http://localhost:8000
```

## .env Konfiguration

Mindestens diese Werte in `.env` setzen:

```bash
JWT_SECRET=<openssl rand -hex 32>
ADMIN_EMAIL=admin@test.de
ADMIN_PASSWORD=mein-sicheres-passwort
```

Fuer Cloud-Modelle zusaetzlich:
```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

## Ollama-Anbindung

### macOS / Windows (Docker Desktop)

Docker Desktop leitet `host.docker.internal` automatisch an den Host weiter.
Die Standard-Konfiguration in `docker-compose.yml` funktioniert sofort:

```bash
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

### Linux

Auf Linux muss die Host-IP manuell angegeben werden:

```bash
OLLAMA_BASE_URL=http://172.17.0.1:11434
```

Das `extra_hosts` Mapping in `docker-compose.yml` sorgt dafuer, dass
`host.docker.internal` auch auf Linux funktioniert.

## Befehle

```bash
# Starten
docker compose up -d

# Logs anzeigen
docker compose logs -f

# Stoppen
docker compose down

# Neu bauen (nach Code-Aenderungen)
docker compose up -d --build

# Daten zuruecksetzen
docker compose down -v
```

## Daten

Die SQLite-Datenbank und Einstellungen werden in einem Docker Volume gespeichert:
- `app-data` -> `/app/data` im Container

Bei `docker compose down` bleiben die Daten erhalten.
Bei `docker compose down -v` werden sie geloescht.
