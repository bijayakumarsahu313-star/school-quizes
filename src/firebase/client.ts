
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore: Firestore = getFirestore(app);

export { app, firestore };
