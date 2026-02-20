import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/LearnCI/);
});

test('homepage has main heading', async ({ page }) => {
    await page.goto('/');

    // Expect the page to have a heading.
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
});
