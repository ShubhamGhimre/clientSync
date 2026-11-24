'use client';

import { useState } from 'react';
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
  Lock, 
  Shield, 
  Eye, 
  UserPlus,
  Crown,
  Briefcase,
  EyeOff
} from 'lucide-react';
import { useCreateUser, CreateUserData } from '@/hooks/api/useUsers';

interface CreateUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'ADMIN' | 'AGENT' | 'VIEWER';
  isActive: boolean;
}

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserModal({ open, onOpenChange }: CreateUserModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const createUserMutation = useCreateUser();

  const form = useForm<CreateUserFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'AGENT',
      isActive: true,
    },
  });

  const watchedRole = form.watch('role');

  const onSubmit = async (data: CreateUserFormData) => {
    // Basic validation
    if (data.password !== data.confirmPassword) {
      form.setError('confirmPassword', { message: "Passwords don't match" });
      return;
    }

    try {
      const userData: CreateUserData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        isActive: data.isActive,
      };

      await createUserMutation.mutateAsync(userData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Create user error:', error);
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex items-center gap-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="icon-tile brand-gradient-alt text-on-brand">
              <UserPlus className="size-5 shrink-0" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Create New User</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Add a new team member to your organization
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

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
                          disabled={createUserMutation.isPending}
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
                          disabled={createUserMutation.isPending}
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
                        disabled={createUserMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Security */}
            <div className="flex flex-col gap-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Lock className="size-4 shrink-0" />
                Security
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label">Password</FormLabel>
                      <FormControl>
                        <div className="input-wrap has-action">
                          <input 
                            type={showPassword ? "text" : "password"}
                            className="input"
                            placeholder="••••••••" 
                            {...field} 
                            disabled={createUserMutation.isPending}
                          />
                          <button
                            type="button"
                            className="input-action"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={createUserMutation.isPending}
                          >
                            {showPassword ? (
                              <EyeOff className="size-3.5 shrink-0" />
                            ) : (
                              <Eye className="size-3.5 shrink-0" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="input-wrap has-action">
                          <input 
                            type={showConfirmPassword ? "text" : "password"}
                            className="input"
                            placeholder="••••••••" 
                            {...field} 
                            disabled={createUserMutation.isPending}
                          />
                          <button
                            type="button"
                            className="input-action"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={createUserMutation.isPending}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="size-3.5 shrink-0" />
                            ) : (
                              <Eye className="size-3.5 shrink-0" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                          disabled={createUserMutation.isPending}
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
                          User can access the system immediately
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={createUserMutation.isPending}
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
                disabled={createUserMutation.isPending}
                className="btn btn-secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createUserMutation.isPending}
                className="btn btn-brand"
              >
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 shrink-0 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4 shrink-0 mr-2" />
                    Create User
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
