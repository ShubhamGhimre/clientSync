'use client';

import { useState, useMemo } from 'react';
import {
  Headphones,
  Shield,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { UsersTable } from '@/components/tables/users-table';
import { TableShell, TableToolbar } from '@/components/tables/table-kits';
import {
  FilterDropdown,
  PageContainer,
  PageErrorState,
  PageHeader,
  PrimaryActionButton,
  RefreshButton,
  SearchField,
  StatsStrip,
  type StatItem,
} from '@/components/page-kits';
import { UserAttentionPanel } from '@/components/users/user-attention-panel';
import { CreateUserModal } from '@/components/modals/create-user-modal';
import { EditUserModal } from '@/components/modals/edit-user-modal';
import { ResetPasswordModal } from '@/components/modals/reset-password-modal';
import {
  useUsers,
  useUserStats,
  useDeleteUser,
  useUpdateUser,
  User,
} from '@/hooks/api/useUsers';
import { useDisplayUser } from '@/hooks/useDisplayUser';

type Role = 'ADMIN' | 'AGENT' | 'VIEWER';

const roleOptions = [
  { value: 'ALL', label: 'All roles' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'AGENT', label: 'Agent' },
  { value: 'VIEWER', label: 'Viewer' },
];

const statusOptions = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<Role | undefined>();
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();
  const [pageSize] = useState(10);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
  const closeConfirm = () => setConfirmDialog((d) => ({ ...d, open: false }));

  const { displayUser } = useDisplayUser();
  const isAdmin = displayUser?.role === 'ADMIN';

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      search: searchTerm.trim() || undefined,
      role: roleFilter,
      isActive: statusFilter,
    }),
    [currentPage, pageSize, searchTerm, roleFilter, statusFilter]
  );

  const {
    data: usersResponse,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useUsers(queryParams);

  const {
    data: statsResponse,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useUserStats();

  const deleteUserMutation = useDeleteUser();
  const updateUserMutation = useUpdateUser();

  const users = usersResponse?.data || [];
  const pagination = usersResponse?.pagination;
  const stats = statsResponse?.data;

  const isLoadingAny = usersLoading || statsLoading;
  const isMutating =
    deleteUserMutation.isPending || updateUserMutation.isPending;

  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUserDelete = (userId: string) => {
    if (!isAdmin) {
      toast.error('Only administrators can delete users');
      return;
    }
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const targetUser = { ...user };
    setConfirmDialog({
      open: true,
      title: 'Delete User',
      description: `Are you sure you want to delete ${targetUser.firstName} ${targetUser.lastName}?\n\nThis action cannot be undone and will:\n• Remove the user's access to the system\n• Delete their account permanently\n• Reassign their tickets to other agents`,
      variant: 'destructive',
      icon: 'delete',
      action: async () => {
        try {
          await deleteUserMutation.mutateAsync(targetUser.id);
          closeConfirm();
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

  const handleRoleChange = (userId: string, newRole: Role) => {
    if (!isAdmin) {
      toast.error('Only administrators can change user roles');
      return;
    }
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (userId === displayUser?.id && newRole !== displayUser?.role) {
      toast.error('You cannot change your own role');
      return;
    }

    const targetUser = { ...user };
    setConfirmDialog({
      open: true,
      title: 'Change User Role',
      description: `Change ${targetUser.firstName} ${targetUser.lastName}'s role from ${targetUser.role} to ${newRole}?`,
      action: async () => {
        try {
          await updateUserMutation.mutateAsync({
            id: targetUser.id,
            data: { role: newRole },
          });
          closeConfirm();
        } catch (error) {
          console.error('Role change error:', error);
        }
      },
    });
  };

  const handleStatusToggle = (userId: string, currentStatus: boolean) => {
    if (!isAdmin) {
      toast.error('Only administrators can change user status');
      return;
    }
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (userId === displayUser?.id && currentStatus) {
      toast.error('You cannot deactivate your own account');
      return;
    }

    const action = currentStatus ? 'deactivate' : 'activate';
    const actionCapitalized = action.charAt(0).toUpperCase() + action.slice(1);
    const targetUser = { ...user };

    setConfirmDialog({
      open: true,
      title: `${actionCapitalized} User`,
      description: `Are you sure you want to ${action} ${targetUser.firstName} ${targetUser.lastName}?`,
      icon: currentStatus ? 'deactivate' : 'activate',
      action: async () => {
        try {
          await updateUserMutation.mutateAsync({
            id: targetUser.id,
            data: { isActive: !currentStatus },
          });
          closeConfirm();
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
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setSelectedUser(user);
    setIsResetPasswordModalOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refetchUsers();
    refetchStats();
  };

  const handleAttentionRoleFilter = (role: Role) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleAttentionStatusFilter = (active: boolean) => {
    setStatusFilter(active);
    setCurrentPage(1);
  };

  const roleValue = roleFilter ?? 'ALL';
  const statusValue =
    statusFilter === undefined ? 'ALL' : statusFilter ? 'ACTIVE' : 'INACTIVE';

  const activePct =
    stats && stats.total > 0
      ? `${Math.round((stats.active / stats.total) * 100)}% of total`
      : '';

  const statItems: StatItem[] = [
    {
      label: 'Total users',
      value: stats?.total ?? 0,
      hint: `${stats?.active ?? 0} active`,
      icon: Users,
      iconClass: 'text-primary',
    },
    {
      label: 'Active',
      value: stats?.active ?? 0,
      hint: activePct,
      icon: UserCheck,
      iconClass: 'text-chart-2',
    },
    {
      label: 'Admins',
      value: stats?.byRole?.ADMIN ?? 0,
      hint: 'Full access',
      icon: Shield,
      iconClass: 'text-chart-4',
    },
    {
      label: 'Agents',
      value: stats?.byRole?.AGENT ?? 0,
      hint: 'Support team',
      icon: Headphones,
      iconClass: 'text-chart-3',
    },
  ];

  if (usersError || statsError) {
    return (
      <PageErrorState
        title="Users"
        noun="users"
        message={usersError?.message || statsError?.message}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Users"
        description="Manage accounts, roles and access for your organization."
        actions={
          <>
            <RefreshButton
              onClick={handleRefresh}
              loading={isLoadingAny}
              disabled={isLoadingAny}
            />
            {isAdmin && (
              <PrimaryActionButton
                onClick={handleUserInvite}
                disabled={isMutating}
                icon={UserPlus}
              >
                Invite user
              </PrimaryActionButton>
            )}
          </>
        }
      />

      <StatsStrip items={statItems} loading={statsLoading} />

      <TableShell>
        <TableToolbar>
          <SearchField
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search users"
          />

          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              options={roleOptions}
              value={roleValue}
              onValueChange={(value) => {
                setRoleFilter(value === 'ALL' ? undefined : (value as Role));
                setCurrentPage(1);
              }}
            />

            <FilterDropdown
              options={statusOptions}
              value={statusValue}
              onValueChange={(value) => {
                setStatusFilter(value === 'ALL' ? undefined : value === 'ACTIVE');
                setCurrentPage(1);
              }}
            />
          </div>
        </TableToolbar>

        <UsersTable
          data={users}
          loading={usersLoading}
          onUserEdit={handleUserEdit}
          onUserDelete={handleUserDelete}
          onUserInvite={handleUserInvite}
          onRoleChange={handleRoleChange}
          onStatusToggle={handleStatusToggle}
          onResetPassword={handleResetPassword}
          pagination={pagination}
          onPageChange={setCurrentPage}
          isAdmin={isAdmin}
          isMutating={isMutating}
        />
      </TableShell>

      <UserAttentionPanel
        stats={stats}
        loading={statsLoading}
        onRoleFilter={handleAttentionRoleFilter}
        onStatusFilter={handleAttentionStatusFilter}
      />

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
        onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        icon={confirmDialog.icon}
        onConfirm={confirmDialog.action}
        confirmText={
          confirmDialog.variant === 'destructive' ? 'Delete' : 'Confirm'
        }
      />
    </PageContainer>
  );
}
