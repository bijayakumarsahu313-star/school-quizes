
'use client';

import { Auth } from 'firebase/auth';
import { createContext, useContext } from 'react';

import { useFirebase } from '@/firebase/provider';

const FirebaseAuthContext = createContext<Auth | undefined>(undefined);

export const FirebaseAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { auth } = useFirebase();
  return (
    <FirebaseAuthContext.Provider value={auth}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};
