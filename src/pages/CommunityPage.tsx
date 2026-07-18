import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MapPin, Send, ShieldCheck, Users } from 'lucide-react';
import { CITY_ZONES } from '@/data/incidents';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function CommunityPage() {
  const { user } = useAuth();
  const [activeZone, setActiveZone] = useState(CITY_ZONES[0].id);
  const [messages, setMessages] = useState([
    { id: 1, author: 'P. Gupta', text: 'Does anyone know why the streetlights are out near the crossing?', time: '2h ago', verified: true },
    { id: 2, author: 'A. Sharma', text: 'I reported it to the municipality. They said it will be fixed by tomorrow.', time: '1h ago', verified: false },
    { id: 3, author: 'Community Bot', text: 'Verified Incident: Minor accident cleared near the main road.', time: '15m ago', verified: true, isBot: true },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { 
      id: Date.now(), 
      author: user?.displayName || 'Resident', 
      text: input, 
      time: 'Just now', 
      verified: false 
    }]);
    setInput('');
  };

  const zone = CITY_ZONES.find(z => z.id === activeZone);

  return (
    <div className="min-h-screen bg-ink px-4 pb-16 pt-28 md:px-8 flex justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Sidebar */}
        <div className="col-span-1 border border-white/10 bg-white/5 rounded-2xl p-4 h-fit">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><MapPin className="h-4 w-4 text-amber" /> Local Hubs</h2>
          <div className="flex flex-col gap-2">
            {CITY_ZONES.map(z => (
              <button 
                key={z.id} 
                onClick={() => setActiveZone(z.id)}
                className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeZone === z.id ? 'bg-bluebrand text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
              >
                {z.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-span-1 md:col-span-3 border border-white/10 bg-white/5 rounded-2xl flex flex-col h-[70vh]">
          <div className="border-b border-white/10 p-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white font-display">{zone?.name} Hub</h2>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1"><Users className="h-3 w-3" /> 142 neighbors active</p>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-teal bg-teal/10 px-2 py-1 rounded-full border border-teal/20">Secure Channel</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${m.isBot ? 'bg-amber/20 text-amber' : 'bg-white/10 text-white'}`}>
                  {m.author.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-300">{m.author}</span>
                    {m.verified && <ShieldCheck className="h-3 w-3 text-teal" />}
                    <span className="text-[10px] text-gray-500">{m.time}</span>
                  </div>
                  <div className={`mt-1 inline-block px-4 py-2 rounded-2xl text-sm ${m.isBot ? 'bg-amber/10 text-amber border border-amber/20' : 'bg-white/10 text-white'}`}>
                    {m.text}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t border-white/10 flex gap-3">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question or share an update..." 
              className="flex-1 bg-ink/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-bluebrand"
            />
            <Button className="bg-bluebrand hover:bg-bluebrand/90 px-4" onClick={handleSend}><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
