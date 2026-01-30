'use client';

import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { useFirebase } from '@/firebase/provider';

const useUser = () => {
  const firebase = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firebase?.auth) {
      const unsubscribe = onAuthStateChanged(
        firebase.auth,
        (user) => {
          setUser(user);
          setLoading(false);
        },
        (error) => {
          console.error('Auth state change error:', error);
          setUser(null);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      // Firebase is not ready yet. We are in a loading state.
      setLoading(true);
      setUser(null);
    }
  }, [firebase]);

  return { user, loading };
};

export { useUser };
