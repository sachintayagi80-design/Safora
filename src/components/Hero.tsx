import { motion } from 'framer-motion';
import { SignalHigh } from 'lucide-react';
import { Link } from 'react-router-dom';
import { phoneFeedItems } from '@/data/content';
import PhoneFeedCard from './PhoneFeedCard';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ink pt-32 pb-24">
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
        <svg className="h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <g stroke="rgba(255,255,255,0.08)" strokeWidth="1.5">
            <line x1="0" y1="120" x2="1000" y2="180" /><line x1="0" y1="320" x2="1000" y2="280" />
            <line x1="0" y1="520" x2="1000" y2="600" /><line x1="0" y1="740" x2="1000" y2="700" />
            <line x1="150" y1="0" x2="100" y2="1000" /><line x1="400" y1="0" x2="450" y2="1000" />
            <line x1="650" y1="0" x2="600" y2="1000" /><line x1="850" y1="0" x2="900" y2="1000" />
          </g>
        </svg>
        <span className="absolute left-[6%] top-[10%] font-mono text-xs tracking-widest text-white/20">HAZRATGANJ</span>
        <span className="absolute left-[55%] top-[24%] font-mono text-xs tracking-widest text-white/20">CHARBAGH</span>
        <span className="absolute left-[14%] top-[55%] font-mono text-xs tracking-widest text-white/20">GOMTI NAGAR</span>
        <span className="absolute left-[60%] top-[72%] font-mono text-xs tracking-widest text-white/20">AMINABAD</span>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-ink/40 to-ink" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: [0.21,0.47,0.32,0.98] }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-redbrand/30 bg-redbrand/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-redbrand animate-pulse" />
            <span className="font-mono text-[11px] tracking-widest text-redbrand">LIVE RISK INTELLIGENCE</span>
          </motion.div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl">
            Where neighbors<br />protect each other.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-gray-300">
            Receive real-time safety alerts, live community reports, and instant incident updates on the free SAFORA app.
          </p>
          
          <div className="mt-3 flex flex-wrap gap-3">
            
            <Button asChild variant="danger" size="lg">
              <Link to="/sos">🆘 SOS</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div className="flex justify-center lg:justify-end"
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.21,0.47,0.32,0.98] }}>
          <motion.div className="relative w-[300px] rounded-[2.5rem] border-4 border-neutral-800 bg-black p-2 shadow-2xl"
            animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
            <div className="overflow-hidden rounded-[2rem] bg-neutral-950">
              <div className="flex items-center justify-between px-5 pb-1 pt-4 text-[11px] text-white">
                <span>1:28</span><SignalHigh className="h-3.5 w-3.5" />
              </div>
              <p className="px-5 pb-3 pt-2 text-center text-[11px] font-bold tracking-widest text-gray-400">SAFORA FEED</p>
              <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto px-3 pb-5">
                {phoneFeedItems.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.15 }}>
                    <PhoneFeedCard item={item} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
