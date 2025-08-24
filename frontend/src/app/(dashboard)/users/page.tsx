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
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load users data. {usersError?.message || statsError?.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white dark:from-[#18181b] dark:to-[#23232a] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Users</h1>
          <p className="text-muted-foreground text-base mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoadingAny}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoadingAny && "animate-spin")} />
            Refresh
          </Button>
          {isAdmin && (
            <Button onClick={handleUserInvite} disabled={isMutating} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-100 dark:from-[#23232a] dark:to-[#18181b]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {statsLoading ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : (
                stats?.total || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statsLoading ? '...' : `${stats?.active || 0} active users`}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-100 dark:from-[#23232a] dark:to-[#18181b]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200">Active Users</CardTitle>
            <UserCheck className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {statsLoading ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : (
                stats?.active || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statsLoading || !stats ? '...' : `${Math.round((stats.active / stats.total) * 100)}% of total`}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-100 dark:from-[#23232a] dark:to-[#18181b]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200">Admins</CardTitle>
            <Shield className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {statsLoading ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : (
                stats?.byRole?.ADMIN || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Administrative access
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-100 dark:from-[#23232a] dark:to-[#18181b]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200">Agents</CardTitle>
            <UserCheck className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {statsLoading ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : (
                stats?.byRole?.AGENT || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Support agents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 rounded-lg border-gray-200 dark:border-gray-700 shadow-sm"
            disabled={usersLoading}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={roleFilter === undefined ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => { setRoleFilter(undefined); setCurrentPage(1); }}
            disabled={usersLoading}
          >
            All Roles
          </Button>
          <Button
            variant={roleFilter === 'ADMIN' ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => { setRoleFilter('ADMIN'); setCurrentPage(1); }}
            disabled={usersLoading}
          >
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Button>
          <Button
            variant={roleFilter === 'AGENT' ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => { setRoleFilter('AGENT'); setCurrentPage(1); }}
            disabled={usersLoading}
          >
            <UserCheck className="h-3 w-3 mr-1" />
            Agent
          </Button>
          <Button
            variant={roleFilter === 'VIEWER' ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => { setRoleFilter('VIEWER'); setCurrentPage(1); }}
            disabled={usersLoading}
          >
            <Eye className="h-3 w-3 mr-1" />
            Viewer
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === undefined ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => { setStatusFilter(undefined); setCurrentPage(1); }}
            disabled={usersLoading}
          >
            All Status
          </Button>
          <Button
            variant={statusFilter === true ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => { setStatusFilter(true); setCurrentPage(1); }}
            disabled={usersLoading}
          >
            <UserCheck className="h-3 w-3 mr-1" />
            Active
          </Button>
          <Button
            variant={statusFilter === false ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => { setStatusFilter(false); setCurrentPage(1); }}
            disabled={usersLoading}
          >
            <UserX className="h-3 w-3 mr-1" />
            Inactive
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card className="shadow-md border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">User Management</CardTitle>
          <CardDescription>
            View and manage all users in your organization
            {pagination && (
              <span className="ml-2">
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
        <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-100 dark:from-[#23232a] dark:to-[#18181b]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Additions</CardTitle>
            <CardDescription>
              Users who recently joined your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentlyJoined.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {user.role}
                  </Badge>
                  <p className="text-xs text-muted-foreground flex-shrink-0">
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