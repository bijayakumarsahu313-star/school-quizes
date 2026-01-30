'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { firebaseConfig } from '@/firebase/config';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [firebaseInstance, setFirebaseInstance] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    try {
      if (firebaseConfig?.projectId && firebaseConfig.projectId !== 'PROJECT_ID') {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        const auth = getAuth(app);
        const firestore = getFirestore(app);
        setFirebaseInstance({ app, auth, firestore });
      } else {
        console.error(
          'Firebase config is missing or contains placeholder values. Firebase will not be initialized.'
        );
      }
    } catch (error) {
      console.error('Firebase initialization failed:', error);
    }
  }, []);

  // Render a loading state or nothing until Firebase is initialized.
  // This prevents child components from attempting to use Firebase services too early.
  if (!firebaseInstance) {
    // You could return a full-page loader here if desired
    return null;
  }

  return (
    <FirebaseContext.Provider value={firebaseInstance}>
      {process.env.NODE_ENV === 'development' && <FirebaseErrorListener />}
      {children}
    </FirebaseContext.Provider>
  );
};

// Hooks below will only be called once the provider has a value.
export const useFirebase = (): FirebaseContextValue => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider. This might happen if Firebase fails to initialize.');
  }
  return context;
};

export const useAuth = (): Auth => {
  return useFirebase().auth;
};

export const useFirestore = (): Firestore => {
  return useFirebase().firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  return useFirebase().app;
};
