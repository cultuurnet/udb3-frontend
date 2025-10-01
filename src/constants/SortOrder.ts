import { Values } from '@/types/Values';

const SortOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

type SortOrderType = Values<typeof SortOrder>;

export { SortOrder };
export type { SortOrderType };
