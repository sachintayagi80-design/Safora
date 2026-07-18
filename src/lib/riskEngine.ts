import { CITY_ZONES, type Incident, type RiskLevel } from '@/data/incidents';

// Base URL of the FastAPI + Pandas + Scikit-learn backend (see /backend in the repo root).
// Set VITE_API_BASE_URL in a .env file to point at a deployed backend.
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ZoneRiskPrediction {
  zoneId: string;
  zoneName: string;
  score: number; // 0-100
  risk: RiskLevel;
  source: 'backend' | 'local-fallback';
}

function scoreToRisk(score: number): RiskLevel {
  if (score >= 66) return 'high';
  if (score >= 33) return 'medium';
  return 'low';
}

// Local heuristic used when the Python backend is unreachable, so the dashboard
// never shows a blank state. Mirrors the shape of the backend's response.
function localFallback(incidents: Incident[], hour: number): ZoneRiskPrediction[] {
  return CITY_ZONES.map((zone) => {
    const zoneIncidents = incidents.filter((i) => i.zoneId === zone.id);
    const nightFactor = hour >= 19 || hour <= 4 ? 1.4 : 1;
    const recentFactor = zoneIncidents.filter((i) => i.hoursAgo < 48).length;
    const raw = (zoneIncidents.length * 3 + recentFactor * 5) * nightFactor;
    const score = Math.max(4, Math.min(97, Math.round(raw)));
    return { zoneId: zone.id, zoneName: zone.name, score, risk: scoreToRisk(score), source: 'local-fallback' };
  });
}

export async function fetchZoneRiskPredictions(incidents: Incident[], hour = new Date().getHours()): Promise<ZoneRiskPrediction[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/predict-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(2500),
      body: JSON.stringify({
        hour,
        incidents: incidents.map((i) => ({ zone_id: i.zoneId, type: i.type, hours_ago: i.hoursAgo, hour_of_day: i.hourOfDay, risk: i.risk })),
      }),
    });
    if (!res.ok) throw new Error(`Backend responded ${res.status}`);
    const data = await res.json();
    return data.predictions.map((p: any) => ({ ...p, source: 'backend' as const }));
  } catch {
    // Backend not running / unreachable — use the deterministic local model instead.
    return localFallback(incidents, hour);
  }
}
