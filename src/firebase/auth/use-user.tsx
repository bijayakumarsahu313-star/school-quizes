
'use client';
import { useFirebase } from '../provider';

export function useUser() {
  const { user, userProfile, loading } = useFirebase();
  return { user, userProfile, loading };
}
