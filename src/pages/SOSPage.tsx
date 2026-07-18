import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Phone, UserPlus, Trash2, Radio, CheckCircle2, XCircle, AlertTriangle,
  MapPinned, MessageSquareWarning, Siren, PhoneCall, Vibrate,
} from 'lucide-react';
import { useSOS, type EmergencyContact } from '@/context/SOSContext';
import { useSettings, type SOSSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COUNTDOWN = 5;
const RADIUS = 44;
const CIRCUM = 2 * Math.PI * RADIUS;

export default function SOSPage() {
  const { contacts, addContact, removeContact, status, secondsLeft, startSOS, cancelSOS, confirmSend, reset } = useSOS();
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState<'alert' | 'contacts' | 'settings'>('alert');
  const navigate = useNavigate();

  const progress = (COUNTDOWN - secondsLeft) / COUNTDOWN;
  const inAlertFlow = status !== 'idle' && status !== 'cancelled';

  return (
    <div className="min-h-screen bg-ink px-4 py-8 pt-28">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => navigate('/app')} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-white" />
            <span className="font-display font-bold text-white">SAFORA</span>
          </div>
        </div>

        {!inAlertFlow && (
          <div className="mb-6 flex justify-center">
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList>
                <TabsTrigger value="alert"><Siren className="h-3.5 w-3.5" /> Alert</TabsTrigger>
                <TabsTrigger value="contacts"><Phone className="h-3.5 w-3.5" /> Contacts</TabsTrigger>
                <TabsTrigger value="settings"><MessageSquareWarning className="h-3.5 w-3.5" /> Settings</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* ─── ALERT FLOW ─────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {status === 'idle' && tab === 'alert' && (
            <motion.div key="idle" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-redbrand/10">
                    <AlertTriangle className="h-10 w-10 text-redbrand" />
                  </div>
                  <CardTitle className="text-xl">Emergency SOS</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">
                    {contacts.length > 0
                      ? `Alerts ${contacts.length} contact${contacts.length > 1 ? 's' : ''} with your live location.`
                      : 'Add a contact below before sending an alert.'}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Button variant="danger" size="lg" className="w-full text-base font-bold" onClick={startSOS} disabled={contacts.length === 0}>
                    🆘 Trigger SOS Alert
                  </Button>
                  <p className="text-xs text-gray-500">You'll get {COUNTDOWN} seconds to cancel before anything is sent.</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {status === 'counting-down' && (
            <motion.div key="countdown" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Card className="text-center">
                <CardContent className="flex flex-col items-center gap-6 py-10">
                  <div className="relative flex h-36 w-36 items-center justify-center">
                    <svg className="-rotate-90 absolute inset-0" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                      <motion.circle
                        cx="50" cy="50" r={RADIUS} fill="none"
                        stroke="#ff4d4d" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={CIRCUM}
                        strokeDashoffset={CIRCUM * (1 - progress)}
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                      />
                    </svg>
                    <span className="font-display text-5xl font-bold text-redbrand">{secondsLeft}</span>
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-redbrand">Sending alert…</h2>
                    <p className="mt-1 text-sm text-gray-400">Your emergency contacts will be notified.</p>
                  </div>
                  <div className="flex w-full gap-3">
                    <Button variant="secondary" size="lg" className="flex-1" onClick={cancelSOS}>Cancel</Button>
                    <Button variant="danger" size="lg" className="flex-1" onClick={confirmSend}>Send Now</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {status === 'dispatching' && (
            <motion.div key="dispatching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="text-center">
                <CardContent className="flex flex-col items-center gap-5 py-12">
                  <div className="h-14 w-14 animate-spin rounded-full border-4 border-redbrand/20 border-t-redbrand" />
                  <p className="text-sm text-gray-400">Sending your location to emergency contacts…</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {status === 'sent' && (
            <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="text-center">
                <CardContent className="flex flex-col items-center gap-5 py-10">
                  <CheckCircle2 className="h-16 w-16 text-teal" />
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">Alert sent!</h2>
                    <p className="mt-2 text-sm text-gray-400">{contacts.length} contact{contacts.length !== 1 ? 's' : ''} notified with your location.</p>
                  </div>
                  <div className="w-full rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-left text-xs text-amber">
                    <strong>Note:</strong> This is a simulated send — real SMS dispatch requires a backend (e.g. Twilio). Wiring it in later only requires changing <code>SOSContext.confirmSend()</code>.
                  </div>
                  <Button variant="secondary" size="lg" className="w-full" onClick={() => { reset(); navigate('/app'); }}>Done</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {status === 'cancelled' && (
            <motion.div key="cancelled" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="text-center">
                <CardContent className="flex flex-col items-center gap-4 py-10">
                  <XCircle className="h-14 w-14 text-gray-500" />
                  <p className="text-sm text-gray-400">Alert cancelled — nothing was sent.</p>
                  <Button variant="ghost" size="sm" onClick={reset}>Back to SOS Hub</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── CONTACTS TAB ───────────────────────────────────── */}
        {status === 'idle' && tab === 'contacts' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-white">Trusted contacts</h2>
              <Button variant="ghost" size="sm" className="text-redbrand hover:text-redbrand/80 hover:bg-redbrand/10" onClick={() => setShowAdd((v) => !v)}>
                <UserPlus className="h-4 w-4" /> {showAdd ? 'Cancel' : 'Add'}
              </Button>
            </div>

            <AnimatePresence>
              {showAdd && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                  <AddContactForm onAdd={(c) => { addContact(c); setShowAdd(false); }} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-2">
              {contacts.map((c) => (
                <motion.div key={c.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-redbrand/15">
                      <Phone className="h-4 w-4 text-redbrand" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.relation} · {c.phone}</p>
                    </div>
                  </div>
                  <button onClick={() => removeContact(c.id)} className="rounded-lg p-2 text-gray-500 hover:bg-redbrand/10 hover:text-redbrand transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
              {contacts.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-gray-500">
                  No trusted contacts yet. Add one above.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── SETTINGS TAB ───────────────────────────────────── */}
        {status === 'idle' && tab === 'settings' && <SOSSettingsPanel />}
      </div>
    </div>
  );
}

function SOSSettingsPanel() {
  const { settings, toggle } = useSettings();

  const rows: { key: keyof SOSSettings; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'liveLocationSharing', label: 'Live location sharing', desc: 'Share your real-time location with contacts during an SOS.', icon: <MapPinned className="h-4 w-4" /> },
    { key: 'smsAlerts', label: 'SMS alerts', desc: 'Send a text message to trusted contacts when SOS is triggered.', icon: <MessageSquareWarning className="h-4 w-4" /> },
    { key: 'alarmTrigger', label: 'Loud alarm trigger', desc: 'Play a loud siren from your phone to deter threats.', icon: <Siren className="h-4 w-4" /> },
    { key: 'autoCallPolice', label: 'Auto-call police line', desc: 'Automatically dial local emergency services after countdown.', icon: <PhoneCall className="h-4 w-4" /> },
    { key: 'shakeToActivate', label: 'Shake to activate', desc: 'Trigger SOS by shaking your phone rapidly.', icon: <Vibrate className="h-4 w-4" /> },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader><CardTitle className="text-base">SOS Settings</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-gray-400">{r.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{r.label}</p>
                  <p className="text-xs text-gray-400">{r.desc}</p>
                </div>
              </div>
              <button onClick={() => toggle(r.key)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${settings[r.key] ? 'bg-redbrand' : 'bg-white/10'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings[r.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AddContactForm({ onAdd }: { onAdd: (c: Omit<EmergencyContact, 'id'>) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !phone) return;
    onAdd({ name, phone, relation: relation || 'Contact' });
  }

  const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-bluebrand transition-colors";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      <input required placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
      <input placeholder="Relation (e.g. Mom, Friend)" value={relation} onChange={(e) => setRelation(e.target.value)} className={inputCls} />
      <Button type="submit" variant="danger" size="sm">Add contact</Button>
    </form>
  );
}
