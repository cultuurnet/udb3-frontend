import type { Offer } from './Offer';

type EventId = string;

type ProductionOnEvent = {
  id: string;
  title: string;
  otherEvents: EventId[];
};

type Event = Offer & {
  '@context': '/contexts/event';
  production?: ProductionOnEvent;
};

const isEvent = (value: unknown): value is Event => {
  return value['@context'] === '/contexts/event';
};

const isEvents = (value: unknown[]): value is Event[] => {
  return value?.[0]?.['@context'] === '/contexts/event';
};

export { isEvent, isEvents };
export type { Event };
