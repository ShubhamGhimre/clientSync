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
  AlertTriangle
} from 'lucide-react';
import { useUpdateUser, User as UserType, UpdateUserData } from '@/hooks/api/useUsers';

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

export function EditUserModal({ open, onOpenChange, user, currentUserId }: EditUserModalProps) {
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

  // Update form when user changes
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
  const isOwnAccount = user?.id === currentUserId;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex items-center gap-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="icon-tile brand-gradient-alt text-on-brand">
              <Edit className="size-5 shrink-0" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Edit User</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Update user information and permissions
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isOwnAccount && (
          <div role="alert" className="callout callout-warning">
            <AlertTriangle className="size-4 shrink-0 text-warning" />
            <p className="text-warning">
              You are editing your own account. Some options may be restricted.
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Personal Information */}
            <div className="flex flex-col gap-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <User className="size-4 shrink-0" />
                Personal Information
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label">First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John" 
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
                      <FormLabel className="label">Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Doe" 
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
                    <FormLabel className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                      <Mail className="size-4 shrink-0" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="john.doe@company.com" 
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
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Shield className="size-4 shrink-0" />
                Role & Status
              </div>

              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="label">Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={updateUserMutation.isPending || isOwnAccount}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                          <p className="field-hint">
                            You cannot change your own role
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-center">
                  <div className="flex items-center justify-center surface-muted gap-2">
                    <div className="flex items-center justify-center rounded-lg p-1 icon-tile brand-gradient text-on-brand">
                      <roleConfig.icon className="size-3 shrink-0" />
                    </div>
                    <Badge variant={roleConfig.badgeVariant} className="badge">
                      {roleConfig.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between p-3 surface-muted">
                      <div>
                        <FormLabel className="label">Active Account</FormLabel>
                        <p className="field-hint">
                          {isOwnAccount 
                            ? "You cannot deactivate your own account" 
                            : "User can access the system when active"
                          }
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={updateUserMutation.isPending || isOwnAccount}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex items-center justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateUserMutation.isPending}
                className="btn btn-secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="btn btn-brand"
              >
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 shrink-0 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="size-4 shrink-0 mr-2" />
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
