'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Loader2 } from "lucide-react";

export default function TeacherToolsPage() {
  const router = useRouter();

  useEffect(() => {
    // This check runs only on the client-side
    const teacherAuth = sessionStorage.getItem('isTeacherAuthenticated');
    if (teacherAuth === 'true') {
      router.replace('/dashboard');
    } else {
      router.replace('/get-started');
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Redirecting...</p>
      </main>
      <Footer />
    </div>
  );
}
