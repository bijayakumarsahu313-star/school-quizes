
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
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

// --- Singleton Initialization Pattern ---
// This code runs once per client session when the module is first imported,
// ensuring Firebase is initialized before any component renders.

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

if (firebaseConfig?.projectId && firebaseConfig.projectId !== 'PROJECT_ID') {
  firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
} else {
  // This else block is a safeguard for development if the config is missing.
  console.error(
    'Firebase config is missing or contains placeholder values. Firebase will not be initialized.'
  );
  // Create mock objects to prevent the app from crashing.
  firebaseApp = {} as FirebaseApp;
  auth = {} as Auth;
  firestore = {} as Firestore;
}

const firebaseContextValue: FirebaseContextValue = {
  app: firebaseApp,
  auth,
  firestore,
};

// --- End of Singleton Initialization ---

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // The provider now simply provides the pre-initialized and stable context value.
  // This eliminates the race condition caused by useState and useEffect.
  if (!firebaseContextValue.app.options?.projectId) {
    // This renders a fallback UI if the Firebase config was invalid.
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'sans-serif'
        }}>
            <h1>Firebase is not configured. Please check your firebase/config.ts file.</h1>
        </div>
    );
  }

  return (
    <FirebaseContext.Provider value={firebaseContextValue}>
      {isClient && process.env.NODE_ENV === 'development' && <FirebaseErrorListener />}
      {children}
    </FirebaseContext.Provider>
  );
};

// Hooks remain the same, but now they are guaranteed to receive an initialized context.
export const useFirebase = (): FirebaseContextValue => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
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
