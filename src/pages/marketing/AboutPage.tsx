import Stories from '@/components/Stories';
import GetFullStory from '@/components/GetFullStory';
import Testimonial from '@/components/Testimonial';
import GreaterGood from '@/components/GreaterGood';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="bg-ink pt-[72px]">
      <div className="py-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Our Mission</h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">We believe that safety is a fundamental human right. SAFORA was built to empower communities with real-time awareness and rapid response networks.</p>
      </div>
      <Stories />
      <GetFullStory />
      <Testimonial />
      <GreaterGood />
      <Footer />
    </div>
  );
}
