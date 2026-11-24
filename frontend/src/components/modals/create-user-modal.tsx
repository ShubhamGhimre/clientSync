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
      <DialogContent className="dialog-shell">
        <DialogHeader className="dialog-head">
          <div className="row g-3">
            <div className="dialog-icon">
              <UserPlus className="ico-lg" />
            </div>
            <div>
              <DialogTitle className="dialog-title">Create New User</DialogTitle>
              <DialogDescription className="t-sm t-muted">
                Add a new team member to your organization
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="dialog-body">
            {/* Personal Information */}
            <div className="col g-3">
              <div className="section-head">
                <User className="ico" />
                Personal Information
              </div>
              
              <div className="form-grid">
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
                    <FormLabel className="ui-label">
                      <Mail className="ico" />
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
            <div className="col g-3">
              <div className="section-head">
                <Lock className="ico" />
                Security
              </div>

              <div className="form-grid">
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
                              <EyeOff className="ico-sm" />
                            ) : (
                              <Eye className="ico-sm" />
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
                              <EyeOff className="ico-sm" />
                            ) : (
                              <Eye className="ico-sm" />
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
            <div className="col g-3">
              <div className="section-head">
                <Shield className="ico" />
                Role & Status
              </div>

              <div className="row g-3">
                <div className="flex-fill">
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
                              <div className="row g-2">
                                <Eye className="ico-sm" />
                                <span>Viewer</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="AGENT">
                              <div className="row g-2">
                                <Briefcase className="ico-sm" />
                                <span>Agent</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="ADMIN">
                              <div className="row g-2">
                                <Crown className="ico-sm" />
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

                <div className="center">
                  <div className="center surface-muted g-2">
                    <div className="center shape-square pad-1 icon-tile-brand">
                      <roleConfig.icon className="ico-xs" />
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
                    <div className="row-between pad-3 surface-muted">
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

            <DialogFooter className="dialog-foot">
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
                    <Loader2 className="ico space-r-2 spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="ico space-r-2" />
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
