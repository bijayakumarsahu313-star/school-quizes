'use client';

import type { Firestore } from 'firebase/firestore';
import { createContext, useContext } from 'react';

import { useFirebase } from '@/firebase/provider';

const FirebaseFirestoreContext = createContext<Firestore | null>(null);

export const FirebaseFirestoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const firebase = useFirebase();
  return (
    <FirebaseFirestoreContext.Provider value={firebase?.firestore ?? null}>
      {children}
    </FirebaseFirestoreContext.Provider>
  );
};

export const useFirestore = () => {
  return useContext(FirebaseFirestoreContext);
};
