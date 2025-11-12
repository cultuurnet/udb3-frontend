import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

const dummyRole = {
  name: 'e2e-test ' + faker.lorem.words(2),
  longName: 'e2e-test ' + faker.string.alphanumeric(300),
  constraint: faker.lorem.words(3),
  nonExistingEmail: faker.internet.email(),
  existingEmail: process.env.E2E_TEST_ADMIN_EMAIL,
  labelName: 'e2e',
};
let createdRoleUrl: string;

test.describe('Role Editing - Admin', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'ff_react_roles_create_edit',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);
    await page.goto('/manage/roles/create');
    await page.getByLabel('Naam').fill(dummyRole.name);
    await page.getByRole('button', { name: 'Toevoegen' }).click();
    await page.waitForLoadState('networkidle');
    createdRoleUrl = page.url();
  });

  test.afterEach(async ({ page }) => {
    await page.goto('/manage/roles');
    await page.getByLabel('Zoeken').fill(dummyRole.name);
    await page.waitForLoadState('networkidle');
    await page
      .getByRole('row')
      .filter({ hasText: dummyRole.name })
      .getByRole('button', { name: 'Verwijderen' })
      .click();
    await page.getByRole('button', { name: 'Definitief verwijderen' }).click();
    await page.waitForLoadState('networkidle');
  });

  test('has freshly created role to edit', async ({ page }) => {
    await page.goto('/manage/roles');
    await page.getByLabel('Zoeken').fill(dummyRole.name);
    await page.waitForLoadState('networkidle');
    await page
      .getByRole('row')
      .filter({ hasText: dummyRole.name })
      .getByRole('link', { name: 'Bewerken' })
      .click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(createdRoleUrl);
  });

  test('has role information', async ({ page }) => {
    await expect(page).toHaveURL(createdRoleUrl);
    const roleNameButton = page
      .locator('#role-name-display')
      .getByRole('button', { name: 'Wijzigen' });
    await expect(roleNameButton).toBeVisible();
    await roleNameButton.click();
    const roleNameInput = page.getByLabel('Naam');
    await expect(roleNameInput).toBeVisible();
    await expect(roleNameInput).toHaveValue(dummyRole.name);

    const saveButton = page
      .locator('.role-name-input')
      .getByRole('button', { name: 'Bewaren' });
    const cancelButton = page
      .locator('.role-name-input')
      .getByRole('button', { name: 'Annuleren' });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
    await expect(cancelButton).toBeVisible();
    await expect(cancelButton).toBeEnabled();

    await roleNameInput.fill('b');
    await expect(saveButton).toBeDisabled();
    await expect(
      page.locator('span:below(input[name="name"])').first(),
    ).toContainText('3 tekens');
  });

  test('can edit role name', async ({ page }) => {
    const newRoleName = dummyRole.name + ' edited';
    const roleNameButton = page
      .locator('#role-name-display')
      .getByRole('button', { name: 'Wijzigen' });
    await roleNameButton.click();
    const roleNameInput = page.getByLabel('Naam');
    const saveButton = page
      .locator('.role-name-input')
      .getByRole('button', { name: 'Bewaren' });

    await roleNameInput.fill(newRoleName);
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await page.waitForLoadState('networkidle');

    const updatedRoleNameButton = page
      .locator('#role-name-display')
      .getByRole('button', { name: 'Wijzigen' });
    await expect(updatedRoleNameButton).toBeVisible();
    await expect(page.locator('#role-name-display')).toContainText(newRoleName);
  });

  test('can add and edit role constraints', async ({ page }) => {
    const constraintsSection = page.locator('.role-constraints-section');

    const addConstraintButton = constraintsSection.getByRole('button', {
      name: 'Toevoegen',
    });
    await expect(addConstraintButton).toBeVisible();
    await addConstraintButton.click();

    let constraintInput = page.locator('#constraint-value');
    await expect(constraintInput).toBeVisible();
    await expect(constraintInput).toHaveValue('');

    const constraintSaveButton = constraintsSection.getByRole('button', {
      name: 'Bewaren',
    });
    const constraintCancelButton = constraintsSection.getByRole('button', {
      name: 'Annuleren',
    });
    await expect(constraintSaveButton).toBeVisible();
    await expect(constraintSaveButton).toBeDisabled();
    await expect(constraintCancelButton).toBeVisible();
    await expect(constraintCancelButton).toBeEnabled();

    await constraintInput.fill(dummyRole.constraint);
    await expect(constraintSaveButton).toBeEnabled();
    await constraintSaveButton.click();
    await page.waitForLoadState('networkidle');

    const constraintDisplay = constraintsSection.getByText(
      dummyRole.constraint,
    );
    await expect(constraintDisplay).toBeVisible();
    await page.goto(createdRoleUrl);

    const editConstraintButton = constraintsSection.getByRole('button', {
      name: 'Wijzigen',
    });
    const removeConstraintButton = constraintsSection.getByRole('button', {
      name: 'Verwijderen',
    });
    await expect(editConstraintButton).toBeVisible();
    await expect(removeConstraintButton).toBeVisible();

    await editConstraintButton.click();
    constraintInput = page.locator('#constraint-value');
    await expect(constraintInput).toBeVisible();
    await expect(constraintInput).toHaveValue(dummyRole.constraint);

    const updatedConstraint = dummyRole.constraint + ' updated';
    await constraintInput.fill(updatedConstraint);
    await expect(constraintSaveButton).toBeEnabled();
    await constraintSaveButton.click();
    await page.waitForLoadState('networkidle');

    const updatedConstraintDisplay =
      constraintsSection.getByText(updatedConstraint);
    await expect(updatedConstraintDisplay).toBeVisible();

    await editConstraintButton.click();
    constraintInput = page.locator('#constraint-value');
    await expect(constraintInput).toBeVisible();
    await expect(constraintInput).toHaveValue(updatedConstraint);
    await constraintCancelButton.click();
    await expect(constraintsSection.getByText(updatedConstraint)).toBeVisible();

    await removeConstraintButton.click();
    await expect(constraintsSection.getByText(updatedConstraint)).toHaveCount(
      0,
    );
  });

  test('can add and remove role permissions', async ({ page }) => {
    const permissionsSection = page.locator('.role-permissions-section');

    const checkboxes = await permissionsSection
      .locator('input[type="checkbox"]')
      .all();
    for (const checkbox of checkboxes) {
      await expect(checkbox).not.toBeChecked();
    }

    await checkboxes[0].check();
    await expect(checkboxes[0]).toBeChecked();
    await page.waitForTimeout(100);
    const toast = page.locator('.toast');
    expect(toast).toBeVisible();
    expect(toast).toContainText('toegevoegd');

    page.goto(createdRoleUrl);
    await checkboxes[0].waitFor();
    await expect(checkboxes[0]).toBeChecked();

    await checkboxes[0].uncheck();
    await expect(checkboxes[0]).not.toBeChecked();
    await page.waitForTimeout(100);
    expect(toast).toBeVisible();
    expect(toast).toContainText('verwijderd');
  });

  test('can add and remove role users', async ({ page }) => {
    await expect(page).toHaveURL(createdRoleUrl);

    await page.getByRole('tab', { name: 'Leden' }).click();
    const usersSection = page.locator('.role-users-section');
    expect(usersSection).toBeVisible();
    await expect(usersSection).toContainText('nog geen gebruikers');

    await usersSection.getByLabel('Voeg lid toe').fill('b');
    await expect(
      usersSection.locator('span:below(input[name="email"])').first(),
    ).toContainText('geldig');

    await usersSection.getByLabel('Voeg lid toe').fill('');
    await expect(
      usersSection.locator('span:below(input[name="email"])').first(),
    ).toContainText('verplicht');

    await usersSection
      .getByLabel('Voeg lid toe')
      .fill(dummyRole.nonExistingEmail);
    const addUserButton = usersSection.getByRole('button', {
      name: 'Toevoegen',
    });
    await expect(addUserButton).toBeEnabled();
    await addUserButton.click();
    await page.waitForLoadState('networkidle');
    await expect(
      usersSection.locator('span:below(input[name="email"])').first(),
    ).toContainText('niet gevonden');

    await usersSection.getByLabel('Voeg lid toe').fill(dummyRole.existingEmail);
    await expect(addUserButton).toBeEnabled();
    await addUserButton.click();
    await page.waitForLoadState('networkidle');

    await expect(usersSection.locator('table')).toBeVisible();
    const userRow = usersSection
      .locator('table')
      .getByRole('row')
      .filter({ hasText: dummyRole.existingEmail });
    await expect(userRow).toBeVisible();

    const removeUserButton = userRow.getByRole('button', {
      name: 'Lidmaatschap verwijderen',
    });
    await expect(removeUserButton).toBeVisible();
    await removeUserButton.click();
    await page.waitForLoadState('networkidle');
    await expect(usersSection).toContainText('nog geen gebruikers');
  });

  test('can add and remove role labels', async ({ page }) => {
    await expect(page).toHaveURL(createdRoleUrl);

    await page.getByRole('tab', { name: 'Labels' }).click();

    const labelsSection = page.locator('.role-labels-section');
    expect(labelsSection).toBeVisible();

    await labelsSection
      .getByLabel('Voeg een label toe')
      .fill(dummyRole.labelName);

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const labelsPicker = labelsSection.locator('div#labels-picker');
    await expect(labelsPicker).toBeVisible();
    const labelOption = labelsPicker.getByRole('option').first();
    await expect(labelOption).toBeVisible();
    await labelOption.click();
    await page.waitForLoadState('networkidle');

    await expect(labelsSection.locator('.picked-labels')).toBeVisible();
    await expect(labelsSection.locator('.picked-labels')).toContainText(
      dummyRole.labelName,
    );

    await labelsSection
      .locator('.picked-labels')
      .first()
      .locator('svg')
      .click();
    await page.waitForLoadState('networkidle');
    await expect(labelsSection.locator('.picked-labels')).not.toContainText(
      dummyRole.labelName,
    );

    await labelsSection
      .getByLabel('Voeg een label toe')
      .fill(dummyRole.longName);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(labelOption).toBeVisible();
    await expect(labelOption).toContainText('Geen label gevonden?');
  });
});
