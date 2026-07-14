from __future__ import annotations

import httpx  # Wichtig für den Aufruf der KI-API
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from zxcvbn import zxcvbn

app = FastAPI(title="Aura.AI Backend Service")

# CORS erlauben, damit Next.js mit dem Service kommunizieren kann
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- BESTEHENDE MODELLE FÜR PASSWORT ---
class PasswordCheckRequest(BaseModel):
    password: str = Field(..., min_length=1)

class PasswordCheckResponse(BaseModel):
    score: int
    feedback: list[str]
    warning: str | None


# --- NEUE MODELLE FÜR KI-USER-ANALYSE ---
class UserAnalyzeRequest(BaseModel):
    email: str
    days_since_registration: int
    days_since_last_login: int
    login_count: int
    feature_clicks: int

class UserAnalyzeResponse(BaseModel):
    status: str  # z. B. "Active", "At Risk (Churn)", "Inactive"
    summary: str  # Der KI-Text für das Dashboard
    recommendation: str  # Die KI-Handlungsempfehlung


# --- 1. ENDPUNKT: PASSWORT PRÜFEN (UNVERÄNDERT) ---
@app.post("/api/check-password", response_model=PasswordCheckResponse)
async def check_password(body: PasswordCheckRequest):
    try:
        res = zxcvbn(body.password)
        score = res.get("score", 0)
        feedback_data = res.get("feedback", {})
        suggestions = feedback_data.get("suggestions", [])
        warning = feedback_data.get("warning", None)
        
        return PasswordCheckResponse(
            score=score,
            feedback=suggestions,
            warning=warning if warning else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- 2. ENDPUNKT: KI-USER-ANALYSE (NEU) ---
@app.post("/api/analyze-user", response_model=UserAnalyzeResponse)
async def analyze_user(body: UserAnalyzeRequest):
    try:
        # Hier bauen wir den präzisen Prompt für die KI anhand der echten User-Zahlen
        prompt = (
            f"Analysiere das Verhalten dieses Nutzers:\n"
            f"- Registriert vor: {body.days_since_registration} Tagen\n"
            f"- Letzter Login vor: {body.days_since_last_login} Tagen\n"
            f"- Anzahl Logins gesamt: {body.login_count}\n"
            f"- Genutzte Kern-Features: {body.feature_clicks} Klicks\n\n"
            f"Antworte strikt im folgenden JSON-Format ohne weiteren Text drumherum:\n"
            f'{{"status": "Active" oder "At Risk" oder "Inactive", '
            f'"summary": "Maximal 1 Satz Zusammenfassung des Verhaltens.", '
            f'"recommendation": "Eine konkrete Aktion für den Admin in einem kurzen Stichpunkt."}}'
        )

        # Wir rufen ein lokal laufendes KI-Modell (z.B. Llama 3 via Ollama) oder eine API auf
        # Für das Beispiel nutzen wir Ollama, das im Docker-Netzwerk unter 'http://ollama:11434' erreichbar ist
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://ollama:11434/api/generate",
                json={
                    "model": "llama3",
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"  # Zwingt die KI, sauberes JSON zu liefern
                },
                timeout=60.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="KI-Service nicht erreichbar")
            
            # Ergebnis der KI parsen
            result_json = response.json()
            ki_output = result_json.get("response")
            
            # Die Antwort der KI ist ein String im JSON-Format, den wir direkt als Python-Dict einlesen
            import json
            data = json.loads(ki_output)
            
            return UserAnalyzeResponse(
                status=data.get("status", "Unknown"),
                summary=data.get("summary", "Keine Analyse möglich."),
                recommendation=data.get("recommendation", "Keine Empfehlung.")
            )

    except Exception as e:
        # Fallback, falls die KI mal streikt oder nicht läuft, damit die App nicht abstürzt
        return UserAnalyzeResponse(
            status="Error",
            summary=f"KI-Analyse temporär nicht verfügbar.",
            recommendation="Bitte überprüfe die Server-Verbindung zur KI."
        )