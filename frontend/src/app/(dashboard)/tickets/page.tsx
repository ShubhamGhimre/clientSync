'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Download, HelpCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { TicketsTable } from '@/components/tables/tickets-table';
import { useSupportTickets, useCreateSupportTicket, useUpdateSupportTicket, useDeleteSupportTicket } from '@/hooks/api/useSupportTickets';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function TicketsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any | null>(null);
  const [deletingTicket, setDeletingTicket] = useState<any | null>(null);

  // Fetch tickets from API
  const { data: ticketsData, isLoading: ticketsLoading, refetch } = useSupportTickets();
  // Defensive: ensure array
  const tickets = ticketsData && Array.isArray((ticketsData as any).tickets) ? (ticketsData as any).tickets : [];

  // API hooks
  const createTicketMutation = useCreateSupportTicket();
  const updateTicketMutation = useUpdateSupportTicket();
  const deleteTicketMutation = useDeleteSupportTicket();

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
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'OPEN',
  });

  // Populate form when editing
  React.useEffect(() => {
    if (editingTicket) {
      setForm({
        title: editingTicket.title || '',
        description: editingTicket.description || '',
        priority: editingTicket.priority || 'MEDIUM',
        status: editingTicket.status || 'OPEN',
      });
    } else {
      setForm({ title: '', description: '', priority: 'MEDIUM', status: 'OPEN' });
    }
  }, [editingTicket, modalOpen]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTicket) {
      await updateTicketMutation.mutateAsync({ id: editingTicket.id, ...form });
    } else {
      await createTicketMutation.mutateAsync(form);
    }
    setModalOpen(false);
    setEditingTicket(null);
    refetch();
  };

  const handleDeleteConfirm = async () => {
    if (deletingTicket) {
      await deleteTicketMutation.mutateAsync(deletingTicket.id);
      setDeleteModalOpen(false);
      setDeletingTicket(null);
      refetch();
    }
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
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
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
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Open</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">Being resolved</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Resolved</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">1,002</div>
              <p className="text-xs text-muted-foreground">80.3% resolution rate</p>
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
          {/* <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger> */}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <TicketsTable 
                data={tickets} 
                loading={ticketsLoading}
                onTicketEdit={handleEdit}
                onTicketDelete={handleDelete}
              />
      {/* Create/Update Ticket Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTicket ? 'Update Ticket' : 'Create Ticket'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input name="title" value={form.title} onChange={handleFormChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleFormChange} className="w-full border rounded p-2" required />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select name="priority" value={form.priority} onChange={handleFormChange} className="w-full border rounded p-2">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleFormChange} className="w-full border rounded p-2">
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={createTicketMutation.isPending || updateTicketMutation.isPending}
              >
                {(createTicketMutation.isPending || updateTicketMutation.isPending)
                  ? (editingTicket ? 'Updating...' : 'Creating...')
                  : (editingTicket ? 'Update' : 'Create')}
              </Button>
              <Button type="button" variant="outline" onClick={handleModalClose}>Cancel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Ticket Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this ticket?</p>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteTicketMutation.isPending}
            >
              {deleteTicketMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
            <Button type="button" variant="outline" onClick={handleDeleteModalClose}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="assigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tickets Assigned to You</CardTitle>
              <CardDescription>Support tickets that require your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 'TICK-001',
                    title: 'Chatbot not responding to queries',
                    priority: 'high',
                    status: 'in-progress',
                    customer: 'John Doe',
                    updated: '2 hours ago'
                  },
                  {
                    id: 'TICK-002',
                    title: 'Unable to upload training files',
                    priority: 'medium',
                    status: 'open',
                    customer: 'Jane Smith',
                    updated: '4 hours ago'
                  }
                ].map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{ticket.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">{ticket.id}</span>
                          <Badge variant={ticket.priority === 'high' ? 'destructive' : 'secondary'}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline">{ticket.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{ticket.customer}</p>
                      <p className="text-xs text-muted-foreground">{ticket.updated}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unassigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Tickets</CardTitle>
              <CardDescription>Support tickets waiting to be assigned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No unassigned tickets</h3>
                <p className="text-muted-foreground">All tickets have been assigned to team members.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urgent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Urgent Tickets</CardTitle>
              <CardDescription>High priority tickets requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border-l-4 border-red-500 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">System outage affecting all chatbots</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">TICK-003</span>
                        <Badge variant="destructive">urgent</Badge>
                        <Badge variant="outline">open</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Enterprise Customer</p>
                    <p className="text-xs text-muted-foreground">30 minutes ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}