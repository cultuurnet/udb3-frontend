import { EventTypes } from '../../../src/constants/EventTypes.ts';
import { PermissionTypes } from '../../../src/constants/PermissionTypes.ts';
import { formatPermission } from '../../../src/utils/formatPermission.ts';
import { parseOfferId } from '../../../src/utils/parseOfferId.js';
import { vrtDaysFromNow } from '../pins/clock.mjs';
import { vrtMockImageUrls } from './images.mjs';

const EVENT_ID = 'vrt-mock-event-1';
const LOCATION_ID = 'vrt-mock-place-1';
const ORGANIZER_ID = 'vrt-mock-organizer-1';

// Never resolves (RFC 2606); an @id is only ever split for its last segment.
const MOCK_API_ORIGIN = 'https://vrt-mock-api.invalid';

// A real id, unlike the rest here; themes have no constant of their own.
const CLASSICAL_MUSIC_THEME_ID = '1.8.1.0.0';

const vrtDayAtUtcTime = (days, utcHours, utcMinutes = 0) => {
  const moment = vrtDaysFromNow(days);
  moment.setUTCHours(utcHours, utcMinutes, 0, 0);
  return moment.toISOString();
};

const eventSubEvents = [
  {
    '@type': 'Event',
    startDate: vrtDayAtUtcTime(30, 20),
    endDate: vrtDayAtUtcTime(30, 22, 30),
    status: { type: 'Available' },
    bookingAvailability: { type: 'Unavailable' },
  },
  {
    '@type': 'Event',
    startDate: vrtDayAtUtcTime(32, 20),
    endDate: vrtDayAtUtcTime(32, 22, 30),
    status: {
      type: 'TemporarilyUnavailable',
      reason: { nl: 'VRT mock reden — tweede datum uitgesteld' },
    },
    bookingAvailability: { type: 'Available' },
  },
];

// Every summary in this file is copied from a real response, never generated:
// the API writes them server side, down to the notes above, and Intl
// reproduces none of that.
const eventCalendarSummary = {
  lg: 'Woensdag 15 juli 2026 (Volzet of uitverkocht)\nVrijdag 17 juli 2026 (uitgesteld)',
  md: 'Wo 15 juli 2026 (Volzet of uitverkocht)\nVr 17 juli 2026 (uitgesteld)',
  sm: 'Wo 15 jul - vr 17 jul',
  xs: '15 jul - 17 jul',
};

const firstSubEvent = eventSubEvents[0];
const lastSubEvent = eventSubEvents.at(-1);

const calendarTypeFor = (subEvents) =>
  subEvents.length > 1 ? 'multiple' : 'single';

const availableSubEventsOn = (dayOffsets) =>
  dayOffsets.map((days) => ({
    '@type': 'Event',
    startDate: vrtDayAtUtcTime(days, 20),
    endDate: vrtDayAtUtcTime(days, 22, 30),
    status: { type: 'Available' },
    bookingAvailability: { type: 'Available' },
  }));

// Only the calsum endpoint serves md; the list request asks for lg/sm/xs.
const withoutMediumFormat = ({ md, ...text }) => text;

const eventLocationFixture = {
  '@id': `${MOCK_API_ORIGIN}/places/${LOCATION_ID}`,
  '@context': '/contexts/place',
  mainLanguage: 'nl',
  name: { nl: 'VRT mock locatie — zaal' },
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
  workflowStatus: 'APPROVED',
};

const eventOrganizerFixture = {
  '@id': `${MOCK_API_ORIGIN}/organizers/${ORGANIZER_ID}`,
  '@context': '/contexts/organizer',
  mainLanguage: 'nl',
  name: { nl: 'VRT mock organisatie' },
  address: {
    nl: {
      addressCountry: 'BE',
      addressLocality: 'VRT mock gemeente',
      postalCode: '1000',
      streetAddress: 'VRT mock straat 2',
    },
  },
  labels: [],
  hiddenLabels: [],
};

const eventMediaObjects = [
  {
    '@id': `${MOCK_API_ORIGIN}/images/vrt-mock-image-1`,
    '@type': 'schema:ImageObject',
    contentUrl: vrtMockImageUrls.square,
    thumbnailUrl: vrtMockImageUrls.square,
    description: 'VRT mock afbeelding — hoofdafbeelding',
    copyrightHolder: 'VRT mock rechthebbende',
    inLanguage: 'nl',
  },
  {
    '@id': `${MOCK_API_ORIGIN}/images/vrt-mock-image-2`,
    '@type': 'schema:ImageObject',
    contentUrl: vrtMockImageUrls.portrait,
    thumbnailUrl: vrtMockImageUrls.portrait,
    description: 'VRT mock afbeelding — tweede afbeelding',
    copyrightHolder: 'VRT mock rechthebbende',
    inLanguage: 'nl',
  },
];

const vrtMockEvent = {
  '@id': `${MOCK_API_ORIGIN}/events/${EVENT_ID}`,
  '@context': '/contexts/event',
  mainLanguage: 'nl',
  name: {
    nl: 'VRT mock evenement — concert',
    fr: 'VRT mock évènement — concert',
  },
  description: {
    nl: 'VRT mock beschrijving van het evenement, lang genoeg om over meer dan één regel te lopen.',
    fr: "VRT mock description de l'évènement, assez longue pour dépasser une seule ligne.",
  },
  terms: [
    {
      id: EventTypes.Concert,
      domain: 'eventtype',
      label: 'VRT mock type — concert',
    },
    {
      id: CLASSICAL_MUSIC_THEME_ID,
      domain: 'theme',
      label: 'VRT mock thema — klassieke muziek',
    },
  ],
  status: { type: 'Available' },
  workflowStatus: 'APPROVED',
  availableFrom: vrtDaysFromNow(-30).toISOString(),
  availableTo: lastSubEvent.endDate,
  created: vrtDaysFromNow(-120).toISOString(),
  modified: vrtDaysFromNow(-14).toISOString(),
  creator: 'vrt-mock-user-1',
  calendarType: calendarTypeFor(eventSubEvents),
  startDate: firstSubEvent.startDate,
  endDate: lastSubEvent.endDate,
  subEvent: eventSubEvents,
  openingHours: [],
  location: eventLocationFixture,
  organizer: eventOrganizerFixture,
  attendanceMode: 'offline',
  audience: { audienceType: 'everyone' },
  typicalAgeRange: '12-15',
  childrenOnly: false,
  labels: ['vrt-mock-label-evenement', 'vrt-mock-moderatie'],
  hiddenLabels: [],
  languages: ['nl', 'fr'],
  completedLanguages: ['nl'],
  completeness: 85,
  contactPoint: {
    phone: ['+32 2 000 00 02'],
    email: ['vrt-mock-contact@example.com'],
    url: ['https://vrt-mock-evenement.example.com'],
  },
  bookingInfo: {
    availabilityStarts: vrtDayAtUtcTime(-10, 9),
    availabilityEnds: vrtDayAtUtcTime(25, 17),
    url: 'https://vrt-mock-tickets.example.com',
    urlLabel: {
      nl: 'VRT mock reservatielabel',
      fr: 'VRT mock label de réservation',
      de: 'VRT mock Reservierungslabel',
      en: 'VRT mock booking label',
    },
    email: 'vrt-mock-reservatie@example.com',
    phone: '+32 2 000 00 03',
  },
  bookingAvailability: { type: 'Available' },
  priceInfo: [
    {
      category: 'base',
      name: { nl: 'Basistarief', fr: 'Tarif de base', de: 'Basisrate' },
      price: 12,
      priceCurrency: 'EUR',
    },
    {
      category: 'tariff',
      name: {
        nl: 'VRT mock tarief — korting',
        fr: 'VRT mock tarif — réduction',
      },
      price: 8,
      priceCurrency: 'EUR',
    },
  ],
  faqs: [
    {
      nl: {
        question: 'VRT mock vraag — is er een pauze?',
        answer: '<p>VRT mock antwoord op de eerste vraag.</p>',
      },
      fr: {
        question: 'VRT mock question — y a-t-il une pause ?',
        answer: '<p>VRT mock réponse à la première question.</p>',
      },
    },
  ],
  mediaObject: eventMediaObjects,
  image: eventMediaObjects[0].contentUrl,
  videos: [],
};

const NO_IMAGE = { image: undefined, mediaObject: [] };

const eventListMember = ({ id, nameNl, subEvents, summary, ...overrides }) => ({
  ...vrtMockEvent,
  '@id': `${MOCK_API_ORIGIN}/events/${id}`,
  name: { nl: nameNl },
  subEvent: subEvents,
  calendarType: calendarTypeFor(subEvents),
  startDate: subEvents[0].startDate,
  endDate: subEvents.at(-1).endDate,
  availableTo: subEvents.at(-1).endDate,
  calendarSummary: { nl: { text: withoutMediumFormat(summary) } },
  ...overrides,
});

const eventListVariants = [
  {
    id: 'vrt-mock-event-2',
    nameNl: 'VRT mock evenement — afgelopen zonder afbeelding',
    subEvents: availableSubEventsOn([-40, -38]),
    summary: {
      lg: 'Woensdag 6 mei 2026\nVrijdag 8 mei 2026',
      md: 'Wo 6 mei 2026\nVr 8 mei 2026',
      sm: 'Wo 6 mei - vr 8 mei',
      xs: '6 mei - 8 mei',
    },
    availableFrom: vrtDaysFromNow(-60).toISOString(),
    ...NO_IMAGE,
  },
  {
    id: 'vrt-mock-event-3',
    nameNl:
      'VRT mock evenement — zonder afbeelding en met een titel die lang genoeg is om afgekapt te worden',
    subEvents: availableSubEventsOn([60]),
    summary: {
      lg: 'Vrijdag 14 augustus 2026',
      md: 'Vr 14 augustus 2026',
      sm: 'Vr 14 aug',
      xs: '14 aug',
    },
    ...NO_IMAGE,
  },
  {
    id: 'vrt-mock-event-4',
    nameNl: 'VRT mock evenement — gepland en volledig',
    subEvents: availableSubEventsOn([90]),
    summary: {
      lg: 'Zondag 13 september 2026',
      md: 'Zo 13 september 2026',
      sm: 'Zo 13 sep',
      xs: '13 sep',
    },
    availableFrom: vrtDaysFromNow(20).toISOString(),
    completeness: 100,
  },
  {
    id: 'vrt-mock-event-5',
    nameNl: 'VRT mock evenement — concept',
    subEvents: availableSubEventsOn([75]),
    summary: {
      lg: 'Zaterdag 29 augustus 2026',
      md: 'Za 29 augustus 2026',
      sm: 'Za 29 aug',
      xs: '29 aug',
    },
    workflowStatus: 'DRAFT',
    completeness: 40,
  },
  {
    id: 'vrt-mock-event-6',
    nameNl: 'VRT mock evenement — afgewezen',
    subEvents: availableSubEventsOn([45]),
    summary: {
      lg: 'Donderdag 30 juli 2026',
      md: 'Do 30 juli 2026',
      sm: 'Do 30 jul',
      xs: '30 jul',
    },
    workflowStatus: 'REJECTED',
  },
];

const eventListMembers = [
  {
    ...vrtMockEvent,
    calendarSummary: {
      nl: { text: withoutMediumFormat(eventCalendarSummary) },
    },
  },
  ...eventListVariants.map(eventListMember),
];

const calendarSummaryById = {
  [EVENT_ID]: eventCalendarSummary,
  ...Object.fromEntries(
    eventListVariants.map(({ id, summary }) => [id, summary]),
  ),
};

const eventsByCreatorFixture = {
  '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
  '@type': 'PagedCollection',
  itemsPerPage: 14,
  totalItems: eventListMembers.length,
  member: eventListMembers,
};

const withoutCalendarSummary = ({ calendarSummary, ...event }) => event;

// What global.mjs's role constraints grant on this event.
const eventPermissionsFixture = {
  permissions: [
    PermissionTypes.AANBOD_BEWERKEN,
    PermissionTypes.AANBOD_MODEREREN,
    PermissionTypes.AANBOD_HISTORIEK,
  ].map(formatPermission),
};

const CALENDAR_SUMMARY_CONTENT_TYPE = 'text/plain; charset=utf-8';

const ANY_EVENT_PATH = /^\/events\/[^/]+$/;
const ANY_EVENT_CALENDAR_SUMMARY_PATH = /^\/events\/[^/]+\/calsum$/;
const ANY_EVENT_PERMISSIONS_PATH = /^\/events\/[^/]+\/permissions$/;

const eventByIdFixtures = eventListMembers.map((member) => ({
  method: 'GET',
  path: `/events/${parseOfferId(member['@id'])}`,
  response: withoutCalendarSummary(member),
}));

const calendarSummaryResponse = (text) => (params) =>
  text[params.get('format')] ?? text.lg;

const eventCalendarSummaryFixtures = eventListMembers.map((member) => ({
  method: 'GET',
  path: `/events/${parseOfferId(member['@id'])}/calsum`,
  contentType: CALENDAR_SUMMARY_CONTENT_TYPE,
  response: calendarSummaryResponse(
    calendarSummaryById[parseOfferId(member['@id'])],
  ),
}));

export const eventsApiFixtures = [
  {
    method: 'GET',
    path: '/events/',
    response: eventsByCreatorFixture,
  },
  ...eventCalendarSummaryFixtures,
  {
    method: 'GET',
    path: ANY_EVENT_CALENDAR_SUMMARY_PATH,
    contentType: CALENDAR_SUMMARY_CONTENT_TYPE,
    response: calendarSummaryResponse(eventCalendarSummary),
  },
  {
    method: 'GET',
    path: ANY_EVENT_PERMISSIONS_PATH,
    response: eventPermissionsFixture,
  },
  ...eventByIdFixtures,
  {
    method: 'GET',
    path: ANY_EVENT_PATH,
    response: vrtMockEvent,
  },
];
