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
  return useContext(FirebaseAuthContext);
};
