import { cn } from '@/ui/shadcn/utils';

import { Icon, Icons } from '../Icon';

function Spinner({
  className,
  width,
  height,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <Icon
      name={Icons.CHECK_NOTCH}
      role="status"
      aria-label="Loading"
      className={cn('tw:animate-spin', className)}
      width={width}
      height={height}
    />
  );
}

export { Spinner };
