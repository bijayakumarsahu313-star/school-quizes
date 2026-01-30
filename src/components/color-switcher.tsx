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

export function ColorSwitcher() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setBackgroundColor = (color: string) => {
    document.body.style.backgroundColor = color;
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
        <DropdownMenuItem onSelect={() => setBackgroundColor('red')}>
          Red
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setBackgroundColor('yellow')}>
          Yellow
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setBackgroundColor('white')}>
          White
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setBackgroundColor('black')}>
          Black
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setBackgroundColor('')}>
          Default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
