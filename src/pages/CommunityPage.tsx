import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MapPin, Send, ShieldCheck, Users } from 'lucide-react';
import { CITY_ZONES } from '@/data/incidents';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function CommunityPage() {
  const { user } = useAuth();
  const [activeZone, setActiveZone] = useState(CITY_ZONES[0].id);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  
  // 1. Fetch real messages from MongoDB for the active zone
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/hub/${activeZone}`);
        if (response.ok) {
          const data = await response.json();
          // The API returns messages in chronological order (oldest to newest)
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Failed to load hub messages:", err);
      }
    };

    fetchMessages();
    
    // Optional: Refresh chat every 10 seconds to make it feel "live"
    const intervalId = setInterval(fetchMessages, 10000);
    return () => clearInterval(intervalId);
  }, [activeZone]); // Re-fetch whenever the user clicks a new zone

  // 2. Save new messages to MongoDB
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMessage = { 
      senderName: user?.displayName || 'Resident', 
      messageText: input, 
      verified: false,
      isBot: false
    };

    try {
      // Optimistically update the UI so it feels instant
      setMessages([...messages, { ...newMessage, time: 'Just now' }]);
      setInput('');

      // Post the message to the backend
      await fetch(`http://localhost:8000/api/hub/${activeZone}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const zone = CITY_ZONES.find(z => z.id === activeZone);

  // Helper function to format MongoDB timestamps into readable text
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'Just now';
    const minsAgo = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (minsAgo < 1) return 'Just now';
    if (minsAgo < 60) return `${minsAgo}m ago`;
    const hoursAgo = Math.floor(minsAgo / 60);
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    return `${Math.floor(hoursAgo / 24)}d ago`;
  };

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
              <motion.div key={m._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${m.isBot ? 'bg-amber/20 text-amber' : 'bg-white/10 text-white'}`}>
                  {m.senderName ? m.senderName.charAt(0) : 'R'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-300">{m.senderName}</span>
                    {m.verified && <ShieldCheck className="h-3 w-3 text-teal" />}
                    <span className="text-[10px] text-gray-500">{m.time || formatTime(m.timestamp)}</span>
                  </div>
                  <div className={`mt-1 inline-block px-4 py-2 rounded-2xl text-sm ${m.isBot ? 'bg-amber/10 text-amber border border-amber/20' : 'bg-white/10 text-white'}`}>
                    {m.messageText}
                  </div>
                </div>
              </motion.div>
            ))}
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                No messages in this hub yet. Be the first to say hello!
              </div>
            )}
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