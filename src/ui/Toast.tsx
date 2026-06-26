import { useEffect, useId, useRef } from 'react';
import { toast as sonnerToast } from 'sonner';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { Values } from '@/types/Values';
import { Toaster } from '@/ui/shadcn/sonner';

import { ToastLegacy } from './ToastLegacy';

const ToastVariants = {
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
} as const;

type ToastProps = {
  variant?: Values<typeof ToastVariants>;
  body: string;
  visible?: boolean;
  onClose?: () => void;
  duration?: number;
};

const getSonnerFn = (variant: Values<typeof ToastVariants>) => {
  if (variant === ToastVariants.SUCCESS) return sonnerToast.success;
  if (variant === ToastVariants.DANGER) return sonnerToast.error;
  if (variant === ToastVariants.WARNING) return sonnerToast.warning;
  if (variant === ToastVariants.INFO) return sonnerToast.info;
  return sonnerToast;
};

const ToastShadcn = ({
  variant = ToastVariants.SUCCESS,
  body,
  visible = true,
  onClose,
  duration = 5000,
}: ToastProps) => {
  const toasterId = useId();
  const toastId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (visible && body) {
      const fn = getSonnerFn(variant);
      fn(body, {
        id: toastId,
        toasterId,
        duration,
        closeButton: !!onClose,
        onDismiss: () => onCloseRef.current?.(),
        onAutoClose: () => onCloseRef.current?.(),
      });
    } else {
      sonnerToast.dismiss(toastId);
    }
  }, [visible, body, variant, toastId, toasterId, duration, onClose]);

  useEffect(() => {
    return () => {
      sonnerToast.dismiss(toastId);
    };
  }, [toastId]);

  return <Toaster id={toasterId} position="top-right" />;
};

const Toast = ({
  variant = ToastVariants.SUCCESS,
  body,
  visible = true,
  onClose,
  duration,
}: ToastProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (!isShadcnMigrationEnabled) {
    return (
      <ToastLegacy
        variant={variant}
        body={body}
        visible={visible}
        onClose={onClose}
      />
    );
  }

  return (
    <ToastShadcn
      variant={variant}
      body={body}
      visible={visible}
      onClose={onClose}
      duration={duration}
    />
  );
};

export { toast } from 'sonner';
export { Toast, Toaster, ToastVariants };
