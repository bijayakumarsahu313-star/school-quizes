
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useUser, useDoc, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import type { UserProfile } from '@/lib/data';
import { Skeleton } from './ui/skeleton';

const navLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/teacher-tools', label: 'Teacher Tools' },
  { href: '/student-zone', label: 'Student Zone' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const { user, loading: userLoading } = useUser();
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(user ? 'users' : null, user ? user.uid : null);
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  const isLoading = userLoading || (user && profileLoading);

  const getDashboardLink = () => {
    if (userProfile?.role === 'teacher') {
        return '/dashboard';
    }
    return '/student-zone';
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <nav className="ml-10 hidden items-center space-x-6 text-sm font-medium md:flex">
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
        <div className="ml-auto flex items-center gap-4">
            {isLoading ? (
                <div className='flex items-center gap-2'>
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                </div>
            ) : user ? (
                <>
                    <Button variant="ghost" asChild>
                        <Link href={getDashboardLink()}>Dashboard</Link>
                    </Button>
                    <Button onClick={handleLogout}>Logout</Button>
                </>
            ) : (
                <>
                    <Button variant="ghost" asChild>
                        <Link href="/auth/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                </>
            )}
        </div>
      </div>
    </header>
  );
}
