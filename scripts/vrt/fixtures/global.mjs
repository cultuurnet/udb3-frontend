export const globalUserPermissionsFixture = [
  'AANBOD_BEWERKEN',
  'AANBOD_MODEREREN',
  'AANBOD_VERWIJDEREN',
  'AANBOD_HISTORIEK',
  'ORGANISATIES_BEWERKEN',
  'ORGANISATIES_BEHEREN',
  'LABELS_BEHEREN',
  'VOORZIENINGEN_BEWERKEN',
  'PRODUCTIES_AANMAKEN',
  'FILMS_AANMAKEN',
  'MEDIA_UPLOADEN',
];

export const globalUserRolesFixture = [
  {
    uuid: 'vrt-mock-role-1',
    name: 'VRT mock rol — zonder constraint',
    permissions: ['PRODUCTIES_AANMAKEN', 'FILMS_AANMAKEN'],
  },
  {
    uuid: 'vrt-mock-role-2',
    name: 'VRT mock rol — organisatie',
    permissions: ['ORGANISATIES_BEWERKEN', 'AANBOD_BEWERKEN'],
    constraints: {
      v3: '(id:vrt-mock-organizer-1 OR (organizer.id:vrt-mock-organizer-1 AND _type:event))',
    },
  },
  {
    uuid: 'vrt-mock-role-3',
    name: 'VRT mock rol — tweede organisatie',
    permissions: ['ORGANISATIES_BEWERKEN', 'AANBOD_BEWERKEN'],
    constraints: {
      v3: '(id:vrt-mock-organizer-2 OR (organizer.id:vrt-mock-organizer-2 AND _type:event))',
    },
  },
  {
    uuid: 'vrt-mock-role-4',
    name: 'VRT mock rol — moderatie',
    permissions: ['AANBOD_MODEREREN', 'AANBOD_BEWERKEN', 'AANBOD_HISTORIEK'],
    constraints: { v3: 'label:vrt-mock-moderatie' },
  },
];

export const globalEventsToModerateFixture = {
  '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
  '@type': 'PagedCollection',
  itemsPerPage: 1,
  totalItems: 3,
  member: [],
};

export const globalAnnouncementsFixture = {
  data: [
    { uid: 'vrt-mock-announcement-1', title: 'VRT mock announcement 1' },
    { uid: 'vrt-mock-announcement-2', title: 'VRT mock announcement 2' },
  ],
};
