import getConfig from 'next/config';
import { useQuery } from 'react-query';
import type { UseQueryOptions } from 'react-query';

const getAnnouncements = async () => {
  const { publicRuntimeConfig } = getConfig();
  const res = await fetch(publicRuntimeConfig.newAnnouncementsUrl);
  return await res.json();
};

const useGetAnnouncements = (configuration?: UseQueryOptions) =>
  useQuery(['announcement'], getAnnouncements, configuration);

export { useGetAnnouncements };
