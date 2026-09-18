import { parseOfferId } from '../../../src/utils/parseOfferId.js';
import { UITPAS_ORGANIZER_LABEL, vrtMockOrganizers } from './organizers.mjs';

// events.mjs builds the event from this id, so both sides name the same one.
export const UITPAS_EVENT_ID = 'vrt-mock-event-7';

// An organizer counts as a UiTPAS one when one of its labels matches a value
// here; the app only ever reads Object.values().
const uitpasLabelsFixture = {
  'vrt-mock-uitpas-1': UITPAS_ORGANIZER_LABEL,
  'vrt-mock-uitpas-2': 'vrt-mock-uitpas-regio',
};

// Both endpoints answer with a map keyed by card system id, which is what the
// app indexes when it toggles one. The ids come from a real response.
const UITPAS_CARD_SYSTEM = {
  id: 5,
  name: 'VRT mock kaartsysteem',
};

// A real organizer answers with its distribution keys empty; the event it is
// registered on answers with the ones it carries, keyed the same way.
const cardSystemsForOrganizerFixture = {
  [UITPAS_CARD_SYSTEM.id]: { ...UITPAS_CARD_SYSTEM, distributionKeys: [] },
};

const cardSystemsForEventFixture = {
  [UITPAS_CARD_SYSTEM.id]: {
    ...UITPAS_CARD_SYSTEM,
    distributionKeys: {
      44: { id: 44, name: 'VRT mock verdeelsleutel' },
    },
  },
};

// UiTPAS derives this from the card system and the base price and embeds it in
// the offer's priceInfo; the form renders it read-only. Dutch only, as recorded.
export const uitpasPriceInfo = {
  category: 'uitpas',
  name: { nl: `Kansentarief met ${UITPAS_CARD_SYSTEM.name}` },
  price: 3,
  priceCurrency: 'EUR',
};

const UITPAS_ORGANIZER_ID = parseOfferId(vrtMockOrganizers.uitpas['@id']);

export const uitpasApiFixtures = [
  {
    method: 'GET',
    path: '/uitpas/labels',
    response: uitpasLabelsFixture,
  },
  {
    method: 'GET',
    path: `/uitpas/events/${UITPAS_EVENT_ID}/cardSystems/`,
    response: cardSystemsForEventFixture,
  },
  {
    method: 'GET',
    path: `/uitpas/organizers/${UITPAS_ORGANIZER_ID}/cardSystems/`,
    response: cardSystemsForOrganizerFixture,
  },
];
