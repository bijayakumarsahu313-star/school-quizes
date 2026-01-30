'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

import { initializeFirebase } from '@/firebase';
import { firebaseConfig } from './config';

interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// Create a context to hold the Firebase app instance.
const FirebaseClientContext = createContext<FirebaseContextValue | null>(null);

// Create a provider component that initializes Firebase on the client-side.
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebase, setFirebase] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    // Initialize Firebase and store the app instance in state if config is present and valid.
    if (firebaseConfig?.projectId && firebaseConfig.projectId !== 'PROJECT_ID') {
      const { app, auth, firestore } = initializeFirebase();
      setFirebase({ app, auth, firestore });
    }
  }, []);

  // Use useMemo to prevent re-rendering of the provider value.
  const value = useMemo(() => firebase, [firebase]);

  return (
    <FirebaseClientContext.Provider value={value}>
      {children}
    </FirebaseClientContext.Provider>
  );
}

// Create a hook to access the Firebase app instance.
export const useFirebaseApp = () => {
  return useContext(FirebaseClientContext);
};
