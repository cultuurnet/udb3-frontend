import type { Offer } from './Offer';

type ProductionOnEvent = {
  id: string;
  title: string;
  otherEvents: string[];
};

type Event = Offer & {
  '@context': '/contexts/event';
  production?: ProductionOnEvent;
};

export type { Event };
