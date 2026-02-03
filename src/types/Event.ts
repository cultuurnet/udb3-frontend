import { AudienceTypes } from '@/constants/AudienceType';

import type { BaseOffer } from './Offer';
import type { Place } from './Place';
import { Values } from './Values';

type EventId = string;

type ProductionOnEvent = {
  id: string;
  title: string;
  otherEvents: EventId[];
};

const AttendanceMode = {
  OFFLINE: 'offline',
  ONLINE: 'online',
  MIXED: 'mixed',
} as const;

const BookingAvailability = {
  AVAILABLE: 'Available',
  UNAVAILABLE: 'Unavailable',
} as const;

type Event = BaseOffer & {
  '@context': '/contexts/event';
  location: Place;
  onlineUrl?: string;
  production?: ProductionOnEvent;
  attendanceMode: Values<typeof AttendanceMode>;
  bookingAvailability: { type: Values<typeof BookingAvailability> };
};

const isEvent = (value: unknown): value is Event => {
  if (typeof value?.['@context'] !== 'string') return false;
  return value['@context'].endsWith('/event');
};

const areEvents = (value: unknown): value is Event[] => {
  if (!Array.isArray(value)) return false;
  return value.every(isEvent);
};

const isCultuurkuur = (value: Event): boolean => {
  return (
    value.audience && value.audience.audienceType === AudienceTypes.EDUCATION
  );
};

export {
  areEvents,
  AttendanceMode,
  BookingAvailability,
  isCultuurkuur,
  isEvent,
};
export type { Event, EventId };
