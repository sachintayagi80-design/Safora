import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Radio, Mail, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth, type UserRole } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

function Field({
  label, icon, type = 'text', value, onChange, placeholder, required = true,
}: {
  label: string; icon: React.ReactNode; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-400">{label}</label>
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-gray-500">{icon}</span>
        <input
          type={isPass && show ? 'text' : type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white outline-none placeholder:text-white/20 focus:border-bluebrand transition-colors"
        />
        {isPass && (
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3.5 text-gray-500 hover:text-white">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

const ROLES: { value: UserRole; label: string; desc: string; emoji: string }[] = [
  { value: 'resident', label: 'Resident', desc: 'See nearby alerts', emoji: '🏙️' },
  { value: 'business', label: 'Business', desc: 'Analytics & insights', emoji: '🏢' },
  { value: 'law-enforcement', label: 'Law Enforcement', desc: 'Full incident access', emoji: '🛡️' },
];

export default function LoginPage() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup'>(params.get('mode') === 'signup' ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('resident');
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const { signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(email, password, displayName, role);
      navigate('/app');
    } catch {
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="flex min-h-screen bg-ink">
      {/* Left panel — visual */}
      <div className="relative hidden flex-1 overflow-hidden lg:flex">
        <div className="absolute inset-0 bg-ink2">
          <div className="absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-redbrand/20 blur-3xl animate-pulse" />
          <div className="absolute left-1/2 top-1/2 h-56 w-56 rounded-full bg-amber/15 blur-2xl animate-pulse [animation-delay:1.2s]" />
          <div className="absolute left-1/6 top-2/3 h-48 w-48 rounded-full bg-teal/10 blur-2xl animate-pulse [animation-delay:2.4s]" />
        </div>
        <svg className="absolute inset-0 h-full w-full opacity-10" viewBox="0 0 800 800" preserveAspectRatio="none">
          <g stroke="white" strokeWidth="1">
            <line x1="0" y1="160" x2="800" y2="200" /><line x1="0" y1="380" x2="800" y2="340" />
            <line x1="0" y1="580" x2="800" y2="620" /><line x1="160" y1="0" x2="120" y2="800" />
            <line x1="400" y1="0" x2="440" y2="800" /><line x1="640" y1="0" x2="600" y2="800" />
          </g>
        </svg>
        <div className="relative flex flex-col justify-end p-12">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-redbrand animate-pulse" />
            <span className="font-mono text-xs tracking-widest text-redbrand">LIVE RISK INTELLIGENCE</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-white leading-tight">
            See what's happening<br />on every street.
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">
            Real-time heatmaps, community reports, and push alerts — all free.
          </p>
          <div className="mt-10 flex gap-8 border-t border-white/10 pt-6">
            <div><p className="font-display text-2xl font-bold text-white">+30%</p><p className="mt-1 text-xs text-gray-400">more accurate than legacy systems</p></div>
            <div><p className="font-display text-2xl font-bold text-white">~45%</p><p className="mt-1 text-xs text-gray-400">faster emergency response</p></div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:max-w-[480px]">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to SAFORA
        </Link>

        <div className="mb-2 flex items-center gap-2">
          <Radio className="h-6 w-6 text-white" />
          <span className="font-display text-xl font-bold text-white">SAFORA</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <h1 className="mt-6 font-display text-2xl font-bold text-white">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="mt-1.5 text-sm text-gray-400">
              {mode === 'signin' ? 'Sign in to access your safety map.' : 'Join thousands keeping their city safe.'}
            </p>
          </motion.div>
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          {mode === 'signup' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Field label="Full name" icon={<User className="h-4 w-4" />} value={displayName} onChange={setDisplayName} placeholder="Priya Sharma" />
            </motion.div>
          )}
          <Field label="Email address" icon={<Mail className="h-4 w-4" />} type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <Field label="Password" icon={<Lock className="h-4 w-4" />} type="password" value={password} onChange={setPassword} placeholder="••••••••" />

          {mode === 'signin' && (
            <div className="flex justify-end">
              {forgotSent
                ? <p className="text-xs text-teal">Reset link sent — check your email.</p>
                : <button type="button" onClick={() => setForgotSent(true)} className="text-xs text-gray-400 hover:text-white transition-colors">Forgot password?</button>}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <p className="mb-2 text-xs font-medium text-gray-400">I'm signing up as</p>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${role === r.value ? 'border-redbrand bg-redbrand/10' : 'border-white/10 hover:border-white/25'}`}>
                    <span className="text-lg">{r.emoji}</span>
                    <span className="mt-1.5 block text-xs font-bold text-white">{r.label}</span>
                    <span className="block text-[10px] text-gray-400">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-redbrand/30 bg-redbrand/10 px-3.5 py-2.5 text-xs text-redbrand">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <Button type="submit" variant="default" size="lg" disabled={loading} className="w-full bg-bluebrand hover:bg-bluebrand/90">
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-gray-500">or continue with</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm text-white transition-colors hover:bg-white/5">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm text-white transition-colors hover:bg-white/5">
            📱 Phone OTP
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
            className="font-semibold text-white hover:underline">
            {mode === 'signin' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
