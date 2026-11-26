import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function PageErrorState({
  title,
  noun,
  message,
  onRetry,
}: {
  title: string;
  noun: string;
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <Button onClick={onRetry} variant="outline" className="rounded-full">
          <RefreshCw className="mr-2 size-4 shrink-0" />
          Retry
        </Button>
      </div>
      <Alert
        variant="destructive"
        className="rounded-2xl border-destructive/25 bg-destructive/10"
      >
        <AlertCircle className="size-4 shrink-0" />
        <AlertDescription>
          Failed to load {noun}. {message}
        </AlertDescription>
      </Alert>
    </div>
  );
}
