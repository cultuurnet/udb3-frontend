import { useQuery } from '@tanstack/react-query';
import getConfig from 'next/config';

const getAnnouncements = async ({ queryKey }) => {
  const [_key, options] = queryKey;
  const url = new URL(process.env.NEXT_PUBLIC_NEW_ANNOUNCEMENTS_URL);
  if (options.includeDisabled) {
    url.searchParams.append('includeDisabled', '1');
  }
  const res = await fetch(url.toString());
  return await res.json();
};

const useGetAnnouncementsQuery = (configuration = {}) => {
  return useQuery({
    queryKey: ['announcement', { includeDisabled: false }],
    queryFn: getAnnouncements,
    ...configuration,
  });
};

export { useGetAnnouncementsQuery };
