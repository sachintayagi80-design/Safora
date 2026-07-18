"""
SAFORA risk-scoring backend.

Stack: FastAPI + Pandas + scikit-learn.

- Pandas aggregates the incoming incident history into per-zone features
  (recent incident count, severity mix, time-of-day skew).
- scikit-learn's GradientBoostingRegressor is trained (at startup, on a
  synthetic-but-realistic dataset) to turn those features into a 0-100 risk
  score per zone. Swap `train_model()` to load a persisted model
  (joblib.load) once you have real historical data.

Run locally:
    cd backend
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

The frontend (src/lib/riskEngine.ts) calls POST /api/predict-risk and falls
back to a local heuristic automatically if this server isn't running.
"""

from __future__ import annotations

import random
from typing import List, Literal, Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.ensemble import GradientBoostingRegressor

app = FastAPI(title="SAFORA Risk Scoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your deployed frontend origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)

ZONES = [
    "z-hazratganj", "z-gomtinagar", "z-charbagh", "z-indiranagar",
    "z-aminabad", "z-alambagh", "z-hussainganj", "z-aliganj",
]

RISK_WEIGHT = {"low": 1.0, "medium": 1.8, "high": 2.6}


# ─── Model training (synthetic bootstrap data — replace with real history) ───

def _synthetic_training_frame(n: int = 4000) -> pd.DataFrame:
    rng = np.random.default_rng(42)
    rows = []
    for _ in range(n):
        recent_count = rng.poisson(4)
        severity_mix = rng.uniform(1.0, 2.6)
        night_ratio = rng.uniform(0, 1)
        zone_base_rate = rng.uniform(0.1, 0.9)
        # Ground-truth score generator with noise — stands in for real labeled history.
        score = (
            recent_count * 6
            + severity_mix * 10
            + night_ratio * 18
            + zone_base_rate * 20
            + rng.normal(0, 5)
        )
        rows.append(
            {
                "recent_count": recent_count,
                "severity_mix": severity_mix,
                "night_ratio": night_ratio,
                "zone_base_rate": zone_base_rate,
                "score": np.clip(score, 2, 98),
            }
        )
    return pd.DataFrame(rows)


def train_model() -> GradientBoostingRegressor:
    df = _synthetic_training_frame()
    features = df[["recent_count", "severity_mix", "night_ratio", "zone_base_rate"]]
    target = df["score"]
    model = GradientBoostingRegressor(n_estimators=150, max_depth=3, learning_rate=0.08, random_state=7)
    model.fit(features, target)
    return model


MODEL = train_model()

# Rough population/base-rate priors per zone, used as a feature alongside live incidents.
ZONE_BASE_RATE = {
    "z-hazratganj": 0.25, "z-gomtinagar": 0.2, "z-charbagh": 0.8,
    "z-indiranagar": 0.45, "z-aminabad": 0.75, "z-alambagh": 0.5,
    "z-hussainganj": 0.45, "z-aliganj": 0.2,
}


# ─── Request / response schema ────────────────────────────────────────────

class IncidentIn(BaseModel):
    zone_id: str
    type: str
    hours_ago: float
    hour_of_day: int
    risk: Literal["low", "medium", "high"]


class PredictRequest(BaseModel):
    hour: int
    incidents: List[IncidentIn]


class ZonePrediction(BaseModel):
    zoneId: str
    zoneName: str
    score: int
    risk: Literal["low", "medium", "high"]


class PredictResponse(BaseModel):
    predictions: List[ZonePrediction]


ZONE_NAMES = {
    "z-hazratganj": "Hazratganj", "z-gomtinagar": "Gomti Nagar", "z-charbagh": "Charbagh",
    "z-indiranagar": "Indira Nagar", "z-aminabad": "Aminabad", "z-alambagh": "Alambagh",
    "z-hussainganj": "Hussainganj", "z-aliganj": "Aliganj",
}


def score_to_risk(score: float) -> str:
    if score >= 66:
        return "high"
    if score >= 33:
        return "medium"
    return "low"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/predict-risk", response_model=PredictResponse)
def predict_risk(req: PredictRequest):
    # Build a Pandas DataFrame from the incoming incident log, then aggregate
    # per-zone features — this is the "Pandas" half of the pipeline.
    if req.incidents:
        df = pd.DataFrame([i.dict() for i in req.incidents])
    else:
        df = pd.DataFrame(columns=["zone_id", "type", "hours_ago", "hour_of_day", "risk"])

    predictions: List[ZonePrediction] = []
    for zone_id in ZONES:
        zone_df = df[df["zone_id"] == zone_id]
        recent = zone_df[zone_df["hours_ago"] < 48]
        recent_count = len(recent)
        severity_mix = recent["risk"].map(RISK_WEIGHT).mean() if len(recent) else 1.2
        night_hits = zone_df[(zone_df["hour_of_day"] >= 19) | (zone_df["hour_of_day"] <= 4)]
        night_ratio = (len(night_hits) / len(zone_df)) if len(zone_df) else 0.3
        zone_base_rate = ZONE_BASE_RATE.get(zone_id, 0.4)

        features = pd.DataFrame([{
            "recent_count": recent_count,
            "severity_mix": float(severity_mix) if not pd.isna(severity_mix) else 1.2,
            "night_ratio": night_ratio,
            "zone_base_rate": zone_base_rate,
        }])
        raw_score = float(MODEL.predict(features)[0])
        score = int(np.clip(round(raw_score), 2, 98))

        predictions.append(ZonePrediction(
            zoneId=zone_id,
            zoneName=ZONE_NAMES[zone_id],
            score=score,
            risk=score_to_risk(score),
        ))

    return PredictResponse(predictions=predictions)
