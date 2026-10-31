import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Incident, type IncidentType, type RiskLevel } from '@/data/incidents';

export interface NewReportInput {
  type: IncidentType;
  x: number;
  y: number;
  zoneId: string;
  description: string;
  photoDataUrl?: string;
}

interface ReportsContextValue {
  incidents: Incident[];
  myReports: Incident[];
  addReport: (r: NewReportInput) => Promise<Incident>;
  trustScore: number;
  trustLevel: 'New' | 'Trusted' | 'Verified Guardian' | 'Community Hero';
}

const ReportsContext = createContext<ReportsContextValue | undefined>(undefined);

const CURRENT_USER_LABEL = 'You';

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // 1. Fetch real incidents from MongoDB on app load
  useEffect(() => {
    fetch('http://localhost:8000/api/incidents')
      .then((res) => res.json())
      .then((data) => {
        if (data.incidents) {
          // Format the DB incidents to match the React frontend interface
          const mapped = data.incidents.map((dbInc: any, i: number) => ({
            id: dbInc._id || `db-inc-${i}`,
            type: dbInc.type,
            zoneId: dbInc.zoneId,
            x: dbInc.x || 50,
            y: dbInc.y || 50,
            risk: dbInc.risk || 'low',
            title: dbInc.description?.slice(0, 60) || dbInc.type,
            description: dbInc.description || '',
            status: dbInc.status || 'unverified',
            reportedBy: dbInc.reportedBy || 'Anonymous',
            hoursAgo: dbInc.hoursAgo || 0,
            hourOfDay: dbInc.hourOfDay || new Date().getHours(),
            photoDataUrl: dbInc.photoDataUrl,
          }));
          setIncidents(mapped);
        }
      })
      .catch((err) => console.error("Failed to load incidents:", err));
  }, []);

  // 2. Save new reports to the MongoDB backend
  async function addReport(r: NewReportInput): Promise<Incident> {
    const risk: RiskLevel = r.type === 'assault' || r.type === 'harassment' || r.type === 'fire' ? 'high' : 'medium';
    
    // Strictly match your Incident interface here so TypeScript is happy
    const newIncident: Incident = {
      id: `inc-user-${Date.now()}`, // Temporary ID
      type: r.type,
      zoneId: r.zoneId,
      x: r.x,
      y: r.y,
      risk,
      title: r.description.slice(0, 60) || 'Community report',
      description: r.description || 'No additional details provided.',
      status: 'unverified',
      reportedBy: CURRENT_USER_LABEL,
      hoursAgo: 0,
      hourOfDay: new Date().getHours(),
      photoDataUrl: r.photoDataUrl,
    };

    try {
      // POST the new report to your FastAPI backend, adding the timestamp just for the DB
      const response = await fetch('http://localhost:8000/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newIncident, timestamp: new Date().toISOString() })
      });
      
      const newDbIncident = await response.json();
      
      // If the database gives us a real MongoDB _id, update the incident ID
      if (newDbIncident._id) {
        newIncident.id = newDbIncident._id;
      }
      
      // Update local state so it appears on the map instantly
      setIncidents((prev) => [newIncident, ...prev]);
      return newIncident;
      
    } catch (error) {
      console.error("Failed to save report to database:", error);
      // Fallback: add to local state even if DB fails so UI doesn't break
      setIncidents((prev) => [newIncident, ...prev]);
      return newIncident;
    }
  }

  const myReports = incidents.filter((i) => i.reportedBy === CURRENT_USER_LABEL);
  const verifiedCount = myReports.filter((r) => r.status === 'verified' || r.status === 'resolved').length;

  // Trust score calculation
  const trustScore = Math.min(100, 40 + myReports.length * 6 + verifiedCount * 9);
  const trustLevel: ReportsContextValue['trustLevel'] =
    trustScore >= 90 ? 'Community Hero' : trustScore >= 70 ? 'Verified Guardian' : trustScore >= 50 ? 'Trusted' : 'New';

  return (
    <ReportsContext.Provider value={{ incidents, myReports, addReport, trustScore, trustLevel }}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be inside ReportsProvider');
  return ctx;
}