import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { menuContentClass, toolbarBtnClass } from '@/components/tables/table-kits';
import { cn } from '@/lib/utils';

export type FilterOption = { value: string; label: string };

export function FilterDropdown({
  options,
  value,
  onValueChange,
  active,
  className,
}: {
  options: FilterOption[];
  value: string;
  onValueChange: (value: string) => void;
  active?: boolean;
  className?: string;
}) {
  const isActive = active ?? value !== 'ALL';
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            toolbarBtnClass,
            isActive && 'border-primary/30 bg-primary/5 text-primary',
            className
          )}
        >
          {options.find((option) => option.value === value)?.label}
          <ChevronDown className="size-3.5 shrink-0 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={menuContentClass}>
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
