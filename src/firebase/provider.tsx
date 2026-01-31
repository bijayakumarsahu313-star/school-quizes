
'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type Auth, type User } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import type { UserProfile } from '@/lib/data';
import { doc, onSnapshot } from 'firebase/firestore';

interface FirebaseContextType {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const { app, auth, firestore } = useMemo(() => {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { app, auth, firestore };
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    let unsubscribeProfile: () => void = () => {};

    if (user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUserProfile({ id: doc.id, ...doc.data() } as UserProfile);
        } else {
          setUserProfile(null);
        }
      });
    } else {
        setUserProfile(null);
    }

    return () => {
        unsubscribeAuth();
        unsubscribeProfile();
    };
  }, [auth, firestore, user]);

  const value = { app, auth, firestore, user, userProfile, loading };

  return (
    <FirebaseContext.Provider value={value}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  return useFirebase().app;
}

export function useAuth() {
  return useFirebase().auth;
}

export function useFirestore() {
  return useFirebase().firestore;
}
