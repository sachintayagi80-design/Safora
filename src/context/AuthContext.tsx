import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  updateProfile 
} from 'firebase/auth';
import { auth } from '../firebaseconfig'; // Adjust this path if your config file is in a different folder

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true); // Start loading true to wait for Firebase check

  // ─── 1. FIREBASE AUTH STATE LISTENER (Solves the reload bug) ─────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role: 'resident', // Note: See note below about roles
        });
      } else {
        setUser(null);
      }
      setLoading(false); // Stop loading once Firebase gives us an answer
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // ─── 2. FIREBASE SIGN IN ─────────────────────────────────────────────
  async function signIn(email: string, password: string) {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // We don't need to manually setUser here because onAuthStateChanged handles it!
    } catch (error) {
      console.error("Login failed:", error);
      setLoading(false);
      throw error; // Throw error so your LoginPage can display an alert
    }
  }

  // ─── 3. FIREBASE SIGN UP ─────────────────────────────────────────────
  async function signUp(email: string, password: string, displayName: string, role: UserRole) {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's name in Firebase immediately after creation
      await updateProfile(userCredential.user, { displayName: displayName });

      // TODO for SAFORA later: Save the `role` to a Firestore database here
      // (Firebase Auth only stores email/password natively, not custom roles)

    } catch (error) {
      console.error("Signup failed:", error);
      setLoading(false);
      throw error;
    }
  }

  // ─── 4. FIREBASE SIGN OUT ────────────────────────────────────────────
  function signOut() {
    firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {/* Don't render the app until Firebase finishes checking the login status */}
      {!loading && children} 
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}