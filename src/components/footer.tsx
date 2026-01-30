import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ColorSwitcher } from './color-switcher';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-6 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Logo />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} school quizes. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/about" className="text-sm hover:underline">
              About
            </Link>
            <Link href="/contact" className="text-sm hover:underline">
              Contact
            </Link>
            <Link href="/pricing" className="text-sm hover:underline">
              Pricing
            </Link>
          </nav>
          <ColorSwitcher />
        </div>
      </div>
    </footer>
  );
}
