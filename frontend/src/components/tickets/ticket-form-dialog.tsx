'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { LifeBuoy } from 'lucide-react';
import {
  ComboboxField,
  FormDialog,
  FormSection,
  SelectField,
  TextareaField,
  TextField,
} from '@/components/page-kits';
import type {
  SupportTicket,
  TicketCategory,
  TicketPriority,
} from '@/hooks/api/useSupportTickets';
import { useAgents } from '@/hooks/api/useUsers';

export type TicketFormValues = {
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  priority: TicketPriority;
  categoryId: string;
  assignedAgentId: string;
};

const emptyForm: TicketFormValues = {
  title: '',
  description: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  priority: 'MEDIUM',
  categoryId: '',
  assignedAgentId: '',
};

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'CRITICAL', label: 'Critical' },
];

const formatRole = (role: string) =>
  role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

const fullName = (firstName?: string, lastName?: string, email?: string) =>
  `${firstName || ''} ${lastName || ''}`.trim() || email || 'Unknown user';

export function TicketFormDialog({
  open,
  onOpenChange,
  ticket,
  categories,
  isSubmitting = false,
  onAddCategory,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: SupportTicket | null;
  categories: TicketCategory[];
  isSubmitting?: boolean;
  onAddCategory?: () => void;
  onSubmit: (values: TicketFormValues) => void | Promise<void>;
}) {
  const [form, setForm] = useState<TicketFormValues>(emptyForm);
  const {
    data: agentsData,
    isLoading: agentsLoading,
    error: agentsError,
  } = useAgents();

  useEffect(() => {
    setForm(
      ticket
        ? {
            title: ticket.title || '',
            description: ticket.description || '',
            customerName: ticket.customerName || '',
            customerEmail: ticket.customerEmail || '',
            customerPhone: ticket.customerPhone || '',
            priority: ticket.priority || 'MEDIUM',
            categoryId: ticket.categoryId || '',
            assignedAgentId: ticket.assignedAgentId || '',
          }
        : emptyForm
    );
  }, [ticket, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(form);
  };

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
    description: category.description,
    color: category.color,
  }));

  const agentOptions = (agentsData?.data ?? []).map((agent) => ({
    value: agent.id,
    label: fullName(agent.firstName, agent.lastName, agent.email),
    description: `${formatRole(agent.role)} · ${agent.email}`,
  }));

  const assignedAgent = ticket?.assignedAgent;
  if (
    ticket?.assignedAgentId &&
    !agentOptions.some((option) => option.value === ticket.assignedAgentId)
  ) {
    agentOptions.unshift({
      value: ticket.assignedAgentId,
      label: assignedAgent
        ? fullName(assignedAgent.firstName, assignedAgent.lastName, assignedAgent.email)
        : 'Assigned agent',
      description: assignedAgent
        ? `${formatRole(assignedAgent.role)} · ${assignedAgent.email} · Unavailable for assignment`
        : 'Unavailable for assignment',
    });
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={ticket ? 'Update ticket' : 'Create ticket'}
      description={
        ticket
          ? `Edit the details for ${ticket.ticketNumber}.`
          : 'Add a new customer support request to your queue.'
      }
      icon={LifeBuoy}
      size="lg"
      isSubmitting={isSubmitting}
      submitLabel={ticket ? 'Update ticket' : 'Create ticket'}
      submittingLabel={ticket ? 'Updating…' : 'Creating…'}
      onSubmit={handleSubmit}
    >
      <FormSection title="Ticket details" description="What the customer needs help with.">
        <TextField
          label="Title"
          required
          value={form.title}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, title: event.target.value }))
          }
          placeholder="Short summary of the issue"
          disabled={isSubmitting}
        />
        <TextareaField
          label="Description"
          required
          className="sm:col-span-2"
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          placeholder="Describe the problem and any steps already taken"
          disabled={isSubmitting}
        />
        <SelectField
          label="Priority"
          options={priorityOptions}
          value={form.priority}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              priority: event.target.value as TicketPriority,
            }))
          }
          disabled={isSubmitting}
        />
        <ComboboxField
          label="Category"
          options={categoryOptions}
          value={form.categoryId || undefined}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, categoryId: value }))
          }
          placeholder="Select category"
          searchPlaceholder="Search categories..."
          emptyLabel="No categories found."
          addLabel="Add category"
          onAdd={onAddCategory}
        />
      </FormSection>

      <FormSection
        title="Customer"
        description="Contact details for updates and follow-up."
      >
        <TextField
          label="Customer name"
          required
          value={form.customerName}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, customerName: event.target.value }))
          }
          placeholder="Full name"
          disabled={isSubmitting}
        />
        <TextField
          label="Customer email"
          type="email"
          required
          value={form.customerEmail}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, customerEmail: event.target.value }))
          }
          placeholder="name@example.com"
          disabled={isSubmitting}
        />
        <TextField
          label="Customer phone"
          value={form.customerPhone}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, customerPhone: event.target.value }))
          }
          placeholder="Optional"
          disabled={isSubmitting}
        />
      </FormSection>

      <FormSection title="Routing" description="Optional assignment for this request.">
        <ComboboxField
          label="Assigned agent"
          className="sm:col-span-2"
          options={agentOptions}
          value={form.assignedAgentId || undefined}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, assignedAgentId: value }))
          }
          placeholder="Select an agent"
          searchPlaceholder="Search agents..."
          emptyLabel={
            agentsError ? 'Couldn’t load agents.' : 'No agents available.'
          }
          loading={agentsLoading}
          disabled={isSubmitting}
          allowClear
        />
      </FormSection>
    </FormDialog>
  );
}
