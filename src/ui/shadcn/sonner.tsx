import { Toaster as Sonner } from 'sonner';

import { Icon, Icons } from '@/ui/Icon';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="tw:toaster tw:group"
      icons={{
        success: (
          <Icon
            name={Icons.CHECK_CIRCLE}
            className="tw:text-udb-main-positive-green"
          />
        ),
        error: (
          <Icon name={Icons.TIMES_CIRCLE} className="tw:text-udb-danger" />
        ),
        warning: (
          <Icon
            name={Icons.EXCLAMATION_TRIANGLE}
            className="tw:text-udb-warning"
          />
        ),
        info: <Icon name={Icons.INFO} className="tw:text-primary" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'tw:bg-white/85 tw:backdrop-blur-sm tw:border tw:border-border tw:shadow-lg tw:rounded-udb tw:text-foreground',
          success:
            'tw:bg-udb-main-light-green/90 tw:border-udb-main-positive-green',
          error: 'tw:bg-udb-pink-1/90 tw:border-udb-danger',
          warning: 'tw:bg-udb-orange-1/20 tw:border-udb-warning',
          info: 'tw:bg-accent/90 tw:border-primary',
          closeButton: 'tw:bg-white tw:border-border',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
