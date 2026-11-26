'use client';

import {
  useId,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { Check, ChevronDown, ChevronsUpDown, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

const fieldBaseClass =
  'h-9 w-full rounded-lg border border-border/70 bg-background px-3 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-border focus-visible:border-primary/40 focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50';

export function FormField({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium text-foreground"
      >
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormSection({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className={cn('grid gap-3.5 sm:grid-cols-2', className)}>
        {children}
      </div>
    </section>
  );
}

export function TextField({
  label,
  hint,
  error,
  required = false,
  className,
  inputClassName,
  id,
  ...props
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
} & ComponentProps<typeof Input>) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      <Input
        id={fieldId}
        className={cn(fieldBaseClass, inputClassName)}
        {...props}
      />
    </FormField>
  );
}

export function TextareaField({
  label,
  hint,
  error,
  required = false,
  className,
  textareaClassName,
  id,
  ...props
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  textareaClassName?: string;
} & ComponentProps<'textarea'>) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      <textarea
        id={fieldId}
        className={cn(
          fieldBaseClass,
          'min-h-[96px] resize-y py-2 leading-relaxed',
          textareaClassName
        )}
        {...props}
      />
    </FormField>
  );
}

export function SelectField({
  label,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select an option',
  hint,
  error,
  required = false,
  disabled = false,
  className,
  name,
  id,
}: {
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string;
  defaultValue?: string;
  onChange?: (event: { target: { name?: string; value: string } }) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue ?? options[0]?.value ?? ''
  );

  const currentValue = value !== undefined ? value : internalValue;
  const selected = options.find((option) => option.value === currentValue);

  const handleSelect = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onChange?.({ target: { name, value: nextValue } });
    setOpen(false);
  };

  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      {name && <input type="hidden" name={name} value={currentValue} />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={fieldId}
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              fieldBaseClass,
              'flex cursor-pointer items-center justify-between gap-2 text-left font-normal data-[state=open]:border-primary/40 data-[state=open]:ring-[3px] data-[state=open]:ring-ring/25'
            )}
          >
            <span
              className={cn(
                'truncate',
                !selected && 'text-muted-foreground'
              )}
            >
              {selected ? selected.label : placeholder}
            </span>
            <ChevronDown
              className={cn(
                'size-3.5 shrink-0 text-muted-foreground transition-transform duration-150',
                open && 'rotate-180 text-foreground'
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[var(--radix-popover-trigger-width)] rounded-xl border-border/60 bg-popover p-1 text-popover-foreground shadow-soft"
        >
          <div className="flex max-h-60 flex-col gap-0.5 overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.value === currentValue;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-40',
                    isSelected
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-foreground hover:bg-muted/70'
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  <Check
                    className={cn(
                      'ml-2 size-3.5 shrink-0 text-primary transition-opacity',
                      isSelected ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </FormField>
  );
}

export function ColorField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const generatedId = useId();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    onChange(event.target.value);
  return (
    <FormField label={label} htmlFor={generatedId} className={className}>
      <div className="flex items-center gap-2.5">
        <input
          id={generatedId}
          type="color"
          value={value}
          onChange={handleChange}
          className="size-9 shrink-0 cursor-pointer rounded-lg border border-border/70 bg-background p-1"
        />
        <Input
          value={value}
          onChange={handleChange}
          aria-label={`${label} hex value`}
          placeholder="#3B82F6"
          className={cn(fieldBaseClass, 'font-mono text-[11px]')}
        />
      </div>
    </FormField>
  );
}

export function ComboboxField({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  emptyLabel = 'No options found.',
  addLabel,
  onAdd,
  disabled = false,
  loading = false,
  allowClear = false,
  clearLabel = 'Unassign',
  className,
}: {
  label: string;
  options: {
    value: string;
    label: string;
    description?: string;
    color?: string;
  }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  addLabel?: string;
  onAdd?: () => void;
  disabled?: boolean;
  loading?: boolean;
  allowClear?: boolean;
  clearLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <FormField label={label} className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || loading}
            className={cn(
              fieldBaseClass,
              'flex cursor-pointer items-center justify-between font-normal shadow-none'
            )}
          >
            {loading ? (
              <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <Loader2 className="size-3.5 shrink-0 animate-spin" />
                Loading…
              </span>
            ) : selected ? (
              <span className="flex min-w-0 items-center gap-2">
                {selected.color && (
                  <span
                    className="inline-block size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: selected.color }}
                  />
                )}
                <span className="truncate">{selected.label}</span>
              </span>
            ) : (
              <span className="truncate text-muted-foreground">
                {placeholder}
              </span>
            )}
            <ChevronsUpDown className="ml-2 size-3.5 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] rounded-xl border-border/60 bg-popover p-0 text-popover-foreground shadow-soft"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandEmpty>
              <div className="flex flex-col items-start gap-2 p-3">
                <p className="text-xs text-muted-foreground">
                  {loading ? 'Loading…' : emptyLabel}
                </p>
                {addLabel && onAdd && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-lg text-xs"
                    onClick={() => {
                      setOpen(false);
                      onAdd();
                    }}
                  >
                    {addLabel}
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {allowClear && value && (
                <CommandItem
                  onSelect={() => {
                    onChange('');
                    setOpen(false);
                  }}
                >
                  <X className="mr-2 size-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{clearLabel}</span>
                </CommandItem>
              )}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.description ?? ''}`}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 size-3.5 shrink-0',
                      value === option.value ? 'text-primary' : 'opacity-0'
                    )}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="flex items-center gap-2 font-medium">
                      {option.color && (
                        <span
                          className="inline-block size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="truncate text-[11px] text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </span>
                </CommandItem>
              ))}
              {addLabel && onAdd && (
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    onAdd();
                  }}
                >
                  <Plus className="mr-2 size-3.5 shrink-0" />
                  {addLabel}
                </CommandItem>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </FormField>
  );
}