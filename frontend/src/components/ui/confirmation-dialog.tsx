'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, UserX, UserCheck } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  icon?: 'delete' | 'deactivate' | 'activate' | 'warning';
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  icon = 'warning'
}: ConfirmationDialogProps) {
  const getIcon = () => {
    switch (icon) {
      case 'delete':
        return <Trash2 className="h-5 w-5 text-red-500" />;
      case 'deactivate':
        return <UserX className="h-5 w-5 text-orange-500" />;
      case 'activate':
        return <UserCheck className="h-5 w-5 text-green-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {getIcon()}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}