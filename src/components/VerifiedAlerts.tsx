import { motion } from 'framer-motion';
import Porthole from './Porthole';
import { photos } from '@/data/content';

export default function VerifiedAlerts() {
  return (
    <Porthole bgClassName="bg-ink" direction="up" className="pt-2 pb-32">
      <div className="relative h-[600px] w-full">
        <img src={photos.verifiedAlertsHero} alt="A woman walking down a city street at night"
          className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/50" />
        <motion.div className="absolute inset-0 flex items-center justify-center px-6 text-center"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.21,0.47,0.32,0.98] }}>
          <h2 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Verified alerts. Real reports<br />from your community.
          </h2>
        </motion.div>
        {[{ left: '8%', top: '55%' }, { left: '15%', bottom: '10%' }, { right: '12%', bottom: '6%' }].map((pos, i) => (
          <motion.span key={i}
            className="absolute flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white/20 text-xl backdrop-blur-sm"
            style={pos as React.CSSProperties}
            animate={{ y: [0, -6, 0] }} transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}>
            👤
          </motion.span>
        ))}
      </div>
    </Porthole>
  );
}
