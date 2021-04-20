import { OfferStatus } from '@/constants/OfferStatus';
import { Values } from './Values';

type Type = Values<typeof OfferStatus>;

type Reason = { [languages: string]: string };

type OfferStatus = {
  type: Type;
  reason?: Reason;
};

export type { OfferStatus, Type, Reason };
