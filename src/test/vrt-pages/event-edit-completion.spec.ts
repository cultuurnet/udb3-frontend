import { expect, type Page } from '@playwright/test';

import { screenshotPages } from './support';

const PARTIAL_EVENT_EDIT_PATH = '/events/vrt-mock-event-1/edit';
const COMPLETE_EVENT_EDIT_PATH = '/events/vrt-mock-event-8/edit';

const PARTIAL_SCORE = '89';
const COMPLETE_SCORE = '98';

const completionWidget = (page: Page) => page.getByTestId('form-score');

const waitForScore = (score: string) => async (page: Page) => {
  await expect(completionWidget(page).locator('#current-score')).toHaveText(
    score,
  );
};

screenshotPages([
  {
    title: 'event edit completion partial',
    path: PARTIAL_EVENT_EDIT_PATH,
    locator: completionWidget,
    beforeScreenshot: waitForScore(PARTIAL_SCORE),
  },
  {
    title: 'event edit completion complete',
    path: COMPLETE_EVENT_EDIT_PATH,
    locator: completionWidget,
    beforeScreenshot: waitForScore(COMPLETE_SCORE),
  },
]);
