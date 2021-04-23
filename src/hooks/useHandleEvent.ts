import { useEffect } from 'react';
import { useIsClient } from './useIsClient';
import type { Values } from '@/types/Values';

const EventTypes = {
  NAVIGATE_PREVIOUS_PAGE: 'popstate',
} as const;

type EventsMap = {
  [K in Values<typeof EventTypes>]?: EventListenerOrEventListenerObject;
};

const useHandleEvent = (eventsMap: EventsMap = {}) => {
  const isClient = useIsClient();
  useEffect(() => {
    if (!isClient) return;
    Object.entries(eventsMap).forEach(([type, handler]) => {
      window.addEventListener(type, handler);
    });
    return () => {
      Object.entries(eventsMap).forEach(([type, handler]) => {
        window.removeEventListener(type, handler);
      });
    };
  }, [isClient]);
};

export { useHandleEvent, EventTypes };
