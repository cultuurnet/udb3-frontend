import { expect, test } from '@playwright/test';

const dummyPlace = {
  name: 'E2E test location',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a porta leo. Etiam sit amet cursus diam. Donec finibus luctus tincidunt. Quisque a lectus nunc. Maecenas rutrum varius orci, eget placerat sapien fermentum non.',
  address: {
    zip: '9000',
    municipality: '9000 Gent',
    streetAndNumber: 'E2E test street 1',
  },
  contactInfo: {
    email: 'e2e.udb3.frontend@gmail.com',
  },
  bookingInfo: {
    email: 'e2e.udb3.frontend@gmail.com',
  },
  video: 'https://www.youtube.com/watch?v=lkIFF4maKMU&t=48s',
};

test('create a place', async ({ baseURL, page }) => {
  await page.goto(`${baseURL}/create`);
  await page.getByRole('button', { name: 'Locatie' }).click();
  await page.getByRole('button', { name: 'Bioscoop' }).click();

  // 1. Fill in address
  await page.getByLabel('Gemeente').click();
  await page.getByLabel('Gemeente').fill(dummyPlace.address.zip);
  await page
    .getByRole('option', { name: dummyPlace.address.municipality })
    .click();
  await page.getByLabel('Straat en nummer').click();
  await page
    .getByLabel('Straat en nummer')
    .fill(dummyPlace.address.streetAndNumber);

  // 2. Name
  await page.getByLabel('Naam van de locatie').click();
  await page.getByLabel('Naam van de locatie').fill(dummyPlace.name);

  // 3. Age Range
  await page.getByRole('button', { name: 'Volwassenen 18+' }).click();
  await page.getByRole('button', { name: 'Opslaan' }).click();

  // 4. Additionnal Information
  await page
    .getByRole('textbox', { name: 'rdw-editor' })
    .fill(dummyPlace.description);

  await page
    .getByRole('tabpanel')
    .locator('section')
    .filter({ hasText: dummyPlace.description })
    .click();
  // check if checkmark is there
  await expect(
    page.getByRole('tab', { name: 'Beschrijving' }).locator('.fa-check-circle'),
  ).toBeVisible();

  await page.getByRole('tab', { name: 'Prijzen' }).click();
  await page.getByPlaceholder('Prijs').click();
  await page.getByPlaceholder('Prijs').fill('10');

  await page.getByText('BasistariefeuroGratisTarief toevoegen').click();
  await page.getByRole('tab', { name: 'Contact' }).click();
  await page.getByRole('button', { name: 'Contactgegevens toevoegen' }).click();
  await page.locator('#contact-info-value').click();
  await page.locator('#contact-info-value').fill(dummyPlace.contactInfo.email);
  await page.getByRole('tabpanel').click();
  await page.getByRole('tab', { name: 'Reservatie' }).click();
  await page.getByPlaceholder('E-mailadres').click();
  await page.getByPlaceholder('E-mailadres').fill(dummyPlace.bookingInfo.email);

  // Add video url
  await page.getByRole('tab', { name: 'Afbeelding & video' }).click();
  await page.getByRole('button', { name: 'Video-link toevoegen' }).click();
  await page.getByLabel('Link').fill(dummyPlace.video);
  await page.getByRole('button', { name: 'Toevoegen' }).click();
  await expect(page.getByRole('img', { name: 'video' })).toBeVisible();
  await expect(page.getByText(dummyPlace.video)).toBeVisible();
  await expect(
    page
      .getByRole('tab', { name: 'Afbeelding & video' })
      .locator('.fa-check-circle'),
  ).toBeVisible();

  // 5. Publish
  await page.getByRole('button', { name: 'Publiceren', exact: true }).click();

  // 6. Verify if created location is visible on dashboard
  await page.goto(`${baseURL}/dashboard?tab=places&page=1`);
  await expect(page.getByText(dummyPlace.name).first()).toBeVisible();
});
