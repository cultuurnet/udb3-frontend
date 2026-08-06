import fs from 'node:fs';

import type { CustomProjectConfig } from 'lost-pixel';

import { labelsInteractionsByShotName } from './scripts/vrt/interactions/labels.mjs';

const pagesOnly = process.env.LOST_PIXEL_PAGES_ONLY === 'true';

const interactionsByShotName: Record<string, (page: any) => Promise<void>> = {
  ...labelsInteractionsByShotName,
};

const pageShotsPages = [
  { path: '/manage/labels/create', name: 'pages--labels-create' },
  { path: '/manage/labels', name: 'pages--labels-overview' },
  { path: '/manage/labels/vrt-mock-label-1/edit', name: 'pages--labels-edit' },
  { path: '/manage/labels', name: 'pages--labels-search-results' },
  { path: '/manage/labels', name: 'pages--labels-no-results' },
];

if (pagesOnly) {
  const pageNames = new Set(pageShotsPages.map((page) => page.name));
  const orphanedInteractions = Object.keys(interactionsByShotName).filter(
    (shotName) => !pageNames.has(shotName),
  );
  if (orphanedInteractions.length > 0) {
    throw new Error(
      `interactionsByShotName has entries for shot names that don't exist in pageShots.pages: ${orphanedInteractions.join(', ')}`,
    );
  }
}

const AUTH_STORAGE_STATE_PATH = 'playwright/.auth/user.json';
const HOST_IP = process.env.HOST_IP ?? 'localhost';

const buildPageShotsStorageState = () => {
  const storageState = JSON.parse(
    fs.readFileSync(AUTH_STORAGE_STATE_PATH, 'utf-8'),
  );
  const cookies = storageState.cookies.map(
    (cookie: Record<string, unknown> & { domain: string }) =>
      cookie.domain === 'localhost' ? { ...cookie, domain: HOST_IP } : cookie,
  );
  return { ...storageState, cookies };
};

const pageShotsStorageState = pagesOnly ? buildPageShotsStorageState() : null;

export const config: CustomProjectConfig = {
  ...(pagesOnly
    ? {
        imagePathBaseline: '.lostpixel-pages/baseline/',
        imagePathCurrent: '.lostpixel-pages/current/',
        imagePathDifference: '.lostpixel-pages/difference/',
        pageShots: {
          baseUrl: `http://${HOST_IP}:3000`,
          pages: pageShotsPages,
        },
        configureBrowser: () => ({ storageState: pageShotsStorageState }),
        beforeScreenshot: async (page, { shotName }) => {
          const interaction = shotName
            ? interactionsByShotName[shotName]
            : undefined;
          if (interaction) await interaction(page);
        },
        threshold: 0.05,
      }
    : {
        storybookShots: {
          storybookUrl: './storybook-static',
          elementLocator: '#storybook-root',
        },
        threshold: 20,
      }),
  generateOnly: true,
  failOnDifference: true,
};
