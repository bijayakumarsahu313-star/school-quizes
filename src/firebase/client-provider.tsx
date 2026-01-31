'use client';

import { ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

/**
 * This provider is a client-side wrapper that safely handles rendering
 * components that should only exist in the browser (like the FirebaseErrorListener).
 * It uses a `useEffect` hook to ensure that client-only components are rendered
 * *after* the initial server-client hydration is complete, preventing hydration errors.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  // This effect runs only once on the client, after the component mounts.
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <FirebaseProvider>
      {/* The FirebaseErrorListener is only rendered on the client and in development mode,
          and only after the initial hydration is complete. */}
      {isClient && process.env.NODE_ENV === 'development' && <FirebaseErrorListener />}
      {children}
    </FirebaseProvider>
  );
}
