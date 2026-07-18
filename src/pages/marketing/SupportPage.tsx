import FAQ from '@/components/FAQ';
import Stats from '@/components/Stats';
import Footer from '@/components/Footer';
import { Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SupportPage() {
  return (
    <div className="bg-ink pt-[72px]">
      <div className="py-20 text-center px-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Support & FAQ</h1>
        <p className="text-gray-400 text-lg mb-12">Need help? We've got you covered. Check out our frequently asked questions or reach out to our team.</p>
        
        <div className="grid md:grid-cols-2 gap-6 text-left mb-16">
          <div className="border border-white/10 bg-white/5 rounded-2xl p-6">
            <Mail className="h-8 w-8 text-bluebrand mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Email Support</h3>
            <p className="text-gray-400 text-sm mb-4">Our team typically responds within 24 hours.</p>
            <Button variant="outline" className="w-full">Contact Support</Button>
          </div>
          <div className="border border-white/10 bg-white/5 rounded-2xl p-6">
            <MessageSquare className="h-8 w-8 text-amber mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Community Discord</h3>
            <p className="text-gray-400 text-sm mb-4">Join 10,000+ residents discussing local safety.</p>
            <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4]">Join Discord</Button>
          </div>
        </div>
      </div>
      <FAQ />
      <Stats />
      <Footer />
    </div>
  );
}
