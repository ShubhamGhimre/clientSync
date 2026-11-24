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
      <DialogContent className="dialog-shell">
        <DialogHeader>
          <DialogTitle className="row g-2">
            <Key className="ico-lg" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Set a new password for{' '}
            <span className="t-medium">
              {user?.firstName} {user?.lastName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div role="alert" className="callout callout-warning">
          <AlertTriangle className="ico" />
          <span>
            The user will need to use this new password on their next login. 
            Consider sending them the new password through a secure channel.
          </span>
        </div>

        <div className="row g-3 pad-3 surface-muted">
          <div className="avatar icon-tile-brand">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-zero">
            <p className="t-medium">{user?.firstName} {user?.lastName}</p>
            <p className="field-hint">{user?.email}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="col g-4">
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

            <DialogFooter className="dialog-foot">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={resetPasswordMutation.isPending}
                className="btn btn-secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                variant="destructive"
                className="btn btn-danger"
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="ico space-r-2 spin" />
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
