'use client';

import { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

import {
  FirebaseClientProvider,
  useFirebaseApp,
} from '@/firebase/client-provider';
import { FirebaseAuthProvider } from '@/firebase/auth/provider';
import { FirebaseFirestoreProvider } from '@/firebase/firestore/provider';

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
  return (
    <FirebaseClientProvider>
      <FirebaseProviderInternal>{children}</FirebaseProviderInternal>
    </FirebaseClientProvider>
  );
};

const FirebaseProviderInternal = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const firebase = useFirebaseApp();

  if (!firebase) {
    // Render nothing until Firebase is initialized on the client.
    // This prevents children from trying to access context that isn't ready yet.
    return null;
  }

  return (
    <FirebaseContext.Provider value={firebase}>
      <FirebaseAuthProvider>
        <FirebaseFirestoreProvider>{children}</FirebaseFirestoreProvider>
      </FirebaseAuthProvider>
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  return useContext(FirebaseContext);
};
