"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        e.target.email.value,
        e.target.password.value
      );
      router.push("/");
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
