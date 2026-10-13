import type { ReactNode } from 'react';

import type { Values } from '@/types/Values';
import { cn } from '@/ui/shadcn/utils';
import { Text, TextVariants } from '@/ui/Text';

import type { BoxProps } from './Box';
import { Box, getBoxProps } from './Box';
import type { ParagraphVariants } from './Paragraph';

type Props = BoxProps & {
  children?: ReactNode;
  variant?: Values<typeof ParagraphVariants>;
};

const textVariantByParagraphVariant: Record<
  Values<typeof ParagraphVariants>,
  Values<typeof TextVariants>
> = {
  regular: TextVariants.REGULAR,
  muted: TextVariants.MUTED,
  error: TextVariants.DANGER,
};

const ParagraphLegacy = ({
  as = 'p',
  variant = 'regular',
  className,
  children,
  ...props
}: Props) => (
  <Box
    as={Text}
    forwardedAs={as}
    variant={textVariantByParagraphVariant[variant]}
    className={cn('tw:max-w-180 tw:leading-[140%]', className)}
    {...getBoxProps(props)}
  >
    {children}
  </Box>
);

export { ParagraphLegacy };
