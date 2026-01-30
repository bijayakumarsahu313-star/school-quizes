'use client';

import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { useAuth } from '@/firebase/auth/provider';

const useUser = () => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If the auth context is not yet available, we are in a loading state.
    if (!auth) {
      setLoading(true);
      setUser(null);
      return;
    }

    // Auth is available, so we set up the listener.
    // The listener will immediately fire with the current auth state.
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        // We have received the auth state.
        setUser(user);
        setLoading(false);
      },
      (error) => {
        // Handle potential errors from the listener itself.
        console.error('Auth state change error:', error);
        setUser(null);
        setLoading(false);
      }
    );

    // Cleanup the listener on unmount.
    return () => unsubscribe();
  }, [auth]); // This effect re-runs whenever the auth object changes.

  return { user, loading };
};

export { useUser };
