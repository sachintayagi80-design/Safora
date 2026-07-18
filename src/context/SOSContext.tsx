import { createContext, useContext, useState, useRef, type ReactNode } from 'react';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export type SOSStatus = 'idle' | 'counting-down' | 'dispatching' | 'sent' | 'cancelled';

interface SOSContextValue {
  contacts: EmergencyContact[];
  addContact: (c: Omit<EmergencyContact, 'id'>) => void;
  removeContact: (id: string) => void;
  status: SOSStatus;
  secondsLeft: number;
  startSOS: () => void;
  cancelSOS: () => void;
  confirmSend: () => void;
  reset: () => void;
}

const SOSContext = createContext<SOSContextValue | undefined>(undefined);

const COUNTDOWN = 5;

const SEED: EmergencyContact[] = [
  { id: 'c1', name: 'Mom', phone: '+91 98765 43210', relation: 'Family' },
  { id: 'c2', name: 'Rahul', phone: '+91 91234 56789', relation: 'Friend' },
];

export function SOSProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<EmergencyContact[]>(SEED);
  const [status, setStatus] = useState<SOSStatus>('idle');
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  function clearTimers() {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
  }

  function startSOS() {
    if (status !== 'idle') return;
    setStatus('counting-down');
    setSecondsLeft(COUNTDOWN);
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    timerRef.current = window.setTimeout(() => {
      confirmSend();
    }, COUNTDOWN * 1000);
  }

  function cancelSOS() {
    clearTimers();
    setStatus('cancelled');
    setSecondsLeft(COUNTDOWN);
    window.setTimeout(() => setStatus('idle'), 1200);
  }

  function confirmSend() {
    clearTimers();
    setStatus('dispatching');
    // TODO: replace with real SMS API call (Twilio/Fast2SMS) when backend is ready
    window.setTimeout(() => setStatus('sent'), 1800);
  }

  function reset() {
    clearTimers();
    setStatus('idle');
    setSecondsLeft(COUNTDOWN);
  }

  function addContact(c: Omit<EmergencyContact, 'id'>) {
    setContacts((prev) => [...prev, { ...c, id: `c-${Date.now()}` }]);
  }

  function removeContact(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <SOSContext.Provider value={{ contacts, addContact, removeContact, status, secondsLeft, startSOS, cancelSOS, confirmSend, reset }}>
      {children}
    </SOSContext.Provider>
  );
}

export function useSOS() {
  const ctx = useContext(SOSContext);
  if (!ctx) throw new Error('useSOS must be inside SOSProvider');
  return ctx;
}
