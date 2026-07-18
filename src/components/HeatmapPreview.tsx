import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sun, Moon, Radio } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import Reveal from './Reveal';

type Risk = 'low' | 'mid' | 'high';
type Mode = 'day' | 'night' | 'live';

interface Zone { id: string; x: number; y: number; risk: Risk; label: string; }

const zones: Record<Mode, Zone[]> = {
  day: [
    { id: 'z1', x: 22, y: 30, risk: 'low', label: 'Hazratganj' },
    { id: 'z2', x: 48, y: 20, risk: 'low', label: 'Gomti Nagar' },
    { id: 'z3', x: 68, y: 40, risk: 'mid', label: 'Charbagh' },
    { id: 'z4', x: 30, y: 62, risk: 'low', label: 'Indira Nagar' },
    { id: 'z5', x: 58, y: 68, risk: 'mid', label: 'Aminabad' },
    { id: 'z6', x: 80, y: 75, risk: 'low', label: 'Alambagh' },
  ],
  night: [
    { id: 'z1', x: 22, y: 30, risk: 'mid', label: 'Hazratganj' },
    { id: 'z2', x: 48, y: 20, risk: 'low', label: 'Gomti Nagar' },
    { id: 'z3', x: 68, y: 40, risk: 'high', label: 'Charbagh' },
    { id: 'z4', x: 30, y: 62, risk: 'mid', label: 'Indira Nagar' },
    { id: 'z5', x: 58, y: 68, risk: 'high', label: 'Aminabad' },
    { id: 'z6', x: 80, y: 75, risk: 'mid', label: 'Alambagh' },
  ],
  live: [
    { id: 'z1', x: 22, y: 30, risk: 'low', label: 'Hazratganj' },
    { id: 'z2', x: 48, y: 20, risk: 'high', label: 'Gomti Nagar' },
    { id: 'z3', x: 68, y: 40, risk: 'mid', label: 'Charbagh' },
    { id: 'z4', x: 30, y: 62, risk: 'low', label: 'Indira Nagar' },
    { id: 'z5', x: 58, y: 68, risk: 'mid', label: 'Aminabad' },
    { id: 'z6', x: 80, y: 75, risk: 'high', label: 'Alambagh' },
  ],
};

const riskColor: Record<Risk, string> = { low: '#2ed573', mid: '#ffb020', high: '#ff4d4d' };
const riskLabel: Record<Risk, string> = { low: 'Low risk', mid: 'Caution', high: 'High risk' };

export default function HeatmapPreview() {
  const [mode, setMode] = useState<Mode>('night');
  const [hovered, setHovered] = useState<Zone | null>(null);

  return (
    <section className="bg-white px-6 py-24" id="map">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold tracking-widest text-gray-400">LIVE PREVIEW</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">See risk shift in real time.</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          Toggle between day, night, and live to see how the heatmap changes as new reports come in.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mx-auto mt-10 flex justify-center">
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList className="border-gray-200 bg-gray-100">
            <TabsTrigger value="day" className="data-[state=active]:text-ink text-gray-500">
              <Sun className="h-3.5 w-3.5" /> Day
            </TabsTrigger>
            <TabsTrigger value="night" className="data-[state=active]:text-ink text-gray-500">
              <Moon className="h-3.5 w-3.5" /> Night
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:text-ink text-gray-500">
              <Radio className="h-3.5 w-3.5" /> Live
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Reveal>

      <Reveal delay={0.2} className="mx-auto mt-10 max-w-4xl">
        <Card className="overflow-hidden border-gray-200 bg-ink p-0">
          <div className="relative h-[400px] w-full overflow-hidden">
            <svg className="absolute inset-0 h-full w-full opacity-15" preserveAspectRatio="none" viewBox="0 0 100 100">
              <g stroke="white" strokeWidth="0.3">
                <line x1="0" y1="20" x2="100" y2="15" /><line x1="0" y1="50" x2="100" y2="55" />
                <line x1="0" y1="80" x2="100" y2="75" /><line x1="20" y1="0" x2="15" y2="100" />
                <line x1="50" y1="0" x2="55" y2="100" /><line x1="80" y1="0" x2="75" y2="100" />
              </g>
            </svg>
            {['HAZRATGANJ','CHARBAGH','AMINABAD'].map((l, i) => (
              <span key={l} className="absolute font-mono text-[10px] tracking-widest text-white/15"
                style={{ left: `${12 + i * 32}%`, top: `${10 + i * 12}%` }}>{l}</span>
            ))}

            <AnimatePresence mode="wait">
              <motion.div key={mode} className="absolute inset-0"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                {zones[mode].map((z) => (
                  <button key={z.id} onMouseEnter={() => setHovered(z)} onMouseLeave={() => setHovered(null)}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${z.x}%`, top: `${z.y}%` }}
                    aria-label={`${z.label}: ${riskLabel[z.risk]}`}>
                    <motion.span className="absolute -inset-6 rounded-full blur-xl"
                      style={{ backgroundColor: riskColor[z.risk] }}
                      animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
                    <motion.span className="relative block h-3 w-3 rounded-full ring-2 ring-ink"
                      style={{ backgroundColor: riskColor[z.risk] }}
                      whileHover={{ scale: 1.8 }} />
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {hovered && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-4 left-4 flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/75 px-3.5 py-2.5 backdrop-blur-sm">
                  <MapPin className="h-4 w-4 text-white/60" />
                  <div>
                    <p className="text-xs font-semibold text-white">{hovered.label}</p>
                    <p className="text-[11px]" style={{ color: riskColor[hovered.risk] }}>{riskLabel[hovered.risk]}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute right-4 top-4 flex items-center gap-3 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 font-mono text-[10px] text-white backdrop-blur-sm">
              {(Object.entries(riskColor) as [Risk, string][]).map(([r, c]) => (
                <span key={r} className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />
                  {riskLabel[r]}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </Reveal>
    </section>
  );
}
