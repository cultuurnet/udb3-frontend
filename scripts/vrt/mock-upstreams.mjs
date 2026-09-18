import { eventsApiFixtures } from './fixtures/events.mjs';
import {
  globalAnnouncementsFixtures,
  globalApiFixtures,
} from './fixtures/global.mjs';
import {
  IMAGE_ENV_VAR,
  IMAGE_PINNED_URL,
  imagesFixtures,
} from './fixtures/images.mjs';
import { labelsApiFixtures } from './fixtures/labels.mjs';
import { organizersApiFixtures } from './fixtures/organizers.mjs';
import { termsTaxonomyFixtures } from './fixtures/terms.mjs';

// Only its own upstream's fixtures can answer a request; within one, first
// match wins, so narrowed entries go above the catch-all they share a path
// with, and a RegExp `path` below everything it would swallow. Order within a
// domain lives in its fixture module; assertFixturesAreReachable() enforces
// it. A fixture's `path` is the pathname the real host sees, so it includes
// any path the upstream's URL carries — change that URL's path and every
// fixture under it stops matching. An upstream always needs `envVar` — it
// names the route prefix and the variable the app is given — and takes its
// real URL from that variable, or from a `pinnedUrl` overriding it when the
// pipeline supplies the host itself.
export const MOCK_UPSTREAMS = [
  {
    envVar: 'NEXT_PUBLIC_API_URL',
    fixtures: [
      ...globalApiFixtures,
      ...labelsApiFixtures,
      ...eventsApiFixtures,
      ...organizersApiFixtures,
    ],
  },
  {
    envVar: 'NEXT_PUBLIC_NEW_ANNOUNCEMENTS_URL',
    fixtures: globalAnnouncementsFixtures,
  },
  {
    envVar: 'NEXT_PUBLIC_TAXONOMY_URL',
    fixtures: termsTaxonomyFixtures,
  },
  {
    envVar: IMAGE_ENV_VAR,
    pinnedUrl: IMAGE_PINNED_URL,
    fixtures: imagesFixtures,
  },
];

// Deliberately conservative: only flags what matchesFixture would definitely
// swallow. String paths compare exactly, so /labels/ leaves /labels/<uuid>
// alone, and a later RegExp is never flagged.
const answersEverything = (earlier, later) => {
  if (earlier.query) return false;
  if (earlier.method && earlier.method !== later.method) return false;
  if (typeof later.path !== 'string') return false;
  return typeof earlier.path === 'string'
    ? earlier.path === later.path
    : earlier.path.test(later.path);
};

const describeFixture = ({ method, path, query }) =>
  `${method ?? 'ANY'} ${path}${query ? ' (narrowed by query)' : ''}`;

export const assertFixturesAreReachable = () => {
  for (const { envVar, fixtures } of MOCK_UPSTREAMS) {
    fixtures.forEach((fixture, index) => {
      const shadowIndex = fixtures
        .slice(0, index)
        .findIndex((earlier) => answersEverything(earlier, fixture));
      if (shadowIndex === -1) return;

      throw new Error(
        `\n${envVar} fixture ${describeFixture(fixture)} can never match: an earlier ${describeFixture(fixtures[shadowIndex])} already answers every request it would.\nMove the narrower entry above it — within its fixture module, or by reordering the lists spread into this upstream.\n`,
      );
    });
  }
};
