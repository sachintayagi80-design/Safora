import { createContext, useContext, useState, type ReactNode } from 'react';

export type UserRole = 'resident' | 'business' | 'law-enforcement';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── NOTE ────────────────────────────────────────────────────────────────────
// This is a local mock store. No real Firebase calls happen here.
// To wire Firebase: replace signIn/signUp/signOut with real Firebase Auth calls
// (signInWithEmailAndPassword, createUserWithEmailAndPassword, firebaseSignOut).
// The shape of AppUser and the context API stay the same — callers don't change.
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(email: string, _password: string) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate network
    setUser({ uid: `uid-${Date.now()}`, email, displayName: email.split('@')[0], role: 'resident' });
    setLoading(false);
  }

  async function signUp(email: string, _password: string, displayName: string, role: UserRole) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setUser({ uid: `uid-${Date.now()}`, email, displayName, role });
    setLoading(false);
  }

  function signOut() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
