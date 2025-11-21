import { faker } from '@faker-js/faker';
import { expect, test as base } from '@playwright/test';

let dummyRole: any;

type TestFixtures = {
  uniqueRoleUrl: string;
  uniqueRoleName: string;
};

const test = base.extend<TestFixtures>({
  uniqueRoleUrl: async ({ page, context, uniqueRoleName }, applyFixture) => {
    await context.addCookies([
      {
        name: 'ff_react_roles_create_edit',
        value: 'true',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/manage/roles/create');
    await page.getByLabel('Naam').fill(uniqueRoleName);
    await page.getByRole('button', { name: 'Toevoegen' }).click();
    await page.waitForURL(/\/manage\/roles\/[a-f0-9-]+\/edit$/);
    await page.waitForLoadState('networkidle');

    const roleUrl = page.url();

    await applyFixture(roleUrl);

    try {
      if (
        !page.url().includes('/manage/roles/') ||
        page.url().endsWith('/create')
      ) {
        await page.goto(roleUrl);
        await page.waitForLoadState('networkidle');
      }

      await page.getByRole('button', { name: 'Rol verwijderen' }).click();
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Definitief verwijderen' })
        .click();
      await page.waitForURL('/manage/roles');
    } catch {
      // Role cleanup failed - likely already deleted or test failure
    }
  },

  uniqueRoleName: async ({}, applyFixture, testInfo) => {
    const timestamp = Date.now();
    const uniqueRoleName = `e2e-test-${faker.lorem.words(2)}-${timestamp}`;
    await applyFixture(uniqueRoleName);
  },
});
test.describe('Role Editing - Admin', () => {
  test.beforeAll(async () => {
    dummyRole = {
      longName: 'e2e-test ' + faker.string.alphanumeric(300),
      constraint: faker.lorem.words(3),
      nonExistingEmail: faker.internet.email(),
      existingEmail: process.env.E2E_TEST_ADMIN_EMAIL,
      labelName: 'e2e',
    };
  });

  test('has freshly created role to edit', async ({
    page,
    uniqueRoleUrl,
    uniqueRoleName,
  }) => {
    await page.goto('/manage/roles');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Zoeken').fill(uniqueRoleName);
    await page.waitForLoadState('networkidle');
    await page
      .getByRole('row')
      .filter({ hasText: uniqueRoleName })
      .getByRole('link', { name: 'Bewerken' })
      .click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(uniqueRoleUrl);
  });

  test('has role information', async ({ page, uniqueRoleUrl }) => {
    await expect(page).toHaveURL(uniqueRoleUrl);
    const roleNameButton = page
      .locator('#role-name-display')
      .getByRole('button', { name: 'Wijzigen' });
    await expect(roleNameButton).toBeVisible();
    await roleNameButton.click();
    const roleNameInput = page.getByLabel('Naam');
    await expect(roleNameInput).toBeVisible();
    const roleNameValue = await roleNameInput.inputValue();
    await expect(roleNameValue).toMatch(/^e2e-test-.+/);

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

  test('can edit role name', async ({
    page,
    uniqueRoleUrl,
    uniqueRoleName,
  }) => {
    const newRoleName = uniqueRoleName + ' edited';
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

  test('can add and edit role constraints', async ({ page, uniqueRoleUrl }) => {
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
    await page.goto(uniqueRoleUrl);
    await page.waitForLoadState('networkidle');

    await constraintDisplay.waitFor();

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
    await page.waitForTimeout(500);

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
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Ben je zeker dat je');
    await expect(
      dialog.getByRole('button', { name: 'Verwijderen' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Annuleren' }),
    ).toBeVisible();

    await dialog.getByRole('button', { name: 'Verwijderen' }).click();
    await page.waitForLoadState('networkidle');
    await expect(constraintsSection.getByText(updatedConstraint)).toHaveCount(
      0,
    );
  });

  test('can add and remove role permissions', async ({
    page,
    uniqueRoleUrl,
  }) => {
    const permissionsSection = page.locator('.role-permissions-section');

    await permissionsSection.waitFor();

    const checkboxes = await permissionsSection
      .locator('input[type="checkbox"]')
      .all();

    expect(checkboxes.length).toBeGreaterThan(0);

    for (const checkbox of checkboxes) {
      await expect(checkbox).not.toBeChecked();
    }

    await checkboxes[0].check();
    await expect(checkboxes[0]).toBeChecked();
    await page.waitForTimeout(100);
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('toegevoegd');

    await page.goto(uniqueRoleUrl);
    await checkboxes[0].waitFor();
    await expect(checkboxes[0]).toBeChecked();

    await checkboxes[0].uncheck();
    await expect(checkboxes[0]).not.toBeChecked();
    await page.waitForTimeout(100);
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('verwijderd');
  });

  test('can add and remove role users', async ({ page, uniqueRoleUrl }) => {
    await expect(page).toHaveURL(uniqueRoleUrl);

    await page.getByRole('tab', { name: 'Leden' }).click();
    const usersSection = page.locator('.role-users-section');
    await expect(usersSection).toBeVisible();
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

  test('can add and remove role labels', async ({ page, uniqueRoleUrl }) => {
    await expect(page).toHaveURL(uniqueRoleUrl);

    await page.getByRole('tab', { name: 'Labels' }).click();

    const labelsSection = page.locator('.role-labels-section');
    await expect(labelsSection).toBeVisible();

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

  test('can delete role with confirmation modal', async ({
    page,
    uniqueRoleUrl,
  }) => {
    await expect(page).toHaveURL(uniqueRoleUrl);
    const deleteButton = page.getByRole('button', { name: 'Rol verwijderen' });
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toBeEnabled();
    await deleteButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Ben je zeker dat je');
    await expect(
      dialog.getByRole('button', { name: 'Definitief verwijderen' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Annuleren' }),
    ).toBeVisible();

    await dialog.getByRole('button', { name: 'Annuleren' }).click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(uniqueRoleUrl);
  });
});
