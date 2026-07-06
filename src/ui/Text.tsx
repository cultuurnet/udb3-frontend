import type { ReactNode } from 'react';
import React, { forwardRef } from 'react';

import type { Values } from '@/types/Values';
import { cn } from '@/ui/shadcn/utils';

const TextVariants = {
  REGULAR: 'regular',
  MUTED: 'muted',
  ERROR: 'error',
} as const;

type Props = {
  as?: string | React.ComponentType<any>;
  children?: ReactNode;
  className?: string;
  variant?: Values<typeof TextVariants>;
  dangerouslySetInnerHTML?: { __html: string };
};

const variantClasses: Record<Values<typeof TextVariants>, string> = {
  regular: '',
  muted: 'tw:text-muted-foreground',
  error: 'tw:text-destructive',
};

const Text = forwardRef<HTMLElement, Props>(
  (
    {
      as = 'span',
      children,
      className,
      variant = TextVariants.REGULAR,
      dangerouslySetInnerHTML,
    },
    ref,
  ) => {
    const Tag = as as React.ElementType;

    return (
      <Tag
        ref={ref}
        className={cn(variantClasses[variant], className)}
        dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      >
        {children}
      </Tag>
    );
  },
);

Text.displayName = 'Text';

export { Text, TextVariants };
export type { Props as TextProps };
