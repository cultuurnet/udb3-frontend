import {
  globalAnnouncementsFixture,
  globalEventsToModerateFixture,
  globalUserPermissionsFixture,
  globalUserRolesFixture,
} from './fixtures/global.mjs';
import {
  labelsEditPageFixture,
  labelsNoResultsFixture,
  labelsOverviewPageFixture,
  labelsSearchResultsFixture,
} from './fixtures/labels.mjs';
import { termsFixture } from './fixtures/terms.mjs';

export const MOCK_PORT = 4010;

export const MOCK_UPSTREAMS = [
  {
    envVar: 'NEXT_PUBLIC_API_URL',
    fixtures: [
      {
        method: 'GET',
        path: '/user/permissions/',
        response: globalUserPermissionsFixture,
      },
      {
        method: 'GET',
        path: '/user/roles/',
        response: globalUserRolesFixture,
      },
      {
        method: 'GET',
        path: '/events/',
        query: (params) =>
          params.get('workflowStatus') === 'READY_FOR_VALIDATION',
        response: globalEventsToModerateFixture,
      },
      {
        method: 'GET',
        path: '/labels/',
        query: (params) => params.get('query') === 'verborgen',
        response: labelsSearchResultsFixture,
      },
      {
        method: 'GET',
        path: '/labels/',
        query: (params) => params.get('query') === 'geen-resultaten-mock',
        response: labelsNoResultsFixture,
      },
      {
        method: 'GET',
        path: '/labels/',
        response: labelsOverviewPageFixture,
      },
      {
        method: 'GET',
        path: `/labels/${labelsEditPageFixture.uuid}`,
        response: labelsEditPageFixture,
      },
    ],
  },
  {
    envVar: 'NEXT_PUBLIC_NEW_ANNOUNCEMENTS_URL',
    fixtures: [
      {
        method: 'GET',
        path: '/uitdatabank/articles.json',
        response: globalAnnouncementsFixture,
      },
    ],
  },
  {
    envVar: 'NEXT_PUBLIC_TAXONOMY_URL',
    fixtures: [
      {
        method: 'GET',
        path: /^\/+terms$/,
        response: termsFixture,
      },
    ],
  },
];
