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
    // We can't get the user if the auth service isn't ready.
    if (!auth) {
      setLoading(true);
      setUser(null);
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
