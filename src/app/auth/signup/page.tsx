"use client";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const role = e.target.role.value;

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role, // teacher or student
        createdAt: new Date(),
      });

      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: 'auto', paddingTop: '2rem' }}>
      <h2>Sign Up</h2>

      <input name="name" placeholder="Full Name" required style={{ padding: '0.5rem' }} />
      <input name="email" type="email" placeholder="Email" required style={{ padding: '0.5rem' }} />
      <input name="password" type="password" placeholder="Password" required style={{ padding: '0.5rem' }} />

      <select name="role" required style={{ padding: '0.5rem' }}>
        <option value="">Select Role</option>
        <option value="teacher">Teacher</option>
        <option value="student">Student</option>
      </select>

      <button disabled={loading} style={{ padding: '0.5rem' }}>
        {loading ? "Creating..." : "Sign Up"}
      </button>
    </form>
  );
}
