
'use client';

import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

import { firebaseConfig as clientFirebaseConfig } from '@/firebase/config';

// Re-export components and hooks for easy importing.
export { FirebaseProvider, useFirebase, useAuth, useFirestore, useFirebaseApp } from '@/firebase/provider';
export { useUser } from '@/firebase/auth/use-user';
export { useDoc } from '@/firebase/firestore/use-doc';
export { useCollection } from '@/firebase/firestore/use-collection';

/**
 * Initializes a Firebase app and returns the app, auth, and firestore instances.
 *
 * @param config The Firebase configuration object.
 * @returns An object containing the Firebase app, auth, and firestore instances.
 */
export function initializeFirebase(config: Record<string, string> = {}) {
  const firebaseConfig =
    Object.keys(config).length > 0 ? config : clientFirebaseConfig;

  if (firebaseConfig?.projectId === undefined) {
    throw new Error(
      'Firebase config is not defined. Ensure you have a valid firebase/config.ts file.'
    );
  }
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { app, auth, firestore };
}
