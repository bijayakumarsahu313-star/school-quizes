
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
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { useEffect, useState } from 'react';


function Header() {
    const { user, userProfile } = useUser();
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

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  useEffect(() => {
    if (user) {
        const q = userProfile?.role === 'admin' 
            ? query(collection(db, 'quizzes'))
            : query(collection(db, 'quizzes'), where('createdBy', '==', user.uid));
            
        const unsub = onSnapshot(q, (snapshot) => {
            setQuizzesCount(snapshot.size);
            setLoadingQuizzes(false);
        });
        return () => unsub();
    }
  }, [user, userProfile, db]);
  
  const navItems = [
    { href: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { href: '/dashboard/quizzes', icon: <BookCopy />, label: 'Quizzes', badge: loadingQuizzes ? '...' : quizzesCount.toString() },
  ];
  
  if (userProfile?.role === 'admin') {
    navItems.push({ href: '/dashboard/users', icon: <Users />, label: 'Users' });
  }

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
            <Header/>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
