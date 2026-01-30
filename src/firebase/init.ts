import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

import { firebaseConfig as clientFirebaseConfig } from '@/firebase/config';

/**
 * Initializes a Firebase app and returns the app, auth, and firestore instances.
 * This function is idempotent, so it's safe to call it multiple times.
 *
 * @param config The Firebase configuration object.
 * @returns An object containing the Firebase app, auth, and firestore instances.
 */
export function initializeFirebase(config: Record<string, string> = {}): { app: FirebaseApp; auth: Auth; firestore: Firestore; } {
  const firebaseConfig =
    Object.keys(config).length > 0 ? config : clientFirebaseConfig;

  if (!firebaseConfig?.projectId || firebaseConfig.projectId === 'PROJECT_ID') {
    throw new Error(
      'Firebase config is not defined or contains placeholder values. Ensure you have a valid firebase/config.ts file.'
    );
  }
  
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { app, auth, firestore };
}
