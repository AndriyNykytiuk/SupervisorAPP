import { test, expect } from '@playwright/test';

test.describe('Equipment Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    
    // Fill login credentials (using default dev user)
    await page.locator('input[type="text"]').fill('afryca');
    await page.locator('input[type="password"]').fill('qwerty');
    await page.locator('button[type="submit"]').click();

    // Verify successful login by waiting for the header brigade selector to appear
    await expect(page.locator('.header__select')).toBeVisible({ timeout: 10000 });
  });

  test('should successfully add and then update an electric tool', async ({ page }) => {
    // Select the first real brigade from the header dropdown (index 1 skips the empty default)
    const selectLocator = page.locator('.header__select');
    // Wait for the API to populate the detachments (optgroups)
    await expect(selectLocator.locator('optgroup').first()).toBeAttached({ timeout: 10000 });
    await selectLocator.selectOption({ index: 1 });

    // Navigate to the Tools (Обладнання) page via the sidebar to avoid a full page reload resetting state
    await page.locator('.sidebar-links a[href="/tools"]').click();

    // Wait for the specific container to appear
    const wrapper = page.locator('.item-electrictool-wrapper');
    await expect(wrapper).toBeVisible({ timeout: 10000 });

    // 1. ADD a new item
    // Click the '+ додати' button on the Electric Stations card
    await wrapper.locator('.add-btn').click();

    // Fill the add form in the modal
    const addForm = page.locator('.modal-content .add-form');
    await expect(addForm).toBeVisible();

    await addForm.locator('input[name="name"]').fill('Генератор E2E test');
    // Note: the input name in codebase has a typo 'yaerOfPurchase'
    await addForm.locator('input[name="yaerOfPurchase"]').fill('2023');
    await addForm.locator('input[name="powerOf"]').fill('50');
    await addForm.locator('select[name="placeOfStorage"]').selectOption({ label: 'Залучені' });
    await addForm.locator('input[name="notes"]').fill('Initial note');

    // Submit add form
    await addForm.locator('button[type="submit"]').click();

    // Catch success toast for adding
    const addSuccessToast = page.locator('.Toastify__toast--success').first();
    await expect(addSuccessToast).toBeVisible({ timeout: 5000 });

    // Form should close automatically
    await expect(addForm).toBeHidden({ timeout: 5000 });
    
    // Wait for the toast to disappear so it doesn't block clicks
    await expect(addSuccessToast).toBeHidden({ timeout: 10000 });

    // 2. UPDATE the item we just created
    // Find the update button in the list of electric tools
    const firstUpdateBtn = wrapper.locator('.update-btn').first();
    await expect(firstUpdateBtn).toBeVisible({ timeout: 10000 });
    
    // Click the edit button
    await firstUpdateBtn.click();

    // Look for the edit form that replaces the row content
    const editForm = wrapper.locator('form.edit-form').first();
    await expect(editForm).toBeVisible();

    // Find the "notes" input and append text to prove update
    const noteInput = editForm.locator('input[name="notes"]');
    await noteInput.fill('Updated note E2E');

    // Save changes
    const saveBtn = editForm.locator('button.save-btn');
    await saveBtn.click();

    // Check for success toast for the update
    const updateSuccessToast = page.locator('.Toastify__toast--success').first();
    await expect(updateSuccessToast).toBeVisible({ timeout: 5000 });

    // Verify form closed and it went back to row mode
    await expect(editForm).toBeHidden({ timeout: 5000 });
  });
});
