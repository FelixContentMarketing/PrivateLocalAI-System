# PrivateLocalAI

**100% lokale KI-Dokumentenverarbeitung -- DSGVO-konform, keine Cloud**

Eine vollstaendig lokal laufende Webanwendung, die Gespraechstranskripte mithilfe eines lokalen KI-Sprachmodells (LLM) in professionelle Dokumente umwandelt. Saemtliche Datenverarbeitung findet ausschliesslich auf Ihrem Rechner statt -- keine Cloud, keine externen Server, vollstaendig DSGVO-konform.

---

## Funktionen

- **Zusammenfassung** -- Strukturierte Zusammenfassung mit Sachverhalt, offenen Fragen und naechsten Schritten
- **Besprechungsprotokoll** -- Formelles Protokoll mit Tagesordnungspunkten, Massnahmen und Fristen
- **Schriftsatz-Entwurf** -- Juristischer Schriftsatz mit Antraegen, Sachverhalt und rechtlicher Wuerdigung
- **Anschreiben** -- Verstaendlicher Brief mit Sachstand und Empfehlungen

Alle generierten Dokumente werden als **ENTWURF** gekennzeichnet und erfordern eine Pruefung vor Verwendung.

---

## Datenschutz & DSGVO

| Massnahme | Details |
|-----------|---------|
| Lokale Verarbeitung | Alle Daten bleiben auf Ihrem Computer |
| Keine Cloud-Anbindung | Keine externen API-Aufrufe zur Laufzeit |
| Keine Datenspeicherung | Keine Datenbank, keine Dateien auf der Festplatte |
| Keine Telemetrie | Kein Analytics, kein Tracking, keine Cookies |
| Automatische Bereinigung | Daten werden beim Schliessen des Browsers geloescht |

Die vollstaendige DSGVO-Dokumentation finden Sie unter [docs/DSGVO_DOCUMENTATION.md](docs/DSGVO_DOCUMENTATION.md).

---

## Voraussetzungen

Bevor Sie beginnen, stellen Sie sicher, dass folgende Software installiert ist:

| Software | Version | Download |
|----------|---------|----------|
| **Python** | 3.11+ | [python.org/downloads](https://www.python.org/downloads/) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **Ollama** | aktuell | [ollama.com/download](https://ollama.com/download) |

### Hardware-Empfehlungen

| RAM | Empfohlenes Modell | Qualitaet |
|-----|-------------------|-----------|
| 8-16 GB | `llama3.2:3b` | Ausreichend |
| 16 GB | `llama3.1:8b` | Gut |
| 32+ GB | `qwen2.5:14b` | Sehr gut |

Die Anwendung erkennt Ihre Hardware automatisch und empfiehlt das optimale Modell.

---

## Installation

### 1. Repository klonen

```bash
git clone https://github.com/FelixContentMarketing/PrivateLocalAI-System.git
cd PrivateLocalAI-System
```

### 2. Automatische Installation

```bash
chmod +x setup.sh
./setup.sh
```

Das Setup-Script prueft automatisch alle Voraussetzungen, installiert die Abhaengigkeiten, erkennt Ihre Hardware und schlaegt ein passendes KI-Modell vor.

### Oder: Manuelle Installation

```bash
# Python Virtual Environment erstellen und aktivieren
python3 -m venv .venv
source .venv/bin/activate    # macOS/Linux
# .venv\Scripts\activate     # Windows

# Backend-Abhaengigkeiten installieren
pip install -r backend/requirements.txt

# Frontend
cd frontend
npm install
npm run build
cd ..

# Ollama-Modell herunterladen (Beispiel fuer 16 GB RAM)
ollama pull llama3.1:8b
```

---

## Starten

### Produktionsmodus

```bash
make run
```

Oeffnen Sie anschliessend [http://localhost:8000](http://localhost:8000) in Ihrem Browser.

### Entwicklungsmodus (mit Hot-Reload)

```bash
# Terminal 1: Backend
make dev-backend

# Terminal 2: Frontend
make dev-frontend
```

Oeffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser.

---

## Bedienung

1. **Transkript eingeben** -- Text einfuegen oder `.txt`-Datei per Drag-and-Drop hochladen
2. **Format waehlen** -- Eines der vier Ausgabeformate auswaehlen
3. **Generieren** -- Auf "Dokument generieren" klicken
4. **Ergebnis nutzen** -- Text kopieren oder als TXT/DOCX exportieren

---

## Projektstruktur

```
PrivateLocalAI-System/
  backend/                  # Python FastAPI Server
    api/                    # REST-Endpunkte
    services/               # Ollama-Client, Prompt-Engine, Hardware-Erkennung
    prompts/                # Prompt-Templates fuer alle 4 Formate
  frontend/                 # React + Vite + Tailwind
    src/components/         # UI-Komponenten (Atoms, Molecules, Organisms)
    src/hooks/              # React Hooks (Streaming, Health, Models)
    src/lib/                # API-Client, Typen, Konstanten
  docs/                     # DSGVO-Dokumentation
  setup.sh                  # Installations-Script
  Makefile                  # Build- und Start-Befehle
```

---

## Technologie

| Komponente | Technologie | Zweck |
|------------|-------------|-------|
| Frontend | React + Vite + Tailwind CSS | Benutzeroberflaeche |
| Backend | Python FastAPI | REST-API + SSE-Streaming |
| KI-Engine | Ollama (lokal) | Sprachmodell-Inference |
| Export | python-docx | DOCX-Generierung |

---

## Haeufige Fragen

**Werden meine Daten irgendwohin gesendet?**
Nein. Die gesamte Verarbeitung findet lokal auf Ihrem Rechner statt. Es gibt keine externen Netzwerkverbindungen.

**Welches KI-Modell soll ich verwenden?**
Die Anwendung empfiehlt automatisch ein Modell basierend auf Ihrer Hardware. Fuer die beste Qualitaet empfehlen wir `qwen2.5:14b` (benoetigt 32 GB RAM).

**Kann ich das Modell wechseln?**
Ja, ueber die Einstellungen in der Anwendung koennen Sie jederzeit ein anderes installiertes Modell waehlen.

**Muss ich online sein?**
Nur fuer die erstmalige Installation und den Download des KI-Modells. Danach funktioniert alles offline.

---

## Lizenz

MIT

---

*PrivateLocalAI -- Powered by ProMechCRM -- Felix Schmidt*
