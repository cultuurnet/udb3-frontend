import { vrtDaysFromNow } from '../pins/clock.mjs';
import { MOCK_API_ORIGIN, pagedCollection } from './mock-api.mjs';
import { UITPAS_ORGANIZER_LABEL, vrtMockOrganizers } from './organizers.mjs';

const placeUri = (id) => `${MOCK_API_ORIGIN}/places/${id}`;

const vrtMockLocation = ({ id, nameNl, street, zip, city, ...overrides }) => ({
  '@id': placeUri(id),
  '@context': '/contexts/place',
  mainLanguage: 'nl',
  name: { nl: nameNl },
  address: {
    nl: {
      addressCountry: 'BE',
      addressLocality: city,
      postalCode: zip,
      streetAddress: street,
    },
  },
  labels: [],
  hiddenLabels: [],
  workflowStatus: 'APPROVED',
  ...overrides,
});

// useRecentLocations keeps the first four that survive its filter.
const recentLocations = [
  vrtMockLocation({
    id: 'vrt-mock-place-2',
    nameNl: 'VRT mock locatie — cultuurcentrum',
    street: 'VRT mock straat 4',
    zip: '1000',
    city: 'VRT mock gemeente',
  }),
  vrtMockLocation({
    id: 'vrt-mock-place-3',
    nameNl: 'VRT mock locatie — bibliotheek',
    street: 'VRT mock straat 5',
    zip: '9000',
    city: 'VRT mock tweede gemeente',
  }),
  // Location cards carry the UiTPAS badge too, not just organizer ones.
  vrtMockLocation({
    id: 'vrt-mock-place-4',
    nameNl: 'VRT mock locatie — UiTPAS',
    street: 'VRT mock straat 6',
    zip: '9000',
    city: 'VRT mock tweede gemeente',
    labels: [UITPAS_ORGANIZER_LABEL],
  }),
  vrtMockLocation({
    id: 'vrt-mock-place-5',
    nameNl:
      'VRT mock locatie — met een naam die lang genoeg is om afgekapt te worden',
    street: 'VRT mock straat 7',
    zip: '3000',
    city: 'VRT mock derde gemeente',
  }),
];

const filteredOutLocations = [
  vrtMockLocation({
    id: 'vrt-mock-place-6',
    nameNl: 'Online',
    street: 'VRT mock straat 8',
    zip: '1000',
    city: 'VRT mock gemeente',
  }),
  vrtMockLocation({
    id: 'vrt-mock-place-7',
    nameNl: 'VRT mock locatie — afgewezen',
    street: 'VRT mock straat 9',
    zip: '1000',
    city: 'VRT mock gemeente',
    workflowStatus: 'REJECTED',
  }),
];

const vrtMockOffer = ({ id, nameNl, location, organizer, daysAgo }) => ({
  '@id': `${MOCK_API_ORIGIN}/events/${id}`,
  '@context': '/contexts/event',
  mainLanguage: 'nl',
  name: { nl: nameNl },
  location,
  organizer,
  workflowStatus: 'APPROVED',
  created: vrtDaysFromNow(daysAgo - 30).toISOString(),
  modified: vrtDaysFromNow(daysAgo).toISOString(),
});

// Order is behaviour: both readers keep the first few distinct entries.
const offerMembers = [
  vrtMockOffer({
    id: 'vrt-mock-offer-1',
    nameNl: 'VRT mock aanbod — eerste',
    location: recentLocations[0],
    organizer: vrtMockOrganizers.owned,
    daysAgo: -1,
  }),
  // Same organizer again, so the dedupe is exercised rather than assumed.
  vrtMockOffer({
    id: 'vrt-mock-offer-2',
    nameNl: 'VRT mock aanbod — tweede',
    location: recentLocations[1],
    organizer: vrtMockOrganizers.owned,
    daysAgo: -3,
  }),
  vrtMockOffer({
    id: 'vrt-mock-offer-3',
    nameNl: 'VRT mock aanbod — van een andere gebruiker',
    location: recentLocations[2],
    organizer: vrtMockOrganizers.suggested,
    daysAgo: -5,
  }),
  vrtMockOffer({
    id: 'vrt-mock-offer-4',
    nameNl: 'VRT mock aanbod — UiTPAS',
    location: recentLocations[3],
    organizer: vrtMockOrganizers.uitpas,
    daysAgo: -8,
  }),
  vrtMockOffer({
    id: 'vrt-mock-offer-5',
    nameNl: 'VRT mock aanbod — online',
    location: filteredOutLocations[0],
    organizer: vrtMockOrganizers.owned,
    daysAgo: -13,
  }),
  vrtMockOffer({
    id: 'vrt-mock-offer-6',
    nameNl: 'VRT mock aanbod — afgewezen locatie',
    location: filteredOutLocations[1],
    organizer: vrtMockOrganizers.owned,
    daysAgo: -21,
  }),
];

const offersByCreatorFixture = pagedCollection(offerMembers, 20);

// Path only: all three callers interpolate the signed-in user's id into q.
export const offersApiFixtures = [
  {
    method: 'GET',
    path: '/offers/',
    response: offersByCreatorFixture,
  },
];
