'use client';

import { createContext, useContext, ReactNode } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { firebaseConfig } from '@/firebase/config';

interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// --- Singleton Initialization Pattern ---
// This code ensures Firebase is initialized only once per client session,
// outside of the React component lifecycle. This is the key to preventing
// race conditions and the `auth/configuration-not-found` error.

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// This check prevents initialization errors during server-side rendering.
if (typeof window !== 'undefined' && firebaseConfig?.projectId) {
  // getApps() checks if Firebase has already been initialized.
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
} else {
  // On the server, or if config is missing, create mock objects. This prevents
  // the app from crashing and is crucial for SSR safety.
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

/**
 * This is a "pure" provider. It contains no hooks or conditional rendering.
 * Its only job is to provide the pre-initialized Firebase services.
 * This guarantees it renders identically on the server and client,
 * which is essential for preventing hydration errors.
 */
export function FirebaseProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseContext.Provider value={firebaseContextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

// --- Service Hooks ---
// These hooks provide a clean, consistent way for components to access services.

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
