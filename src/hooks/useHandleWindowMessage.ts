import { useEffect } from 'react';
import { useIsClient } from './useIsClient';

const WindowMessageSources = {
  UDB: 'UDB',
};

const WindowMessageTypes = {
  URL_CHANGED: 'URL_CHANGED',
  URL_UNKNOWN: 'URL_UNKNOWN',
  JOB_ADDED: 'JOB_ADDED',
  HTTP_ERROR_CODE: 'HTTP_ERROR_CODE',
} as const;

type Values<T> = T[keyof T];

type EventsMap = {
  [K in Values<typeof WindowMessageTypes>]?: () => void;
};

const useHandleWindowMessage = (eventsMap: EventsMap = {}) => {
  const isClient = useIsClient();

  const internalHandler = (event) => {
    const { source, type, ...data } = event.data;
    if (source !== WindowMessageSources.UDB) return;
    eventsMap?.[type]?.(data); // call handler when it exists
  };

  useEffect(() => {
    if (!isClient) return;
    window.addEventListener('message', internalHandler);
    return () => window.removeEventListener('message', internalHandler);
  }, [isClient]);
};

export { useHandleWindowMessage, WindowMessageTypes };
