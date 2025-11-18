import getConfig from 'next/config';

import { FeatureFlags } from './hooks/useFeatureFlag';
import type { SupportedLanguages } from './i18n';
import type { Values } from './types/Values';

const tabOptions = ['events', 'organizers', 'places'];

type Environment = 'development' | 'acceptance' | 'testing' | 'production';

const createDashboardRedirects = (environment: Environment) => {
  return [
    {
      source: '/dashboard',
      destination: '/dashboard?tab=events&page=1&sort=created_desc',
      permanent: environment !== 'development',
    },
    {
      source: '/events',
      destination: '/dashboard?tab=events&page=1&sort=created_desc',
      permanent: environment !== 'development',
    },
    {
      source: '/organizers',
      destination: '/dashboard?tab=organizers&page=1&sort=created_desc',
      permanent: environment !== 'development',
    },
    {
      source: '/places',
      destination: '/dashboard?tab=places&page=1&sort=created_desc',
      permanent: environment !== 'development',
    },
    ...tabOptions.map((tabName) => {
      const source = `/dashboard?tab=${tabName}`;
      return {
        source,
        destination: `${source}&page=1`,
        permanent: environment !== 'development',
      };
    }),
  ];
};

const { publicRuntimeConfig } = getConfig();

const getRedirects = (
  environment: Environment,
  language: Values<typeof SupportedLanguages> = 'nl',
) => [
  // Only make the permanent redirects really permanent in environments other
  // than development, so we don't get permanent redirects on localhost which
  // may conflict with other projects.
  {
    source: '/event/:eventId/status',
    destination: '/events/:eventId/availability',
    permanent: environment !== 'development',
  },
  {
    source: '/place/:placeId/status',
    destination: '/places/:placeId/availability',
    permanent: environment !== 'development',
  },
  {
    source: '/events/:eventId/status',
    destination: '/events/:eventId/availability',
    permanent: environment !== 'development',
  },
  {
    source: '/places/:placeId/status',
    destination: '/places/:placeId/availability',
    permanent: environment !== 'development',
  },
  {
    source: '/event/:eventId/edit',
    destination: '/events/:eventId/edit',
    permanent: false,
  },
  {
    source: '/event/:eventId/duplicate',
    destination: '/events/:eventId/duplicate',
    permanent: false,
    featureFlag: FeatureFlags.REACT_DUPLICATE,
  },
  {
    source: '/manage/roles/overview',
    destination: '/manage/roles',
    permanent: false,
    featureFlag: FeatureFlags.REACT_ROLES_OVERVIEW,
  },
  {
    source: '/manage/users/overview',
    destination: '/manage/users',
    permanent: false,
    featureFlag: FeatureFlags.REACT_USERS_SEARCH,
  },
  {
    source: '/manage/labels/overview',
    destination: '/manage/labels',
    permanent: environment !== 'development',
  },
  {
    source:
      '/manage/labels/:labelId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})',
    destination: '/manage/labels/:labelId/edit',
    permanent: false,
    featureFlag: FeatureFlags.REACT_LABELS_CREATE_EDIT,
  },
  {
    source: '/place/:placeId/edit',
    destination: '/places/:placeId/edit',
    permanent: false,
  },
  {
    source: '/organizer',
    destination: '/organizers/create',
    permanent: false,
  },
  {
    source: '/organizer/:organizerId/edit',
    destination: '/organizers/:organizerId/edit',
    permanent: false,
  },
  {
    source: '/organizer/:organizerId/preview',
    destination: '/organizers/:organizerId/preview',
    permanent: false,
  },
  {
    source: '/organizer/:organizerId/ownerships',
    destination: '/organizers/:organizerId/ownerships',
    permanent: false,
  },
  publicRuntimeConfig.ownershipEnabled === 'true' && {
    source: '/manage/organizations',
    destination: '/search?tab=organizers',
    permanent: false,
  },
  publicRuntimeConfig.ownershipEnabled === 'false' && {
    source: '/search?tab=organizers',
    destination: '/404',
    permanent: false,
  },
  {
    source: '/:language/copyright',
    destination: '/copyright',
    permanent: environment !== 'development',
  },
  {
    source: '/event',
    destination: '/create?scope=events',
    permanent: false,
  },
  ...(language !== 'nl'
    ? [
        {
          source: '/manage/movies/create',
          destination: '/dashboard',
          permanent: false,
        },
      ]
    : []),
  ...createDashboardRedirects(environment),
];

export { getRedirects };
