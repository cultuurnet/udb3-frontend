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
  OFFER_MODERATED: 'OFFER_MODERATED',
  OPEN_ANNOUNCEMENT_MODAL: 'OPEN_ANNOUNCEMENT_MODAL',
  PAGE_HEIGHT: 'PAGE_HEIGHT',
};

const useHandleWindowMessage = (eventsMap = {}) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);
};

export { useHandleWindowMessage, WindowMessageTypes };
