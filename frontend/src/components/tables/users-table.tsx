'use client';

import { useState } from 'react';
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

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'badge badge-danger';
      case 'AGENT':
        return 'badge badge-brand';
      case 'VIEWER':
        return 'badge badge-neutral';
      default:
        return 'badge badge-outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="size-3 shrink-0 mr-1" />;
      case 'AGENT':
        return <UserCheck className="size-3 shrink-0 mr-1" />;
      case 'VIEWER':
        return <Eye className="size-3 shrink-0 mr-1" />;
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
    <th 
      className="cursor-pointer"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="size-3 shrink-0" /> : 
            <ChevronDown className="size-3 shrink-0" />
        )}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col">Joined</th>
              <th scope="col">Activity</th>
              <th scope="col" className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="skeleton avatar" />
                    <div className="flex flex-col gap-1">
                      <div className="skeleton w-full p-1" />
                      <div className="skeleton w-full p-1" />
                    </div>
                  </div>
                </td>
                <td>
                  <div className="skeleton w-full p-1" />
                </td>
                <td>
                  <div className="skeleton badge" />
                </td>
                <td>
                  <div className="skeleton badge" />
                </td>
                <td>
                  <div className="skeleton w-full p-1" />
                </td>
                <td>
                  <div className="skeleton w-full p-1" />
                </td>
                <td>
                  <div className="skeleton btn btn-icon btn-sm ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <SortHeader field="firstName">Name</SortHeader>
              <SortHeader field="email">Email</SortHeader>
              <SortHeader field="role">Role</SortHeader>
              <th scope="col">Status</th>
              <SortHeader field="createdAt">Joined</SortHeader>
              <th scope="col">Activity</th>
              <th scope="col" className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((user) => {
              const joinedDate = formatDate(user.createdAt);
              
              return (
                <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="avatar-sm avatar-ai shrink-0 text-sm font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                          ID: {user.id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={user.email}>
                      {user.email}
                    </div>
                  </td>
                  <td>
                    <span className={getRoleBadgeClass(user.role)}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={user.isActive ? 'badge badge-success' : 'badge badge-neutral'}>
                      {user.isActive ? (
                        <>
                          <UserCheck className="size-3 shrink-0 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <UserX className="size-3 shrink-0 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm">
                      {joinedDate.date}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {joinedDate.time}
                    </div>
                  </td>
                  <td>
                    {user._count && (
                      <div className="text-sm flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Tickets:</span>
                          <span className="font-medium tabular">{user._count.assignedTickets}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Comments:</span>
                          <span className="font-medium tabular">{user._count.ticketComments}</span>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button type="button" className="btn btn-ghost btn-sm" disabled={isMutating}>
                          {isMutating ? (
                            <Loader2 className="size-4 shrink-0 animate-spin" />
                          ) : (
                            <MoreHorizontal className="size-4 shrink-0" />
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onUserSelect(user)}>
                          <Eye className="size-4 shrink-0 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => onUserEdit(user)}>
                          <Edit className="size-4 shrink-0 mr-2" />
                          Edit User
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <Mail className="size-4 shrink-0 mr-2" />
                          Send Email
                        </DropdownMenuItem>

                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => onStatusToggle(user.id, user.isActive)}>
                              {user.isActive ? (
                                <>
                                  <UserX className="size-4 shrink-0 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="size-4 shrink-0 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => onResetPassword(user.id)}>
                              <Key className="size-4 shrink-0 mr-2" />
                              Reset Password
                            </DropdownMenuItem>

                            {user.role !== 'ADMIN' && (
                              <DropdownMenuItem 
                                onClick={() => onRoleChange(user.id, 'ADMIN')}
                              >
                                <Shield className="size-4 shrink-0 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                            )}

                            {user.role !== 'AGENT' && (
                              <DropdownMenuItem 
                                onClick={() => onRoleChange(user.id, 'AGENT')}
                              >
                                <UserCheck className="size-4 shrink-0 mr-2" />
                                Make Agent
                              </DropdownMenuItem>
                            )}

                            {user.role !== 'VIEWER' && (
                              <DropdownMenuItem 
                                onClick={() => onRoleChange(user.id, 'VIEWER')}
                              >
                                <Eye className="size-4 shrink-0 mr-2" />
                                Make Viewer
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => onUserDelete(user.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="size-4 shrink-0 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {sortedData.length === 0 && (
          <div className="empty-state">
            <div className="flex items-center justify-center">
              <Users className="size-8 shrink-0" />
            </div>
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={!pagination.hasPrev || loading}
            >
              Previous
            </button>
            
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
                    <button
                      type="button"
                      className={`${page === pagination.page ? 'btn btn-primary' : 'btn btn-secondary'} btn-icon btn-sm`}
                      onClick={() => onPageChange?.(page)}
                      disabled={loading}
                    >
                      {page}
                    </button>
                  </div>
                ))
              }
            </div>
            
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.hasNext || loading}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
