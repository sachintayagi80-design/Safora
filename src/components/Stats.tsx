import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, target, {
      duration: 1.6, ease: [0.21, 0.47, 0.32, 0.98],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [inView, target]);

  return <span ref={ref}>{val}{suffix}</span>;
}

const stats = [
  { value: 30, suffix: '%+', label: 'More accurate than legacy systems' },
  { value: 45, suffix: '%', label: 'Faster emergency response time' },
  { value: 60, suffix: '%', label: 'Less manual monitoring needed' },
  { value: 12, suffix: '+', label: 'Neighborhoods in pilot city' },
];

export default function Stats() {
  return (
    <section className="bg-ink border-y border-white/5 px-6 py-20">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-10 sm:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} className="text-center"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
            <p className="font-display text-4xl font-bold text-white sm:text-5xl">
              <Counter target={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-xs leading-snug text-gray-400">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
