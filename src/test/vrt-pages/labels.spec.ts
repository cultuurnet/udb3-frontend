import { expect, test } from '@playwright/test';

test('labels create', async ({ page }) => {
  await page.goto('/manage/labels/create');
  await expect(page).toHaveScreenshot('pages--labels-create.png');
});

test('labels overview', async ({ page }) => {
  await page.goto('/manage/labels');
  await expect(page).toHaveScreenshot('pages--labels-overview.png');
});

test('labels edit', async ({ page }) => {
  await page.goto('/manage/labels/vrt-mock-label-1/edit');
  await expect(page).toHaveScreenshot('pages--labels-edit.png');
});

test('labels search results', async ({ page }) => {
  await page.goto('/manage/labels');
  await page
    .getByPlaceholder('Schrijf een zoekopdracht van minstens 2 karakters.')
    .fill('verborgen');
  await page.getByText('VRT mock label — verborgen').waitFor();
  await expect(page).toHaveScreenshot('pages--labels-search-results.png');
});

test('labels no results', async ({ page }) => {
  await page.goto('/manage/labels');
  await page
    .getByPlaceholder('Schrijf een zoekopdracht van minstens 2 karakters.')
    .fill('geen-resultaten-mock');
  await page.getByText('Geen labels gevonden.').waitFor();
  await expect(page).toHaveScreenshot('pages--labels-no-results.png');
});
