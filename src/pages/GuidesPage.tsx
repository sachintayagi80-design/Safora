import { motion } from 'framer-motion';
import { Flame, Activity, ShieldAlert, HeartPulse, Building2, Wind } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const GUIDES = [
  { id: 'fire', title: 'Fire Safety', icon: Flame, color: '#ff4d4d', steps: ['Crawl low under smoke.', 'Feel doors before opening them.', 'Use the stairs, never the elevator.'] },
  { id: 'assault', title: 'Physical Assault', icon: ShieldAlert, color: '#ffb020', steps: ['Make noise to draw attention.', 'Trust your instincts and run to a crowded area.', 'Keep your hands free (drop heavy bags).'] },
  { id: 'medical', title: 'Medical Emergency', icon: HeartPulse, color: '#1fc7c7', steps: ['Check for breathing and pulse.', 'Call emergency services immediately.', 'Do not move the person unless in immediate danger.'] },
  { id: 'earthquake', title: 'Earthquakes', icon: Activity, color: '#3b82f6', steps: ['Drop, Cover, and Hold On.', 'Stay away from windows and heavy furniture.', 'If outdoors, move to an open area.'] },
  { id: 'flood', title: 'Flash Floods', icon: Wind, color: '#3b82f6', steps: ['Move immediately to higher ground.', 'Do not walk or drive through flood waters.', 'Disconnect electrical appliances.'] },
  { id: 'evacuation', title: 'Evacuation', icon: Building2, color: '#2ed573', steps: ['Grab your pre-packed emergency kit.', 'Follow designated evacuation routes.', 'Lock your home before leaving.'] },
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-ink px-4 pt-28 pb-16 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="font-display text-4xl font-bold text-white mb-4">Emergency Preparedness</h1>
          <p className="text-gray-400 text-sm">Quick, actionable advice on what to do during critical situations. Stay informed, stay safe.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GUIDES.map((g, i) => {
            const Icon = g.icon;
            return (
              <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full border-white/5 hover:border-white/15 transition-colors overflow-hidden group bg-white/5 hover:bg-white/[0.07]">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ backgroundColor: `${g.color}15` }}>
                      <Icon className="h-6 w-6" style={{ color: g.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{g.title}</h3>
                    <ul className="space-y-3">
                      {g.steps.map((step, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-gray-400">
                          <span className="font-mono text-[10px] font-bold mt-0.5" style={{ color: g.color }}>0{idx + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
