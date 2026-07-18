import { motion } from 'framer-motion';
import { Trophy, Star, ShieldCheck, TrendingUp } from 'lucide-react';

const LEADERS = [
  { rank: 1, name: 'A. Sharma', score: 940, level: 'Community Hero', reports: 42, color: '#ffb020' },
  { rank: 2, name: 'P. Gupta', score: 820, level: 'Verified Guardian', reports: 31, color: '#3b82f6' },
  { rank: 3, name: 'R. Verma', score: 710, level: 'Verified Guardian', reports: 24, color: '#3b82f6' },
  { rank: 4, name: 'S. Singh', score: 650, level: 'Trusted', reports: 18, color: '#1fc7c7' },
  { rank: 5, name: 'Anonymous', score: 540, level: 'Trusted', reports: 15, color: '#1fc7c7' },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-ink px-4 pt-28 pb-16 md:px-8 flex justify-center">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <div className="h-16 w-16 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-8 w-8 text-amber" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Community Leaderboard</h1>
          <p className="text-sm text-gray-400">Recognizing the heroes who help keep our neighborhoods safe by submitting and verifying reports.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-5">Resident</div>
            <div className="col-span-2 text-right">Reports</div>
            <div className="col-span-3 text-right">Trust Score</div>
          </div>
          
          <div className="flex flex-col">
            {LEADERS.map((l, i) => (
              <motion.div 
                key={l.rank} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.1 }}
                className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-white/5 last:border-0 items-center hover:bg-white/5 transition-colors"
              >
                <div className="col-span-2 flex justify-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${l.rank === 1 ? 'bg-amber text-ink' : l.rank === 2 ? 'bg-gray-300 text-ink' : l.rank === 3 ? 'bg-[#cd7f32] text-ink' : 'text-gray-500'}`}>
                    {l.rank}
                  </div>
                </div>
                <div className="col-span-5">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    {l.name}
                    {l.rank <= 3 && <Star className="h-3 w-3 text-amber fill-amber" />}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: l.color }}>{l.level}</div>
                </div>
                <div className="col-span-2 text-right font-mono text-sm text-gray-300">
                  {l.reports}
                </div>
                <div className="col-span-3 text-right flex flex-col items-end">
                  <span className="font-display font-bold text-lg" style={{ color: l.color }}>{l.score}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4" /> Verify reports in the Live Map to earn Trust Points.
        </div>
      </div>
    </div>
  );
}
