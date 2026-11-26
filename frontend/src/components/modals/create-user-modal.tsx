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
  EyeOff,
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
  const RoleIcon = roleConfig.icon;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl border-border bg-card text-card-foreground shadow-soft">
        <DialogHeader className="border-b border-border pb-4 text-left">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <UserPlus className="size-5 shrink-0" />
            </span>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                Create New User
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Add a new team member to your organization
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

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
                      <FormLabel className="text-xs font-medium text-foreground">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          className="h-10 rounded-xl border-input bg-background text-sm focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25"
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
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Lock className="size-3.5 shrink-0 text-primary" />
                <span>Security</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-foreground">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="h-10 rounded-xl border-input bg-background pr-10 text-sm focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25"
                            {...field}
                            disabled={createUserMutation.isPending}
                          />
                          <button
                            type="button"
                            className="absolute top-1/2 right-2.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={createUserMutation.isPending}
                            aria-label={
                              showPassword ? 'Hide password' : 'Show password'
                            }
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
                      <FormLabel className="text-xs font-medium text-foreground">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="h-10 rounded-xl border-input bg-background pr-10 text-sm focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25"
                            {...field}
                            disabled={createUserMutation.isPending}
                          />
                          <button
                            type="button"
                            className="absolute top-1/2 right-2.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            disabled={createUserMutation.isPending}
                            aria-label={
                              showConfirmPassword
                                ? 'Hide confirm password'
                                : 'Show confirm password'
                            }
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
                          disabled={createUserMutation.isPending}
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

            <DialogFooter className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createUserMutation.isPending}
                className="h-10 rounded-xl border-border bg-card px-4 text-sm font-medium text-foreground shadow-xs hover:border-primary/30 hover:text-primary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createUserMutation.isPending}
                className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 shrink-0 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 size-4 shrink-0" />
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