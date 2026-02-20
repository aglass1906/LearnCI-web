import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should log in successfully with valid credentials', async ({ page }) => {
        const email = process.env.TEST_USER_EMAIL;
        const password = process.env.TEST_USER_PASSWORD;

        if (!email || !password) {
            throw new Error('TEST_USER_EMAIL or TEST_USER_PASSWORD not set in environment');
        }

        await page.goto('/login');

        // Fill in the login form
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);

        // Click sign in
        await page.click('button:has-text("Sign In")');

        // Should redirect to portal
        await expect(page).toHaveURL(/\/portal/);
        await expect(page.locator('h1')).toContainText(/Portal/i);
    });
});
