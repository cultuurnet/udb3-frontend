import { useState } from 'react';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useIsClient } from '@/hooks/useIsClient';
import type { Values } from '@/types/Values';
import { toast as sonnerToast } from '@/ui/Toast';
import { ToastLegacy, ToastVariants } from '@/ui/ToastLegacy';

const getSonnerFn = (variant: Values<typeof ToastVariants>) => {
  if (variant === ToastVariants.DANGER) return sonnerToast.error;
  if (variant === ToastVariants.WARNING) return sonnerToast.warning;
  if (variant === ToastVariants.INFO) return sonnerToast.info;
  return sonnerToast.success;
};

// TODO: after SHADCN_MIGRATION flag is removed, keep only the getSonnerFn call in show() and remove everything else — message/variant state, clear, component, ToastLegacy, useIsClient
const useToast = ({
  messages = {},
  closable = true,
}: { messages?: Record<string, string>; closable?: boolean } = {}) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );
  const [message, setMessage] = useState<string | undefined>();
  const [variant, setVariant] = useState<Values<typeof ToastVariants>>(
    ToastVariants.SUCCESS,
  );

  const clear = () => setMessage(undefined);

  const show = (
    text: string,
    toastVariant: Values<typeof ToastVariants> = ToastVariants.SUCCESS,
  ) => {
    if (isShadcnMigrationEnabled) {
      getSonnerFn(toastVariant)(text, { closeButton: closable });
    } else {
      setVariant(toastVariant);
      setMessage(text);
    }
  };

  const trigger = (key: string) => {
    const foundMessage = messages[key];
    if (!foundMessage) return;
    show(foundMessage);
  };

  const isClient = useIsClient();

  const component =
    !isClient || isShadcnMigrationEnabled ? null : (
      <ToastLegacy
        variant={variant}
        body={message ?? ''}
        visible={!!message}
        onClose={closable ? clear : undefined}
      />
    );

  return { clear, trigger, show, component };
};

export { ToastVariants, useToast };
