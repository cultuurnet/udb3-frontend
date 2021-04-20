import { Badge as BootstrapBadge } from 'react-bootstrap';

import { getBoxProps } from './Box';
import type { BoxProps } from './Box';

import { Text } from './Text';
import type { TextProps } from './Text';
import type { Values } from '@/types/Values';

const BadgeVariants = {
  DANGER: 'danger',
  SECONDARY: 'secondary',
} as const;

const BaseBadge = (props: TextProps) => <Text {...props} />;

type Props = BoxProps & {
  variant?: Values<typeof BadgeVariants>;
  children: React.ReactNode;
};

const Badge = ({ children, className, variant, ...props }: Props) => {
  return (
    <BootstrapBadge
      as={BaseBadge}
      className={className}
      variant={variant}
      {...getBoxProps(props)}
    >
      {children}
    </BootstrapBadge>
  );
};

Badge.defaultProps = {
  variant: BadgeVariants.DANGER,
};

export { Badge, BadgeVariants };
