import { Values } from '@/types/Values';

const CalsumFormats = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
} as const;

type CalsumFormat = Values<typeof CalsumFormats>;

export type { CalsumFormat };
export { CalsumFormats };
