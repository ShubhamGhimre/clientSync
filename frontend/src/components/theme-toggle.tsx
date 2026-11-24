'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed right-4 top-4 z-50 size-10" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex size-10 shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full border border-border bg-card/90 text-foreground shadow-float backdrop-blur-sm transition-colors hover:bg-card fixed right-4 top-4 z-50"
    >
      {isDark ? <Sun className="size-5 shrink-0" /> : <Moon className="size-5 shrink-0" />}
    </Button>
  );
}
