
'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart2,
  BookCopy,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuBadge,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Quiz, UserProfile } from '@/lib/data';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';


function Header({userProfile}: {userProfile: UserProfile | null}) {
    const { user } = useUser();
    return (
      <div className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
        <div className="hidden md:block">
            {/* Can add breadcrumbs or page title here */}
        </div>
        <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || ''} />
              <AvatarFallback>{userProfile?.name?.charAt(0) || 'T'}</AvatarFallback>
            </Avatar>
        </div>
      </div>
    );
}

function useUser() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }, []);
    return { user };
}


export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
        const unsub = onSnapshot(query(collection(db, 'quizzes'), where('createdBy', '==', user.uid)), (snapshot) => {
            setQuizzesCount(snapshot.size);
            setLoadingQuizzes(false);
        });
        const unsubProfile = onSnapshot(doc(db, "users", user.uid), (doc) => {
          setUserProfile(doc.data() as UserProfile);
        })
        return () => {
            unsub();
            unsubProfile();
        }
    }
  }, [user]);
  
  const navItems = [
    { href: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { href: '/dashboard/quizzes', icon: <BookCopy />, label: 'Quizzes', badge: loadingQuizzes ? '...' : quizzesCount.toString() },
    { href: '/dashboard/students', icon: <Users />, label: 'Students' },
    { href: '/dashboard/analytics', icon: <BarChart2 />, label: 'Analytics' },
  ];

  const handleLogout = async () => {
      await signOut(auth);
      router.push('/');
  }

  return (
    <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <a href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Separator className="my-2" />
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Settings">
                        <a href="#">
                        <Settings />
                        <span>Settings</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <Header userProfile={userProfile}/>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
