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
    if (auth === null) {
      // Firebase Auth is not yet initialized. We are in a loading state.
      // We will wait for the auth object to be available.
      setLoading(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        // Auth state has been determined.
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setUser(null);
        setLoading(false);
      }
    );

    // Cleanup the listener on unmount.
    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
};

export { useUser };
