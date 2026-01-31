'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/teacher-tools', label: 'Teacher Tools' },
  { href: '/student-zone', label: 'Student Zone' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [userDetails, setUserDetails] = useState<{ type: 'student' | 'teacher'; name: string; id: string } | null>(null);

  useEffect(() => {
    // This code runs only on the client, so window and sessionStorage are available.
    const studentDetailsString = sessionStorage.getItem('studentDetails');
    const adminDetailsString = sessionStorage.getItem('adminDetails');

    if (studentDetailsString) {
      try {
        const student = JSON.parse(studentDetailsString);
        if (student.name && student.rollNo) {
            setUserDetails({ type: 'student', name: student.name, id: student.rollNo });
        }
      } catch (e) {
        console.error("Failed to parse student details", e);
      }
    } else if (adminDetailsString) {
      try {
        const admin = JSON.parse(adminDetailsString);
        if(admin.adminId) {
            setUserDetails({ type: 'teacher', name: 'Teacher', id: admin.adminId });
        }
      } catch (e) {
        console.error("Failed to parse admin details", e);
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    // Using window.location.href to ensure a full page reload and clear state.
    window.location.href = '/get-started';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <nav className="ml-auto hidden items-center space-x-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center ml-4">
            {userDetails ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer h-9 w-9">
                        <AvatarFallback>{userDetails.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                        <div className="font-bold">{userDetails.name}</div>
                        <div className="text-xs text-muted-foreground font-normal">
                        {userDetails.type === 'teacher' ? 'Admin No.' : 'Roll No.'}: {userDetails.id}
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        Log Out
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : null }
        </div>
      </div>
    </header>
  );
}
