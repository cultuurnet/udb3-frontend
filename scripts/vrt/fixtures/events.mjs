import { vrtDaysFromNow } from '../pins/clock.mjs';
import { vrtMockImageUrls } from './images.mjs';

const EVENT_ID = 'vrt-mock-event-1';
const LOCATION_ID = 'vrt-mock-place-1';
const ORGANIZER_ID = 'vrt-mock-organizer-1';

// Never resolves (RFC 2606); an @id is only ever split for its last segment.
const MOCK_API_ORIGIN = 'https://vrt-mock-api.invalid';

// Real, unlike every other id here: the dashboard runs the type through
// t('eventTypes*<id>') and the picker groups themes by id. Labels stay mock.
const CONCERT_EVENT_TYPE_ID = '0.50.4.0.0';
const CLASSICAL_MUSIC_THEME_ID = '1.8.1.0.0';
const EXPO_HALL_EVENT_TYPE_ID = 'OyaPaf64AEmEAYXHeLMAtA';

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
    bookingAvailability: { type: 'Available' },
  },
  {
    '@type': 'Event',
    startDate: vrtDayAtUtcTime(32, 20),
    endDate: vrtDayAtUtcTime(32, 22, 30),
    status: {
      type: 'TemporarilyUnavailable',
      reason: { nl: 'VRT mock reden — tweede datum uitgesteld' },
    },
    bookingAvailability: { type: 'Unavailable' },
  },
];

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

const SUMMARY_LOCALE = 'nl-BE';
// UTC, and the app agrees only because the run pins no timezoneId. Pinning one
// desyncs this, formatPeriod's HH:mm and usePublicationStatus — see the ticket.
const HOST_INDEPENDENT_TIME_ZONE = 'UTC';

const summaryFormat = (options) =>
  new Intl.DateTimeFormat(SUMMARY_LOCALE, {
    ...options,
    timeZone: HOST_INDEPENDENT_TIME_ZONE,
  });

const weekdayAndDate = summaryFormat({
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const dayAndMonth = summaryFormat({ day: 'numeric', month: 'long' });
const abbreviatedDayAndMonth = summaryFormat({
  day: 'numeric',
  month: 'short',
});
const clockTime = summaryFormat({
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const summarizeSubEvent =
  (dateFormat) =>
  ({ startDate, endDate }) =>
    `${dateFormat.format(new Date(startDate))} van ${clockTime.format(
      new Date(startDate),
    )} tot ${clockTime.format(new Date(endDate))}`;

const calendarSummaryTextFor = (subEvents) => {
  const start = new Date(subEvents[0].startDate);
  const end = new Date(subEvents.at(-1).endDate);
  const isSingleDay = subEvents.length === 1;

  return {
    lg: subEvents.map(summarizeSubEvent(weekdayAndDate)).join('\n'),
    md: subEvents.map(summarizeSubEvent(dayAndMonth)).join('\n'),
    sm: isSingleDay
      ? dayAndMonth.format(start)
      : `van ${dayAndMonth.format(start)} tot ${dayAndMonth.format(end)}`,
    xs: isSingleDay
      ? abbreviatedDayAndMonth.format(start)
      : `${abbreviatedDayAndMonth.format(start)} - ${abbreviatedDayAndMonth.format(end)}`,
  };
};

const eventCalendarSummaryText = calendarSummaryTextFor(eventSubEvents);

// Only the calsum endpoint serves md; the list request asks for lg/sm/xs.
const withoutMediumFormat = ({ md, ...text }) => text;

const eventLocationFixture = {
  '@id': `${MOCK_API_ORIGIN}/places/${LOCATION_ID}`,
  '@context': '/contexts/place',
  mainLanguage: 'nl',
  name: { nl: 'VRT mock locatie — zaal' },
  terms: [
    {
      id: EXPO_HALL_EVENT_TYPE_ID,
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
      id: CONCERT_EVENT_TYPE_ID,
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

const eventListMember = ({ id, nameNl, subEvents, ...overrides }) => ({
  ...vrtMockEvent,
  '@id': `${MOCK_API_ORIGIN}/events/${id}`,
  name: { nl: nameNl },
  subEvent: subEvents,
  calendarType: calendarTypeFor(subEvents),
  startDate: subEvents[0].startDate,
  endDate: subEvents.at(-1).endDate,
  availableTo: subEvents.at(-1).endDate,
  calendarSummary: {
    nl: { text: withoutMediumFormat(calendarSummaryTextFor(subEvents)) },
  },
  ...overrides,
});

const eventListMembers = [
  {
    ...vrtMockEvent,
    calendarSummary: {
      nl: { text: withoutMediumFormat(eventCalendarSummaryText) },
    },
  },
  eventListMember({
    id: 'vrt-mock-event-2',
    nameNl: 'VRT mock evenement — afgelopen zonder afbeelding',
    subEvents: availableSubEventsOn([-40, -38]),
    availableFrom: vrtDaysFromNow(-60).toISOString(),
    ...NO_IMAGE,
  }),
  eventListMember({
    id: 'vrt-mock-event-3',
    nameNl:
      'VRT mock evenement — zonder afbeelding en met een titel die lang genoeg is om afgekapt te worden',
    subEvents: availableSubEventsOn([60]),
    ...NO_IMAGE,
  }),
  eventListMember({
    id: 'vrt-mock-event-4',
    nameNl: 'VRT mock evenement — gepland en volledig',
    subEvents: availableSubEventsOn([90]),
    availableFrom: vrtDaysFromNow(20).toISOString(),
    completeness: 100,
  }),
  eventListMember({
    id: 'vrt-mock-event-5',
    nameNl: 'VRT mock evenement — concept',
    subEvents: availableSubEventsOn([75]),
    workflowStatus: 'DRAFT',
    completeness: 40,
  }),
  eventListMember({
    id: 'vrt-mock-event-6',
    nameNl: 'VRT mock evenement — afgewezen',
    subEvents: availableSubEventsOn([45]),
    workflowStatus: 'REJECTED',
  }),
];

const eventsByCreatorFixture = {
  '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
  '@type': 'PagedCollection',
  itemsPerPage: 14,
  totalItems: eventListMembers.length,
  member: eventListMembers,
};

const idOf = (event) => event['@id'].split('/').at(-1);

const withoutCalendarSummary = ({ calendarSummary, ...event }) => event;

// Display-formatted or the edit route redirects to /unauthorized; the set is
// what global.mjs's role constraints grant on this event.
const OFFER_PERMISSION_LABELS = {
  AANBOD_BEWERKEN: 'Aanbod bewerken',
  AANBOD_MODEREREN: 'Aanbod modereren',
  AANBOD_HISTORIEK: 'Aanbod historiek',
};

const eventPermissionsFixture = {
  permissions: Object.values(OFFER_PERMISSION_LABELS),
};

const CALENDAR_SUMMARY_CONTENT_TYPE = 'text/plain; charset=utf-8';

const ANY_EVENT_PATH = /^\/events\/[^/]+$/;
const ANY_EVENT_CALENDAR_SUMMARY_PATH = /^\/events\/[^/]+\/calsum$/;
const ANY_EVENT_PERMISSIONS_PATH = /^\/events\/[^/]+\/permissions$/;

const eventByIdFixtures = eventListMembers.map((member) => ({
  method: 'GET',
  path: `/events/${idOf(member)}`,
  response: withoutCalendarSummary(member),
}));

const calendarSummaryResponse = (text) => (params) =>
  text[params.get('format')] ?? text.lg;

const eventCalendarSummaryFixtures = eventListMembers.map((member) => ({
  method: 'GET',
  path: `/events/${idOf(member)}/calsum`,
  contentType: CALENDAR_SUMMARY_CONTENT_TYPE,
  response: calendarSummaryResponse(calendarSummaryTextFor(member.subEvent)),
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
    response: calendarSummaryResponse(eventCalendarSummaryText),
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
