import type { Page } from '@playwright/test';

import { screenshotPages } from './support';

const EVENT_EDIT_PATH = '/events/vrt-mock-event-1/edit';
const UITPAS_EVENT_EDIT_PATH = '/events/vrt-mock-event-7/edit';
const CHILDREN_ONLY_EVENT_EDIT_PATH = '/events/vrt-mock-event-9/edit';
const EVENT_WITHOUT_ORGANIZER_EDIT_PATH = '/events/vrt-mock-event-10/edit';

const SCOPE_STEP_NUMBER = 1;
const ADDITIONAL_INFORMATION_STEP_NUMBER = 6;

const scopeStep = (page: Page) => page.getByTestId(`step-${SCOPE_STEP_NUMBER}`);

const additionalInformationStep = (page: Page) =>
  page.getByTestId(`step-${ADDITIONAL_INFORMATION_STEP_NUMBER}`);

const waitForText = (text: string) => async (page: Page) => {
  await page.getByText(text).waitFor();
};

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
  {
    title: 'event edit accessibility',
    path: `${CHILDREN_ONLY_EVENT_EDIT_PATH}#accessibility`,
    ...additionalInformationTab,
    beforeScreenshot: async (page) => {
      await page
        .getByRole('heading', { name: 'Vertreklocatie 1', exact: true })
        .waitFor();
    },
  },
  {
    title: 'event edit uitpas price info',
    path: `${UITPAS_EVENT_EDIT_PATH}#price_info`,
    ...additionalInformationTab,
    beforeScreenshot: waitForText(
      'Het UiTPAS kansentarief wordt automatisch berekend',
    ),
  },
  {
    title: 'event edit uitpas organizer',
    path: `${UITPAS_EVENT_EDIT_PATH}#organizer`,
    ...additionalInformationTab,
    beforeScreenshot: waitForText('UiTPAS Kaartsystemen'),
  },
  {
    title: 'event edit organizer picker',
    path: `${EVENT_WITHOUT_ORGANIZER_EDIT_PATH}#organizer`,
    ...additionalInformationTab,
    beforeScreenshot: waitForText('Een organisatie hergebruiken'),
  },
  {
    title: 'event edit scope locked',
    path: EVENT_EDIT_PATH,
    locator: scopeStep,
    fitContent: true,
  },
]);
