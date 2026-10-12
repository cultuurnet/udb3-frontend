import fs from 'node:fs';

import { pinLanguage } from './pins/language.mjs';
import { pinProfileClaims } from './pins/profile.mjs';

const AUTH_STORAGE_STATE_PATH = 'playwright/.auth/user.json';

// Read only. Writing it back would replay whatever a session picked up — a
// rotated token, a stray seenAnnouncements entry — on every later run.
export const buildStorageState = (appHost) => {
  const storageState = JSON.parse(
    fs.readFileSync(AUTH_STORAGE_STATE_PATH, 'utf-8'),
  );
  const cookies = storageState.cookies.map((cookie) =>
    cookie.domain === 'localhost' ? { ...cookie, domain: appHost } : cookie,
  );
  return {
    ...storageState,
    cookies: pinProfileClaims(pinLanguage(cookies, appHost)),
  };
};
