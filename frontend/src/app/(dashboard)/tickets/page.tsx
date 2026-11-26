"use client";

import { useMemo, useState } from "react";
import { Plus, Tag } from "lucide-react";
import { TicketsTable } from "@/components/tables/tickets-table";
import {
  PageContainer,
  PageHeader,
  PrimaryActionButton,
  RefreshButton,
  SecondaryActionButton,
} from "@/components/page-kits";
import {
  CategoryFormDialog,
} from "@/components/tickets/category-form-dialog";
import {
  DeleteTicketDialog,
} from "@/components/tickets/delete-ticket-dialog";
import {
  TicketFormDialog,
  type TicketFormValues,
} from "@/components/tickets/ticket-form-dialog";
import { TicketStatsStrip } from "@/components/tickets/ticket-stats-strip";
import { TicketToolbarFilters } from "@/components/tickets/ticket-toolbar-filters";
import {
  useSupportTickets,
  useCreateSupportTicket,
  useUpdateSupportTicket,
  useDeleteSupportTicket,
  useTicketCategories,
  useCreateTicketCategory,
  useTicketStats,
  type SupportTicket,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "@/hooks/api/useSupportTickets";

export default function TicketsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(
    null
  );
  const [deletingTicket, setDeletingTicket] = useState<SupportTicket | null>(
    null
  );

  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    refetch,
  } = useSupportTickets();
  const { data: categoriesData } = useTicketCategories();
  const { data: statsData, isLoading: statsLoading } = useTicketStats();

  const tickets: SupportTicket[] = useMemo(
    () => (Array.isArray(ticketsData?.data) ? ticketsData.data : []),
    [ticketsData]
  );
  const categories: TicketCategory[] = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : [];

  const createTicketMutation = useCreateSupportTicket();
  const updateTicketMutation = useUpdateSupportTicket();
  const deleteTicketMutation = useDeleteSupportTicket();
  const createCategoryMutation = useCreateTicketCategory();

  const filteredTickets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        ticket.title?.toLowerCase().includes(query) ||
        ticket.description?.toLowerCase().includes(query) ||
        ticket.customerName?.toLowerCase().includes(query) ||
        ticket.customerEmail?.toLowerCase().includes(query) ||
        ticket.ticketNumber?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        ticket.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesPriority =
        priorityFilter === "all" ||
        ticket.priority?.toLowerCase() === priorityFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const handleCreate = () => {
    setEditingTicket(null);
    setFormOpen(true);
  };

  const handleEdit = (ticket: SupportTicket) => {
    setEditingTicket(ticket);
    setFormOpen(true);
  };

  const handleDelete = (ticketId: string) => {
    const ticket = tickets.find((candidate) => candidate.id === ticketId);
    if (!ticket) return;
    setDeletingTicket(ticket);
    setDeleteOpen(true);
  };

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    await updateTicketMutation.mutateAsync({ id: ticketId, status });
    refetch();
  };

  const handlePriorityChange = async (
    ticketId: string,
    priority: TicketPriority
  ) => {
    await updateTicketMutation.mutateAsync({ id: ticketId, priority });
    refetch();
  };

  const handleTicketSubmit = async (values: TicketFormValues) => {
    try {
      if (editingTicket) {
        const payload = { id: editingTicket.id, ...values };
        await updateTicketMutation.mutateAsync(payload);
      } else {
        await createTicketMutation.mutateAsync(values);
      }
      setFormOpen(false);
      setEditingTicket(null);
      refetch();
    } catch (error) {
      console.error("Save ticket error:", error);
    }
  };

  const handleCategorySubmit = async (values: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    try {
      await createCategoryMutation.mutateAsync(values);
      setCategoryOpen(false);
    } catch (error) {
      console.error("Create category error:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTicket) return;
    try {
      await deleteTicketMutation.mutateAsync(deletingTicket.id);
      setDeleteOpen(false);
      setDeletingTicket(null);
      refetch();
    } catch (error) {
      console.error("Delete ticket error:", error);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Support Tickets"
        description="Manage and track customer support requests"
        actionsClassName="flex flex-wrap items-center gap-2"
        actions={
          <>
            <RefreshButton onClick={() => refetch()} />
            <SecondaryActionButton icon={Tag} onClick={() => setCategoryOpen(true)}>
              Manage Categories
            </SecondaryActionButton>
            <PrimaryActionButton icon={Plus} onClick={handleCreate}>
              Create Ticket
            </PrimaryActionButton>
          </>
        }
      />

      <TicketStatsStrip
        statsData={statsData}
        fallbackTotal={tickets.length}
        loading={statsLoading}
      />

      <TicketsTable
        data={filteredTickets.map((ticket) => ({
          ...ticket,
          status:
            ticket.status === "PENDING_CUSTOMER" ? "OPEN" : ticket.status,
        }))}
        loading={ticketsLoading}
        onTicketEdit={handleEdit}
        onTicketDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        toolbarLeading={
          <TicketToolbarFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
          />
        }
      />

      <TicketFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        ticket={editingTicket}
        categories={categories}
        isSubmitting={
          createTicketMutation.isPending || updateTicketMutation.isPending
        }
        onAddCategory={() => setCategoryOpen(true)}
        onSubmit={handleTicketSubmit}
      />

      <CategoryFormDialog
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        isSubmitting={createCategoryMutation.isPending}
        onSubmit={handleCategorySubmit}
      />

      <DeleteTicketDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        ticket={deletingTicket}
        isSubmitting={deleteTicketMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  );
}
