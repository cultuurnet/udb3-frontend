import getConfig from 'next/config';
import { useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import type { Values } from '@/types/Values';

const SocketMessageTypes = {
  JOB_STARTED: 'job_started',
  JOB_INFO: 'job_info',
  JOB_FINISHED: 'job_finished',
  JOB_FAILED: 'job_failed',
} as const;

type EventsMap = {
  [K in Values<typeof SocketMessageTypes>]: (...args: unknown[]) => unknown;
};

const useHandleSocketMessage = (eventsMap: EventsMap) => {
  const { publicRuntimeConfig } = getConfig();

  useEffect((): (() => void) => {
    const socket = socketIOClient(publicRuntimeConfig.socketUrl);
    Object.entries(eventsMap).forEach(([event, handler]) => {
      socket.on(event, handler as Function);
    });
    return () => socket.close();
  }, []);
};

export { useHandleSocketMessage, SocketMessageTypes };
