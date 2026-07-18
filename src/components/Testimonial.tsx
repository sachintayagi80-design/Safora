import { motion } from 'framer-motion';
import Reveal from './Reveal';

export default function Testimonial() {
  return (
    <section className="bg-white px-6 py-24">
      <Reveal className="mx-auto max-w-3xl">
        <motion.span className="font-display text-5xl font-bold text-blue-500"
          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }}>&ldquo;</motion.span>
        <blockquote className="mt-2 font-display text-2xl font-medium leading-snug text-ink sm:text-3xl">
          If there's a crowd, a road closure, or something just doesn't feel right,
          it's incredibly helpful to pull up SAFORA and know why.
        </blockquote>
        <p className="mt-6 text-sm text-gray-500">
          <strong className="font-semibold text-ink">Priya S.,</strong> Lucknow user since 2025
        </p>
      </Reveal>
    </section>
  );
}
