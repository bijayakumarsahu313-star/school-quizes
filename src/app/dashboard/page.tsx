"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const role = docSnap.data()?.role;
          if (role === 'student') {
             router.replace('/student-zone');
          } else {
            setUserRole(role);
            setLoading(false);
          }
        } else {
          // If no user doc, they can't have a role, redirect to login
          router.replace('/auth/login');
        }
      } else {
        // No user logged in, redirect to login
        router.replace('/auth/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <p>Loading...</p>;
  }
  
  if (!userRole) {
    // This case is handled by the redirect, but as a fallback
    return <p>Loading or redirecting...</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      {userRole === "teacher" && (
        <div>
          <h2>Welcome, Teacher!</h2>
          <p>Teacher Quiz Management Panel</p>
        </div>
      )}
      
      {/* Student view is now handled by redirecting to /student-zone */}
    </div>
  );
}
