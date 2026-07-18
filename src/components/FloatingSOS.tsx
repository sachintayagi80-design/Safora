import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSOS } from '@/context/SOSContext';

export default function FloatingSOS() {
  const { pathname } = useLocation();
  const { status } = useSOS();
  const isActive = status === 'counting-down' || status === 'dispatching';
  if (pathname === '/sos' || pathname === '/login' || pathname === '/app') return null;

  return (
    <Link to="/sos" aria-label="Emergency SOS">
      <motion.div
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-redbrand font-display text-sm font-bold text-white shadow-2xl"
        style={{ boxShadow: isActive ? '0 0 0 8px rgba(255,77,77,0.25), 0 8px 24px rgba(255,77,77,0.5)' : '0 8px 24px rgba(255,77,77,0.4)' }}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 1 }}>
        {isActive && <span className="absolute inset-0 animate-ping rounded-full bg-redbrand/50" />}
        <span className="relative">SOS</span>
      </motion.div>
    </Link>
  );
}
