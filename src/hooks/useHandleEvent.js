import { useEffect, useRef } from 'react';

import { useIsClient } from './useIsClient';

const EventTypes = {
  NAVIGATE_PREVIOUS_PAGE: 'popstate',
};

const useHandleEvent = (eventsMap = {}) => {
  const isClient = useIsClient();
  const eventsMapRef = useRef(eventsMap);

  useEffect(() => {
    if (!isClient) return;

    const eventsMap = eventsMapRef.current;

    Object.entries(eventsMap.current).forEach(([type, handler]) => {
      window.addEventListener(type, handler);
    });
    return () => {
      Object.entries(eventsMap.current).forEach(([type, handler]) => {
        window.removeEventListener(type, handler);
      });
    };
  }, [isClient]);
};

export { EventTypes, useHandleEvent };
