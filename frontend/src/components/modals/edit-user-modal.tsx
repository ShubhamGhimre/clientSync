'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  User,
  Mail,
  Shield,
  Edit,
  Eye,
  Crown,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import {
  useUpdateUser,
  User as UserType,
  UpdateUserData,
} from '@/hooks/api/useUsers';

interface EditUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'AGENT' | 'VIEWER';
  isActive: boolean;
}

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserType | null;
  currentUserId?: string;
}

export function EditUserModal({
  open,
  onOpenChange,
  user,
  currentUserId,
}: EditUserModalProps) {
  const updateUserMutation = useUpdateUser();

  const form = useForm<EditUserFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'AGENT',
      isActive: true,
    },
  });

  const watchedRole = form.watch('role');

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: EditUserFormData) => {
    if (!user) return;

    try {
      const updateData: UpdateUserData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      };

      await updateUserMutation.mutateAsync({
        id: user.id,
        data: updateData,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          icon: Crown,
          label: 'Administrator',
          description: 'Full system access',
          badgeVariant: 'destructive' as const,
        };
      case 'AGENT':
        return {
          icon: Briefcase,
          label: 'Support Agent',
          description: 'Handle tickets & support',
          badgeVariant: 'default' as const,
        };
      case 'VIEWER':
        return {
          icon: Eye,
          label: 'Viewer',
          description: 'Read-only access',
          badgeVariant: 'secondary' as const,
        };
      default:
        return {
          icon: User,
          label: 'User',
          description: 'Basic access',
          badgeVariant: 'outline' as const,
        };
    }
  };

  const roleConfig = getRoleConfig(watchedRole);
  const RoleIcon = roleConfig.icon;
  const isOwnAccount = user?.id === currentUserId;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl border-border bg-card text-card-foreground shadow-soft">
        <DialogHeader className="border-b border-border pb-4 text-left">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Edit className="size-5 shrink-0" />
            </span>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                Edit User
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update user information and permissions
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isOwnAccount && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-xl border border-chart-4/30 bg-chart-4/10 px-3.5 py-2.5 text-xs font-medium text-foreground"
          >
            <AlertTriangle className="size-4 shrink-0 text-chart-4" />
            <p>
              You are editing your own account. Some options may be restricted.
            </p>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5 pt-1"
          >
            {/* Personal Information */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <User className="size-3.5 shrink-0 text-primary" />
                <span>Personal Information</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-foreground">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          className="h-10 rounded-xl border-input bg-background text-sm focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25"
                          {...field}
                          disabled={updateUserMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-foreground">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          className="h-10 rounded-xl border-input bg-background text-sm focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25"
                          {...field}
                          disabled={updateUserMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                      <span>Email Address</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@company.com"
                        className="h-10 rounded-xl border-input bg-background text-sm focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25"
                        {...field}
                        disabled={updateUserMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Role & Status */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Shield className="size-3.5 shrink-0 text-primary" />
                <span>Role & Status</span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-foreground">
                          Role
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={updateUserMutation.isPending || isOwnAccount}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-xl border-input bg-background text-sm">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground">
                            <SelectItem value="VIEWER">
                              <div className="flex items-center gap-2">
                                <Eye className="size-3.5 shrink-0" />
                                <span>Viewer</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="AGENT">
                              <div className="flex items-center gap-2">
                                <Briefcase className="size-3.5 shrink-0" />
                                <span>Agent</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="ADMIN">
                              <div className="flex items-center gap-2">
                                <Crown className="size-3.5 shrink-0" />
                                <span>Admin</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {isOwnAccount && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            You cannot change your own role
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                    <RoleIcon className="size-3.5 shrink-0" />
                  </span>
                  <Badge
                    variant={roleConfig.badgeVariant}
                    className="rounded-full text-xs font-medium"
                  >
                    {roleConfig.label}
                  </Badge>
                </div>
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 p-3.5">
                      <div>
                        <FormLabel className="text-xs font-semibold text-foreground">
                          Active Account
                        </FormLabel>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {isOwnAccount
                            ? 'You cannot deactivate your own account'
                            : 'User can access the system when active'}
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={
                            updateUserMutation.isPending || isOwnAccount
                          }
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateUserMutation.isPending}
                className="h-10 rounded-xl border-border bg-card px-4 text-sm font-medium text-foreground shadow-xs hover:border-primary/30 hover:text-primary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 shrink-0 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 size-4 shrink-0" />
                    Update User
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}