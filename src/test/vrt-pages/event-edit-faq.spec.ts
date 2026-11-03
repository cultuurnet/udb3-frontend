import { expect, type Page } from '@playwright/test';

import { screenshotPages } from './support';

const EVENT_WITH_FAQ_PATH = '/events/vrt-mock-event-1/edit#description';
const EVENT_WITHOUT_FAQ_PATH = '/events/vrt-mock-event-11/edit#description';

const ADDITIONAL_INFORMATION_STEP_NUMBER = 6;

const additionalInformationStep = (page: Page) =>
  page.getByTestId(`step-${ADDITIONAL_INFORMATION_STEP_NUMBER}`);

const faqModal = (page: Page) =>
  page
    .getByRole('dialog')
    .filter({ has: page.getByRole('combobox') })
    .locator('.modal-content');

const openAddFaqModal = async (page: Page) => {
  await page
    .getByRole('button', { name: 'Voeg een veelgestelde vraag toe' })
    .click();
  await faqModal(page).getByRole('combobox').waitFor();
};

screenshotPages([
  {
    title: 'event edit faq empty',
    path: EVENT_WITHOUT_FAQ_PATH,
    locator: additionalInformationStep,
    fitContent: true,
  },
  {
    title: 'event edit faq suggestions',
    path: EVENT_WITHOUT_FAQ_PATH,
    locator: faqModal,
    beforeScreenshot: async (page) => {
      await openAddFaqModal(page);
      await faqModal(page).getByRole('combobox').click();
      await page.getByRole('listbox').waitFor();
    },
  },
  {
    title: 'event edit faq edit',
    path: EVENT_WITH_FAQ_PATH,
    locator: faqModal,
    beforeScreenshot: async (page) => {
      await additionalInformationStep(page)
        .getByRole('button', { name: 'Bewerken' })
        .click();
      await expect(faqModal(page).getByRole('combobox')).not.toHaveValue('');
    },
  },
]);
