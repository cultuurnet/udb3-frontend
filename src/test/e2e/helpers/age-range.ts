import { expect, Page } from '@playwright/test';

import { AgeRanges } from '../../../constants/AgeRange';
import nl from '../../../i18n/nl.json';

const age = nl.create.name_and_age.age;

export const ageRangeLabels = {
  all: age.all,
  toddlers: `${age.toddlers} ${AgeRanges.TODDLERS.label}`,
  kids: `${age.kids} ${AgeRanges.KIDS.label}`,
  adults: `${age.adults} ${AgeRanges.ADULTS.label}`,
} as const;

export const minAgeInput = (page: Page) =>
  page.getByPlaceholder(age.from, { exact: true });

export const maxAgeInput = (page: Page) =>
  page.getByPlaceholder(age.till, { exact: true });

export const presetButton = (page: Page, name: string) =>
  page.getByRole('button', { name: new RegExp(`^${name}`) });

export const changeAgeRangeButton = (page: Page) =>
  page.getByRole('button', { name: age.change_age, exact: true });

export const expectSelectedAgeRange = (page: Page, label: string) =>
  expect(page.getByText(label, { exact: true })).toBeVisible();

export const expectAgeRange = async (page: Page, min: string, max: string) => {
  await expect(minAgeInput(page)).toHaveValue(min);
  await expect(maxAgeInput(page)).toHaveValue(max);
};

export const openAgeRangeForm = async (page: Page) => {
  const changeButton = changeAgeRangeButton(page);
  await changeButton.or(minAgeInput(page)).first().waitFor();
  if (await changeButton.isVisible()) {
    await changeButton.click();
  }
  await expect(minAgeInput(page)).toBeVisible();
};

export const pickAgePreset = async (page: Page, name: string) => {
  await openAgeRangeForm(page);
  await presetButton(page, name).click();
};
