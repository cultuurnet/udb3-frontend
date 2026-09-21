import { pagedCollection } from './mock-api.mjs';

const labelsOverviewMembers = [
  {
    uuid: 'vrt-mock-label-1',
    name: 'VRT mock label — normaal',
    visibility: 'visible',
    privacy: 'public',
    excluded: false,
  },
  {
    uuid: 'vrt-mock-label-2',
    name: 'VRT mock label — verborgen',
    visibility: 'invisible',
    privacy: 'public',
    excluded: false,
  },
  {
    uuid: 'vrt-mock-label-3',
    name: 'VRT mock label — voorbehouden',
    visibility: 'visible',
    privacy: 'private',
    excluded: false,
  },
  {
    uuid: 'vrt-mock-label-4',
    name: 'VRT mock label — uitgesloten',
    visibility: 'visible',
    privacy: 'public',
    excluded: true,
  },
  {
    uuid: 'vrt-mock-label-5',
    name: 'VRT mock label — alle statussen',
    visibility: 'invisible',
    privacy: 'private',
    excluded: true,
  },
];

const labelsOverviewPageFixture = pagedCollection(labelsOverviewMembers, 10);

const labelsEditPageFixture = labelsOverviewMembers[0];

const labelsSearchResultsFixture = pagedCollection(
  [labelsOverviewMembers[1]],
  10,
);

const labelsSuggestionsFixture = pagedCollection(
  [
    {
      uuid: 'vrt-mock-suggestie-1',
      name: 'vrt-mock-suggestie-cultuur',
      visibility: 'visible',
      privacy: 'public',
      excluded: false,
    },
    {
      uuid: 'vrt-mock-suggestie-2',
      name: 'vrt-mock-suggestie-jeugd',
      visibility: 'visible',
      privacy: 'public',
      excluded: false,
    },
    {
      uuid: 'vrt-mock-suggestie-3',
      name: 'vrt-mock-suggestie-sport',
      visibility: 'visible',
      privacy: 'public',
      excluded: false,
    },
  ],
  6,
);

const labelsNoResultsFixture = pagedCollection([], 10);

export const labelsApiFixtures = [
  {
    method: 'GET',
    path: '/labels/',
    query: (params) => params.get('suggestion') === 'true',
    response: labelsSuggestionsFixture,
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
];
