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
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // If auth is null, we are still in the process of initializing.
      // The loading state remains true until the auth object is available.
      setLoading(true);
    }
  }, [auth]);

  return { user, loading };
};

export { useUser };
