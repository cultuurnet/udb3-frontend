import { Toaster as Sonner } from 'sonner';

import { Icon, Icons } from '@/ui/Icon';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="tw:toaster tw:group"
      icons={{
        success: <Icon name={Icons.CHECK_CIRCLE} className="tw:text-success" />,
        error: (
          <Icon name={Icons.TIMES_CIRCLE} className="tw:text-destructive" />
        ),
        warning: (
          <Icon name={Icons.EXCLAMATION_TRIANGLE} className="tw:text-warning" />
        ),
        info: <Icon name={Icons.INFO} className="tw:text-info" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'tw:bg-white/85 tw:backdrop-blur-sm tw:border tw:border-border tw:shadow-lg tw:rounded-udb tw:text-foreground',
          success: 'tw:bg-success-muted/90 tw:border-success',
          error: 'tw:bg-destructive-muted/90 tw:border-destructive',
          warning: 'tw:bg-warning-muted/90 tw:border-warning',
          info: 'tw:bg-info-muted/90 tw:border-info',
          closeButton: 'tw:bg-white tw:border-border',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
