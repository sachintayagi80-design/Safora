import { motion } from 'framer-motion';
import { BellRing, Video, Search, Radio } from 'lucide-react';
import { features } from '@/data/content';
import Reveal, { staggerContainer } from './Reveal';

const ICONS: Record<string, React.ElementType> = {
  'feature-notify': BellRing,
  'feature-report': Video,
  'feature-search': Search,
};

export default function Features() {
  return (
    <section className="bg-ink px-6 py-24" id="how">
      <Reveal>
        <motion.div whileHover={{ scale: 1.01 }}
          className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-2xl sm:flex sm:items-start sm:gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white">
            <Radio className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <div className="mt-3 sm:mt-0">
            <div className="flex items-center gap-2">
              <strong className="text-sm text-ink">SAFORA</strong>
              <span className="text-xs text-gray-400">4m ago</span>
            </div>
            <p className="mt-1 font-semibold text-ink">Oil Tanker Crashed, Gallons Spilling Into Gomti River</p>
            <p className="mt-0.5 text-sm text-gray-500">Charbagh, Lucknow</p>
          </div>
        </motion.div>
      </Reveal>

      <motion.div className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-12 sm:grid-cols-3"
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={staggerContainer}>
        {features.map((f) => {
          const Icon = ICONS[f.id] ?? BellRing;
          return (
            <motion.div key={f.id}
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}>
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.iconColorClass}`}>
                <Icon className="h-[22px] w-[22px]" strokeWidth={1.6} />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{f.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
