import { motion } from 'framer-motion';
import { Eye, Clock, Users } from 'lucide-react';
import Porthole from './Porthole';
import Reveal, { staggerContainer } from './Reveal';
import { storyDetails, photos } from '@/data/content';

const ICONS: Record<string, React.ElementType> = {
  'detail-watch': Eye,
  'detail-know': Clock,
  'detail-report': Users,
};

export default function GetFullStory() {
  return (
    <Porthole bgClassName="bg-ink" direction="up" className="pt-32 pb-2">
      <div className="bg-white px-6 pb-24 pt-20">
        <Reveal className="text-center">
          <motion.span className="inline-flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold tracking-wide text-white"
            animate={{ scale: [1,1.05,1] }} transition={{ duration: 2, repeat: Infinity }}>
            <span className="h-1.5 w-1.5 rounded-full bg-white" /> LIVE
          </motion.span>
          <h2 className="mx-auto mt-5 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Get the full story,<br />faster.
          </h2>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal from="left" className="flex justify-center">
            <div className="relative w-[260px] rounded-[2.5rem] border-4 border-neutral-900 bg-black p-2 shadow-2xl">
              <div className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
              <div className="relative aspect-[9/19] overflow-hidden rounded-[2rem]">
                <img src={photos.liveVideoMock} alt="Street scene at night" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-black/20" />
                <span className="absolute left-3 top-4 rounded bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">👁 7,390 views on SAFORA</span>
                <span className="absolute right-3 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white">✕</span>
              </div>
            </div>
          </Reveal>

          <motion.div className="flex flex-col gap-8"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {storyDetails.map((d) => {
              const Icon = ICONS[d.id] ?? Eye;
              return (
                <motion.div key={d.id} variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
                  className="flex gap-4">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${d.iconColorClass}`}>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </span>
                  <div>
                    <h4 className="font-display text-base font-bold text-ink">{d.title}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{d.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </Porthole>
  );
}
