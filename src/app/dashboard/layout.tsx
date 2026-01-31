
'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, userProfile, loading } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    if (userProfile) {
      if (userProfile.role === 'teacher' || userProfile.role === 'admin') {
        setIsAuthorized(true);
      } else {
        router.replace('/student-zone');
      }
    }
    // If no user profile, they will be redirected eventually, so we wait.
    
  }, [user, userProfile, loading, router]);

  if (loading || !isAuthorized) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return <DashboardSidebar>{children}</DashboardSidebar>;
}
