'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';

// This component listens for permission errors and throws them to be caught
// by the Next.js development error overlay.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Throw the error so Next.js can display it in the dev overlay.
      // This is for development-time debugging of security rules.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null; // This component does not render anything.
}
