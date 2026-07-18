import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, MapPin, Clock, X, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSOS } from '@/context/SOSContext';
import { useNavigate } from 'react-router-dom';

export default function SafeWalkPage() {
  const [minutes, setMinutes] = useState(15);
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const { startSOS } = useSOS();
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (active && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (active && timeLeft === 0) {
      // Trigger SOS!
      setActive(false);
      startSOS();
      navigate('/sos');
    }
    return () => clearInterval(interval);
  }, [active, timeLeft, startSOS, navigate]);

  const handleStart = () => {
    setTimeLeft(minutes * 60);
    setActive(true);
  };

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;

  return (
    <div className="min-h-screen bg-ink px-4 pt-28 pb-16 flex justify-center items-center">
      <div className="max-w-md w-full relative">
        <div className="absolute inset-0 bg-bluebrand/10 blur-[100px] rounded-full pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {!active ? (
            <motion.div key="setup" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 relative z-10 text-center">
              <div className="h-16 w-16 bg-bluebrand/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-bluebrand/30">
                <ShieldAlert className="h-8 w-8 text-bluebrand" />
              </div>
              <h1 className="text-2xl font-display font-bold text-white mb-2">SafeWalk Timer</h1>
              <p className="text-sm text-gray-400 mb-8">Heading home? Set an estimated arrival time. If the timer expires before you check in, we'll automatically notify your trusted contacts.</p>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <button onClick={() => setMinutes(Math.max(5, minutes - 5))} className="w-12 h-12 rounded-full border border-white/10 text-white text-xl hover:bg-white/5">-</button>
                <div className="text-4xl font-display font-bold text-white w-24">{minutes}<span className="text-lg text-gray-500 ml-1">min</span></div>
                <button onClick={() => setMinutes(Math.min(120, minutes + 5))} className="w-12 h-12 rounded-full border border-white/10 text-white text-xl hover:bg-white/5">+</button>
              </div>

              <Button size="lg" className="w-full bg-bluebrand hover:bg-bluebrand/90 font-bold text-base" onClick={handleStart}>
                Start SafeWalk
              </Button>
            </motion.div>
          ) : (
            <motion.div key="active" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white/5 border border-amber/30 rounded-3xl p-8 relative z-10 text-center shadow-[0_0_40px_rgba(255,176,32,0.1)]">
              <div className="h-16 w-16 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Clock className="h-8 w-8 text-amber" />
              </div>
              <h2 className="text-sm font-bold tracking-widest text-amber uppercase mb-2">SafeWalk Active</h2>
              <div className="text-6xl font-display font-bold text-white mb-8">
                {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
              </div>
              <p className="text-xs text-gray-400 mb-8">Your trusted contacts will be alerted in {m} minutes if you do not check in.</p>
              
              <div className="flex flex-col gap-3">
                <Button variant="secondary" size="lg" className="w-full bg-teal text-ink hover:bg-teal/90 font-bold border-none" onClick={() => setActive(false)}>
                  I'm Safe (Cancel Timer)
                </Button>
                <Button variant="danger" size="lg" className="w-full font-bold" onClick={() => { setActive(false); startSOS(); navigate('/sos'); }}>
                  Trigger SOS Now
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
