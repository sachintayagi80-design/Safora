import { Zap, CheckCircle2, Shield } from 'lucide-react';
import Porthole from './Porthole';
import Reveal, { staggerContainer } from './Reveal';
import { motion } from 'framer-motion';
import { greaterGoodItems, photos } from '@/data/content';

const ICONS: Record<string, React.ElementType> = {
  'gg-hospitals': Zap,
  'gg-transparency': CheckCircle2,
  'gg-access': Shield,
};

export default function GreaterGood() {
  return (
    <Porthole bgClassName="bg-white" direction="up" className="pt-2 pb-32">
      <div className="relative min-h-[640px] w-full">
        <img src={photos.greaterGoodHero} alt="Doctors walking down a hospital hallway"
          className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/60 to-ink/90" />
        <div className="relative px-6 pb-16 pt-20 sm:px-12">
          <Reveal>
            <h2 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
              For the<br />greater good.
            </h2>
          </Reveal>
          <motion.div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {greaterGoodItems.map((item) => {
              const Icon = ICONS[item.id] ?? Shield;
              return (
                <motion.div key={item.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.iconColorClass}`}>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </span>
                  <h4 className="mt-4 font-display text-base font-bold text-white">{item.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-gray-300">{item.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </Porthole>
  );
}
