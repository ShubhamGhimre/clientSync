'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Shield,
  UserCheck,
  UserX,
  Key,
  Mail,
  Loader2,
  ChevronDown,
  ChevronUp,
  Users
} from 'lucide-react';
import { User } from '@/hooks/api/useUsers';
import { cn } from '@/lib/utils';

interface UsersTableProps {
  data: User[];
  loading: boolean;
  onUserSelect: (user: User) => void;
  onUserEdit: (user: User) => void;
  onUserDelete: (userId: string) => void;
  onUserInvite: () => void;
  onRoleChange: (userId: string, newRole: 'ADMIN' | 'AGENT' | 'VIEWER') => void;
  onStatusToggle: (userId: string, currentStatus: boolean) => void;
  onResetPassword: (userId: string) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange?: (page: number) => void;
  isAdmin: boolean;
  isMutating?: boolean;
}

export function UsersTable({ 
  data, 
  loading, 
  onUserSelect, 
  onUserEdit, 
  onUserDelete, 
  onUserInvite,
  onRoleChange,
  onStatusToggle,
  onResetPassword,
  pagination,
  onPageChange,
  isAdmin,
  isMutating = false
}: UsersTableProps) {
  const [sortField, setSortField] = useState<keyof User>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'AGENT':
        return 'default';
      case 'VIEWER':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-3 w-3 mr-1" />;
      case 'AGENT':
        return <UserCheck className="h-3 w-3 mr-1" />;
      case 'VIEWER':
        return <Eye className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const SortHeader = ({ field, children }: { field: keyof User; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="h-3 w-3" /> : 
            <ChevronDown className="h-3 w-3" />
        )}
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-5 bg-gray-200 rounded w-12 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-8 bg-gray-200 rounded w-8 animate-pulse ml-auto"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader field="firstName">Name</SortHeader>
              <SortHeader field="email">Email</SortHeader>
              <SortHeader field="role">Role</SortHeader>
              <TableHead>Status</TableHead>
              <SortHeader field="createdAt">Joined</SortHeader>
              <TableHead>Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((user) => {
              const joinedDate = formatDate(user.createdAt);
              
              return (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          ID: {user.id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={user.email}>
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                      {user.isActive ? (
                        <>
                          <UserCheck className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <UserX className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {joinedDate.date}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {joinedDate.time}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user._count && (
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Tickets:</span>
                          <span className="font-medium">{user._count.assignedTickets}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Comments:</span>
                          <span className="font-medium">{user._count.ticketComments}</span>
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={isMutating}>
                          {isMutating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onUserSelect(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => onUserEdit(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>

                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => onStatusToggle(user.id, user.isActive)}>
                              {user.isActive ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => onResetPassword(user.id)}>
                              <Key className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>

                            {user.role !== 'ADMIN' && (
                              <DropdownMenuItem 
                                onClick={() => onRoleChange(user.id, 'ADMIN')}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                            )}

                            {user.role !== 'AGENT' && (
                              <DropdownMenuItem 
                                onClick={() => onRoleChange(user.id, 'AGENT')}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Make Agent
                              </DropdownMenuItem>
                            )}

                            {user.role !== 'VIEWER' && (
                              <DropdownMenuItem 
                                onClick={() => onRoleChange(user.id, 'VIEWER')}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Make Viewer
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => onUserDelete(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {sortedData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={!pagination.hasPrev || loading}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === pagination.totalPages || 
                  Math.abs(page - pagination.page) <= 1
                )
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={page === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange?.(page)}
                      className="w-8 h-8 p-0"
                      disabled={loading}
                    >
                      {page}
                    </Button>
                  </div>
                ))
              }
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.hasNext || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}