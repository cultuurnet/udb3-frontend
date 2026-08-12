import { test } from '@playwright/test';

import { takeVrtScreenshot } from './support';

test('labels create', async ({ page }) => {
  await page.goto('/manage/labels/create');
  await takeVrtScreenshot(page.locator('main'));
});

test('labels overview', async ({ page }) => {
  await page.goto('/manage/labels');
  await takeVrtScreenshot(page.locator('main'));
});

test('labels edit', async ({ page }) => {
  await page.goto('/manage/labels/vrt-mock-label-1/edit');
  await takeVrtScreenshot(page.locator('main'));
});

test('labels search results', async ({ page }) => {
  await page.goto('/manage/labels');
  await page
    .getByPlaceholder('Schrijf een zoekopdracht van minstens 2 karakters.')
    .fill('verborgen');
  await page.getByText('VRT mock label — verborgen').waitFor();
  await takeVrtScreenshot(page.locator('main'));
});

test('labels no results', async ({ page }) => {
  await page.goto('/manage/labels');
  await page
    .getByPlaceholder('Schrijf een zoekopdracht van minstens 2 karakters.')
    .fill('geen-resultaten-mock');
  await page.getByText('Geen labels gevonden.').waitFor();
  await takeVrtScreenshot(page.locator('main'));
});
