'use client';

import type { FormEventHandler, ReactNode } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const headerGradient =
  'linear-gradient(90deg, transparent, var(--primary), var(--chart-2), transparent)';

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  children,
  onSubmit,
  submitLabel = 'Save changes',
  submittingLabel = 'Saving…',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  size = 'md',
  variant = 'default',
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitLabel?: string;
  submittingLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  size?: 'md' | 'lg';
  variant?: 'default' | 'destructive';
  className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-h-[88vh] gap-0 overflow-y-auto rounded-2xl border-border/60 bg-card p-0 text-card-foreground shadow-soft sm:max-w-xl',
          size === 'lg' && 'sm:max-w-2xl',
          className
        )}
      >
        <div className="relative overflow-hidden border-b border-border/60 px-6 py-5 pr-12">
          <div
            className="pointer-events-none absolute inset-x-6 top-0 h-px opacity-90"
            style={{ background: headerGradient }}
            aria-hidden="true"
          />
          <DialogHeader className="gap-0 text-left">
            <div className="flex items-start gap-3">
              {Icon && (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Icon className="size-4 shrink-0" />
                </span>
              )}
              <div className="min-w-0">
                <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                  {title}
                </DialogTitle>
                {description && (
                  <DialogDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col">
          <div className="flex flex-col gap-5 px-6 py-5">{children}</div>
          <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-muted/25 px-6 py-3.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 rounded-full border-border/70 bg-background px-4 text-xs font-medium text-foreground hover:border-primary/30 hover:text-primary"
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'h-9 rounded-full px-4 text-xs font-semibold',
                variant === 'destructive' &&
                  'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              )}
            >
              {isSubmitting && (
                <Loader2 className="mr-1.5 size-3.5 shrink-0 animate-spin" />
              )}
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
