import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { ButtonProps, buttonVariants } from '@/ui/shadcn/button';
import { cn } from '@/ui/shadcn/utils';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('tw:mx-auto tw:flex tw:w-full tw:justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('tw:flex tw:flex-row tw:items-center tw:gap-1', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('tw:', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>;

const PaginationLink = ({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      'tw:no-underline tw:select-none',
      isActive
        ? 'tw:bg-primary tw:text-primary-foreground tw:border-primary tw:hover:bg-primary tw:hover:text-primary-foreground'
        : 'tw:hover:bg-udb-grey-1 tw:hover:text-foreground',
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const { t } = useTranslation();
  return (
    <PaginationLink
      aria-label={t('pagination.previous_aria')}
      size="default"
      className={cn(
        'tw:gap-1 tw:pl-2.5',
        props['aria-disabled']
          ? 'tw:cursor-not-allowed! tw:opacity-50 tw:hover:bg-transparent! tw:hover:text-current!'
          : 'tw:hover:bg-udb-grey-1 tw:hover:text-foreground',
        className,
      )}
      {...props}
    >
      <ChevronLeft className="tw:h-4 tw:w-4" />
      <span>{t('pagination.previous')}</span>
    </PaginationLink>
  );
};
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const { t } = useTranslation();
  return (
    <PaginationLink
      aria-label={t('pagination.next_aria')}
      size="default"
      className={cn(
        'tw:gap-1 tw:pr-2.5',
        props['aria-disabled']
          ? 'tw:cursor-not-allowed! tw:opacity-50 tw:hover:bg-transparent! tw:hover:text-current!'
          : 'tw:hover:bg-udb-grey-1 tw:hover:text-foreground',
        className,
      )}
      {...props}
    >
      <span>{t('pagination.next')}</span>
      <ChevronRight className="tw:h-4 tw:w-4" />
    </PaginationLink>
  );
};
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn(
      'tw:flex tw:h-9 tw:w-9 tw:items-center tw:justify-center',
      className,
    )}
    {...props}
  >
    <MoreHorizontal className="tw:h-4 tw:w-4" />
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
