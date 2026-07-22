from __future__ import annotations

import json
import logging
import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from pydantic import BaseModel, Field
from zxcvbn import zxcvbn

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("aura-backend")

app = FastAPI(title="Aura.AI Backend Service")

# Liest OPENAI_API_KEY aus der Umgebung.
_openai_client = AsyncOpenAI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Passwort-Check (unverändert)
# ---------------------------------------------------------------------------
class PasswordCheckRequest(BaseModel):
    password: str = Field(..., min_length=1)


class PasswordCheckResponse(BaseModel):
    score: int
    feedback: list[str]
    warning: str | None


@app.post("/api/check-password", response_model=PasswordCheckResponse)
async def check_password(body: PasswordCheckRequest):
    try:
        res = zxcvbn(body.password)
        feedback_data = res.get("feedback", {})
        return PasswordCheckResponse(
            score=res.get("score", 0),
            feedback=feedback_data.get("suggestions", []),
            warning=feedback_data.get("warning") or None,
        )
    except Exception as e:
        logger.error("Passwort-Check fehlgeschlagen: %s", e)
        raise HTTPException(status_code=500, detail="Systemfehler beim Passwort-Check.")


# ---------------------------------------------------------------------------
# KI-User-Analyse (überarbeitet)
# ---------------------------------------------------------------------------
class UserAnalyzeRequest(BaseModel):
    email: str
    days_since_registration: int
    days_since_last_login: int
    login_count: int
    feature_clicks: int


class UserAnalyzeResponse(BaseModel):
    status: str
    summary: str
    recommendation: str
    source: str  # "llm" oder "rules" – zeigt transparent, woher der Text kommt


def classify_status(days_since_last_login: int, login_count: int, feature_clicks: int) -> str:
    """
    Deterministische Klassifizierung statt LLM-Ratespiel.
    Kein Rate-Limit, keine Latenz, kein Risiko von Fehlklassifikation durch
    Halluzination – und bei gleichen Zahlen immer dasselbe Ergebnis.
    Schwellenwerte sind bewusst grob; gerne an echte Nutzungsdaten justieren.
    """
    if login_count == 0:
        return "Inactive"
    if days_since_last_login > 21:
        return "Inactive"
    if days_since_last_login > 7 or (login_count <= 2 and feature_clicks < 3):
        return "At Risk"
    return "Active"


# Einfacher In-Memory-Cache, damit identische/ähnliche Kennzahlen nicht bei
# jedem Seitenaufruf erneut ans LLM geschickt werden. Für Produktion besser
# durch Redis oder eine DB-Spalte (kiAnalyzedAt) ersetzen, siehe Hinweise unten.
_analysis_cache: dict[tuple, tuple[float, "UserAnalyzeResponse"]] = {}
_CACHE_TTL_SECONDS = 60 * 30  # 30 Minuten


def _cache_key(status: str, days_since_last_login: int, login_count: int, feature_clicks: int) -> tuple:
    # Grobe Rundung, damit z.B. "1 Klick mehr" nicht sofort einen neuen LLM-Call auslöst
    return (status, min(days_since_last_login, 30), min(login_count, 20), min(feature_clicks, 20))


_ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "recommendation": {"type": "string"},
    },
    "required": ["summary", "recommendation"],
    "additionalProperties": False,
}


async def _call_llm(prompt: str) -> dict:
    response = await _openai_client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=300,
        response_format={
            "type": "json_schema",
            "json_schema": {"name": "user_analysis", "strict": True, "schema": _ANALYSIS_SCHEMA},
        },
        messages=[{"role": "user", "content": prompt}],
        timeout=12.0,  # 60s war für ein interaktives Dashboard deutlich zu lang
    )
    return json.loads(response.choices[0].message.content)


@app.post("/api/analyze-user", response_model=UserAnalyzeResponse)
async def analyze_user(body: UserAnalyzeRequest):
    # 1. Status: regelbasiert, sofort, ohne LLM
    status = classify_status(body.days_since_last_login, body.login_count, body.feature_clicks)

    # 2. Cache-Check, bevor überhaupt ans LLM gedacht wird
    key = _cache_key(status, body.days_since_last_login, body.login_count, body.feature_clicks)
    cached = _analysis_cache.get(key)
    if cached and (time.time() - cached[0]) < _CACHE_TTL_SECONDS:
        return cached[1]

    # 3. LLM nur noch für die Formulierung, Status ist bereits fix
    prompt = (
        "Du bist ein knapper, professioneller SaaS-Analyst. "
        f'Der Status des Nutzers steht bereits fest: "{status}". '
        "Erkläre oder wiederhole ihn nicht, sondern liefere nur kurzen Kontext:\n"
        f"- Registriert vor {body.days_since_registration} Tagen\n"
        f"- Letzter Login vor {body.days_since_last_login} Tagen\n"
        f"- {body.login_count} Logins insgesamt, {body.feature_clicks} Feature-Klicks\n\n"
        "summary: maximal 1-2 Sätze, sachlich, keine Wiederholung der Rohzahlen. "
        "recommendation: eine konkrete, umsetzbare Handlung für den Admin, max. 1 Satz."
    )

    try:
        data = await _call_llm(prompt)
        result = UserAnalyzeResponse(
            status=status,
            summary=data.get("summary", "Keine Analyse verfügbar."),
            recommendation=data.get("recommendation", "Keine Empfehlung verfügbar."),
            source="llm",
        )
    except Exception as e:
        logger.warning("LLM-Aufruf fehlgeschlagen, nutze regelbasierten Fallback-Text: %s", e)
        # Fallback: rein regelbasierte Texte statt Absturz oder langer Wartezeit
        fallback_texts = {
            "Active": (
                "Nutzer ist regelmäßig aktiv und nutzt Kernfunktionen.",
                "Keine Aktion nötig.",
            ),
            "At Risk": (
                "Nutzungsfrequenz sinkt, Feature-Nutzung ist gering.",
                "Re-Engagement-E-Mail oder kurzen Check-in senden.",
            ),
            "Inactive": (
                "Nutzer hat sich lange nicht mehr eingeloggt.",
                "Reaktivierungs-Kampagne prüfen oder Account archivieren.",
            ),
        }
        summary, recommendation = fallback_texts.get(
            status, ("Keine Analyse verfügbar.", "Keine Empfehlung verfügbar.")
        )
        result = UserAnalyzeResponse(status=status, summary=summary, recommendation=recommendation, source="rules")

    _analysis_cache[key] = (time.time(), result)
    return result
