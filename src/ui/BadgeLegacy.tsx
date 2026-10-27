import type { ReactNode } from 'react';
import { Badge as BootstrapBadge } from 'react-bootstrap';

import type { Values } from '@/types/Values';

import { Text } from './Text';
import { colors } from './theme';

const BadgeVariants = {
  DANGER: 'danger',
  SECONDARY: 'secondary',
  INFO: 'info',
} as const;

type Props = {
  children?: ReactNode;
  className?: string;
  variant?: Values<typeof BadgeVariants>;
  pill?: boolean;
};

const BadgeLegacy = ({
  children,
  pill,
  variant = BadgeVariants.DANGER,
}: Props) => {
  return (
    <BootstrapBadge
      bg={variant}
      pill={pill}
      css={`
        &.badge {
          align-self: center;
        }
        ${variant === BadgeVariants.INFO &&
        `background-color: ${colors.udbMainBlue} !important;`}
      `}
    >
      <Text>{children}</Text>
    </BootstrapBadge>
  );
};

export { BadgeLegacy, BadgeVariants };
