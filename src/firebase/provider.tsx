'use client';

import { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

import { initializeFirebase } from '@/firebase/init';
import { firebaseConfig } from './config';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

let firebaseInstance: FirebaseContextValue | null = null;
try {
  if (firebaseConfig?.projectId && firebaseConfig.projectId !== 'PROJECT_ID') {
    firebaseInstance = initializeFirebase();
  } else {
    console.warn(
      'Firebase config is missing or contains placeholder values. Firebase will not be initialized.'
    );
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

export const FirebaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // If initialization failed, don't render the children.
  // This prevents the app from crashing.
  if (!firebaseInstance) {
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
