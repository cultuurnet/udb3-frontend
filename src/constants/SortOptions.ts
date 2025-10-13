import { Values } from '@/types/Values';

const SortOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

const SortField = {
  AVAILABLETO: 'availableTo',
  CREATED: 'created',
  COMPLETENESS: 'completeness',
} as const;

type SortOrderType = Values<typeof SortOrder>;

export { SortField, SortOrder };
export type { SortOrderType };
