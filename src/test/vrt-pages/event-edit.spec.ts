import type { Page } from '@playwright/test';

import { screenshotPages } from './support';

const EVENT_EDIT_PATH = '/events/vrt-mock-event-1/edit';

const ADDITIONAL_INFORMATION_STEP_NUMBER = 6;

const additionalInformationStep = (page: Page) =>
  page.getByTestId(`step-${ADDITIONAL_INFORMATION_STEP_NUMBER}`);

const additionalInformationTab = {
  locator: additionalInformationStep,
  fitContent: true,
};

screenshotPages([
  {
    title: 'event edit description',
    path: `${EVENT_EDIT_PATH}#description`,
    ...additionalInformationTab,
  },
  {
    title: 'event edit media',
    path: `${EVENT_EDIT_PATH}#media`,
    ...additionalInformationTab,
  },
  {
    title: 'event edit price info',
    path: `${EVENT_EDIT_PATH}#price_info`,
    ...additionalInformationTab,
  },
  {
    title: 'event edit organizer',
    path: `${EVENT_EDIT_PATH}#organizer`,
    ...additionalInformationTab,
  },
  {
    title: 'event edit contact info',
    path: `${EVENT_EDIT_PATH}#contact_info`,
    ...additionalInformationTab,
  },
  {
    title: 'event edit booking info',
    path: `${EVENT_EDIT_PATH}#booking_info`,
    ...additionalInformationTab,
  },
  {
    title: 'event edit labels',
    path: `${EVENT_EDIT_PATH}#labels`,
    ...additionalInformationTab,
  },
  {
    title: 'event edit audience',
    path: `${EVENT_EDIT_PATH}#audience`,
    ...additionalInformationTab,
  },
]);
