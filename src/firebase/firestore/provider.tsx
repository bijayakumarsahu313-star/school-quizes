
'use client';

import { Firestore } from 'firebase/firestore';
import { createContext, useContext } from 'react';

import { useFirebase } from '@/firebase/provider';

const FirebaseFirestoreContext = createContext<Firestore | undefined>(
  undefined
);

export const FirebaseFirestoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { firestore } = useFirebase();
  return (
    <FirebaseFirestoreContext.Provider value={firestore}>
      {children}
    </FirebaseFirestoreContext.Provider>
  );
};

export const useFirestore = () => {
  const context = useContext(FirebaseFirestoreContext);
  if (context === undefined) {
    throw new Error(
      'useFirestore must be used within a FirebaseFirestoreProvider'
    );
  }
  return context;
};
