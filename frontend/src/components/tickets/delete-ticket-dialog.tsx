'use client';

import type { FormEvent } from 'react';
import { AlertCircle } from 'lucide-react';
import { FormDialog } from '@/components/page-kits';
import type { SupportTicket } from '@/hooks/api/useSupportTickets';

export function DeleteTicketDialog({
  open,
  onOpenChange,
  ticket,
  isSubmitting = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: SupportTicket | null;
  isSubmitting?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onConfirm();
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete ticket"
      description={`This permanently deletes ${ticket?.ticketNumber || 'this ticket'} and all of its comments and attachments. This can't be undone.`}
      icon={AlertCircle}
      variant="destructive"
      isSubmitting={isSubmitting}
      submitLabel="Delete ticket"
      submittingLabel="Deleting…"
      cancelLabel="Keep ticket"
      onSubmit={handleSubmit}
    >
      <div className="rounded-xl border border-destructive/25 bg-destructive/10 p-4">
        <p className="text-xs font-medium text-foreground">
          {ticket?.title || 'Untitled ticket'}
        </p>
        {ticket?.customerName && (
          <p className="mt-1 text-xs text-muted-foreground">
            Reported by {ticket.customerName}
          </p>
        )}
      </div>
    </FormDialog>
  );
}
