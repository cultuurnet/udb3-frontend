import { vrtDaysFromNow } from '../pins/clock.mjs';
import { vrtMockImageUrls } from './images.mjs';
import { idOf, MOCK_API_ORIGIN, pagedCollection } from './mock-api.mjs';

// global.mjs constrains ORGANISATIES_BEWERKEN to these two ids, so a third
// organizer renders the preview without its edit button.
const OWNED_ORGANIZER_IDS = ['vrt-mock-organizer-1', 'vrt-mock-organizer-2'];
const SUGGESTED_ORGANIZER_ID = 'vrt-mock-organizer-3';

// Real, unlike every other label here: the picker badges the organizer by
// looking for this exact string in hiddenLabels.
const CULTUURKUUR_ORGANIZER_LABEL = 'cultuurkuur_organizer';

const organizerUri = (id) => `${MOCK_API_ORIGIN}/organizers/${id}`;

const organizerImages = [
  {
    '@id': `${MOCK_API_ORIGIN}/images/vrt-mock-image-3`,
    '@type': 'schema:ImageObject',
    contentUrl: vrtMockImageUrls.landscape,
    thumbnailUrl: vrtMockImageUrls.landscape,
    description: 'VRT mock afbeelding — organisatie',
    copyrightHolder: 'VRT mock rechthebbende',
    inLanguage: 'nl',
  },
  {
    '@id': `${MOCK_API_ORIGIN}/images/vrt-mock-image-4`,
    '@type': 'schema:ImageObject',
    contentUrl: vrtMockImageUrls.portrait,
    thumbnailUrl: vrtMockImageUrls.portrait,
    description: 'VRT mock afbeelding — tweede afbeelding van de organisatie',
    copyrightHolder: 'VRT mock rechthebbende',
    inLanguage: 'nl',
  },
];

// The preview badges the main image by comparing mainImage against
// thumbnailUrl, never against contentUrl.
const withImages = (images) => ({ images, mainImage: images[0].thumbnailUrl });

const NO_IMAGES = { images: [], mainImage: undefined };

const NO_CONTACT = { phone: [], email: [], url: [] };

const vrtMockOrganizer = {
  '@id': organizerUri(OWNED_ORGANIZER_IDS[0]),
  '@context': '/contexts/organizer',
  mainLanguage: 'nl',
  name: { nl: 'VRT mock organisatie' },
  description: {
    nl: 'VRT mock beschrijving van de organisatie, lang genoeg om over meer dan één regel te lopen.',
  },
  url: 'https://vrt-mock-organisatie.example.com',
  address: {
    nl: {
      addressCountry: 'BE',
      addressLocality: 'VRT mock gemeente',
      postalCode: '1000',
      streetAddress: 'VRT mock straat 2',
    },
  },
  contactPoint: {
    phone: ['+32 2 000 00 04'],
    email: ['vrt-mock-organisatie@example.com'],
    url: ['https://vrt-mock-organisatie.example.com/contact'],
  },
  labels: ['vrt-mock-label-organisatie'],
  hiddenLabels: [],
  creator: 'vrt-mock-user-1',
  modified: vrtDaysFromNow(-14).toISOString(),
  // name 20 + url 20 + contact 20 + description 15 + media 15 + location 10,
  // so every completeness below says which of those the record drops.
  completeness: 100,
  ...withImages(organizerImages),
};

const organizerVariant = ({ id, nameNl, ...overrides }) => ({
  ...vrtMockOrganizer,
  '@id': organizerUri(id),
  name: { nl: nameNl },
  ...overrides,
});

const ownedOrganizers = [
  vrtMockOrganizer,
  organizerVariant({
    id: OWNED_ORGANIZER_IDS[1],
    nameNl: 'VRT mock organisatie — zonder afbeelding',
    completeness: 85,
    ...NO_IMAGES,
  }),
];

// The only organizer the picker renders as a card alongside the canonical one,
// so it carries the Cultuurkuur badge and the second address.
const suggestedOrganizer = organizerVariant({
  id: SUGGESTED_ORGANIZER_ID,
  nameNl: 'VRT mock organisatie — van een andere gebruiker',
  creator: 'vrt-mock-user-2',
  address: {
    nl: {
      addressCountry: 'BE',
      addressLocality: 'VRT mock tweede gemeente',
      postalCode: '9000',
      streetAddress: 'VRT mock straat 3',
    },
  },
  hiddenLabels: [CULTUURKUUR_ORGANIZER_LABEL],
  description: undefined,
  contactPoint: NO_CONTACT,
  completeness: 65,
});

const allOrganizers = [...ownedOrganizers, suggestedOrganizer];

// The event fixture embeds these, which is what puts them in front of the
// dashboard suggestions and the picker's recently-used cards.
export const vrtMockOrganizers = {
  owned: vrtMockOrganizer,
  suggested: suggestedOrganizer,
};

const organizersByCreatorFixture = pagedCollection(ownedOrganizers, 14);

// Answers the query the dashboard builds from the organizers on its recent
// offers: `id:… NOT creator:"<the user>"`. Returning only the organizer
// somebody else created honours that clause without parsing it.
const suggestedOrganizersFixture = pagedCollection([suggestedOrganizer]);

// Every typeahead keystroke lands here. Keyed on one search string instead,
// any other input would fall through to the real backend unnoticed.
const organizerSearchFixture = pagedCollection(allOrganizers);

// Both create flows read member[0] of a website search as "this url is already
// taken" and put the form in an error state. Empty keeps the url free; a taken
// one belongs on a fixed url, the way labels.mjs narrows its no-results query.
const organizerWebsiteFixture = pagedCollection([]);

// Display-formatted, like the offer permissions in events.mjs, and derived per
// id because global.mjs's role constraints name the organizer.
const ORGANISATIES_BEWERKEN = 'Organisaties bewerken';

const permissionsFor = (id) => ({
  permissions: OWNED_ORGANIZER_IDS.includes(id) ? [ORGANISATIES_BEWERKEN] : [],
});

const organizerCreatorFixture = {
  userId: 'vrt-mock-user-1',
  email: 'vrt-mock@example.com',
};

const approvedOwnership = (itemId) => ({
  id: `vrt-mock-ownership-${itemId}-eigenaar`,
  itemId,
  itemType: 'organizer',
  ownerId: 'vrt-mock-user-1',
  ownerEmail: 'vrt-mock@example.com',
  requesterId: 'vrt-mock-user-1',
  state: 'approved',
  created: vrtDaysFromNow(-60).toISOString(),
  approvedDate: vrtDaysFromNow(-59).toISOString(),
  approvedByEmail: 'vrt-mock-beheerder@example.com',
});

const requestedOwnership = (itemId) => ({
  id: `vrt-mock-ownership-${itemId}-aanvraag`,
  itemId,
  itemType: 'organizer',
  ownerId: 'vrt-mock-user-3',
  ownerEmail: 'vrt-mock-aanvrager@example.com',
  requesterId: 'vrt-mock-user-3',
  state: 'requested',
  created: vrtDaysFromNow(-3).toISOString(),
});

// The ownerships page groups on state and renders an approved table and a
// pending one, so one organizer has to carry both.
const ownershipsForOrganizer = (itemId) =>
  pagedCollection([approvedOwnership(itemId), requestedOwnership(itemId)]);

// The dashboard turns the approved rows into the `OR id:…` half of its list
// query, so only the organizers it should list belong here.
const ownedOrganizerOwnershipsFixture = pagedCollection(
  ownedOrganizers.map((organizer) => approvedOwnership(idOf(organizer))),
);

const ANY_ORGANIZER_PATH = /^\/organizers\/[^/]+$/;
const ANY_ORGANIZER_PERMISSIONS_PATH = /^\/organizers\/[^/]+\/permissions$/;
const ANY_ORGANIZER_CREATOR_PATH = /^\/organizers\/[^/]+\/creator$/;

const organizerPermissionsFixtures = allOrganizers.map((organizer) => ({
  method: 'GET',
  path: `/organizers/${idOf(organizer)}/permissions`,
  response: permissionsFor(idOf(organizer)),
}));

const organizerByIdFixtures = allOrganizers.map((organizer) => ({
  method: 'GET',
  path: `/organizers/${idOf(organizer)}`,
  response: organizer,
}));

// The by-creator list is the only organizer request with a trailing slash;
// the searches below hit /organizers, which is a different pathname.
export const organizersApiFixtures = [
  {
    method: 'GET',
    path: '/organizers/',
    response: organizersByCreatorFixture,
  },
  {
    method: 'GET',
    path: '/organizers',
    query: (params) => params.has('q'),
    response: suggestedOrganizersFixture,
  },
  {
    method: 'GET',
    path: '/organizers',
    query: (params) => params.has('website'),
    response: organizerWebsiteFixture,
  },
  {
    method: 'GET',
    path: '/organizers',
    response: organizerSearchFixture,
  },
  ...organizerPermissionsFixtures,
  {
    method: 'GET',
    path: ANY_ORGANIZER_PERMISSIONS_PATH,
    response: { permissions: [] },
  },
  {
    method: 'GET',
    path: ANY_ORGANIZER_CREATOR_PATH,
    response: organizerCreatorFixture,
  },
  ...organizerByIdFixtures,
  {
    method: 'GET',
    path: ANY_ORGANIZER_PATH,
    response: vrtMockOrganizer,
  },
  {
    method: 'GET',
    path: '/ownerships/',
    query: (params) => params.has('itemId'),
    response: (params) => ownershipsForOrganizer(params.get('itemId')),
  },
  {
    method: 'GET',
    path: '/ownerships/',
    query: (params) => params.has('ownerId'),
    response: ownedOrganizerOwnershipsFixture,
  },
];
