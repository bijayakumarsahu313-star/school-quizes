'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCrYs-SDa1MS5grPC5vOAaiTzpyeaxqyK8",
    authDomain: "studio-8531319632-2a07c.firebaseapp.com",
    projectId: "studio-8531319632-2a07c",
    storageBucket: "studio-8531319632-2a07c.appspot.com",
    messagingSenderId: "715607628631",
    appId: "1:715607628631:web:0182fd7af9a6568c073c12"
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth: Auth = getAuth(app);
export const firestore: Firestore = getFirestore(app);
