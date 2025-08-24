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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <UserPlus className="h-5 w-5" />
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
                          disabled={createUserMutation.isPending}
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
                          disabled={createUserMutation.isPending}
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
                        disabled={createUserMutation.isPending}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Security */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4" />
                Security
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            {...field} 
                            disabled={createUserMutation.isPending}
                            className="h-9 pr-9"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-9 w-9 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={createUserMutation.isPending}
                          >
                            {showPassword ? (
                              <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                            ) : (
                              <Eye className="h-3.5 w-3.5 text-gray-400" />
                            )}
                          </Button>
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
                      <FormLabel className="text-sm">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            {...field} 
                            disabled={createUserMutation.isPending}
                            className="h-9 pr-9"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-9 w-9 p-0"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={createUserMutation.isPending}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                            ) : (
                              <Eye className="h-3.5 w-3.5 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                          disabled={createUserMutation.isPending}
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

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createUserMutation.isPending}
                className="h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createUserMutation.isPending}
                className="h-9 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
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