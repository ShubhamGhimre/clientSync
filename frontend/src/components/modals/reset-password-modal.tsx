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
import { Loader2, Key, AlertTriangle } from 'lucide-react';
import { useResetPassword, User as UserType } from '@/hooks/api/useUsers';

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserType | null;
}

export function ResetPasswordModal({
  open,
  onOpenChange,
  user,
}: ResetPasswordModalProps) {
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
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl border-border bg-card text-card-foreground shadow-soft">
        <DialogHeader className="border-b border-border pb-4 text-left">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Key className="size-5 shrink-0" />
            </span>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                Reset Password
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set a new password for{' '}
                <span className="font-medium text-foreground">
                  {user?.firstName} {user?.lastName}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-chart-4/30 bg-chart-4/10 p-3.5 text-xs leading-relaxed text-foreground"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-chart-4" />
          <span>
            The user will need to use this new password on their next login.
            Consider sending them the new password through a secure channel.
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 pt-1"
          >
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-foreground">
                    New Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      className="h-10 rounded-xl border-input bg-background text-sm focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25"
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
                  <FormLabel className="text-xs font-medium text-foreground">
                    Confirm New Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      className="h-10 rounded-xl border-input bg-background text-sm focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25"
                      {...field}
                      disabled={resetPasswordMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={resetPasswordMutation.isPending}
                className="h-10 rounded-xl border-border bg-card px-4 text-sm font-medium text-foreground shadow-xs hover:border-primary/30 hover:text-primary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                variant="destructive"
                className="h-10 rounded-xl px-4 text-sm font-semibold shadow-xs"
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 shrink-0 animate-spin" />
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