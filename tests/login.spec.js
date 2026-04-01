import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should load the login page and show the form', async ({ page }) => {
    // Navigate to the base URL (which should redirect or show the login page if not authenticated)
    await page.goto('/');

    // Wait for the login form to appear
    await expect(page.locator('.login-container')).toBeVisible({ timeout: 10000 });
    
    // Check for the inputs
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/');

    // Fill in wrong credentials
    await page.locator('input[type="text"]').fill('wronguser');
    await page.locator('input[type="password"]').fill('wrongpass');
    
    // Submit
    await page.locator('button[type="submit"]').click();

    // The login component renders <p className="error"> for invalid credentials
    const errorMessage = page.locator('.error');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

});
