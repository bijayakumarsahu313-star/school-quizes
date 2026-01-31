
'use client';
import { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '@/firebase/provider';
import type { UserProfile } from '@/lib/data';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(userState => {
        setUser(userState);
        if (!userState) {
            setLoading(false);
            setUserProfile(null);
        }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user === undefined) return; // Still waiting for auth state
    if (user === null) {
        setLoading(false); // No user, not loading
        return;
    }

    const userDocRef = doc(firestore, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
            setUserProfile({ id: doc.id, ...doc.data() } as UserProfile);
        } else {
            setUserProfile(null);
        }
        setLoading(false); // Profile fetched or confirmed not to exist
    }, (error) => {
        console.error("Error fetching user profile:", error);
        setLoading(false);
    });
    
    return () => unsubscribeProfile();
  }, [user]);

  return { user, userProfile, loading };
}
