# SAFORA Risk Scoring Backend

FastAPI service that powers the "Predictive Risk Scoring" card on the Analytics
Dashboard. Pandas aggregates the incident log into per-zone features; a
scikit-learn `GradientBoostingRegressor` turns those features into a 0-100
risk score per zone.

## Run it

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. Check `GET /health`.

## Wire it to the frontend

The frontend already points at `http://localhost:8000` by default
(`src/lib/riskEngine.ts`). To point at a different host/deployment, add a
`.env` file at the project root:

```
VITE_API_BASE_URL=https://your-deployed-backend.example.com
```

If the backend isn't reachable, the frontend automatically falls back to a
local heuristic so the dashboard never breaks — you'll see "Local heuristic
model (backend offline)" in the Analytics page header instead of "Live model".

## Swapping in real data

`train_model()` currently trains on a synthetic-but-realistic bootstrap
dataset at startup. To use real historical incident data:

1. Replace `_synthetic_training_frame()` with a function that loads your
   labeled incident history (CSV/DB) into a Pandas DataFrame with the same
   feature columns (`recent_count`, `severity_mix`, `night_ratio`,
   `zone_base_rate`) and a `score` label.
2. Train + persist the model once (`joblib.dump(model, "model.pkl")`)
   instead of retraining on every process start.
3. Load it at startup with `joblib.load("model.pkl")`.

## Endpoint

`POST /api/predict-risk`

```json
{
  "hour": 21,
  "incidents": [
    { "zone_id": "z-charbagh", "type": "theft", "hours_ago": 5, "hour_of_day": 21, "risk": "high" }
  ]
}
```

Returns a risk score + level for each of the 8 tracked Lucknow zones.
