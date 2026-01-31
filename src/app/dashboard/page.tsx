"use client";

import { useUser } from "@/firebase";

export default function Dashboard() {
  const { user } = useUser();

  // The parent layout (layout.tsx) already protects this route and ensures
  // only teachers can access it. We can assume `user` exists and is a teacher.
  // The loading state is also handled by the layout.

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Welcome, {user?.displayName || 'Teacher'}!</h2>
      <p>This is your teacher quiz management panel. You can create quizzes, view results, and manage your students from here.</p>
    </div>
  );
}
