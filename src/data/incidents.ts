export type IncidentType = 'theft' | 'assault' | 'harassment' | 'accident' | 'fire' | 'missing-person' | 'suspicious-activity';
export type RiskLevel = 'low' | 'medium' | 'high';
export type IncidentStatus = 'unverified' | 'verified' | 'resolved';

export interface CityZone {
  id: string;
  name: string;
  x: number; // % position on the stylized map, 0-100
  y: number; // % position on the stylized map, 0-100
  baseRisk: RiskLevel;
}

// Lucknow neighbourhoods — mirrors the zones already used on the marketing heatmap preview
export const CITY_ZONES: CityZone[] = [
  { id: 'z-hazratganj', name: 'Hazratganj', x: 24, y: 28, baseRisk: 'low' },
  { id: 'z-gomtinagar', name: 'Gomti Nagar', x: 50, y: 18, baseRisk: 'low' },
  { id: 'z-charbagh', name: 'Charbagh', x: 68, y: 42, baseRisk: 'high' },
  { id: 'z-indiranagar', name: 'Indira Nagar', x: 30, y: 60, baseRisk: 'medium' },
  { id: 'z-aminabad', name: 'Aminabad', x: 58, y: 68, baseRisk: 'high' },
  { id: 'z-alambagh', name: 'Alambagh', x: 80, y: 76, baseRisk: 'medium' },
  { id: 'z-hussainganj', name: 'Hussainganj', x: 40, y: 40, baseRisk: 'medium' },
  { id: 'z-aliganj', name: 'Aliganj', x: 16, y: 55, baseRisk: 'low' },
];

export const INCIDENT_TYPES: { value: IncidentType; label: string; emoji: string; color: string }[] = [
  { value: 'theft', label: 'Theft / Snatching', emoji: '🎒', color: '#ffb020' },
  { value: 'assault', label: 'Assault', emoji: '⚠️', color: '#ff4d4d' },
  { value: 'harassment', label: 'Harassment', emoji: '🚫', color: '#ff4d4d' },
  { value: 'accident', label: 'Road Accident', emoji: '🚗', color: '#3b82f6' },
  { value: 'fire', label: 'Fire Hazard', emoji: '🔥', color: '#ff4d4d' },
  { value: 'missing-person', label: 'Missing Person', emoji: '🧍', color: '#1fc7c7' },
  { value: 'suspicious-activity', label: 'Suspicious Activity', emoji: '👁️', color: '#ffb020' },
];

export const RISK_COLOR: Record<RiskLevel, string> = { low: '#2ed573', medium: '#ffb020', high: '#ff4d4d' };
export const RISK_LABEL: Record<RiskLevel, string> = { low: 'Low risk', medium: 'Caution', high: 'High risk' };

export interface Incident {
  id: string;
  type: IncidentType;
  zoneId: string;
  x: number; // absolute position on the map, jittered around the zone
  y: number;
  risk: RiskLevel;
  title: string;
  description: string;
  status: IncidentStatus;
  reportedBy: string;
  hoursAgo: number; // used to derive timestamp + "peak hour" analytics
  hourOfDay: number; // 0-23
  photoDataUrl?: string;
}

function jitter(v: number, spread = 6) {
  return Math.min(96, Math.max(4, v + (Math.random() * spread * 2 - spread)));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const TITLES: Record<IncidentType, string[]> = {
  theft: ['Snatching attempt near market', 'Reported chain-snatching', 'Pickpocketing reported'],
  assault: ['Physical altercation reported', 'Assault near bus stop'],
  harassment: ['Eve-teasing reported', 'Harassment near college gate'],
  accident: ['Two-vehicle collision', 'Pedestrian hit near crossing'],
  fire: ['Electrical fire hazard', 'Small fire reported near shops'],
  'missing-person': ['Elderly person reported missing', 'Child separated from family'],
  'suspicious-activity': ['Suspicious loitering reported', 'Unattended bag reported'],
};

function seededIncidents(count: number): Incident[] {
  const list: Incident[] = [];
  for (let i = 0; i < count; i++) {
    const zone = pick(CITY_ZONES);
    const type = pick(INCIDENT_TYPES).value;
    const risk: RiskLevel = zone.baseRisk === 'high' ? pick(['high', 'high', 'medium']) : zone.baseRisk === 'medium' ? pick(['medium', 'medium', 'low', 'high']) : pick(['low', 'low', 'medium']);
    // Incidents skew toward evening/night hours — used later for the "peak hours" chart
    const hourOfDay = pick([8, 9, 13, 17, 18, 19, 20, 20, 21, 21, 22, 23, 0, 1]);
    list.push({
      id: `inc-${i}-${zone.id}`,
      type,
      zoneId: zone.id,
      x: jitter(zone.x),
      y: jitter(zone.y),
      risk,
      title: pick(TITLES[type]),
      description: 'Reported by a nearby SAFORA user via the community feed.',
      status: pick(['verified', 'verified', 'unverified', 'resolved']),
      reportedBy: pick(['Anonymous', 'A. Sharma', 'R. Verma', 'Community bot', 'P. Gupta']),
      hoursAgo: Math.floor(Math.random() * 168), // last 7 days
      hourOfDay,
    });
  }
  return list;
}

export const SEED_INCIDENTS: Incident[] = seededIncidents(46);

export function timeAgoLabel(hoursAgo: number): string {
  if (hoursAgo < 1) return 'Just now';
  if (hoursAgo < 24) return `${hoursAgo}h ago`;
  return `${Math.floor(hoursAgo / 24)}d ago`;
}
