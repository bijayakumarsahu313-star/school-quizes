'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Paintbrush } from 'lucide-react';
import { useEffect, useState } from 'react';

const colorClasses = ['bg-red', 'bg-yellow', 'bg-white', 'bg-black'];

export function ColorSwitcher() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setBackgroundColor = (colorClass: string) => {
    document.body.classList.remove(...colorClasses);
    if (colorClass) {
      document.body.classList.add(colorClass);
    }
  };

  if (!mounted) {
    // Return a placeholder to prevent layout shift
    return <div className="h-10 w-10" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Paintbrush className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change background color</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Background Color</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => setBackgroundColor('bg-red')}>
          Red
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setBackgroundColor('bg-yellow')}>
          Yellow
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setBackgroundColor('bg-white')}>
          White
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setBackgroundColor('bg-black')}>
          Black
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setBackgroundColor('')}>
          Default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
