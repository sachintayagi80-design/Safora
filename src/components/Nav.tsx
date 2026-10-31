import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Menu, X, AlertTriangle, Map, BarChart3, FilePlus2, Users, ShieldAlert, BookOpen, Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { href: '#how', label: 'HOW IT WORKS' },
    { href: '#map', label: 'LIVE MAP' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-ink/95 backdrop-blur-md border-b border-white/5 shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <Radio className="h-6 w-6 text-redbrand" strokeWidth={1.8} />
          SAFORA
        </Link>
                <nav className="hidden items-center gap-8 text-xs font-semibold tracking-wide text-gray-400 md:flex">
          {user ? (
            <>  {/* <--- ADD THIS TAG HERE */}
              <Link to="/app" className="flex items-center gap-1.5 transition-colors hover:text-white"><Map className="h-3.5 w-3.5" /> LIVE MAP</Link>
              <Link to="/analytics" className="flex items-center gap-1.5 transition-colors hover:text-white"><BarChart3 className="h-3.5 w-3.5" /> ANALYTICS</Link>
              <Link to="/report" className="flex items-center gap-1.5 transition-colors hover:text-white"><FilePlus2 className="h-3.5 w-3.5" /> REPORT</Link>
              <Link to="/community" className="flex items-center gap-1.5 transition-colors hover:text-white"><Users className="h-3.5 w-3.5" /> HUB</Link>
              <Link to="/guides" className="flex items-center gap-1.5 transition-colors hover:text-white"><BookOpen className="h-3.5 w-3.5" /> GUIDES</Link>
              <Link to="/leaderboard" className="flex items-center gap-1.5 transition-colors hover:text-white"><Trophy className="h-3.5 w-3.5" /> LEADERS</Link>
            </>
          ) : (
            links.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-white">{l.label}</a>
            ))
          )}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to="/safewalk">
                <Button variant="secondary" size="sm" className="gap-1.5 bg-white/5 border border-amber/30 text-amber hover:bg-amber/10">
                  <ShieldAlert className="h-3.5 w-3.5" /> SafeWalk
                </Button>
              </Link>
              <Link to="/sos">
                <Button variant="danger" size="sm" className="gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> SOS
                </Button>
              </Link>
              <Link to="/profile" className="text-sm text-gray-400 hover:text-white transition-colors">{user.displayName}</Link>
              <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/'); }}>Sign out</Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm"><Link to="/login">LOG IN</Link></Button>
              {/* <Button asChild size="sm" className="bg-bluebrand hover:bg-bluebrand/90"><Link to="/login?mode=signup">GET APP</Link></Button> */}
            </>
          )}
        </div>
        <button className="md:hidden text-white" onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/5 bg-ink/98 md:hidden">
            <div className="flex flex-col gap-1 px-6 py-4">
              {user ? (
                [
                  { href: '/app', label: 'LIVE MAP' },
                  { href: '/analytics', label: 'ANALYTICS' },
                  { href: '/report', label: 'REPORT' },
                  { href: '/community', label: 'HUB' },
                  { href: '/safewalk', label: 'SAFEWALK' },
                  { href: '/guides', label: 'GUIDES' },
                  { href: '/leaderboard', label: 'LEADERS' },
                  { href: '/profile', label: 'PROFILE' },
                ].map((l) => (
                  <Link key={l.href} to={l.href} onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-colors">{l.label}</Link>
                ))
              ) : (
                links.map((l) => (
                  <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-colors">{l.label}</a>
                ))
              )}
              <div className="mt-3 flex flex-col gap-2 border-t border-white/5 pt-3">
                {user ? (
                  <>
                    <Link to="/sos" onClick={() => setMenuOpen(false)}>
                      <Button variant="danger" size="sm" className="w-full justify-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Emergency SOS</Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => { signOut(); setMenuOpen(false); navigate('/'); }}>Sign out</Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" size="sm" className="w-full justify-center"><Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link></Button>
                    <Button asChild size="sm" className="w-full justify-center bg-bluebrand hover:bg-bluebrand/90"><Link to="/login?mode=signup" onClick={() => setMenuOpen(false)}>Get started</Link></Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
