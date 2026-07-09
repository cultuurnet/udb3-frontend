import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';

import { PaginationLegacy } from './PaginationLegacy';
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './shadcn/pagination';

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  perPage: number;
  limitPages?: number;
  onChangePage?: (newValue: number) => void;
};

const PaginationShadcn = ({
  currentPage = 1,
  totalItems = 1,
  perPage = 10,
  limitPages = 5,
  onChangePage,
}: PaginationProps) => {
  const { t } = useTranslation();

  const pages = useMemo(() => {
    const pages = [];
    for (let i = 0; i < Math.ceil(totalItems / perPage); i++) {
      pages.push(i + 1);
    }
    return pages;
  }, [totalItems, perPage]);

  const renderPage = (page: number) => {
    const isActive = page === currentPage;
    return (
      <PaginationItem key={page}>
        <PaginationLink
          isActive={isActive}
          aria-label={t(
            isActive ? 'pagination.current_page_aria' : 'pagination.page_aria',
            { page },
          )}
          onClick={() => onChangePage?.(page)}
        >
          {page}
        </PaginationLink>
      </PaginationItem>
    );
  };

  const { startPages, hasEllipsis, windowPages } = useMemo(() => {
    const totalPages = pages.length;
    const windowSize = limitPages - 2;

    if (totalPages <= limitPages) {
      return { startPages: pages, hasEllipsis: false, windowPages: [] };
    }

    if (currentPage <= limitPages - 1) {
      return {
        startPages: pages.slice(0, limitPages),
        hasEllipsis: false,
        windowPages: [],
      };
    }

    const windowStart = Math.min(
      currentPage - Math.floor(windowSize / 2),
      totalPages - windowSize + 1,
    );

    return {
      startPages: [1],
      hasEllipsis: true,
      windowPages: Array.from(
        { length: windowSize },
        (_, i) => windowStart + i,
      ),
    };
  }, [pages, currentPage, limitPages]);

  if (pages.length <= 1) return null;

  return (
    <PaginationRoot>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onChangePage?.(currentPage - 1)}
            disabled={currentPage === 1}
          />
        </PaginationItem>
        {startPages.map(renderPage)}
        {hasEllipsis && (
          <PaginationItem key="ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {windowPages.map(renderPage)}
        <PaginationItem>
          <PaginationNext
            onClick={() => onChangePage?.(currentPage + 1)}
            disabled={currentPage === pages.length}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
};

const Pagination = (props: PaginationProps) => {
  const [isShadcnMigrationEnabled] = useFeatureFlag(
    FeatureFlags.SHADCN_MIGRATION,
  );

  if (!isShadcnMigrationEnabled) return <PaginationLegacy {...props} />;

  return <PaginationShadcn {...props} />;
};

export { Pagination };
