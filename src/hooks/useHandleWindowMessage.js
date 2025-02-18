import { useCallback, useEffect, useRef } from 'react';

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

  const eventsMapRef = useRef(eventsMap);

  const internalHandler = useCallback((event) => {
    const { source, type, ...data } = event.data;
    if (source !== WindowMessageSources.UDB) return;
    if (eventsMapRef.current?.[type]) {
      eventsMapRef.current[type](data);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    window.addEventListener('message', internalHandler);
    return () => window.removeEventListener('message', internalHandler);
  }, [isClient, internalHandler]);
};

export { useHandleWindowMessage, WindowMessageTypes };
