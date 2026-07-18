import Features from '@/components/Features';
import HeatmapPreview from '@/components/HeatmapPreview';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

export default function FeaturesPage() {
  return (
    <div className="bg-ink pt-[72px]">
      <Features />
      <HeatmapPreview />
      <FinalCTA />
      <Footer />
    </div>
  );
}
