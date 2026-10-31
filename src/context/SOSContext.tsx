import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react';

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

// This will now only be used the very first time someone opens the app
const SEED: EmergencyContact[] = [
  { id: 'c1', name: 'Mom', phone: '+91 98765 43210', relation: 'Family' },
  { id: 'c2', name: 'Rahul', phone: '+91 91234 56789', relation: 'Friend' },
  { id: 'c3', name: 'Sachin', phone: '+91 63874 67185', relation: 'Friend' },
];

export function SOSProvider({ children }: { children: ReactNode }) {
  // 1. Load contacts from local storage on initial load, or fallback to SEED
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const savedContacts = localStorage.getItem('safora_contacts');
    if (savedContacts) {
      try {
        return JSON.parse(savedContacts);
      } catch (e) {
        console.error("Failed to parse contacts from local storage");
      }
    }
    return SEED;
  });

  const [status, setStatus] = useState<SOSStatus>('idle');
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // 2. Automatically save to local storage whenever contacts are added or deleted
  useEffect(() => {
    localStorage.setItem('safora_contacts', JSON.stringify(contacts));
  }, [contacts]);

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

  async function confirmSend() {
    clearTimers();
    setStatus('dispatching');
    
    const emailEmergencyMessage = "EMERGENCY: SOS triggered from SAFORA. User needs immediate assistance. Last known location: Hazratganj.";
    const smsEmergencyMessage = "sms_2fa"; 
    const trustedContactEmail = "friend@example.com"; 

    try {
      // 3. Loop through your dynamic contacts list and message all of them!
      const dispatchPromises = contacts.map(contact => {
        const smsReq = fetch('http://localhost:8000/api/sos/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone_number: contact.phone, message: smsEmergencyMessage })
        });

        const callReq = fetch('http://localhost:8000/api/sos/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone_number: contact.phone, message: "dummy_text" })
        });

        return Promise.all([smsReq, callReq]);
      });

      // Email dispatch (sent once)
      const emailReq = fetch('http://localhost:8000/api/sos/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_email: trustedContactEmail, message: emailEmergencyMessage })
      });

      // Wait for all messages, calls, and the email to finish
      await Promise.all([...dispatchPromises, emailReq]);
      
      console.log("SOS successfully dispatched to all dynamic contacts!");
    } catch (error) {
      console.error("SOS Dispatch Error:", error);
    } finally {
      setStatus('sent');
    }
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