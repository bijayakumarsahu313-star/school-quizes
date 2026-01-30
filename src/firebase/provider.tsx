'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { firebaseConfig } from '@/firebase/config';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [firebaseInstance, setFirebaseInstance] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    try {
      if (firebaseConfig?.projectId && firebaseConfig.projectId !== 'PROJECT_ID') {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        const auth = getAuth(app);
        const firestore = getFirestore(app);
        
        // Use onAuthStateChanged as a readiness check.
        // It fires once the auth service is initialized.
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // Set the instance only on the first run.
            if (!firebaseInstance) {
                setFirebaseInstance({ app, auth, firestore });
            }
            // Unsubscribe to avoid memory leaks. The useUser hook has its own listener.
            unsubscribe();
        }, (error) => {
            console.error("Firebase auth readiness check failed:", error);
            unsubscribe();
        });
        
      } else {
        console.error(
          'Firebase config is missing or contains placeholder values. Firebase will not be initialized.'
        );
      }
    } catch (error) {
      console.error('Firebase initialization failed:', error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on client mount. `firebaseInstance` is intentionally omitted from deps.

  // Render nothing until the onAuthStateChanged listener has fired and set the instance.
  // This prevents hydration mismatches and race conditions.
  if (!firebaseInstance) {
    return null;
  }

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
    throw new Error('useFirebase must be used within a FirebaseProvider. This might happen if Firebase fails to initialize.');
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
