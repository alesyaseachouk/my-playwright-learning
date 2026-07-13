import { test, expect } from '@playwright/test';       //Import tools

test('has title', async ({ page }) => {
   await page.goto('https://playwright.dev/');          //Go to the website

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);        //Check if the title contains "Playwright"
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');          // Go to the website

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();    // Click on the link with the name "Get started"

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible(); // Check if the heading with the name "Installation" is visible
});
