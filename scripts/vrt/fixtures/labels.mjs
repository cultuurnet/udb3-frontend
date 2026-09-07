export const labelsOverviewPageFixture = {
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

export const labelsEditPageFixture = labelsOverviewPageFixture.member[0];

export const labelsSearchResultsFixture = {
  '@context': '/contexts/PagedCollection',
  '@type': 'PagedCollection',
  itemsPerPage: 10,
  totalItems: 1,
  member: [labelsOverviewPageFixture.member[1]],
};

export const labelsNoResultsFixture = {
  '@context': '/contexts/PagedCollection',
  '@type': 'PagedCollection',
  itemsPerPage: 10,
  totalItems: 0,
  member: [],
};
