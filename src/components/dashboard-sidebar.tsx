
'use client';

import { usePathname } from 'next/navigation';
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
import { useCollection, useUser } from '@/firebase';
import type { Quiz } from '@/lib/data';

function Header() {
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
              <AvatarImage src="https://picsum.photos/seed/user/40/40" />
              <AvatarFallback>T</AvatarFallback>
            </Avatar>
        </div>
      </div>
    );
}


export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { data: quizzesData, loading: quizzesLoading } = useCollection<Quiz>(
    'quizzes',
    'createdBy',
    user?.uid
  );

  const navItems = [
    { href: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { href: '/dashboard/quizzes', icon: <BookCopy />, label: 'Quizzes', badge: quizzesLoading ? '...' : (quizzesData?.length ?? 0).toString() },
    { href: '/dashboard/students', icon: <Users />, label: 'Students' },
    { href: '/dashboard/analytics', icon: <BarChart2 />, label: 'Analytics' },
  ];

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
                    <SidebarMenuButton asChild tooltip="Logout">
                        <a href="/">
                        <LogOut />
                        <span>Logout</span>
                        </a>
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
