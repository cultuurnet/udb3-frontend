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
};

const useHandleWindowMessage = (eventsMap = {}) => {
  const isClient = useIsClient();

  const internalHandler = (event) => {
    const { source, type, ...data } = event.data;
    if (source !== WindowMessageSources.UDB) return;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    eventsMap?.[type]?.(data); // call handler when it exists
  };

  useEffect(() => {
    if (!isClient) return;
    window.addEventListener('message', internalHandler);
    return () => window.removeEventListener('message', internalHandler);
  }, [isClient]);
};

export { useHandleWindowMessage, WindowMessageTypes };
