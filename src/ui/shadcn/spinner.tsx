import { Icon, Icons } from '@/ui/Icon';
import { cn } from '@/ui/shadcn/utils';

function Spinner({ className }: { className?: string }) {
  return (
    <span role="status" aria-label="Loading">
      <Icon
        name={Icons.CHECK_NOTCH}
        className={cn('tw:animate-spin', className)}
      />
    </span>
  );
}

export { Spinner };
