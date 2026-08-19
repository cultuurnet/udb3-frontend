import { expect, test } from '@playwright/test';

import nl from '../../../i18n/nl.json';
import { createBasicEvent } from '../helpers/create-basic-event';
import { suppressHydrationErrors } from '../helpers/suppress-hydration-errors';

const nameAndAge = nl.create.name_and_age;

test('shows an error and does not save an empty name', async ({
  page,
  baseURL,
}) => {
  suppressHydrationErrors(page);

  const eventName = `E2E Name Test ${Date.now()}`;
  await createBasicEvent(page, baseURL, eventName);
  await page.waitForURL(/\/events\/[a-f0-9-]+\/edit/);

  const nameInput = page.getByLabel(nameAndAge.name.title_events);
  const requiredError = page.getByText(
    nameAndAge.validation_messages.name.required,
  );

  await expect(nameInput).toHaveValue(eventName);

  await nameInput.fill('');
  await nameInput.blur();
  await expect(requiredError).toBeVisible();

  await nameInput.fill('   ');
  await nameInput.blur();
  await expect(requiredError).toBeVisible();

  await page.reload();

  await expect(requiredError).toBeHidden();
  await expect(nameInput).toHaveValue(eventName);
});
