'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Key, AlertTriangle, User } from 'lucide-react';
import { useResetPassword, User as UserType } from '@/hooks/api/useUsers';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserType | null;
}

export function ResetPasswordModal({ open, onOpenChange, user }: ResetPasswordModalProps) {
  const resetPasswordMutation = useResetPassword();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!user) return;

    try {
      await resetPasswordMutation.mutateAsync({
        id: user.id,
        newPassword: data.newPassword,
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Set a new password for{' '}
            <span className="font-medium">
              {user?.firstName} {user?.lastName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The user will need to use this new password on their next login. 
            Consider sending them the new password through a secure channel.
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="Enter new password"
                      {...field} 
                      disabled={resetPasswordMutation.isPending}
                    />
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
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="Confirm new password"
                      {...field} 
                      disabled={resetPasswordMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={resetPasswordMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                variant="destructive"
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}