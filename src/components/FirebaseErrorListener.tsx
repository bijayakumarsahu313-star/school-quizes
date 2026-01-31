
'use client';
import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This is a client component that will listen for custom errors
// and throw them to be caught by the Next.js error overlay.
// This is only for development and should not be used in production.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // Throw the error so Next.js can handle it
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.removeListener('permission-error', handleError);
    };
  }, []);

  return null; // This component doesn't render anything
}
