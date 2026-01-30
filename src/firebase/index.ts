'use client';

// This is a barrel file. It's used to re-export modules from this directory
// to simplify imports in other parts of the application.

// Core initialization
export { initializeFirebase } from '@/firebase/init';

// Main provider and core hooks
export { FirebaseProvider, useFirebase, useAuth, useFirestore, useFirebaseApp } from '@/firebase/provider';

// Feature-specific hooks
export { useUser } from '@/firebase/auth/use-user';
export { useDoc } from '@/firebase/firestore/use-doc';
export { useCollection } from '@/firebase/firestore/use-collection';
