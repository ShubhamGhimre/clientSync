'use client'
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Clock, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  X
} from 'lucide-react';

// Types
interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'high' | 'medium' | 'low';
  customer: string;
  customerEmail?: string;
  created: string;
  updated: string;
  assignedTo?: string;
  category?: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'view' | 'edit';
  ticket?: Ticket;
  onSave: (ticket: Partial<Ticket>) => void;
}

const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  mode,
  ticket,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Ticket>>({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    customer: '',
    customerEmail: '',
    category: '',
    assignedTo: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debug: Log when modal state changes
  console.log('TicketModal props:', { isOpen, mode, ticket });

  // Initialize form data when ticket changes
  useEffect(() => {
    if (ticket && (mode === 'view' || mode === 'edit')) {
      setFormData({
        ...ticket,
        description: ticket.description || '',
        customerEmail: ticket.customerEmail || '',
        category: ticket.category || '',
        assignedTo: ticket.assignedTo || ''
      });
    } else if (mode === 'create') {
      setFormData({
        title: '',
        description: '',
        status: 'open',
        priority: 'medium',
        customer: '',
        customerEmail: '',
        category: '',
        assignedTo: ''
      });
    }
  }, [ticket, mode, isOpen]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'in-progress': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'closed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <XCircle className="h-4 w-4" />;
      case 'in-progress': return <AlertCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle2 className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.customer?.trim()) {
      newErrors.customer = 'Customer name is required';
    }
    if (formData.customerEmail && !formData.customerEmail.includes('@')) {
      newErrors.customerEmail = 'Valid email is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof Ticket, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Dialog titles
  const getDialogTitle = () => {
    switch (mode) {
      case 'create': return 'Create New Ticket';
      case 'edit': return `Edit Ticket ${ticket?.id}`;
      case 'view': return `Ticket Details - ${ticket?.id}`;
      default: return 'Ticket';
    }
  };

  const getDialogDescription = () => {
    switch (mode) {
      case 'create': return 'Fill in the details below to create a new support ticket.';
      case 'edit': return 'Update the ticket information below.';
      case 'view': return 'View ticket details and current status.';
      default: return '';
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {mode === 'view' && ticket && getStatusIcon(ticket.status)}
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status and Priority Row - Only for view/edit */}
          {(mode === 'view' || mode === 'edit') && ticket && (
            <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Badge className={`${getStatusColor(ticket.status)} border`}>
                {ticket.status}
              </Badge>
              <Badge className={`${getPriorityColor(ticket.priority)} border`}>
                {ticket.priority} priority
              </Badge>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Created: {ticket.created}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Updated: {ticket.updated}</span>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter ticket title"
                disabled={isReadOnly}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the issue or request in detail"
                rows={4}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer" className="text-sm font-medium">
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customer"
                  value={formData.customer || ''}
                  onChange={(e) => handleInputChange('customer', e.target.value)}
                  placeholder="Customer full name"
                  disabled={isReadOnly}
                  className={errors.customer ? 'border-red-500' : ''}
                />
                {errors.customer && <p className="text-sm text-red-500">{errors.customer}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="text-sm font-medium">
                  Customer Email
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail || ''}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder="customer@example.com"
                  disabled={isReadOnly}
                  className={errors.customerEmail ? 'border-red-500' : ''}
                />
                {errors.customerEmail && <p className="text-sm text-red-500">{errors.customerEmail}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Ticket Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ticket Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo" className="text-sm font-medium">
                  Assigned To
                </Label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => handleInputChange('assignedTo', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john-doe">John Doe</SelectItem>
                    <SelectItem value="jane-smith">Jane Smith</SelectItem>
                    <SelectItem value="bob-wilson">Bob Wilson</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          
          {mode !== 'view' && (
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full sm:w-auto bg-blue-500 "

            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Saving...' : mode === 'create' ? 'Create Ticket' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TicketModal;