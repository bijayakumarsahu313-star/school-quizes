'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { useUser, useDoc } from '@/firebase';
import type { UserProfile } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: userLoading } = useUser();
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(user ? 'users' : null, user?.uid);
  const router = useRouter();

  useEffect(() => {
    const isDoneLoading = !userLoading && !profileLoading;

    if (isDoneLoading) {
      if (!user) {
        // If not logged in, redirect to login
        router.replace('/auth/login');
      } else if (userProfile && userProfile.role !== 'teacher') {
        // If logged in but not a teacher, redirect to student zone
        router.replace('/student-zone');
      }
    }
  }, [user, userProfile, userLoading, profileLoading, router]);

  // While loading or if the user is not a teacher, show a loading state.
  // This prevents the children (which may contain restricted data fetches) from rendering.
  if (userLoading || profileLoading || !userProfile || userProfile.role !== 'teacher') {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  // If loading is complete and user is a teacher, render the dashboard.
  return <DashboardSidebar>{children}</DashboardSidebar>;
}
