'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle({ inline = false }: { inline?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const toggle = () => setTheme(isDark ? 'light' : 'dark');
  const icon = mounted && isDark ? <Sun className="size-4 shrink-0" /> : <Moon className="size-4 shrink-0" />;

  if (inline) {
    return (
      <button type="button" aria-label={label} onClick={toggle} className="btn btn-ghost btn-icon btn-sm">
        {icon}
      </button>
    );
  }

  if (!mounted) {
    return <div className="fixed right-4 top-4 z-50 size-10" />;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      onClick={toggle}
      className="inline-flex size-10 shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full border border-border bg-card/90 text-foreground shadow-float backdrop-blur-sm transition-colors hover:bg-card fixed right-4 top-4 z-50"
    >
      {isDark ? <Sun className="size-5 shrink-0" /> : <Moon className="size-5 shrink-0" />}
    </Button>
  );
}
