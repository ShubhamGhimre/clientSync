"use client";
import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  User,
  Clock,
  Eye,
  Edit,
  MoreHorizontal,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Check,
} from "lucide-react";
import TicketModal from "@/components/tickets/TicketModal";

// Types
interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: "open" | "in-progress" | "closed";
  priority: "high" | "medium" | "low";
  customer: string;
  customerEmail?: string;
  created: string;
  updated: string;
  assignedTo?: string;
  category?: string;
}

const mockTickets: Ticket[] = [
  {
    id: "TK001",
    title: "Login Issue",
    description: "User cannot login to their account after password reset",
    status: "open",
    priority: "high",
    customer: "John Doe",
    customerEmail: "john.doe@example.com",
    created: "2024-08-14",
    updated: "2024-08-14",
    category: "technical",
    assignedTo: "john-doe",
  },
  {
    id: "TK002",
    title: "Payment Failed",
    description: "Customer payment was declined multiple times",
    status: "in-progress",
    priority: "medium",
    customer: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    created: "2024-08-13",
    updated: "2024-08-14",
    category: "billing",
    assignedTo: "jane-smith",
  },
  {
    id: "TK003",
    title: "Feature Request",
    description: "Request for dark mode theme option",
    status: "closed",
    priority: "low",
    customer: "Bob Johnson",
    customerEmail: "bob.johnson@example.com",
    created: "2024-08-12",
    updated: "2024-08-13",
    category: "feature",
    assignedTo: "bob-wilson",
  },
  {
    id: "TK004",
    title: "Account Recovery",
    description: "User lost access to email and needs account recovery",
    status: "open",
    priority: "high",
    customer: "Alice Brown",
    customerEmail: "alice.brown@example.com",
    created: "2024-08-13",
    updated: "2024-08-14",
    category: "account",
    assignedTo: "unassigned",
  },
  {
    id: "TK005",
    title: "Billing Question",
    description: "Question about upcoming billing cycle and charges",
    status: "in-progress",
    priority: "medium",
    customer: "Charlie Wilson",
    customerEmail: "charlie.wilson@example.com",
    created: "2024-08-12",
    updated: "2024-08-13",
    category: "billing",
    assignedTo: "jane-smith",
  },
];

const Tickets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Applied filters (what's actually being used to filter)
  const [appliedStatus, setAppliedStatus] = useState("all");
  const [appliedPriority, setAppliedPriority] = useState("all");
  const [appliedCategory, setAppliedCategory] = useState("all");
  
  // Temporary filter states (what user is selecting)
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // You can adjust this

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "view" | "edit";
    ticket?: Ticket;
  }>({
    isOpen: false,
    mode: "create",
    ticket: undefined,
  });

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    ticketId: string;
    ticketTitle: string;
  }>({
    isOpen: false,
    ticketId: "",
    ticketTitle: "",
  });

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 border border-red-200";
      case "in-progress":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "closed":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "low":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Modal handlers
  const handleOpenModal = (
    mode: "create" | "view" | "edit",
    ticket?: Ticket
  ) => {
    console.log("Opening modal with:", { mode, ticket });
    setModalState({ isOpen: true, mode, ticket });
  };

  const handleCloseModal = () => {
    console.log("Closing modal");
    setModalState({ isOpen: false, mode: "create", ticket: undefined });
  };

  const handleSaveTicket = (ticketData: Partial<Ticket>) => {
    console.log("Saving ticket:", ticketData);
    if (modalState.mode === "create") {
      // Create new ticket
      const newTicket: Ticket = {
        id: `TK${String(tickets.length + 1).padStart(3, "0")}`,
        created: new Date().toISOString().split("T")[0],
        updated: new Date().toISOString().split("T")[0],
        title: ticketData.title || "",
        description: ticketData.description || "",
        status: ticketData.status || "open",
        priority: ticketData.priority || "medium",
        customer: ticketData.customer || "",
        customerEmail: ticketData.customerEmail || "",
        category: ticketData.category || "",
        assignedTo: ticketData.assignedTo || "",
      };
      setTickets([newTicket, ...tickets]);
    } else if (modalState.mode === "edit" && modalState.ticket) {
      // Update existing ticket
      setTickets(
        tickets.map((ticket) =>
          ticket.id === modalState.ticket!.id
            ? {
                ...ticket,
                ...ticketData,
                updated: new Date().toISOString().split("T")[0],
              }
            : ticket
        )
      );
    }
  };

  // Delete ticket handler
  const handleDeleteClick = (ticket: Ticket) => {
    setDeleteConfirm({
      isOpen: true,
      ticketId: ticket.id,
      ticketTitle: ticket.title,
    });
  };

  const handleDeleteConfirm = () => {
    setTickets(tickets.filter(ticket => ticket.id !== deleteConfirm.ticketId));
    setDeleteConfirm({ isOpen: false, ticketId: "", ticketTitle: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, ticketId: "", ticketTitle: "" });
  };

  // Filter handlers
  const applyFilters = () => {
    setAppliedStatus(selectedStatus);
    setAppliedPriority(selectedPriority);
    setAppliedCategory(selectedCategory);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedStatus("all");
    setSelectedPriority("all");
    setSelectedCategory("all");
    setAppliedStatus("all");
    setAppliedPriority("all");
    setAppliedCategory("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Reset temporary filters to applied filters when closing without applying
  const resetTempFilters = () => {
    setSelectedStatus(appliedStatus);
    setSelectedPriority(appliedPriority);
    setSelectedCategory(appliedCategory);
    setShowFilters(false);
  };

  // Filter tickets with applied filter criteria
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      appliedStatus === "all" || ticket.status === appliedStatus;
    
    const matchesPriority =
      appliedPriority === "all" || ticket.priority === appliedPriority;
    
    const matchesCategory =
      appliedCategory === "all" || ticket.category === appliedCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== "" || appliedStatus !== "all" || appliedPriority !== "all" || appliedCategory !== "all";
  
  // Check if temp filters are different from applied filters
  const hasUnappliedChanges = selectedStatus !== appliedStatus || selectedPriority !== appliedPriority || selectedCategory !== appliedCategory;

  return (
    <div className="p-3 xs:p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/10 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex flex-col space-y-6 sm:flex-row sm:items-end sm:justify-between sm:space-y-0 mb-6 xs:mb-8 lg:mb-10">
        <div className="min-w-0 flex-1">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span>Dashboard</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Support Tickets</span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-blue-900 bg-clip-text text-transparent leading-tight">
            Support Tickets
          </h1>
          <p className="text-base xs:text-lg text-gray-600 mt-2 xs:mt-3 font-medium">
            Manage and track customer support requests
          </p>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-gray-600">
                <span className="font-semibold text-red-600">{tickets.filter((t) => t.status === "open").length}</span> open
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <span className="text-gray-600">
                <span className="font-semibold text-amber-600">{tickets.filter((t) => t.status === "in-progress").length}</span> in progress
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">
                <span className="font-semibold text-green-600">{tickets.filter((t) => t.status === "closed").length}</span> closed
              </span>
            </div>
          </div>
        </div>
        
        {/* Create Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleOpenModal("create")}
            className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 xs:px-8 py-3 xs:py-4 rounded-xl xs:rounded-2xl flex items-center justify-center gap-3 xs:gap-4 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 text-sm xs:text-base font-semibold w-full sm:w-auto transform hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl xs:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Plus size={20} className="xs:w-6 xs:h-6 relative z-10" />
            <span className="truncate relative z-10">Create New Ticket</span>
          </button>
        </div>
      </div>

      {/* Enhanced Main Content Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl xs:rounded-3xl shadow-xl border border-white/50 overflow-hidden">
        {/* Enhanced Search and Filter Header */}
        <div className="bg-gradient-to-r from-gray-50 via-blue-50/50 to-purple-50/30 border-b border-gray-100/50 backdrop-blur-sm">
          <div className="p-6 xs:p-8 space-y-6">
            {/* Search and Filter Row */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
              {/* Enhanced Search Bar */}
              <div className="relative flex-1 max-w-md lg:max-w-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl "></div>
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search tickets, customers, or ticket IDs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/90  border-2 border-gray-200/60 rounded-xl focus:outline-none  transition-all duration-300 text-sm xs:text-base font-medium placeholder-gray-500 "
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter and Actions */}
              <div className="flex items-center gap-3">
                {/* Enhanced Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`group relative flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 text-sm font-semibold min-w-0 ${
                    hasActiveFilters
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white '
                      : 'bg-white/90  border-2 border-gray-200/60'
                  }`}
                >
                  <Filter size={16} className="transition-transform duration-300 group-hover:scale-110" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {[appliedStatus !== "all", appliedPriority !== "all", appliedCategory !== "all"].filter(Boolean).length}
                      </span>
                    </div>
                  )}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Quick Clear Button */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="group flex items-center gap-2 px-4 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl transition-all duration-200 text-sm font-medium border border-red-200/60 hover:border-red-300/60"
                  >
                    <X size={14} className="transition-transform duration-200 group-hover:scale-110" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Enhanced Filters Panel */}
            {showFilters && (
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-xl"></div>
                <div className="relative bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 p-6 space-y-5">
                  {/* Filter Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Filter size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Filter Options</h3>
                        <p className="text-sm text-gray-500">Refine your ticket search</p>
                      </div>
                    </div>
                    <button
                      onClick={resetTempFilters}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      title="Close filters"
                    >
                      <X size={18} className="text-gray-400" />
                    </button>
                  </div>

                  {/* Filter Selects */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/60 transition-all duration-300 text-sm font-medium"
                      >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Priority</label>
                      <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/60 transition-all duration-300 text-sm font-medium"
                      >
                        <option value="all">All Priority</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/60 transition-all duration-300 text-sm font-medium"
                      >
                        <option value="all">All Categories</option>
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="feature">Feature</option>
                        <option value="account">Account</option>
                      </select>
                    </div>
                  </div>

                  {/* Apply/Clear Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200/60">
                    <div className="flex items-center gap-2 text-sm">
                      {hasUnappliedChanges && (
                        <div className="flex items-center gap-2 text-amber-600">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          <span className="font-medium">Unsaved changes</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={clearFilters}
                        className="group flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 rounded-xl transition-all duration-200 text-sm font-medium"
                      >
                        <X size={14} className="transition-transform duration-200 group-hover:scale-110" />
                        Clear All
                      </button>
                      <button
                        onClick={applyFilters}
                        className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        <Check size={14} className="transition-transform duration-200 group-hover:scale-110" />
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-gray-600">
                    <span className="font-semibold text-red-600">{tickets.filter((t) => t.status === "open").length}</span> open
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                  <span className="text-gray-600">
                    <span className="font-semibold text-amber-600">{tickets.filter((t) => t.status === "in-progress").length}</span> in progress
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-600">
                    <span className="font-semibold text-green-600">{tickets.filter((t) => t.status === "closed").length}</span> closed
                  </span>
                </div>
              </div>
              
              {hasActiveFilters && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/60">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">{filteredTickets.length} filtered results</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 xl:p-6 font-semibold text-gray-700 text-sm">
                  Ticket ID
                </th>
                <th className="text-left p-4 xl:p-6 font-semibold text-gray-700 text-sm">
                  Title
                </th>
                <th className="text-left p-4 xl:p-6 font-semibold text-gray-700 text-sm">
                  Customer
                </th>
                <th className="text-left p-4 xl:p-6 font-semibold text-gray-700 text-sm">
                  Status
                </th>
                <th className="text-left p-4 xl:p-6 font-semibold text-gray-700 text-sm">
                  Priority
                </th>
                <th className="text-left p-4 xl:p-6 font-semibold text-gray-700 text-sm">
                  Created
                </th>
                <th className="text-left p-4 xl:p-6 font-semibold text-gray-700 text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="p-4 xl:p-6 font-semibold text-blue-600 text-sm">
                    {ticket.id}
                  </td>
                  <td className="p-4 xl:p-6">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {ticket.updated}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 xl:p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                        <User size={14} className="text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm truncate">
                        {ticket.customer}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 xl:p-6">
                    <div
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </div>
                  </td>
                  <td className="p-4 xl:p-6">
                    <div
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority}
                    </div>
                  </td>
                  <td className="p-4 xl:p-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={12} />
                      <span className="text-xs">{ticket.created}</span>
                    </div>
                  </td>
                  <td className="p-4 xl:p-6">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenModal("view", ticket)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="View Ticket"
                      >
                        <Eye size={16} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleOpenModal("edit", ticket)}
                        className="p-2 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Edit Ticket"
                      >
                        <Edit size={16} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(ticket)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete Ticket"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                     
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View - Hidden on desktop */}
        <div className="lg:hidden divide-y divide-gray-100">
          {paginatedTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 xs:p-6 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="space-y-3 xs:space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-blue-600 text-sm xs:text-base">
                      {ticket.id}
                    </p>
                    <h3 className="font-semibold text-gray-900 text-base xs:text-lg mt-1 leading-tight">
                      {ticket.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleOpenModal("view", ticket)}
                      className="p-1.5 xs:p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      <Eye size={16} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleOpenModal("edit", ticket)}
                      className="p-1.5 xs:p-2 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    >
                      <Edit size={16} className="text-green-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(ticket)}
                      className="p-1.5 xs:p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  
                  </div>
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                    <User size={16} className="xs:w-5 xs:h-5 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm xs:text-base truncate">
                      {ticket.customer}
                    </p>
                    <p className="text-xs xs:text-sm text-gray-500">Customer</p>
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="flex flex-wrap items-center gap-2 xs:gap-3">
                  <div
                    className={`inline-flex px-2 xs:px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {ticket.status}
                  </div>
                  <div
                    className={`inline-flex px-2 xs:px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {ticket.priority} priority
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 text-xs xs:text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="xs:w-4 xs:h-4" />
                    <span>Created: {ticket.created}</span>
                  </div>
                  <span>Updated: {ticket.updated}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No results message */}
        {filteredTickets.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-500 text-lg mb-6">We couldn't find any tickets matching your criteria.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 font-medium"
              >
                <X size={16} />
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Enhanced Pagination */}
        {filteredTickets.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 via-blue-50/30 to-purple-50/20 border-t border-gray-100/50 p-6 xs:p-8 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4 xs:gap-0">
            <p className="text-sm xs:text-base text-gray-600 text-center xs:text-left font-medium">
              Showing <span className="font-semibold text-gray-900">{startIndex + 1}-{Math.min(endIndex, filteredTickets.length)}</span> of <span className="font-semibold text-gray-900">{filteredTickets.length}</span> tickets
            </p>
            <div className="flex items-center justify-center xs:justify-end space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-white/80 hover:bg-white rounded-xl border border-gray-200/60 hover:border-gray-300/60 hover:shadow-sm"
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentPage === page
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-700 hover:bg-white/80 bg-white/60 border border-gray-200/60 hover:border-gray-300/60"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-white/80 hover:bg-white rounded-xl border border-gray-200/60 hover:border-gray-300/60 hover:shadow-sm"
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Ticket</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700">
              Are you sure you want to delete ticket <strong>{deleteConfirm.ticketId}</strong>: "{deleteConfirm.ticketTitle}"?
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors duration-200"
              >
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      <TicketModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        mode={modalState.mode}
        ticket={modalState.ticket}
        onSave={handleSaveTicket}
      />
    </div>
  );
};

export default Tickets;
