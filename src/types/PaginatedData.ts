export type PaginatedData<T> = {
  '@context': string;
  '@type': string;
  itemsPerPage: number;
  totalItems: number;
  member: T;
};
