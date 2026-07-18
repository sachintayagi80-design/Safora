import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Check, ImagePlus, X, CheckCircle2 } from 'lucide-react';
import MapView from '@/components/MapView';
import { Button } from '@/components/ui/button';
import { useReports } from '@/context/ReportsContext';
import { CITY_ZONES, INCIDENT_TYPES, type IncidentType } from '@/data/incidents';

const STEPS = ['Location', 'Category', 'Details'] as const;

function nearestZone(x: number, y: number) {
  let best = CITY_ZONES[0];
  let bestDist = Infinity;
  for (const z of CITY_ZONES) {
    const d = Math.hypot(z.x - x, z.y - y);
    if (d < bestDist) { bestDist = d; best = z; }
  }
  return best;
}

export default function ReportIncidentPage() {
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const [category, setCategory] = useState<IncidentType | null>(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addReport } = useReports();
  const navigate = useNavigate();

  const zone = useMemo(() => (pin ? nearestZone(pin.x, pin.y) : null), [pin]);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function canAdvance() {
    if (step === 0) return !!pin;
    if (step === 1) return !!category;
    return true;
  }

  function handleSubmit() {
    if (!pin || !category || !zone) return;
    addReport({ type: category, x: pin.x, y: pin.y, zoneId: zone.id, description, photoDataUrl: photo || undefined });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 pt-20 text-center">
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 className="mx-auto h-16 w-16 text-teal" />
          <h1 className="mt-4 font-display text-2xl font-bold text-white">Report submitted</h1>
          <p className="mt-2 max-w-sm text-sm text-gray-400">
            Thanks for helping keep {zone?.name} safer. Your report is now pending community verification — track it from your profile.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/profile')}>View My Reports</Button>
            <Button className="bg-bluebrand hover:bg-bluebrand/90" onClick={() => navigate('/app')}>Back to Live Map</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink px-4 pb-16 pt-28 md:px-8">
      <div className="mx-auto max-w-2xl">
        <button onClick={() => navigate('/app')} className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Cancel report
        </button>

        <h1 className="font-display text-2xl font-bold text-white">Report an Incident</h1>
        <p className="mt-1 text-sm text-gray-400">Help your community stay informed — it only takes a minute.</p>

        {/* stepper */}
        <div className="mt-6 mb-8 flex items-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${i < step ? 'bg-teal text-ink' : i === step ? 'bg-bluebrand text-white' : 'bg-white/10 text-gray-500'}`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`hidden text-xs font-semibold sm:block ${i <= step ? 'text-white' : 'text-gray-500'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`mx-3 h-px flex-1 ${i < step ? 'bg-teal' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="loc" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <p className="mb-3 text-sm text-gray-300">Tap the map to drop a pin at the incident location.</p>
              <div className="overflow-hidden rounded-2xl border border-white/10" style={{ height: 380 }}>
                <MapView incidents={[]} pin={pin} onMapClick={setPin} height="100%" />
              </div>
              {pin && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-gray-300">
                  <MapPin className="h-4 w-4 text-redbrand" /> Pin dropped near <strong className="text-white">{zone?.name}</strong>
                </div>
              )}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="cat" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <p className="mb-3 text-sm text-gray-300">What kind of incident is this?</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {INCIDENT_TYPES.map((t) => (
                  <button key={t.value} onClick={() => setCategory(t.value)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${category === t.value ? 'border-redbrand bg-redbrand/10' : 'border-white/10 hover:border-white/25'}`}>
                    <span className="text-2xl">{t.emoji}</span>
                    <span className="text-xs font-semibold text-white">{t.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="details" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Description</label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
                placeholder="What happened? Any details that could help others stay safe…"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-bluebrand transition-colors"
              />

              <label className="mb-1.5 mt-4 block text-xs font-medium text-gray-400">Photo (optional)</label>
              {!photo ? (
                <button onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 py-8 text-gray-400 hover:border-white/30 hover:text-white transition-colors">
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs">Tap to upload a photo</span>
                </button>
              ) : (
                <div className="relative overflow-hidden rounded-xl border border-white/10">
                  <img src={photo} alt="Incident evidence" className="max-h-56 w-full object-cover" />
                  <button onClick={() => setPhoto(null)} className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black/90">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />

              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-gray-400">
                Reporting <strong className="text-white">{INCIDENT_TYPES.find((t) => t.value === category)?.label}</strong> near <strong className="text-white">{zone?.name}</strong>.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button className="bg-bluebrand hover:bg-bluebrand/90" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="danger" onClick={handleSubmit}>Submit report</Button>
          )}
        </div>
      </div>
    </div>
  );
}
