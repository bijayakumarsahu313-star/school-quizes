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
// The 'use client' directive ensures this code runs only in the browser.
// This code initializes Firebase and sets up the services. It's guaranteed
// to run once before any component that uses these services is rendered.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

const firebaseContextValue: FirebaseContextValue = {
  app,
  auth,
  firestore,
};

// --- React Context and Provider ---
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
}

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
