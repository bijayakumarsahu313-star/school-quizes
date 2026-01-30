'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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
  const [firebaseInstance, setFirebaseInstance] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after hydration is complete.
    try {
      if (firebaseConfig?.projectId && firebaseConfig.projectId !== 'PROJECT_ID') {
        const instance = initializeFirebase();
        setFirebaseInstance(instance);
      } else {
        console.warn(
          'Firebase config is missing or contains placeholder values. Firebase will not be initialized.'
        );
      }
    } catch (error) {
      console.error('Firebase initialization failed:', error);
    }
  }, []); // Empty dependency array ensures this runs only once on mount.

  // On the server, and during the initial client render before useEffect runs,
  // firebaseInstance will be null. To prevent a hydration mismatch, we render
  // nothing until Firebase is initialized on the client.
  if (!firebaseInstance) {
    return null;
  }

  // Once initialized on the client, we re-render with the provider and children.
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
