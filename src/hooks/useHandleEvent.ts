import { useEffect } from 'react';
import { useIsClient } from './useIsClient';

const EventTypes = {
  NAVIGATE_PREVIOUS_PAGE: 'popstate',
};

const useHandleEvent = (eventsMap = {}) => {
  const isClient = useIsClient();
  useEffect(() => {
    if (!isClient) return;
    Object.entries(eventsMap).forEach(([type, handler]) => {
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      window.addEventListener(type, handler);
    });
    return () => {
      Object.entries(eventsMap).forEach(([type, handler]) => {
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        window.removeEventListener(type, handler);
      });
    };
  }, [isClient]);
};

export { useHandleEvent, EventTypes };
