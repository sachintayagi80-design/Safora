import Footer from '@/components/Footer';
import { Calendar, ChevronRight } from 'lucide-react';

const POSTS = [
  { id: 1, title: 'Introducing Heatmap Analytics', excerpt: 'Dive deeper into incident data with our new thermal mapping feature.', date: 'Oct 24, 2023', category: 'Product Updates' },
  { id: 2, title: 'How to Stay Safe at Night', excerpt: '5 actionable tips from security experts for navigating the city after dark.', date: 'Oct 18, 2023', category: 'Safety Guides' },
  { id: 3, title: 'Community Trust Scores Explained', excerpt: 'Learn how our gamified verification system prevents false reporting.', date: 'Oct 12, 2023', category: 'Features' },
  { id: 4, title: 'SAFORA launches in 3 new cities', excerpt: 'We are expanding our real-time safety network to Delhi, Mumbai, and Bangalore.', date: 'Oct 05, 2023', category: 'Company News' },
];

export default function BlogPage() {
  return (
    <div className="bg-ink pt-[72px] min-h-screen flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Safety Blog</h1>
        <p className="text-gray-400 text-lg mb-16">The latest news, product updates, and safety tips from the SAFORA team.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {POSTS.map(post => (
            <div key={post.id} className="border border-white/10 bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
              <span className="text-[10px] uppercase tracking-widest font-bold text-bluebrand bg-bluebrand/10 px-2 py-1 rounded-full">{post.category}</span>
              <h2 className="text-2xl font-bold text-white mt-4 mb-2 group-hover:text-bluebrand transition-colors">{post.title}</h2>
              <p className="text-gray-400 text-sm mb-6">{post.excerpt}</p>
              <div className="flex justify-between items-center text-xs text-gray-500 font-semibold border-t border-white/10 pt-4 mt-auto">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {post.date}</span>
                <span className="flex items-center gap-1 group-hover:text-white transition-colors">Read Post <ChevronRight className="h-3 w-3" /></span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
