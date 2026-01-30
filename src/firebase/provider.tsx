'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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

export const FirebaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [firebase, setFirebase] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    if (firebaseConfig?.projectId && firebaseConfig.projectId !== 'PROJECT_ID') {
      try {
        const { app, auth, firestore } = initializeFirebase();
        setFirebase({ app, auth, firestore });
      } catch (error) {
        console.error("Firebase initialization failed:", error);
      }
    } else {
        console.warn("Firebase config is missing or contains placeholder values. Firebase will not be initialized.");
    }
  }, []);

  const value = useMemo(() => firebase, [firebase]);

  // By returning null (or a loading component), we prevent children from rendering
  // until Firebase is initialized, thus preventing race conditions.
  if (!value) {
    return null;
  }

  return (
    <FirebaseContext.Provider value={value}>
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
