import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative w-full min-w-0 sm:w-72', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        aria-label={label ?? placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded-full border border-border/70 bg-background pr-3 pl-9 text-xs text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-[3px] focus-visible:ring-ring/25"
      />
    </div>
  );
}
