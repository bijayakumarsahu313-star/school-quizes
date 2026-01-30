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
        console.warn("Firebase config is missing or contains placeholder values. Firebase will not be initialized.");
    }
  }, []);

  const value = useMemo(() => firebase, [firebase]);

  return (
    <FirebaseContext.Provider value={value}>
        {process.env.NODE_ENV === 'development' && value && <FirebaseErrorListener />}
        {children}
    </FirebaseContext.Provider>
  );
};

// This hook returns the entire Firebase context value, which can be null during initialization.
export const useFirebase = () => {
    return useContext(FirebaseContext);
};

// This hook returns the Auth instance, or null if Firebase is not yet initialized.
export const useAuth = (): Auth | null => {
    const firebase = useFirebase();
    return firebase ? firebase.auth : null;
};

// This hook returns the Firestore instance, or null if Firebase is not yet initialized.
export const useFirestore = (): Firestore | null => {
    const firebase = useFirebase();
    return firebase ? firebase.firestore : null;
};

// This hook returns the FirebaseApp instance, or null if Firebase is not yet initialized.
export const useFirebaseApp = (): FirebaseApp | null => {
    const firebase = useFirebase();
    return firebase ? firebase.app : null;
};
