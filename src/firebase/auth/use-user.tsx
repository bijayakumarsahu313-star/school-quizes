
'use client';

import { Auth, onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { useAuth } from '@/firebase/auth/provider';

const useUser = () => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
};

export { useUser };
