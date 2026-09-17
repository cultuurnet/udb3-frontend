const labelsOverviewPageFixture = {
  '@context': '/contexts/PagedCollection',
  '@type': 'PagedCollection',
  itemsPerPage: 10,
  totalItems: 5,
  member: [
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
  ],
};

const labelsEditPageFixture = labelsOverviewPageFixture.member[0];

const labelsSearchResultsFixture = {
  '@context': '/contexts/PagedCollection',
  '@type': 'PagedCollection',
  itemsPerPage: 10,
  totalItems: 1,
  member: [labelsOverviewPageFixture.member[1]],
};

const labelsNoResultsFixture = {
  '@context': '/contexts/PagedCollection',
  '@type': 'PagedCollection',
  itemsPerPage: 10,
  totalItems: 0,
  member: [],
};

export const labelsApiFixtures = [
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
