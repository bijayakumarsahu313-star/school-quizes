'use client';

import type { Auth } from 'firebase/auth';
import { createContext, useContext } from 'react';

import { useFirebase } from '@/firebase/provider';

const FirebaseAuthContext = createContext<Auth | null>(null);

export const FirebaseAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const firebase = useFirebase();
  return (
    <FirebaseAuthContext.Provider value={firebase?.auth ?? null}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useAuth = () => {
  // It's possible the context is not available yet during initialization.
  // The consuming hook should handle the null case. We do not throw an error here
  // to allow components to gracefully handle the loading state.
  return useContext(FirebaseAuthContext);
};
