# Kanzlei Kissling KI-Assistent -- Coolify Deployment

## Voraussetzungen

- Coolify-Instanz mit Zugang zum Server
- GitHub-Repository: `FelixContentMarketing/PrivateLocalAI-System` (oder Fork)
- Domain/Subdomain vorbereitet (z.B. `ki.kanzlei-kissling.de`)

## Schritt 1: Neues Projekt anlegen

1. **Coolify UI** > **Projects** > **+ Add**
2. Name: `Kanzlei Kissling KI-Assistent`
3. Environment: `production` (Standard)

## Schritt 2: Application erstellen

1. Im Projekt > **+ New Resource** > **Application**
2. **Source**: GitHub App > Repository `FelixContentMarketing/PrivateLocalAI-System`
3. **Branch**: `main`
4. **Build Pack**: `Dockerfile`
5. **Dockerfile Location**: `/Dockerfile`
6. **Base Directory**: `/`
7. **Port**: `8000`

## Schritt 3: Domain konfigurieren

1. **Domains**: `https://ki.kanzlei-kissling.de` (oder gewuenschte Subdomain)
2. SSL wird automatisch ueber Let's Encrypt / Traefik erstellt

## Schritt 4: Umgebungsvariablen setzen

In der Application > **Environment Variables** folgende Variablen anlegen:

### Pflicht-Variablen

| Variable | Wert | Beschreibung |
|---|---|---|
| `JWT_SECRET` | `openssl rand -hex 32` | 64-Zeichen Hex-String, MUSS einzigartig sein |
| `ADMIN_EMAIL` | `bernd@kanzlei-kissling.de` | E-Mail des Admin-Benutzers |
| `ADMIN_PASSWORD` | `<sicheres-passwort>` | Admin-Passwort (mind. 8 Zeichen) |

### Cloud-Modelle (empfohlen)

| Variable | Wert | Beschreibung |
|---|---|---|
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | OpenRouter API Key ([openrouter.ai/keys](https://openrouter.ai/keys)) |
| `SELECTED_MODEL` | `google/gemini-2.5-flash` | Standard Cloud-Modell |

### Optionale Variablen

| Variable | Default | Beschreibung |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama URL (nur wenn Ollama auf dem Server laeuft) |
| `PORT` | `8000` | Interner Port (normalerweise nicht aendern) |
| `CORS_ORIGINS` | (leer = Same-Origin) | Kommaseparierte Liste erlaubter Origins |

### JWT_SECRET generieren

```bash
openssl rand -hex 32
```

**Wichtig**: Diesen Wert sicher aufbewahren. Bei Aenderung werden alle aktiven Sitzungen ungueltig.

## Schritt 5: Persistent Storage

1. Application > **Storages** > **+ Add**
2. **Volume Name**: `kk-ki-data`
3. **Source Path** (auf dem Host): `/data/coolify/kanzlei-kissling/data`
4. **Destination Path** (im Container): `/app/data`

Hier wird die SQLite-Datenbank (users.db) und settings.json gespeichert.

## Schritt 6: Health Check (optional)

Sollte automatisch aus dem Dockerfile uebernommen werden. Falls nicht:

- **Health Check Path**: `/api/health`
- **Port**: `8000`
- **Interval**: `30s`

## Schritt 7: Deploy

1. **Deploy** Button klicken
2. Build-Log beobachten (Multi-Stage: erst Node/Frontend, dann Python/Backend)
3. Nach erfolgreichem Build: Domain aufrufen
4. Login mit den konfigurierten Admin-Credentials

## Architektur im Container

```
Container (Port 8000)
  |
  +-- FastAPI Backend
  |     +-- /api/* Endpoints
  |     +-- JWT Auth (Cookie: kk-auth-token)
  |     +-- SQLite DB (/app/data/users.db)
  |     +-- Settings (/app/data/settings.json)
  |
  +-- Static Files (Frontend)
        +-- / -> frontend/dist/index.html
        +-- React SPA (Manrope Font, Kissling CI)
```

Alles laeuft in einem einzigen Container. Das Frontend wird als statische Dateien vom Backend ausgeliefert.

## Betrieb ohne Ollama (nur Cloud)

Wenn auf dem Coolify-Server kein Ollama installiert ist:

- `OLLAMA_BASE_URL` weglassen oder leer lassen
- Der Health-Check zeigt `ollama: { connected: false }` -- das ist OK
- Im Dashboard den Modus auf **Cloud (OpenRouter)** stellen
- Alle Generierungen laufen ueber OpenRouter

## Betrieb mit Ollama auf dem Server

Falls Ollama auf dem gleichen Server laeuft:

```bash
# Ollama installieren (auf dem Host, nicht im Container)
curl -fsSL https://ollama.com/install.sh | sh

# Modell herunterladen
ollama pull llama3.1:8b
```

Dann in Coolify die Umgebungsvariable setzen:

```
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

Oder bei Linux-Docker:
```
OLLAMA_BASE_URL=http://172.17.0.1:11434
```

## Troubleshooting

### Login funktioniert nicht
- Pruefen ob `ADMIN_EMAIL` und `ADMIN_PASSWORD` gesetzt sind
- Container-Logs checken: Suche nach "Admin-User angelegt/aktualisiert"
- Volume korrekt gemountet? (`/app/data` muss beschreibbar sein)

### Cloud-Generierung schlaegt fehl
- OpenRouter API-Key korrekt? (beginnt mit `sk-or-`)
- In den Einstellungen (Admin) pruefen ob Key gesetzt ist
- OpenRouter-Guthaben pruefen

### Container startet nicht
- Build-Logs pruefen (npm install oder pip install fehlgeschlagen?)
- Port 8000 bereits belegt?

### Daten nach Redeploy weg
- Volume korrekt konfiguriert? `/app/data` muss als Persistent Storage gemountet sein
- Ohne Volume gehen users.db und settings.json bei jedem Redeploy verloren
