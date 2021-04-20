import { Card as BootstrapCard } from 'react-bootstrap';
import { Stack, getStackProps } from './Stack';
import type { StackProps } from './Stack';

type Props = StackProps & {
  children: React.ReactNode;
};

const Card = ({ children, className, ...props }: Props) => {
  return (
    <BootstrapCard
      as={Stack}
      className={className}
      {...getStackProps(props)}
      css={`
        &.card {
          border: none;
        }
      `}
    >
      {children}
    </BootstrapCard>
  );
};

export { Card };
