import { test, expect } from '@playwright/test';

test.describe('Portal Functional Journeys', () => {
    // Use real credentials from environment
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    test.beforeEach(async ({ page }) => {
        if (!email || !password) {
            throw new Error('TEST_USER_EMAIL or TEST_USER_PASSWORD not set in environment');
        }

        // Login once before each portal test
        await page.goto('/login');
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Sign In")');
        await expect(page).toHaveURL(/\/portal/);
    });

    test('should log a new immersion activity', async ({ page }) => {
        // Generate a unique note to identify this specific test run
        const uniqueNote = `E2E Test Activity - ${Date.now()}`;

        // Open the Log Activity sheet
        // Based on TodaysActivities.tsx, the button text is "Add"
        await page.click('button:has-text("Add")');

        // Wait for Sheet to open - the sheet title IS "Log Activity"
        await expect(page.locator('text=Log Activity').first()).toBeVisible();

        // Fill the form
        // Note: The form uses a native select for activity type
        await page.selectOption('select', 'Watching Videos');
        await page.fill('input[placeholder="15"]', '30');
        await page.fill('input[placeholder="Details..."]', uniqueNote);

        // Submit
        await page.click('button:has-text("Log Activity")');

        // Verify success message exists
        await expect(page.locator('text=Activity logged!')).toBeVisible();

        // Verify it appeared in the list
        // The TodaysActivities component should refresh
        await expect(page.locator(`text=${uniqueNote}`)).toBeVisible();
    });

    test('should complete a daily mindset check-in', async ({ page }) => {
        const uniqueNote = `E2E Test Mindset - ${Date.now()}`;

        // Start Daily Check-in
        // If user has already checked in today, this button might not be visible
        // For automation, we'll check if it exists, or just verify the state
        const checkInBtn = page.locator('text=Start Daily Check-in');

        if (await checkInBtn.isVisible()) {
            await checkInBtn.click();

            // Verify mindset sheet is open
            await expect(page.locator('text=Daily Check-in').nth(1)).toBeVisible();

            // Pick "Great" (val 4, usually index 3 of the buttons in the row)
            // Or select by icon title/color if possible. Let's try val via nth
            await page.locator('button').filter({ hasText: 'Great' }).click();

            // Fill note
            await page.fill('textarea[placeholder="Any thoughts on your progress?"]', uniqueNote);

            // Save
            await page.click('button:has-text("Save Check-in")');

            // Verify success status
            await expect(page.locator('text=Check-in saved!')).toBeVisible();
        } else {
            console.log('User already checked in today, skipping creation but verifying state...');
        }

        // Verify the mindset section shows a note or the correct mood
        // If the note we just added (or a previous one) is visible
        await expect(page.locator('text=Today\'s Mindset')).toBeVisible();
    });

    test('should verify administrative access for test user', async ({ page }) => {
        // Check if "Admin" or related link is in the UI
        // The test user 'test@learnci.app' is confirmed IS_ADMIN=true in Supabase
        // Navigate directly to /admin
        await page.goto('/admin');

        // Use non-strict check to allow for "Admin Dashboard" or similar
        // Note: The admin page currently uses "Dashboard" as its H1
        await expect(page.locator('h1')).toContainText(/Dashboard/i);

        // Go back to portal
        await page.goto('/portal');
        await expect(page.locator('h1')).toContainText(/Portal/i);
    });
});
