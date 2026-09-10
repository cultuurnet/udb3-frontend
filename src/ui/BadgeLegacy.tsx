import { Badge as BootstrapBadge } from 'react-bootstrap';

import type { Values } from '@/types/Values';

import type { BoxProps } from './Box';
import { getBoxProps } from './Box';
import { Text } from './Text';

const BadgeVariants = {
  DANGER: 'danger',
  SECONDARY: 'secondary',
  INFO: 'info',
} as const;

type Props = BoxProps & {
  variant?: Values<typeof BadgeVariants>;
  pill?: boolean;
};

const BadgeLegacy = ({
  children,
  pill,
  className,
  variant = BadgeVariants.DANGER,
  ...props
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
        `background-color: var(--primary) !important;`}
      `}
    >
      <Text {...getBoxProps(props)}>{children}</Text>
    </BootstrapBadge>
  );
};

export { BadgeLegacy, BadgeVariants };
