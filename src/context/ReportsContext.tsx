import { createContext, useContext, useState, type ReactNode } from 'react';
import { SEED_INCIDENTS, type Incident, type IncidentType, type RiskLevel } from '@/data/incidents';

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
  addReport: (r: NewReportInput) => Incident;
  trustScore: number;
  trustLevel: 'New' | 'Trusted' | 'Verified Guardian' | 'Community Hero';
}

const ReportsContext = createContext<ReportsContextValue | undefined>(undefined);

const CURRENT_USER_LABEL = 'You';

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>(SEED_INCIDENTS);

  function addReport(r: NewReportInput): Incident {
    const risk: RiskLevel = r.type === 'assault' || r.type === 'harassment' || r.type === 'fire' ? 'high' : 'medium';
    const incident: Incident = {
      id: `inc-user-${Date.now()}`,
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
    setIncidents((prev) => [incident, ...prev]);
    return incident;
  }

  const myReports = incidents.filter((i) => i.reportedBy === CURRENT_USER_LABEL);
  const verifiedCount = myReports.filter((r) => r.status === 'verified' || r.status === 'resolved').length;

  // Trust score: base 40 + points per submitted report + bonus for verified ones, capped at 100
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
