import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Reveal from './Reveal';
import { Button } from '@/components/ui/button';

export default function FinalCTA() {
  return (
    <section id="cta" className="bg-ink px-6 py-28 text-center">
      <Reveal>
        <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">Protect your world.</h2>
        

        <div className="mt-10 border-t border-white/10 pt-10">
          <p className="text-sm text-gray-400 mb-4">Already prepared? Set up your emergency alert now.</p>
          <Button asChild variant="danger" size="lg">
            <Link to="/sos"><AlertTriangle className="h-4 w-4" /> Set up SOS</Link>
          </Button>
        </div>
      </Reveal>

      {/* animated floating orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {[...Array(3)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full"
            style={{ width: 200 + i * 80, height: 200 + i * 80, left: `${20 + i * 25}%`, top: '30%', background: `radial-gradient(circle, rgba(255,77,77,0.06), transparent)` }}
            animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 }}
          />
        ))}
      </div>
    </section>
  );
}
