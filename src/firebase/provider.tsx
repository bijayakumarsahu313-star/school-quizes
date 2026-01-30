'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

import { initializeFirebase } from '@/firebase/index';
import { firebaseConfig } from './config';

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
    if (firebaseConfig?.projectId) {
      const { app, auth, firestore } = initializeFirebase();
      setFirebase({ app, auth, firestore });
    } else {
        console.error("Firebase config not found. App cannot be initialized.");
    }
  }, []);

  const value = useMemo(() => firebase, [firebase]);

  // If Firebase is not initialized, don't render children to prevent hooks
  // from being called before Firebase context is ready.
  if (!value) {
    return null; // Or a loading spinner
  }

  return (
    <FirebaseContext.Provider value={value}>
        {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};

export const useAuth = () => {
    return useFirebase().auth;
};

export const useFirestore = () => {
    return useFirebase().firestore;
};

export const useFirebaseApp = () => {
    return useFirebase().app;
};
