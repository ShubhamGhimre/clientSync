"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Download,
  HelpCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Tag,
  X,
} from "lucide-react";
import { TicketsTable } from "@/components/tables/tickets-table";
import {
  useSupportTickets,
  useCreateSupportTicket,
  useUpdateSupportTicket,
  useDeleteSupportTicket,
  useTicketCategories,
  useCreateTicketCategory,
  useTicketStats,
  TicketPriority,
} from "@/hooks/api/useSupportTickets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function TicketsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any | null>(null);
  const [deletingTicket, setDeletingTicket] = useState<any | null>(null);
  const [categoryComboOpen, setCategoryComboOpen] = useState(false);

  // Fetch data from APIs
  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    refetch,
  } = useSupportTickets();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useTicketCategories();
  const { data: statsData } = useTicketStats();

  // Defensive: ensure array - fix data access based on API response structure
  const tickets = ticketsData?.data
    ? Array.isArray(ticketsData.data)
      ? ticketsData.data
      : []
    : [];
  const categories = categoriesData?.data
    ? Array.isArray(categoriesData.data)
      ? categoriesData.data
      : []
    : [];

  // API hooks
  const createTicketMutation = useCreateSupportTicket();
  const updateTicketMutation = useUpdateSupportTicket();
  const deleteTicketMutation = useDeleteSupportTicket();
  const createCategoryMutation = useCreateTicketCategory();

  // Handlers
  const handleCreate = () => {
    setEditingTicket(null);
    setModalOpen(true);
  };
  const handleEdit = (ticket: any) => {
    setEditingTicket(ticket);
    setModalOpen(true);
  };
  const handleDelete = (ticket: any) => {
    setDeletingTicket(ticket);
    setDeleteModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingTicket(null);
  };
  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setDeletingTicket(null);
  };

  // Ticket form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    priority: "MEDIUM",
    categoryId: "",
    assignedAgentId: "",
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  });

  // Populate form when editing
  React.useEffect(() => {
    if (editingTicket) {
      setForm({
        title: editingTicket.title || "",
        description: editingTicket.description || "",
        customerName: editingTicket.customerName || "",
        customerEmail: editingTicket.customerEmail || "",
        customerPhone: editingTicket.customerPhone || "",
        priority: editingTicket.priority || "MEDIUM",
        categoryId: editingTicket.categoryId || "",
        assignedAgentId: editingTicket.assignedAgentId || "",
      });
    } else {
      setForm({
        title: "",
        description: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        priority: "MEDIUM",
        categoryId: "",
        assignedAgentId: "",
      });
    }
  }, [editingTicket, modalOpen]);

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCategoryForm({ ...categoryForm, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async () => {
    if (editingTicket) {
      await updateTicketMutation.mutateAsync({
        id: editingTicket.id,
        ...form,
        priority: form.priority as TicketPriority,
      });
    } else {
      await createTicketMutation.mutateAsync({
        ...form,
        priority: form.priority as TicketPriority,
      });
    }
    setModalOpen(false);
    setEditingTicket(null);
    refetch();
  };

  const handleCategorySubmit = async () => {
    await createCategoryMutation.mutateAsync(categoryForm);
    setCategoryForm({ name: "", description: "", color: "#3B82F6" });
    setCategoryModalOpen(false);
    // The query will auto-invalidate and refetch categories due to onSuccess in the hook
  };

  const handleDeleteConfirm = async () => {
    if (deletingTicket) {
      await deleteTicketMutation.mutateAsync(deletingTicket.id);
      setDeleteModalOpen(false);
      setDeletingTicket(null);
      refetch();
    }
  };

  const selectedCategory = categories.find(
    (cat: any) => cat.id === form.categoryId
  );

  // Get stats with fallback values
  const stats = {
    total: statsData?.data.total,
    byPriority: statsData?.data.byPriority,
    byStatus: statsData?.data.byStatus,
    recent: statsData?.data.recent || 0,
  };

  return (
    <div className="space-y-6 px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage and track customer support requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCategoryModalOpen(true)}>
            <Tag className="mr-2 h-4 w-4" />
            Manage Categories
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Total Tickets</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{stats.total}</div>
              {/* <p className="text-xs text-muted-foreground">+12% from last month</p> */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">By Priority</span>
            </div>
            <div className="mt-2">
              <div className="">
                {stats.byPriority
                  ? Object.entries(stats.byPriority).map(
                      ([priority, count], idx, arr) => (
                        <Badge
                          variant="secondary"
                          key={priority}
                          className="mr-1"
                        >
                          <span className="text-sm">
                            {priority.toLowerCase()}:
                          </span>{" "}
                          <span className="font-bold">{count}</span>
                        </Badge>
                      )
                    )
                  : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">By Status</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                {stats.byStatus
                  ? Object.entries(stats.byStatus)
                      .map(([status, count]) => `${status}: ${count}`)
                      .join(", ")
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">Being resolved</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Recent</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                {Array.isArray(stats.recent)
                  ? stats.recent.length
                  : stats.recent}
              </div>
              <p className="text-xs text-muted-foreground">
                80.3% resolution rate
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select defaultValue="all">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <TicketsTable
                data={tickets.map((ticket: any) => ({
                  ...ticket,
                  status:
                    ticket.status === "PENDING_CUSTOMER"
                      ? "OPEN"
                      : ticket.status, // fallback to original if already valid
                }))}
                loading={ticketsLoading}
                onTicketEdit={handleEdit}
                onTicketDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Update Ticket Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTicket ? "Update Ticket" : "Create Ticket"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <Input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  className="w-full border rounded p-2 h-24 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer Name *
                </label>
                <Input
                  name="customerName"
                  value={form.customerName}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer Email *
                </label>
                <Input
                  name="customerEmail"
                  type="email"
                  value={form.customerEmail}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer Phone
                </label>
                <Input
                  name="customerPhone"
                  value={form.customerPhone}
                  onChange={handleFormChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleFormChange}
                  className="w-full border rounded p-2"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <Popover
                  open={categoryComboOpen}
                  onOpenChange={setCategoryComboOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryComboOpen}
                      className="w-full justify-between"
                    >
                      {selectedCategory ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: selectedCategory.color }}
                          />
                          {selectedCategory.name}
                        </div>
                      ) : (
                        "Select category..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandEmpty>
                        <div className="p-2">
                          <p className="text-sm text-muted-foreground mb-2">
                            No categories found.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCategoryComboOpen(false);
                              setCategoryModalOpen(true);
                            }}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add Category
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {categories.map((category: any) => (
                          <CommandItem
                            key={category.id}
                            value={category.name}
                            onSelect={() => {
                              setForm({ ...form, categoryId: category.id });
                              setCategoryComboOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                form.categoryId === category.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <div>
                                <p className="font-medium">{category.name}</p>
                                {category.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {category.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                        <CommandItem
                          onSelect={() => {
                            setCategoryComboOpen(false);
                            setCategoryModalOpen(true);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add new category
                        </CommandItem>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Assigned Agent ID
                </label>
                <Input
                  name="assignedAgentId"
                  value={form.assignedAgentId}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button
                onClick={handleFormSubmit}
                disabled={
                  createTicketMutation.isPending ||
                  updateTicketMutation.isPending
                }
              >
                {createTicketMutation.isPending ||
                updateTicketMutation.isPending
                  ? editingTicket
                    ? "Updating..."
                    : "Creating..."
                  : editingTicket
                  ? "Update"
                  : "Create"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Ticket Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this ticket? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleDeleteModalClose}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteTicketMutation.isPending}
            >
              {deleteTicketMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Management Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                name="name"
                value={categoryForm.name}
                onChange={handleCategoryFormChange}
                required
                placeholder="e.g. Technical Support"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={categoryForm.description}
                onChange={handleCategoryFormChange}
                className="w-full border rounded p-2 h-20 resize-none"
                placeholder="Brief description of this category"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  name="color"
                  value={categoryForm.color}
                  onChange={handleCategoryFormChange}
                  className="w-12 h-10 rounded border"
                />
                <Input
                  name="color"
                  value={categoryForm.color}
                  onChange={handleCategoryFormChange}
                  placeholder="#3B82F6"
                  className="font-mono"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCategorySubmit}
                disabled={createCategoryMutation.isPending}
              >
                {createCategoryMutation.isPending
                  ? "Creating..."
                  : "Create Category"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
