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
import { Alert, AlertDescription } from '@/components/ui/alert';
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
          color: 'bg-red-500',
          badgeVariant: 'destructive' as const,
        };
      case 'AGENT':
        return {
          icon: Briefcase,
          label: 'Support Agent',
          description: 'Handle tickets & support',
          color: 'bg-blue-500',
          badgeVariant: 'default' as const,
        };
      case 'VIEWER':
        return {
          icon: Eye,
          label: 'Viewer',
          description: 'Read-only access',
          color: 'bg-gray-500',
          badgeVariant: 'secondary' as const,
        };
      default:
        return {
          icon: User,
          label: 'User',
          description: 'Basic access',
          color: 'bg-gray-400',
          badgeVariant: 'outline' as const,
        };
    }
  };

  const roleConfig = getRoleConfig(watchedRole);
  const isOwnAccount = user?.id === currentUserId;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
              <Edit className="h-5 w-5" />
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
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              You are editing your own account. Some options may be restricted.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Personal Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Personal Information
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John" 
                          {...field} 
                          disabled={updateUserMutation.isPending}
                          className="h-9"
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
                      <FormLabel className="text-sm">Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Doe" 
                          {...field} 
                          disabled={updateUserMutation.isPending}
                          className="h-9"
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
                    <FormLabel className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="john.doe@company.com" 
                        {...field} 
                        disabled={updateUserMutation.isPending}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Role & Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4" />
                Role & Status
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={updateUserMutation.isPending || isOwnAccount}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="VIEWER">
                              <div className="flex items-center gap-2">
                                <Eye className="h-3.5 w-3.5" />
                                <span>Viewer</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="AGENT">
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-3.5 w-3.5" />
                                <span>Agent</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="ADMIN">
                              <div className="flex items-center gap-2">
                                <Crown className="h-3.5 w-3.5" />
                                <span>Admin</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {isOwnAccount && (
                          <p className="text-xs text-muted-foreground">
                            You cannot change your own role
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <div className="h-9 flex items-center justify-center border rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 ${roleConfig.color} rounded flex items-center justify-center`}>
                        <roleConfig.icon className="h-3 w-3 text-white" />
                      </div>
                      <Badge variant={roleConfig.badgeVariant} className="text-xs h-5">
                        {roleConfig.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                      <div>
                        <FormLabel className="text-sm font-medium">Active Account</FormLabel>
                        <p className="text-xs text-muted-foreground">
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

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateUserMutation.isPending}
                className="h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="h-9 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
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