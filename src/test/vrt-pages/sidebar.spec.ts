import { screenshotPages } from './support';

screenshotPages([
  {
    title: 'sidebar',
    path: '/manage/labels',
    // Deterministic only because the E2E account's Auth0 profile has no `picture`
    // claim (falls back to avatar.svg). That claim can't be mocked via
    // MOCK_UPSTREAMS — it's decoded from the idToken cookie, not an HTTP call.
    locator: (page) => page.getByLabel('Zijbalk'),
  },
]);
