# Datenschutzdokumentation: PrivateLocalAI

## 1. Verantwortlicher

[Vom Betreiber zu ergaenzen]

## 2. Zweck der Verarbeitung

Unterstuetzung bei der Erstellung professioneller Dokumente aus Gespraechstranskripten.
Die Anwendung verarbeitet eingegebene Transkripte mithilfe eines lokal betriebenen
KI-Sprachmodells (LLM) und erstellt daraus strukturierte Dokumente in vier Formaten:

- Zusammenfassungen
- Besprechungsprotokolle
- Schriftsatz-Entwuerfe
- Anschreiben

## 3. Art der verarbeiteten Daten

Gespraechstranskripte, die personenbezogene Daten enthalten koennen, darunter:

- Namen und Kontaktdaten
- Geschaeftliche und private Informationen
- Sachverhalte und Streitgegenstaende

## 4. Rechtsgrundlage

- Art. 6 Abs. 1 lit. b DSGVO (Vertragsdurchfuehrung)
- Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an effizienter Dokumentenverarbeitung)

## 5. Technische und organisatorische Massnahmen (TOMs)

### 5.1 Netzwerkisolation
- Die Anwendung laeuft ausschliesslich auf localhost (127.0.0.1)
- Es werden KEINE externen Netzwerkverbindungen hergestellt
- Weder zur Laufzeit noch im Hintergrund werden Daten uebermittelt
- Content Security Policy (CSP) Headers beschraenken alle Ressourcen auf localhost

### 5.2 Keine Datenpersistenz
- Es wird KEINE Datenbank verwendet
- Es werden KEINE Dateien auf dem Dateisystem geschrieben
- Transkripte und Ergebnisse existieren ausschliesslich im Arbeitsspeicher (RAM)
- Nach Beendigung der Sitzung werden alle Daten automatisch geloescht

### 5.3 Keine Telemetrie
- Kein Analytics-System (kein Google Analytics, kein Matomo, keine Alternative)
- Kein Error-Reporting-Service (kein Sentry, keine Alternative)
- Keine Cookies, keine Session-Speicherung
- Keine Nutzerverfolgung jeglicher Art

### 5.4 Protokollierung
- Server-Logs enthalten ausschliesslich technische Metadaten (Zeitstempel, HTTP-Status)
- Transkriptinhalte und generierte Dokumente werden NICHT protokolliert
- Logs verbleiben auf dem lokalen System

### 5.5 KI-Verarbeitung
- Das KI-Modell (LLM) laeuft vollstaendig lokal ueber Ollama
- Ollama bindet ausschliesslich an localhost:11434
- Keine Cloud-API-Aufrufe fuer die KI-Verarbeitung
- Das Modell speichert keine Eingabe- oder Ausgabedaten

## 6. Speicherdauer

Keine dauerhafte Speicherung. Alle Daten existieren ausschliesslich waehrend der
aktiven Browser-Sitzung im Arbeitsspeicher des Computers. Beim Schliessen des
Browsers oder der Anwendung werden saemtliche Daten unwiderruflich geloescht.

Ein expliziter "Daten loeschen"-Button ermoeglicht die sofortige Bereinigung aller
Daten waehrend der Sitzung.

## 7. Empfaenger der Daten

Keine. Es erfolgt keine Datenweitergabe an Dritte. Alle Verarbeitung findet
ausschliesslich auf dem lokalen Rechner statt.

## 8. Drittlandtransfer

Keiner. Es werden keine personenbezogenen Daten in Drittlaender uebermittelt.
Die gesamte Verarbeitung erfolgt lokal.

## 9. Betroffenenrechte

Die Rechte der Betroffenen nach Art. 15-22 DSGVO werden durch die technische
Architektur weitgehend automatisch gewahrt:

- **Auskunftsrecht (Art. 15)**: Es werden keine Daten gespeichert, ueber die
  Auskunft erteilt werden muesste.
- **Recht auf Loeschung (Art. 17)**: Automatisch erfuellt, da keine Daten
  persistent gespeichert werden.
- **Recht auf Einschraenkung (Art. 18)**: Nicht anwendbar mangels Speicherung.
- **Recht auf Datenportabilitaet (Art. 20)**: Der Nutzer kann generierte Dokumente
  jederzeit als TXT oder DOCX exportieren.

## 10. Datenschutz-Folgenabschaetzung (DPIA)

### Risikobewertung

Die lokale Verarbeitung ohne Netzwerkverbindung, ohne Datenpersistenz und ohne
Telemetrie stellt ein **minimales Risiko** fuer die Rechte und Freiheiten der
betroffenen Personen dar.

**Identifizierte Risiken:**
- Zugriff auf den Rechner durch Unbefugte
  -> Mitigierung: Betriebssystem-Zugangskontrolle, Festplattenverschluesselung

- Temporaere Praesenz sensibler Daten im RAM
  -> Mitigierung: Automatische Bereinigung nach Sitzungsende, expliziter Loesch-Button

**Ergebnis:** Eine vollstaendige DPIA ist aufgrund des minimalen Risikos nicht erforderlich.
Die technischen Massnahmen uebersteigen die Mindestanforderungen der DSGVO.

---

*PrivateLocalAI -- 100% lokale KI-Dokumentenverarbeitung*
