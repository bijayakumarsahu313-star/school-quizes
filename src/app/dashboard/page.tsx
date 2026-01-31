
"use client";

import { useUser } from "@/firebase/auth/use-user";

export default function Dashboard() {
  const { userProfile, loading } = useUser();

  if (loading) return <p>Loading...</p>;
  if (!userProfile) return <p>Please log in.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <h2 className="text-xl mb-2">Welcome, {userProfile.name}!</h2>
      
      {userProfile.role === "teacher" && (
        <div>
          <p className="text-muted-foreground">This is your teacher quiz management panel.</p>
          {/* Teacher-specific components will go here */}
        </div>
      )}
    </div>
  );
}
