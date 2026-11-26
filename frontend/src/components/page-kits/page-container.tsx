import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-dvh w-full  flex-col gap-6 [&>*]:shrink-0',
        className
      )}
    >
      {children}
    </div>
  );
}
