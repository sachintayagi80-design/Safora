import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldCheck, Clock3, Brain, RefreshCw, ServerCog } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReports } from '@/context/ReportsContext';
import { fetchZoneRiskPredictions, type ZoneRiskPrediction } from '@/lib/riskEngine';
import { CITY_ZONES, RISK_COLOR, type Incident } from '@/data/incidents';

function buildCrimeTrend(incidents: Incident[]) {
  const days = Array.from({ length: 7 }, (_, i) => 6 - i);
  return days.map((daysAgo) => {
    const count = incidents.filter((inc) => Math.floor(inc.hoursAgo / 24) === daysAgo).length;
    const label = daysAgo === 0 ? 'Today' : `${daysAgo}d ago`;
    return { day: label, incidents: count };
  }).reverse();
}

function buildSafestAreas(incidents: Incident[]) {
  return CITY_ZONES.map((z) => ({
    zone: z.name,
    incidents: incidents.filter((i) => i.zoneId === z.id).length,
  })).sort((a, b) => a.incidents - b.incidents);
}

function buildPeakHours(incidents: Incident[]) {
  const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, count: 0, h }));
  incidents.forEach((i) => { buckets[i.hourOfDay].count += 1; });
  return buckets;
}

export default function AnalyticsPage() {
  const { incidents } = useReports();
  const [predictions, setPredictions] = useState<ZoneRiskPrediction[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [source, setSource] = useState<'backend' | 'local-fallback' | null>(null);

  const crimeTrend = useMemo(() => buildCrimeTrend(incidents), [incidents]);
  const safestAreas = useMemo(() => buildSafestAreas(incidents), [incidents]);
  const peakHours = useMemo(() => buildPeakHours(incidents), [incidents]);
  const busiestHour = useMemo(() => peakHours.reduce((a, b) => (b.count > a.count ? b : a), peakHours[0]), [peakHours]);

  async function loadPredictions() {
    setLoadingPredictions(true);
    const preds = await fetchZoneRiskPredictions(incidents);
    setPredictions(preds.sort((a, b) => b.score - a.score));
    setSource(preds[0]?.source ?? null);
    setLoadingPredictions(false);
  }

  useEffect(() => { loadPredictions(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="min-h-screen bg-ink px-4 pb-16 pt-28 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500">CITY INSIGHTS</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-400">Crime trends, safest areas, and predictive risk for Lucknow.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-gray-400">
            <ServerCog className="h-3.5 w-3.5" />
            {source === 'backend' ? 'Live model: FastAPI + scikit-learn' : 'Local heuristic model (backend offline)'}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* crime trend */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-bluebrand" /> Crime Trend — Last 7 Days</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={crimeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="incidents" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* trust / verified summary */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4 text-teal" /> Verification Rate</CardTitle></CardHeader>
            <CardContent>
              <VerificationDonut incidents={incidents} />
            </CardContent>
          </Card>

          {/* safest areas */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Safest Areas (fewest reports)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={safestAreas} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" stroke="#666" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis dataKey="zone" type="category" stroke="#999" fontSize={11} tickLine={false} axisLine={false} width={110} />
                  <Tooltip contentStyle={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="incidents" radius={[0, 6, 6, 0]}>
                    {safestAreas.map((entry, idx) => (
                      <Cell key={idx} fill={entry.incidents <= 3 ? '#2ed573' : entry.incidents <= 7 ? '#ffb020' : '#ff4d4d'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* peak hours */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Clock3 className="h-4 w-4 text-amber" /> Peak Incident Hours</CardTitle></CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-gray-400">Busiest hour: <span className="font-semibold text-amber">{busiestHour.hour}</span></p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={peakHours}>
                  <XAxis dataKey="hour" stroke="#555" fontSize={8} interval={2} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {peakHours.map((b, idx) => (
                      <Cell key={idx} fill={b.h === busiestHour.h ? '#ff4d4d' : '#ffb020'} fillOpacity={b.h === busiestHour.h ? 1 : 0.55} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* predictive risk scoring */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base"><Brain className="h-4 w-4 text-redbrand" /> Predictive Risk Scoring</CardTitle>
              <button onClick={loadPredictions} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                <RefreshCw className={`h-3 w-3 ${loadingPredictions ? 'animate-spin' : ''}`} /> Recompute
              </button>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-xs text-gray-400">
                Scores are produced by the SAFORA risk model (<code className="text-gray-300">/backend</code> — Pandas feature aggregation + a scikit-learn gradient boosting regressor trained on incident history, time-of-day, and zone base rate).
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                {predictions.map((p) => (
                  <motion.div key={p.zoneId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                    <p className="truncate text-[11px] font-semibold text-white">{p.zoneName}</p>
                    <p className="mt-1.5 font-display text-xl font-bold" style={{ color: RISK_COLOR[p.risk] }}>{p.score}</p>
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: RISK_COLOR[p.risk] }}>{p.risk}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function VerificationDonut({ incidents }: { incidents: Incident[] }) {
  const verified = incidents.filter((i) => i.status === 'verified' || i.status === 'resolved').length;
  const pct = incidents.length ? Math.round((verified / incidents.length) * 100) : 0;
  const circumference = 2 * Math.PI * 44;
  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative h-32 w-32">
        <svg className="-rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="#1fc7c7" strokeWidth="9" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct / 100)} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-white">{pct}%</span>
          <span className="text-[10px] text-gray-400">verified</span>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-gray-400">{verified} of {incidents.length} reports community-verified</p>
    </div>
  );
}
