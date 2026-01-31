'use client';

// This is a barrel file. It's used to re-export modules from this directory
// to simplify imports in other parts of the application.

// Main provider and core hooks
export { FirebaseProvider, useFirebase, useAuth, useFirestore, useFirebaseApp } from '@/firebase/provider';
export { FirebaseClientProvider } from '@/firebase/client-provider';


// Feature-specific hooks
export { useUser } from '@/firebase/auth/use-user';
export { useDoc } from '@/firebase/firestore/use-doc';
export { useCollection } from '@/firebase/firestore/use-collection';

// Error handling
export { errorEmitter } from '@/firebase/error-emitter';
export { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
