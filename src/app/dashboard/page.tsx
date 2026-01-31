"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/lib/data";

export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDocRef = doc(db, "users", authUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser(userDocSnap.data() as UserProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please log in.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <h2 className="text-xl mb-2">Welcome, {user.name}!</h2>
      
      {user.role === "teacher" && (
        <div>
          <p className="text-muted-foreground">This is your teacher quiz management panel.</p>
          {/* Teacher-specific components will go here */}
        </div>
      )}
      
      {user.role === "student" && (
        <div>
          <p className="text-muted-foreground">Welcome to the student zone. Access your quizzes and track your progress.</p>
          {/* This is a fallback, students should be redirected to /student-zone */}
        </div>
      )}
    </div>
  );
}
