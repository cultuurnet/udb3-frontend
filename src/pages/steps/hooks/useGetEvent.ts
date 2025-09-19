import { useGetEventByIdQuery } from '@/hooks/api/events';

const useGetEvent = ({ id, enabled }) => {
  const getEventByIdQuery = useGetEventByIdQuery(
    { id },
    { enabled: !!id && !!enabled },
  );

  return getEventByIdQuery?.data;
};

export { useGetEvent };
