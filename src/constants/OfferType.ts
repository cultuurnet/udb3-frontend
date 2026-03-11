import { Values } from '@/types/Values';

const OfferTypes = {
  EVENTS: 'events',
  PLACES: 'places',
} as const;

const OfferContexts = {
  EVENT: 'event',
  PLACES: 'place',
} as const;

const ScopeTypes = { ...OfferTypes, ORGANIZERS: 'organizers' } as const;

type OfferType = Values<typeof OfferTypes>;
type OfferContext = Values<typeof OfferContexts>;
type Scope = Values<typeof ScopeTypes>;

export type { OfferContext, OfferType, Scope };
export { OfferContexts, OfferTypes, ScopeTypes };
