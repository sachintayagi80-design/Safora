"""
SAFORA risk-scoring backend with MongoDB Integration & Multi-channel SOS.

Stack: FastAPI + Pandas + scikit-learn + MongoDB (Motor) + Twilio + SMTP + Gemini.

- MongoDB acts as the primary database for users, incidents, and hub messages.
- At startup, the model queries the `incidents` collection to train dynamically.
- The predict endpoint queries the live `incidents` database.
- Twilio integration allows secure dispatch of emergency SOS messages and voice calls.
- SMTP integration allows sending emergency email alerts.
- Gemini integration powers the SAFORA AI safety assistant.
"""

from __future__ import annotations
import os
import random
import smtplib
from email.message import EmailMessage
from contextlib import asynccontextmanager
from typing import List, Literal, Optional
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
load_dotenv()  # This forces Python to read your .env file!

import google.generativeai as genai
import numpy as np
import pandas as pd
from fastapi import Request, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from sklearn.ensemble import GradientBoostingRegressor
from twilio.rest import Client

# ─── Gemini AI Setup ──────────────────────────────────────────────────────

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-2.5-flash')
else:
    gemini_model = None

# ─── MongoDB Setup ────────────────────────────────────────────────────────

MONGO_DETAILS = os.getenv("MONGO_URI", "mongodb://localhost:27017")

class Database:
    client: AsyncIOMotorClient = None
    model: GradientBoostingRegressor = None

db_state = Database()

async def train_model_from_db():
    """Fetches historical incidents from MongoDB to train the model dynamically."""
    db = db_state.client.safora_citizen
    cursor = db.incidents.find({})
    incidents = await cursor.to_list(length=None)
    
    # If the database has fewer than 50 incidents, use a tiny fallback array 
    if len(incidents) < 50:
        print("Warning: Not enough data in MongoDB. Model will output baseline predictions.")
        df = pd.DataFrame([{
            "recent_count": 1, "severity_mix": 1.5, "night_ratio": 0.5, "zone_base_rate": 0.5, "score": 50
        } for _ in range(10)])
    else:
        # Group incidents by zone to build training features
        df_incidents = pd.DataFrame(incidents)
        training_rows = []
        for zone in ZONES:
            z_data = df_incidents[df_incidents["zoneId"] == zone]
            if not z_data.empty:
                recent_count = len(z_data)
                severity_mix = z_data["risk"].map(RISK_WEIGHT).mean() if "risk" in z_data else 1.5
                night_hits = z_data[(z_data["hourOfDay"] >= 19) | (z_data["hourOfDay"] <= 4)] if "hourOfDay" in z_data else pd.DataFrame()
                night_ratio = len(night_hits) / len(z_data)
                zone_base_rate = ZONE_BASE_RATE.get(zone, 0.4)
                
                score = (recent_count * 6) + (severity_mix * 10) + (night_ratio * 18) + (zone_base_rate * 20)
                
                training_rows.append({
                    "recent_count": recent_count,
                    "severity_mix": float(severity_mix),
                    "night_ratio": night_ratio,
                    "zone_base_rate": zone_base_rate,
                    "score": np.clip(score, 2, 98)
                })
        df = pd.DataFrame(training_rows)

    features = df[["recent_count", "severity_mix", "night_ratio", "zone_base_rate"]]
    target = df["score"]
    model = GradientBoostingRegressor(n_estimators=150, max_depth=3, learning_rate=0.08, random_state=7)
    model.fit(features, target)
    return model

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to MongoDB on startup
    db_state.client = AsyncIOMotorClient(MONGO_DETAILS)
    
    # Train the model dynamically from MongoDB data
    db_state.model = await train_model_from_db()
    yield
    # Close connection on shutdown
    db_state.client.close()

app = FastAPI(title="SAFORA API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ZONES = [
    "z-hazratganj", "z-gomtinagar", "z-charbagh", "z-indiranagar",
    "z-aminabad", "z-alambagh", "z-hussainganj", "z-aliganj",
]

RISK_WEIGHT = {"low": 1.0, "medium": 1.8, "high": 2.6}

ZONE_BASE_RATE = {
    "z-hazratganj": 0.25, "z-gomtinagar": 0.2, "z-charbagh": 0.8,
    "z-indiranagar": 0.45, "z-aminabad": 0.75, "z-alambagh": 0.5,
    "z-hussainganj": 0.45, "z-aliganj": 0.2,
}

ZONE_NAMES = {
    "z-hazratganj": "Hazratganj", "z-gomtinagar": "Gomti Nagar", "z-charbagh": "Charbagh",
    "z-indiranagar": "Indira Nagar", "z-aminabad": "Aminabad", "z-alambagh": "Alambagh",
    "z-hussainganj": "Hussainganj", "z-aliganj": "Aliganj",
}

def score_to_risk(score: float) -> str:
    if score >= 66: return "high"
    if score >= 33: return "medium"
    return "low"


# ─── Request / response schemas ───────────────────────────────────────────

class ZonePrediction(BaseModel):
    zoneId: str
    zoneName: str
    score: int
    risk: Literal["low", "medium", "high"]

class PredictResponse(BaseModel):
    predictions: List[ZonePrediction]

class SOSMessage(BaseModel):
    phone_number: str
    message: str

class SOSEmail(BaseModel):
    recipient_email: str
    message: str

class ChatRequest(BaseModel):
    message: str


# ─── Core API Endpoints ───────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "db_connected": db_state.client is not None, "model_ready": db_state.model is not None}

@app.post("/api/predict-risk", response_model=PredictResponse)
async def predict_risk(request: Request):
    """Predicts risk using live data from the MongoDB incidents collection."""
    db = db_state.client.safora_citizen
    
    forty_eight_hours_ago = datetime.now(timezone.utc) - timedelta(hours=48)
    cursor = db.incidents.find({"timestamp": {"$gte": forty_eight_hours_ago.isoformat()}})
    recent_incidents = await cursor.to_list(length=None)
    
    if recent_incidents:
        df = pd.DataFrame(recent_incidents)
    else:
        df = pd.DataFrame(columns=["zoneId", "type", "risk", "hourOfDay"])

    predictions: List[ZonePrediction] = []
    for zone_id in ZONES:
        if not df.empty and "zoneId" in df.columns:
            zone_df = df[df["zoneId"] == zone_id]
        else:
            zone_df = pd.DataFrame()
            
        recent_count = len(zone_df)
        severity_mix = zone_df["risk"].map(RISK_WEIGHT).mean() if not zone_df.empty and "risk" in zone_df else 1.2
        
        if not zone_df.empty and "hourOfDay" in zone_df:
            night_hits = zone_df[(zone_df["hourOfDay"] >= 19) | (zone_df["hourOfDay"] <= 4)]
            night_ratio = len(night_hits) / len(zone_df)
        else:
            night_ratio = 0.3
            
        zone_base_rate = ZONE_BASE_RATE.get(zone_id, 0.4)

        features = pd.DataFrame([{
            "recent_count": recent_count,
            "severity_mix": float(severity_mix) if not pd.isna(severity_mix) else 1.2,
            "night_ratio": night_ratio,
            "zone_base_rate": zone_base_rate,
        }])
        
        raw_score = float(db_state.model.predict(features)[0])
        score = int(np.clip(round(raw_score), 2, 98))

        predictions.append(ZonePrediction(
            zoneId=zone_id,
            zoneName=ZONE_NAMES[zone_id],
            score=score,
            risk=score_to_risk(score),
        ))

    return PredictResponse(predictions=predictions)

@app.post("/api/chat")
async def ai_chat(payload: ChatRequest):
    """Processes chatbot messages using Google's Gemini API."""
    if not gemini_model:
        raise HTTPException(status_code=500, detail="Gemini API key is missing or invalid.")
    
    try:
        # System prompt instructions
        prompt = f"You are the SAFORA emergency app AI assistant. Keep answers brief, helpful, and focused on safety. User asks: {payload.message}"
        response = gemini_model.generate_content(prompt)
        return {"reply": response.text}
    except Exception as e:
        print(f"Gemini Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sos/sms")
async def trigger_sos_sms(payload: SOSMessage):
    """Sends an emergency SMS via Twilio."""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_number = os.getenv("TWILIO_PHONE_NUMBER")

    if not all([account_sid, auth_token, twilio_number]):
        raise HTTPException(status_code=500, detail="Twilio configuration is missing.")

    try:
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=payload.message,
            from_=twilio_number,
            to=payload.phone_number
        )
        return {"success": True, "sid": message.sid}
    except Exception as e:
        print(f"Twilio Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sos/call")
async def trigger_sos_call(payload: SOSMessage):
    """Initiates an emergency voice call via Twilio."""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_number = os.getenv("TWILIO_PHONE_NUMBER")

    if not all([account_sid, auth_token, twilio_number]):
        raise HTTPException(status_code=500, detail="Twilio configuration is missing.")

    try:
        client = Client(account_sid, auth_token)
        twiml_instructions = (
            "<Response>"
            "<Say voice='alice'>Emergency alert. SOS triggered from SAFORA app. "
            "User needs immediate assistance. Please check the app for location details.</Say>"
            "</Response>"
        )
        
        call = client.calls.create(
            twiml=twiml_instructions,
            to=payload.phone_number,
            from_=twilio_number
        )
        return {"success": True, "call_sid": call.sid}
    except Exception as e:
        print(f"Twilio Call Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sos/email")
async def trigger_sos_email(payload: SOSEmail):
    """Sends an emergency email using standard SMTP."""
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")

    if not sender_email or not sender_password:
        raise HTTPException(status_code=500, detail="Email configuration is missing.")

    msg = EmailMessage()
    msg.set_content(payload.message)
    msg["Subject"] = "🚨 SAFORA EMERGENCY SOS TRIGGERED 🚨"
    msg["From"] = f"SAFORA Alerts <{sender_email}>"
    msg["To"] = payload.recipient_email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
        return {"success": True}
    except Exception as e:
        print(f"Email Dispatch Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── MongoDB Endpoints (Leaderboard & Hub) ────────────────────────────

@app.get("/api/leaderboard")
async def get_leaderboard(limit: int = 10):
    db = db_state.client.safora_citizen
    users_cursor = db.users.find({}, {"_id": 0}).sort("trustScore", -1).limit(limit)
    users = await users_cursor.to_list(length=limit)
    return {"leaderboard": users}

@app.get("/api/hub/{zone_id}")
async def get_hub_messages(zone_id: str, limit: int = 50):
    if zone_id not in ZONES:
        raise HTTPException(status_code=404, detail="Zone not found")
        
    db = db_state.client.safora_citizen
    messages_cursor = db.hub_messages.find(
        {"zoneId": zone_id}, 
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit)
    
    messages = await messages_cursor.to_list(length=limit)
    return {"zoneId": zone_id, "messages": messages[::-1]}

@app.get("/api/incidents")
async def get_all_incidents():
    """Fetch all incidents from MongoDB for the Live Map."""
    db = db_state.client.safora_citizen
    cursor = db.incidents.find({}, {"_id": 0})
    incidents = await cursor.to_list(length=None)
    return {"incidents": incidents}
    
@app.post("/api/incidents")
async def post_incident(incident: dict):
    """Save a new incident report to MongoDB."""
    db = db_state.client.safora_citizen
    result = await db.incidents.insert_one(incident)
    incident["_id"] = str(result.inserted_id)
    return incident

@app.post("/api/hub/{zone_id}")
async def post_hub_message(zone_id: str, message: dict):
    if zone_id not in ZONES:
        raise HTTPException(status_code=404, detail="Zone not found")
        
    db = db_state.client.safora_citizen
    message["zoneId"] = zone_id
    message["timestamp"] = datetime.now(timezone.utc).isoformat()
    await db.hub_messages.insert_one(message)
    return {"status": "success", "message": "Message posted"}