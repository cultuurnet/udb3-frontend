import { useGetEventByIdQuery } from '@/hooks/api/events';

const useGetEvent = ({ id, onSuccess, enabled }) => {
  const getEventByIdQuery = useGetEventByIdQuery(
    { id },
    { onSuccess, enabled: !!id && !!enabled },
  );

  return getEventByIdQuery?.data;
};

export { useGetEvent };
