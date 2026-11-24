'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Plus, 
  Search, 
  UserPlus,
  Shield,
  Crown,
  Eye,
  UserCheck,
  UserX,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { UsersTable } from '@/components/tables/users-table';
import { CreateUserModal } from '@/components/modals/create-user-modal';
import { EditUserModal } from '@/components/modals/edit-user-modal';
import { ResetPasswordModal } from '@/components/modals/reset-password-modal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { 
  useUsers, 
  useUserStats, 
  useDeleteUser, 
  useUpdateUser,
  useCreateUser,
  useResetPassword,
  User,
  UpdateUserData 
} from '@/hooks/api/useUsers';
import { useDisplayUser } from '@/hooks/useDisplayUser';
import { toast } from 'sonner';
import { cn } from '@/lib/utils'; // If you have a classnames util

export default function UsersPage() {
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<'ADMIN' | 'AGENT' | 'VIEWER' | undefined>();
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();
  const [pageSize] = useState(10);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
    variant?: 'default' | 'destructive';
    icon?: 'delete' | 'deactivate' | 'activate' | 'warning';
  }>({
    open: false,
    title: '',
    description: '',
    action: () => {},
  });

  const { displayUser } = useDisplayUser();
  const isAdmin = displayUser?.role === 'ADMIN';

  // Memoize query parameters to prevent unnecessary re-renders
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    search: searchTerm.trim() || undefined,
    role: roleFilter,
    isActive: statusFilter
  }), [currentPage, pageSize, searchTerm, roleFilter, statusFilter]);

  // Fetch data using hooks
  const { 
    data: usersResponse, 
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useUsers(queryParams);

  const { 
    data: statsResponse, 
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useUserStats();

  // Mutations
  const deleteUserMutation = useDeleteUser();
  const updateUserMutation = useUpdateUser();
  const createUserMutation = useCreateUser();
  const resetPasswordMutation = useResetPassword();

  // Extract data from responses
  const users = usersResponse?.data || [];
  const pagination = usersResponse?.pagination;
  const stats = statsResponse?.data;

  // Loading states
  const isLoadingAny = usersLoading || statsLoading;
  const isMutating = deleteUserMutation.isPending || updateUserMutation.isPending;

  // Event handlers
  const handleUserSelect = (user: User) => {
    console.log('Selected user:', user);
    // Navigate to user details or open modal
    // router.push(`/users/${user.id}`);
  };

  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUserDelete = async (userId: string) => {
    if (!isAdmin) {
      toast.error('Only administrators can delete users');
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) return;

    setConfirmDialog({
      open: true,
      title: 'Delete User',
      description: `Are you sure you want to delete ${user.firstName} ${user.lastName}?\n\nThis action cannot be undone and will:\n• Remove the user's access to the system\n• Delete their account permanently\n• Reassign their tickets to other agents`,
      variant: 'destructive',
      icon: 'delete',
      action: async () => {
        try {
          await deleteUserMutation.mutateAsync(userId);
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch (error) {
          console.error('Delete user error:', error);
        }
      },
    });
  };

  const handleUserInvite = () => {
    if (!isAdmin) {
      toast.error('Only administrators can invite users');
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'AGENT' | 'VIEWER') => {
    if (!isAdmin) {
      toast.error('Only administrators can change user roles');
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Prevent changing own role
    if (userId === displayUser?.id && newRole !== displayUser?.role) {
      toast.error('You cannot change your own role');
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Change User Role',
      description: `Change ${user.firstName} ${user.lastName}'s role from ${user.role} to ${newRole}?`,
      action: async () => {
        try {
          await updateUserMutation.mutateAsync({
            id: userId,
            data: { role: newRole }
          });
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch (error) {
          console.error('Role change error:', error);
        }
      },
    });
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    if (!isAdmin) {
      toast.error('Only administrators can change user status');
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Prevent deactivating own account
    if (userId === displayUser?.id && currentStatus) {
      toast.error('You cannot deactivate your own account');
      return;
    }

    const action = currentStatus ? 'deactivate' : 'activate';
    const actionCapitalized = action.charAt(0).toUpperCase() + action.slice(1);

    setConfirmDialog({
      open: true,
      title: `${actionCapitalized} User`,
      description: `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`,
      icon: currentStatus ? 'deactivate' : 'activate',
      action: async () => {
        try {
          await updateUserMutation.mutateAsync({
            id: userId,
            data: { isActive: !currentStatus }
          });
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch (error) {
          console.error('Status toggle error:', error);
        }
      },
    });
  };

  const handleResetPassword = (userId: string) => {
    if (!isAdmin) {
      toast.error('Only administrators can reset passwords');
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) return;

    setSelectedUser(user);
    setIsResetPasswordModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRefresh = () => {
    refetchUsers();
    refetchStats();
  };

  // Error handling
  if (usersError || statsError) {
    return (
      <div className="stack g-6 pad-6">
        <div className="row-between">
          <div>
            <h1 className="t-3xl t-bold t-tight">Users</h1>
            <p className="t-muted">Manage user accounts and permissions</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="space-r-2 ico" />
            Retry
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="ico" />
          <AlertDescription>
            Failed to load users data. {usersError?.message || statsError?.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="page stack g-8 screen-h">
      {/* Page Header */}
      <div className="page-toolbar">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="page-actions">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoadingAny}>
            <RefreshCw className={cn("space-r-2 ico", isLoadingAny && "spin")} />
            Refresh
          </Button>
          {isAdmin && (
            <Button onClick={handleUserInvite} disabled={isMutating} className="btn btn-brand">
              <UserPlus className="space-r-2 ico" />
              Invite User
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid-stats">
        <Card className="surface">
          <CardHeader className="row-between pad-y-2">
            <CardTitle className="t-sm t-semibold">Total Users</CardTitle>
            <Users className="ico-lg t-brand" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">
              {statsLoading ? (
                <Loader2 className="ico-xl spin" />
              ) : (
                stats?.total || 0
              )}
            </div>
            <p className="t-xs t-muted space-t-1">
              {statsLoading ? '...' : `${stats?.active || 0} active users`}
            </p>
          </CardContent>
        </Card>
        <Card className="surface">
          <CardHeader className="row-between pad-y-2">
            <CardTitle className="t-sm t-semibold">Active Users</CardTitle>
            <UserCheck className="ico-lg t-success" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">
              {statsLoading ? (
                <Loader2 className="ico-xl spin" />
              ) : (
                stats?.active || 0
              )}
            </div>
            <p className="t-xs t-muted space-t-1">
              {statsLoading || !stats ? '...' : `${Math.round((stats.active / stats.total) * 100)}% of total`}
            </p>
          </CardContent>
        </Card>
        <Card className="surface">
          <CardHeader className="row-between pad-y-2">
            <CardTitle className="t-sm t-semibold">Admins</CardTitle>
            <Shield className="ico-lg t-brand" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">
              {statsLoading ? (
                <Loader2 className="ico-xl spin" />
              ) : (
                stats?.byRole?.ADMIN || 0
              )}
            </div>
            <p className="t-xs t-muted space-t-1">
              Administrative access
            </p>
          </CardContent>
        </Card>
        <Card className="surface">
          <CardHeader className="row-between pad-y-2">
            <CardTitle className="t-sm t-semibold">Agents</CardTitle>
            <UserCheck className="ico-lg t-ai" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">
              {statsLoading ? (
                <Loader2 className="ico-xl spin" />
              ) : (
                stats?.byRole?.AGENT || 0
              )}
            </div>
            <p className="t-xs t-muted space-t-1">
              Support agents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="page-toolbar">
        <div className="search-wrap toolbar-search flex-fill">
          <Search className="search-icon" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
            disabled={usersLoading}
          />
        </div>
        <div className="filter-bar">
          <Button
            variant={roleFilter === undefined ? "default" : "outline"}
            size="sm"
            className="shape-round"
            onClick={() => { setRoleFilter(undefined); setCurrentPage(1); }}
            disabled={usersLoading}
          >
            All Roles
          </Button>
          <Button
            variant={roleFilter === 'ADMIN' ? "default" : "outline"}
            size="sm"
            className="shape-round"
            onClick={() => { setRoleFilter('ADMIN'); setCurrentPage(1); }}
            disabled={usersLoading}
          >
            <Shield className="ico-xs space-r-1" />
            Admin
          </Button>
          <Button
            variant={roleFilter === 'AGENT' ? "default" : "outline"}
            size="sm"
            className="shape-round"
            onClick={() => { setRoleFilter('AGENT'); setCurrentPage(1); }}
            disabled={usersLoading}
          >
            <UserCheck className="ico-xs space-r-1" />
            Agent
          </Button>
          <Button
            variant={roleFilter === 'VIEWER' ? "default" : "outline"}
            size="sm"
            className="shape-round"
            onClick={() => { setRoleFilter('VIEWER'); setCurrentPage(1); }}
            disabled={usersLoading}
          >
            <Eye className="ico-xs space-r-1" />
            Viewer
          </Button>
        </div>
        <div className="cluster">
          <Button
            variant={statusFilter === undefined ? "default" : "outline"}
            size="sm"
            className="shape-round"
            onClick={() => { setStatusFilter(undefined); setCurrentPage(1); }}
            disabled={usersLoading}
          >
            All Status
          </Button>
          <Button
            variant={statusFilter === true ? "default" : "outline"}
            size="sm"
            className="shape-round"
            onClick={() => { setStatusFilter(true); setCurrentPage(1); }}
            disabled={usersLoading}
          >
            <UserCheck className="ico-xs space-r-1" />
            Active
          </Button>
          <Button
            variant={statusFilter === false ? "default" : "outline"}
            size="sm"
            className="shape-round"
            onClick={() => { setStatusFilter(false); setCurrentPage(1); }}
            disabled={usersLoading}
          >
            <UserX className="ico-xs space-r-1" />
            Inactive
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card className="surface-raised">
        <CardHeader>
          <CardTitle className="section-title">User Management</CardTitle>
          <CardDescription>
            View and manage all users in your organization
            {pagination && (
              <span className="space-l-2">
                ({pagination.total} total users)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable
            data={users}
            loading={usersLoading}
            onUserSelect={handleUserSelect}
            onUserEdit={handleUserEdit}
            onUserDelete={handleUserDelete}
            onUserInvite={handleUserInvite}
            onRoleChange={handleRoleChange}
            onStatusToggle={handleStatusToggle}
            onResetPassword={handleResetPassword}
            pagination={pagination}
            onPageChange={handlePageChange}
            isAdmin={isAdmin}
            isMutating={isMutating}
          />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {stats?.recentlyJoined && stats.recentlyJoined.length > 0 && (
        <Card className="surface">
          <CardHeader>
            <CardTitle className="card-title">Recent Additions</CardTitle>
            <CardDescription>
              Users who recently joined your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="stack g-3">
              {stats.recentlyJoined.map((user) => (
                <div key={user.id} className="list-row">
                  <div className="list-avatar t-sm t-semibold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="flex-fill">
                    <p className="list-title">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="list-meta">
                      {user.email}
                    </p>
                  </div>
                  <Badge variant="outline" className="t-xs no-shrink">
                    {user.role}
                  </Badge>
                  <p className="t-xs t-muted no-shrink">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <CreateUserModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <EditUserModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        user={selectedUser}
        currentUserId={displayUser?.id}
      />

      <ResetPasswordModal
        open={isResetPasswordModalOpen}
        onOpenChange={setIsResetPasswordModalOpen}
        user={selectedUser}
      />

      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        icon={confirmDialog.icon}
        onConfirm={confirmDialog.action}
        confirmText={confirmDialog.variant === 'destructive' ? 'Delete' : 'Confirm'}
      />
    </div>
  );
}