import { motion } from 'framer-motion';
import { stories } from '@/data/content';
import Reveal, { staggerContainer } from './Reveal';

export default function Stories() {
  return (
    <section className="bg-white py-24 text-center">
      <Reveal>
        <p className="text-xs font-bold tracking-widest text-gray-400">REAL STORIES</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">See how SAFORA helps others</h2>
      </Reveal>
      <motion.div className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-8 px-6"
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={staggerContainer}>
        {stories.map((story) => (
          <motion.div key={story.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="flex w-28 flex-col items-center gap-3 cursor-default">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl ${story.colorClass} transition-transform`}>
              {story.emoji}
            </div>
            <p className="whitespace-pre-line text-xs font-semibold leading-snug text-ink">{story.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
