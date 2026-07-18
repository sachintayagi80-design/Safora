import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import Reveal from './Reveal';

const faqs = [
  { q: 'Is SAFORA free to use?', a: 'Yes — the core app including live alerts, heatmap, and reporting is completely free. Premium adds extended history and priority routing.' },
  { q: 'How does SAFORA verify reports?', a: 'Reports are cross-checked against nearby submissions and public incident data before influencing the heatmap, reducing false alarms.' },
  { q: 'Does SAFORA share my location?', a: 'Your location is only used to surface relevant nearby alerts. Reports can be submitted anonymously and your identity is never shown on the map.' },
  { q: 'Can law enforcement see my reports?', a: 'Aggregated, anonymized data is visible to verified law enforcement partners to help direct resources. Individual identities are never shared.' },
  { q: 'How does the SOS feature work?', a: 'Tap SOS, add your emergency contacts, and if you trigger an alert a 5-second countdown starts. Your contacts receive your live location. You can cancel any time before it dispatches.' },
  { q: 'Which cities does SAFORA cover?', a: 'SAFORA is currently a concept project piloted in Lucknow with an architecture built to extend city-wide and beyond.' },
];

export default function FAQ() {
  return (
    <section className="bg-ink px-6 py-24" id="faq">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold tracking-widest text-gray-400">FAQ</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Questions, answered.</h2>
      </Reveal>
      <Reveal delay={0.1} className="mx-auto mt-12 max-w-2xl">
        <Accordion type="single" collapsible>
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
