import { EventTypes } from '../../../src/constants/EventTypes.ts';
import { parseOfferId } from '../../../src/utils/parseOfferId.js';
import { vrtDaysFromNow } from '../pins/clock.mjs';
import {
  MODERATION_LABEL,
  moderatedOfferPermissionsFixture,
} from './global.mjs';
import { vrtMockImageUrls } from './images.mjs';
import { MOCK_API_ORIGIN, pagedCollection } from './mock-api.mjs';
import { vrtMockUitpasLocation } from './offers.mjs';
import { vrtMockOrganizers } from './organizers.mjs';

const PLACE_ID = 'vrt-mock-place-1';

// PlaceTypeahead sends `text=*<input>*`, so a story types exactly this.
const PLACE_TYPEAHEAD_SEARCH = 'VRT';

// What the API stores as the end of a permanent calendar.
const PERMANENT_AVAILABLE_TO = '2100-01-01T00:00:00+00:00';

const placeOpeningHours = [
  {
    opens: '00:00',
    closes: '23:59',
    dayOfWeek: ['monday', 'wednesday', 'friday'],
  },
];

// Both summaries are copied from a real place with placeOpeningHours: the
// list embeds lg/sm/xs, while the preview's calsum only ever asks for xl.
const placeCalendarSummary = {
  lg: 'Maandag van 0:00 tot 23:59\nDinsdag gesloten\nWoensdag van 0:00 tot 23:59\nDonderdag gesloten\nVrijdag van 0:00 tot 23:59\nZaterdag gesloten\nZondag gesloten',
  sm: 'Open op ma & wo & vr',
  xs: 'Open op ma & wo & vr',
};

const placeCalsumText = {
  xl: 'Maandag van 0:00 tot 23:59\nWoensdag van 0:00 tot 23:59\nVrijdag van 0:00 tot 23:59\n\nGesloten\nElke dinsdag gesloten\nElke donderdag gesloten\nElke zaterdag gesloten\nElke zondag gesloten\n',
};

const placeMediaObjects = [
  {
    '@id': `${MOCK_API_ORIGIN}/images/vrt-mock-image-6`,
    '@type': 'schema:ImageObject',
    contentUrl: vrtMockImageUrls.landscape,
    thumbnailUrl: vrtMockImageUrls.landscape,
    description: 'VRT mock afbeelding — locatie',
    copyrightHolder: 'VRT mock rechthebbende',
    inLanguage: 'nl',
  },
];

export const vrtMockPlace = {
  '@id': `${MOCK_API_ORIGIN}/places/${PLACE_ID}`,
  '@context': '/contexts/place',
  mainLanguage: 'nl',
  name: { nl: 'VRT mock locatie — zaal' },
  description: {
    nl: 'VRT mock beschrijving van de locatie, lang genoeg om over meer dan één regel te lopen.',
  },
  terms: [
    {
      id: EventTypes['Zaal of expohal'],
      domain: 'eventtype',
      label: 'VRT mock type — zaal',
    },
  ],
  address: {
    nl: {
      addressCountry: 'BE',
      addressLocality: 'VRT mock gemeente',
      postalCode: '1000',
      streetAddress: 'VRT mock straat 1',
    },
  },
  geo: { latitude: 50.85, longitude: 4.35 },
  calendarType: 'permanent',
  openingHours: placeOpeningHours,
  status: { type: 'Available' },
  bookingAvailability: { type: 'Available' },
  workflowStatus: 'APPROVED',
  availableFrom: vrtDaysFromNow(-30).toISOString(),
  availableTo: PERMANENT_AVAILABLE_TO,
  created: vrtDaysFromNow(-200).toISOString(),
  modified: vrtDaysFromNow(-10).toISOString(),
  creator: 'vrt-mock-user-1',
  labels: [MODERATION_LABEL],
  organizer: vrtMockOrganizers.owned,
  typicalAgeRange: '-',
  languages: ['nl'],
  completedLanguages: ['nl'],
  completeness: 96,
  contactPoint: {
    phone: ['+32 2 000 00 04'],
    email: ['vrt-mock-locatie@example.com'],
    url: ['https://vrt-mock-locatie.example.com'],
  },
  bookingInfo: {
    url: 'https://vrt-mock-locatie-tickets.example.com',
    urlLabel: { nl: 'VRT mock reservatielabel' },
    email: 'vrt-mock-locatie-reservatie@example.com',
    phone: '+32 2 000 00 05',
  },
  priceInfo: [
    {
      category: 'base',
      name: { nl: 'Basistarief', fr: 'Tarif de base', de: 'Basisrate' },
      price: 6,
      priceCurrency: 'EUR',
    },
    {
      category: 'tariff',
      name: { nl: 'VRT mock tarief — kinderen' },
      price: 3,
      priceCurrency: 'EUR',
    },
  ],
  mediaObject: placeMediaObjects,
  image: placeMediaObjects[0].contentUrl,
  videos: [],
};

const NO_IMAGE = { image: undefined, mediaObject: undefined };

const placeVariant = ({ id, nameNl, ...overrides }) => ({
  ...vrtMockPlace,
  '@id': `${MOCK_API_ORIGIN}/places/${id}`,
  name: { nl: nameNl },
  ...overrides,
});

const withCalendarSummary = (place) => ({
  ...place,
  calendarSummary: { nl: { text: placeCalendarSummary } },
});

const placeListMembers = [
  vrtMockPlace,
  placeVariant({
    id: 'vrt-mock-place-8',
    nameNl: 'VRT mock locatie — zonder afbeelding',
    workflowStatus: 'READY_FOR_VALIDATION',
    completeness: 70,
    ...NO_IMAGE,
  }),
  placeVariant({
    id: 'vrt-mock-place-9',
    nameNl: 'VRT mock locatie — concept',
    workflowStatus: 'DRAFT',
    availableFrom: undefined,
    completeness: 40,
    ...NO_IMAGE,
  }),
].map(withCalendarSummary);

// Names contain PLACE_TYPEAHEAD_SEARCH: the Typeahead filters its options
// client side on the input too. The UiTPAS one is also a recent-location card
// on the same step, so it has to be the same place.
const placeTypeaheadMembers = [vrtMockPlace, vrtMockUitpasLocation];

const placesServedById = [...placeListMembers, vrtMockUitpasLocation];

const withoutCalendarSummary = ({ calendarSummary, ...place }) => place;

const CALENDAR_SUMMARY_CONTENT_TYPE = 'text/plain; charset=utf-8';

const ANY_PLACE_PATH = /^\/places\/[^/]+$/;
const ANY_PLACE_CALENDAR_SUMMARY_PATH = /^\/places\/[^/]+\/calsum$/;
const ANY_PLACE_PERMISSIONS_PATH = /^\/places\/[^/]+\/permissions$/;

const placeByIdFixtures = placesServedById.map((place) => ({
  method: 'GET',
  path: `/places/${parseOfferId(place['@id'])}`,
  response: withoutCalendarSummary(place),
}));

// The by-creator list puts the signed-in user's id in q, so it matches on
// path alone; the typeahead is the only caller sending this text.
export const placesApiFixtures = [
  {
    method: 'GET',
    path: '/places/',
    query: (params) => params.get('text') === `*${PLACE_TYPEAHEAD_SEARCH}*`,
    response: pagedCollection(placeTypeaheadMembers),
  },
  {
    method: 'GET',
    path: '/places/',
    response: pagedCollection(placeListMembers, 14),
  },
  {
    method: 'GET',
    path: ANY_PLACE_CALENDAR_SUMMARY_PATH,
    contentType: CALENDAR_SUMMARY_CONTENT_TYPE,
    response: (params) =>
      placeCalsumText[params.get('format')] ?? placeCalsumText.xl,
  },
  {
    method: 'GET',
    path: ANY_PLACE_PERMISSIONS_PATH,
    response: moderatedOfferPermissionsFixture,
  },
  ...placeByIdFixtures,
  {
    method: 'GET',
    path: ANY_PLACE_PATH,
    response: vrtMockPlace,
  },
];
