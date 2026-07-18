import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircle2, ShieldCheck, Award, MapPin, Clock, Bell, Lock, LogOut, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useReports } from '@/context/ReportsContext';
import { CITY_ZONES, INCIDENT_TYPES, RISK_COLOR, timeAgoLabel } from '@/data/incidents';

const TRUST_STYLES: Record<string, { color: string; icon: typeof Award }> = {
  New: { color: '#8a8a8a', icon: UserCircle2 },
  Trusted: { color: '#1fc7c7', icon: ShieldCheck },
  'Verified Guardian': { color: '#3b82f6', icon: ShieldCheck },
  'Community Hero': { color: '#ffb020', icon: Award },
};

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { myReports, trustScore, trustLevel } = useReports();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);

  const badge = TRUST_STYLES[trustLevel];
  const BadgeIcon = badge.icon;

  return (
    <div className="min-h-screen bg-ink px-4 pb-16 pt-28 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* header */}
        <div className="mb-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-bluebrand/15 text-3xl font-bold text-bluebrand">
            {(user?.displayName || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-white">{user?.displayName || 'Guest User'}</h1>
            <p className="text-sm text-gray-400">{user?.email || 'Not signed in'}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold capitalize text-gray-300">
              {user?.role?.replace('-', ' ') || 'resident'}
            </span>
          </div>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: `${badge.color}55`, backgroundColor: `${badge.color}12` }}>
            <BadgeIcon className="h-8 w-8" style={{ color: badge.color }} />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-400">Community Trust Score</p>
              <p className="font-display text-lg font-bold" style={{ color: badge.color }}>{trustScore} · {trustLevel}</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* my reports */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">My Reports</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              {myReports.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-xs text-gray-500">
                  You haven't submitted any reports yet. Reports you file from the Report page will appear here.
                </div>
              )}
              {myReports.map((r) => {
                const meta = INCIDENT_TYPES.find((t) => t.value === r.type)!;
                return (
                  <div key={r.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base" style={{ backgroundColor: `${RISK_COLOR[r.risk]}25` }}>{meta.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{meta.label}</p>
                      <p className="mt-0.5 truncate text-xs text-gray-400">{r.description}</p>
                      <p className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {CITY_ZONES.find((z) => z.id === r.zoneId)?.name}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgoLabel(r.hoursAgo)}</span>
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${r.status === 'verified' ? 'bg-teal/15 text-teal' : r.status === 'resolved' ? 'bg-white/10 text-gray-300' : 'bg-amber/15 text-amber'}`}>
                      {r.status}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* account settings */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Account Settings</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-4">
                <SettingRow icon={<Bell className="h-4 w-4" />} label="Push notifications" checked={notifications} onChange={setNotifications} />
                <SettingRow icon={<UserCircle2 className="h-4 w-4" />} label="Public profile" checked={publicProfile} onChange={setPublicProfile} />
                <button className="flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-left text-xs text-gray-300 hover:bg-white/5 transition-colors">
                  <Lock className="h-4 w-4" /> Change password
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-amber" /> Trust Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${trustScore}%`, backgroundColor: badge.color }} />
                </div>
                <p className="text-[11px] text-gray-400">{100 - trustScore} points to next tier. Verified reports earn the most trust.</p>
              </CardContent>
            </Card>

            <Button variant="secondary" className="w-full justify-center gap-2" onClick={() => { signOut(); navigate('/'); }}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon, label, checked, onChange }: { icon: React.ReactNode; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-xs text-gray-300">{icon} {label}</span>
      <button onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-bluebrand' : 'bg-white/10'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}
