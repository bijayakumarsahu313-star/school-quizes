
'use client';
import { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '@/firebase/client';
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
        let profile: UserProfile | null = null;
        if (doc.exists()) {
            profile = { id: doc.id, ...doc.data() } as UserProfile;
        }

        // Automatically grant admin role to a specific email
        if (user.email === 'bisweswarsahu834@gmail.com') {
            if (profile) {
                profile.role = 'admin';
            } else {
                // If profile doesn't exist for some reason, create a temporary one for the session.
                profile = {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || 'Admin',
                    role: 'admin',
                    createdAt: new Date(),
                };
            }
        }

        setUserProfile(profile);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching user profile:", error);
        setLoading(false);
    });
    
    return () => unsubscribeProfile();
  }, [user]);

  return { user, userProfile, loading };
}
