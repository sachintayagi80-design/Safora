import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, MapPin, Filter, X, Navigation, ShieldCheck, Clock, ChevronRight,
  BarChart3, FilePlus2, UserCircle2, Siren, Layers
} from 'lucide-react';
import MapView from '@/components/MapView';
import { Button } from '@/components/ui/button';
import { useReports } from '@/context/ReportsContext';
import { CITY_ZONES, INCIDENT_TYPES, RISK_COLOR, RISK_LABEL, timeAgoLabel, type Incident, type IncidentType, type RiskLevel } from '@/data/incidents';

type TimeFilter = 'all' | '24h' | '7d';

const QUICK_LINKS = [
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/report', label: 'Report', icon: FilePlus2 },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
  { to: '/sos', label: 'SOS', icon: Siren },
];

export default function AppPage() {
  const { incidents } = useReports();
  const [typeFilter, setTypeFilter] = useState<IncidentType[]>([]);
  const [riskFilter, setRiskFilter] = useState<RiskLevel[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('markers');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [routingOpen, setRoutingOpen] = useState(false);
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [avoidHighRisk, setAvoidHighRisk] = useState(true);
  const [route, setRoute] = useState<{ start: { x: number; y: number; label: string }; end: { x: number; y: number; label: string } } | null>(null);

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      if (typeFilter.length && !typeFilter.includes(i.type)) return false;
      if (riskFilter.length && !riskFilter.includes(i.risk)) return false;
      if (timeFilter === '24h' && i.hoursAgo > 24) return false;
      if (timeFilter === '7d' && i.hoursAgo > 168) return false;
      return true;
    }).sort((a, b) => a.hoursAgo - b.hoursAgo);
  }, [incidents, typeFilter, riskFilter, timeFilter]);

  const selected = incidents.find((i) => i.id === selectedId);

  function toggleType(t: IncidentType) {
    setTypeFilter((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }
  function toggleRisk(r: RiskLevel) {
    setRiskFilter((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }

  function planRoute() {
    if (!start || !destination) return;
    // Simulated safe-routing: pick zones matching the typed names (fallback to first/last),
    // then bias the path toward low-risk zones when "avoid high-risk" is enabled.
    const startZone = CITY_ZONES.find((z) => z.name.toLowerCase().includes(start.toLowerCase())) ?? CITY_ZONES[0];
    let endZone = CITY_ZONES.find((z) => z.name.toLowerCase().includes(destination.toLowerCase())) ?? CITY_ZONES[CITY_ZONES.length - 1];
    if (avoidHighRisk && endZone.baseRisk === 'high') {
      const safer = CITY_ZONES.find((z) => z.baseRisk !== 'high' && z.id !== startZone.id);
      if (safer) endZone = safer;
    }
    setRoute({
      start: { x: startZone.x, y: startZone.y, label: startZone.name },
      end: { x: endZone.x, y: endZone.y, label: endZone.name },
    });
  }

  const activeFilterCount = typeFilter.length + riskFilter.length + (timeFilter !== '7d' ? 1 : 0);

  return (
    <div className="flex h-screen w-full flex-col bg-ink pt-[64px] md:pt-[72px]">
      {/* top bar under global nav */}
      <div className="flex items-center justify-between border-b border-white/10 bg-ink2 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-redbrand animate-pulse" />
          <span className="font-display text-sm font-bold text-white">Live View</span>
          <span className="hidden text-xs text-gray-500 sm:inline">· {filtered.length} incidents shown</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/report">
            <Button size="sm" className="h-8 gap-1.5 bg-redbrand hover:bg-redbrand/90 font-bold hidden sm:flex">
              <FilePlus2 className="h-3.5 w-3.5" /> Report Incident
            </Button>
          </Link>
          <button onClick={() => setViewMode(v => v === 'markers' ? 'heatmap' : 'markers')}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${viewMode === 'heatmap' ? 'border-amber bg-amber/15 text-amber' : 'border-white/10 text-gray-300 hover:bg-white/5'}`}>
            <Layers className="h-3.5 w-3.5" /> {viewMode === 'heatmap' ? 'Heatmap' : 'Markers'}
          </button>
          <button onClick={() => setRoutingOpen((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${routingOpen ? 'border-bluebrand bg-bluebrand/15 text-bluebrand' : 'border-white/10 text-gray-300 hover:bg-white/5'}`}>
            <Navigation className="h-3.5 w-3.5" /> Safe Route
          </button>
          <button onClick={() => setFiltersOpen((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${filtersOpen ? 'border-amber bg-amber/15 text-amber' : 'border-white/10 text-gray-300 hover:bg-white/5'}`}>
            <Filter className="h-3.5 w-3.5" /> Filters {activeFilterCount > 0 && <span className="ml-0.5 rounded-full bg-amber px-1.5 text-[10px] text-ink">{activeFilterCount}</span>}
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        {/* map */}
        <div className="relative flex-1">
          <MapView incidents={filtered} route={route} selectedIncidentId={selectedId} onSelectIncident={setSelectedId} showHeatmap={viewMode === 'heatmap'} />

          {/* filters popover */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="absolute right-4 top-4 z-30 w-72 rounded-2xl border border-white/10 bg-ink2/95 p-4 shadow-2xl backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-white">Filters</p>
                  <button onClick={() => setFiltersOpen(false)}><X className="h-4 w-4 text-gray-400" /></button>
                </div>

                <p className="mb-1.5 text-[11px] font-semibold text-gray-400">TIME RANGE</p>
                <div className="mb-4 flex gap-1.5">
                  {(['24h', '7d', 'all'] as TimeFilter[]).map((t) => (
                    <button key={t} onClick={() => setTimeFilter(t)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${timeFilter === t ? 'bg-bluebrand text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      {t === '24h' ? '24h' : t === '7d' ? '7 days' : 'All time'}
                    </button>
                  ))}
                </div>

                <p className="mb-1.5 text-[11px] font-semibold text-gray-400">RISK LEVEL</p>
                <div className="mb-4 flex gap-1.5">
                  {(['low', 'medium', 'high'] as RiskLevel[]).map((r) => (
                    <button key={r} onClick={() => toggleRisk(r)}
                      className={`flex-1 rounded-lg border py-1.5 text-[11px] font-semibold transition-colors ${riskFilter.includes(r) ? 'border-transparent text-ink' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
                      style={riskFilter.includes(r) ? { backgroundColor: RISK_COLOR[r] } : {}}>
                      {RISK_LABEL[r]}
                    </button>
                  ))}
                </div>

                <p className="mb-1.5 text-[11px] font-semibold text-gray-400">INCIDENT TYPE</p>
                <div className="flex flex-wrap gap-1.5">
                  {INCIDENT_TYPES.map((t) => (
                    <button key={t.value} onClick={() => toggleType(t.value)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${typeFilter.includes(t.value) ? 'border-transparent bg-white text-ink font-semibold' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>

                {activeFilterCount > 0 && (
                  <button onClick={() => { setTypeFilter([]); setRiskFilter([]); setTimeFilter('7d'); }}
                    className="mt-4 w-full text-center text-xs text-gray-400 hover:text-white transition-colors">Clear all filters</button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* safe routing panel */}
          <AnimatePresence>
            {routingOpen && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="absolute left-4 top-4 z-30 w-80 rounded-2xl border border-white/10 bg-ink2/95 p-4 shadow-2xl backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-white flex items-center gap-1.5"><Navigation className="h-4 w-4 text-bluebrand" /> Safe Routing</p>
                  <button onClick={() => setRoutingOpen(false)}><X className="h-4 w-4 text-gray-400" /></button>
                </div>
                <div className="flex flex-col gap-2.5">
                  <input value={start} onChange={(e) => setStart(e.target.value)} placeholder="Start (e.g. Hazratganj)"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/25 focus:border-bluebrand" />
                  <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination (e.g. Alambagh)"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/25 focus:border-bluebrand" />
                  <label className="flex items-center gap-2 text-xs text-gray-300">
                    <input type="checkbox" checked={avoidHighRisk} onChange={(e) => setAvoidHighRisk(e.target.checked)} className="h-3.5 w-3.5 accent-bluebrand" />
                    Avoid high-risk zones
                  </label>
                  <Button size="sm" className="bg-bluebrand hover:bg-bluebrand/90" onClick={planRoute} disabled={!start || !destination}>
                    Find safest route
                  </Button>
                  {route && (
                    <div className="rounded-lg border border-bluebrand/30 bg-bluebrand/10 px-3 py-2 text-[11px] text-bluebrand">
                      Routing {route.start.label} → {route.end.label}{avoidHighRisk ? ', avoiding flagged zones' : ''}.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* selected incident card */}
          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 z-30 mx-auto max-w-md rounded-2xl border border-white/10 bg-ink2/95 p-4 shadow-2xl backdrop-blur-md md:left-4 md:right-auto">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-ink" style={{ backgroundColor: RISK_COLOR[selected.risk] }}>{RISK_LABEL[selected.risk]}</span>
                    <p className="font-display text-sm font-bold text-white">{selected.title}</p>
                    <p className="mt-1 text-xs text-gray-400">{selected.description}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500"><Clock className="h-3 w-3" /> {timeAgoLabel(selected.hoursAgo)} · {selected.reportedBy}</p>
                  </div>
                  <button onClick={() => setSelectedId(null)}><X className="h-4 w-4 text-gray-400" /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* side panel — live feed */}
        <div className="hidden w-96 flex-col border-l border-white/10 bg-ink2 lg:flex">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="font-display text-sm font-bold text-white">Live Incident Feed</p>
            <p className="text-xs text-gray-500">Updates as reports are verified</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((inc) => (
              <FeedRow key={inc.id} incident={inc} active={inc.id === selectedId} onClick={() => setSelectedId(inc.id)} />
            ))}
            {filtered.length === 0 && <p className="px-4 py-10 text-center text-xs text-gray-500">No incidents match your filters.</p>}
          </div>
          <div className="grid grid-cols-4 gap-1 border-t border-white/10 p-2">
            {QUICK_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="flex flex-col items-center gap-1 rounded-lg py-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                <l.icon className="h-4 w-4" /><span className="text-[10px]">{l.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* mobile feed drawer toggle */}
      <MobileFeedDrawer incidents={filtered} onSelect={setSelectedId} selectedId={selectedId} />
    </div>
  );
}

function FeedRow({ incident, active, onClick }: { incident: Incident; active: boolean; onClick: () => void }) {
  const meta = INCIDENT_TYPES.find((t) => t.value === incident.type)!;
  return (
    <button onClick={onClick} className={`flex w-full items-start gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors ${active ? 'bg-white/10' : 'hover:bg-white/5'}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm" style={{ backgroundColor: `${RISK_COLOR[incident.risk]}25` }}>{meta.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-white">{incident.title}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500">
          <MapPin className="h-3 w-3" /> {CITY_ZONES.find((z) => z.id === incident.zoneId)?.name} · {timeAgoLabel(incident.hoursAgo)}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase text-ink" style={{ backgroundColor: RISK_COLOR[incident.risk] }}>{incident.risk}</span>
          {incident.status === 'verified' && <span className="flex items-center gap-0.5 text-[9px] text-teal"><ShieldCheck className="h-2.5 w-2.5" /> Verified</span>}
        </div>
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-600" />
    </button>
  );
}

function MobileFeedDrawer({ incidents, onSelect, selectedId }: { incidents: Incident[]; onSelect: (id: string) => void; selectedId: string | null }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen((v) => !v)} className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full bg-bluebrand px-4 py-2.5 text-xs font-bold text-white shadow-xl">
        <Radio className="h-3.5 w-3.5" /> Feed ({incidents.length})
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-ink2">
            <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-ink2 px-4 py-3">
              <p className="font-display text-sm font-bold text-white">Live Feed</p>
              <button onClick={() => setOpen(false)}><X className="h-4 w-4 text-gray-400" /></button>
            </div>
            {incidents.map((inc) => (
              <FeedRow key={inc.id} incident={inc} active={inc.id === selectedId} onClick={() => { onSelect(inc.id); setOpen(false); }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
