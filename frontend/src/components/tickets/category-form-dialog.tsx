'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Tag } from 'lucide-react';
import {
  ColorField,
  FormDialog,
  FormSection,
  TextareaField,
  TextField,
} from '@/components/page-kits';
import type { CreateTicketCategoryPayload } from '@/hooks/api/useSupportTickets';

const emptyForm = {
  name: '',
  description: '',
  color: '#3B82F6',
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  isSubmitting = false,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
  onSubmit: (values: CreateTicketCategoryPayload) => void | Promise<void>;
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) setForm(emptyForm);
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ ...form, name: form.name.trim() });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New category"
      description="Group tickets by team, product area, or issue type."
      icon={Tag}
      isSubmitting={isSubmitting}
      submitLabel="Create category"
      submittingLabel="Creating…"
      onSubmit={handleSubmit}
    >
      <FormSection title="Category details">
        <TextField
          label="Name"
          required
          className="sm:col-span-2"
          value={form.name}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, name: event.target.value }))
          }
          placeholder="e.g. Technical Support"
          disabled={isSubmitting}
        />
        <TextareaField
          label="Description"
          className="sm:col-span-2"
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          placeholder="Brief description of this category"
          hint="Optional — shown in the category picker."
          disabled={isSubmitting}
        />
        <ColorField
          label="Color"
          value={form.color}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, color: value }))
          }
        />
      </FormSection>
    </FormDialog>
  );
}
