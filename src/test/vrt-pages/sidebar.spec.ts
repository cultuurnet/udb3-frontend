import { screenshotPages } from './support';

screenshotPages([
  {
    title: 'sidebar',
    path: '/manage/labels',
    // The profile row's name, email and picture are decoded from the idToken
    // cookie rather than fetched, so MOCK_UPSTREAMS can't reach them.
    // pinProfileClaims rewrites that cookie instead — scripts/vrt/pins/profile.mjs.
    locator: (page) => page.getByLabel('Zijbalk'),
  },
]);
