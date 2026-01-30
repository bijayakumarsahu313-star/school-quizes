'use client';

import { createContext, useContext } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

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

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

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
    return null;
  }

  const { app, auth, firestore } = firebase;
  return (
    <FirebaseContext.Provider value={{ app, auth, firestore }}>
      <FirebaseAuthProvider>
        <FirebaseFirestoreProvider>{children}</FirebaseFirestoreProvider>
      </FirebaseAuthProvider>
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
