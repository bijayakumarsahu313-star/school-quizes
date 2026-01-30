'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

import { initializeFirebase } from '@/firebase/init';
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
    // Check for a valid project ID before attempting to initialize.
    // The placeholder value is 'PROJECT_ID'.
    if (firebaseConfig?.projectId && firebaseConfig.projectId !== 'PROJECT_ID') {
      try {
        const { app, auth, firestore } = initializeFirebase();
        setFirebase({ app, auth, firestore });
      } catch (error) {
        console.error("Firebase initialization failed:", error);
      }
    } else {
        console.error("Firebase config is missing or contains placeholder values. App cannot be initialized.");
    }
  }, []);

  const value = useMemo(() => firebase, [firebase]);

  // If Firebase is not initialized, we don't render the children.
  // This prevents hooks from being called before the Firebase context is ready.
  if (!value) {
    return null; // You can replace this with a loading spinner component.
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
