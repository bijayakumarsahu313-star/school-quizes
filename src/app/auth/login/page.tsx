"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        e.target.email.value,
        e.target.password.value
      );
      
      const userDoc = await getDoc(doc(db, "users", userCred.user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data()?.role;
        if (role === 'teacher') {
          router.push('/dashboard');
        } else {
          router.push('/student-zone');
        }
      } else {
        // Fallback if user document doesn't exist for some reason
        router.push('/');
      }

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: 'auto', paddingTop: '2rem' }}>
      <h2>Login</h2>

      <input name="email" type="email" placeholder="Email" required style={{ padding: '0.5rem' }}/>
      <input name="password" type="password" placeholder="Password" required style={{ padding: '0.5rem' }}/>

      <button disabled={loading} style={{ padding: '0.5rem' }}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
