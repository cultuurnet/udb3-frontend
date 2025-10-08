import getConfig from 'next/config';
import { useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';

const SocketMessageTypes = {
  JOB_STARTED: 'job_started',
  JOB_INFO: 'job_info',
  JOB_FINISHED: 'job_finished',
  JOB_FAILED: 'job_failed',
};

const useHandleSocketMessage = (eventsMap = {}) => {
  const { publicRuntimeConfig } = getConfig();

  const eventsMapRef = useRef(eventsMap);

  useEffect(() => {
    const socket = socketIOClient(process.env.NEXT_PUBLIC_SOCKET_URL);
    Object.entries(eventsMapRef.current).forEach(([event, handler]) => {
      socket.on(event, handler);
    });
    return () => socket.close();
  }, [process.env.NEXT_PUBLIC_SOCKET_URL]);
};

export { SocketMessageTypes, useHandleSocketMessage };
