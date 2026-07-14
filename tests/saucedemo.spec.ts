import { test, expect } from '@playwright/test';

test.describe('SauceDemo Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
  });

  test('Login (happy path)', async ({ page }) => {
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');

    await page.click('#login-button');

    // Verify redirect to inventory page
    await expect(page, 'User is not redirected to the inventory page').toHaveURL(/inventory/);

    // Additional stability assertion
    await expect(page.locator('.title'), 'Products page title is not displayed').toHaveText('Products');
  });

  test('Login (error path)', async ({ page }) => {
    await page.fill('#user-name', 'invalid_user');
    await page.fill('#password', 'invalid_password');

    await page.click('#login-button');

    // Verify error message is visible
    await expect(page.locator('[data-test="error"]'), 'Error message is not shown').toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // BUG 4 — Correct full error text includes "Epic sadface:" prefix
  //
  // The original suite had 'Empty login shows validation error' inside the
  // authenticated block (see BUG 1 below). These two tests replace it at the
  // correct top-level scope AND use the correct full error string (BUG 2).
  // ---------------------------------------------------------------------------
  test('Empty login shows validation error — username required', async ({ page }) => {
    // Click Login without entering username or password
    await page.click('#login-button');

    // Verify user stays on login page
    await expect(page, 'The URL is not opened').toHaveURL('https://www.saucedemo.com/');

    // Verify validation error is displayed
    await expect(page.locator('[data-test="error"]'), 'Validation error is not shown').toBeVisible();

    // ✅ Correct full message (original suite had 'Username is required' — missing prefix)
    await expect(page.locator('[data-test="error"]'), 'Full message is not shown').toHaveText(
      'Epic sadface: Username is required'
    );
  });

  test('Empty login shows validation error — password required', async ({ page }) => {
    // Username provided but password blank
    await page.fill('#user-name', 'standard_user');
    await page.click('#login-button');

    await expect(page, 'The page is not loaded').toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('[data-test="error"]'), 'Error message is not shown').toBeVisible();
    await expect(page.locator('[data-test="error"]'), 'Error message is not shown').toHaveText(
      'Epic sadface: Password is required'
    );
  });

  test.describe('Authenticated user actions', () => {

    test.beforeEach(async ({ page }) => {
      await page.fill('#user-name', 'standard_user');
      await page.fill('#password', 'secret_sauce');
      await page.click('#login-button');

      // Ensure login completed before continuing
      await expect(page).toHaveURL(/inventory/);
    });

    test('Add to cart', async ({ page }) => {
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');

      await expect(
        page.locator('.shopping_cart_badge'),
        'Cart badge is not showing 1 after adding a product'
      ).toHaveText('1');
    });

    test('Remove from cart', async ({ page }) => {
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');

      await expect(
        page.locator('.shopping_cart_badge')
      ).toHaveText('1');

      await page.click('[data-test="remove-sauce-labs-backpack"]');

      // Verify cart badge disappears completely
      await expect(
        page.locator('.shopping_cart_badge'),
        'Cart badge is still shown after removing the product'
      ).toHaveCount(0);
    });

    // -------------------------------------------------------------------------
    // BUG 1 — Original suite had this test nested here, causing it to always
    // fail: the beforeEach above logs in and navigates away from the login page,
    // so #login-button no longer exists when the test body runs.
    // Moved to top-level describe above (no-auth beforeEach).
    // -------------------------------------------------------------------------

    // ---------------------------------------------------------------------------
    // BUG 3 — Rapid "Add to cart" clicks on same item (regression guard)
    //
    // Confirmed safe: button swap is synchronous, badge never exceeds 1.
    // ---------------------------------------------------------------------------
    test('Rapid clicks on "Add to cart" — badge never exceeds 1', async ({ page }) => {
      const addButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');

      await addButton.click();
      // Force subsequent clicks — button is already replaced, should be no-ops
      await addButton.click({ force: true }).catch(() => {/* expected – button replaced */ });
      await addButton.click({ force: true }).catch(() => {/* expected – button replaced */ });

      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

      // Only one "Remove" button should exist
      await expect(
        page.locator('[data-test="remove-sauce-labs-backpack"]')
      ).toHaveCount(1);
    });

    test('Multiple different items can be added independently', async ({ page }) => {
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
      await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
      await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');

      await expect(page.locator('.shopping_cart_badge')).toHaveText('3');
    });

    // ---------------------------------------------------------------------------
    // BUG 4 — Fast add/remove cycles (regression guard)
    //
    // Confirmed safe: badge stays in sync through repeated cycles.
    // ---------------------------------------------------------------------------
    test('Single add→remove cycle leaves no badge', async ({ page }) => {
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
      await page.click('[data-test="remove-sauce-labs-backpack"]');

      await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
    });

    test('Three rapid add/remove cycles leave clean state', async ({ page }) => {
      for (let i = 0; i < 3; i++) {
        await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
        await page.click('[data-test="remove-sauce-labs-backpack"]');
      }

      // Badge must be gone after all cycles
      await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);

      // "Add to cart" button must be restored, not stuck as "Remove"
      await expect(
        page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')
      ).toBeVisible();
    });

    test('Add two items, remove one — badge decrements correctly', async ({ page }) => {
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
      await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');

      await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

      await page.click('[data-test="remove-sauce-labs-backpack"]');

      // Badge should show 1, not 0 or 2
      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    });

    test('Add 3 products, remove 1 — badge shows 2', async ({ page }) => {
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
      await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
      await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');

      const cartBadge = page.locator('.shopping_cart_badge');
      await expect(cartBadge).toHaveText('3');

      await page.click('[data-test="remove-sauce-labs-backpack"]');

      await expect(cartBadge).toHaveText('2');
      await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible();
    });

    test('Sort products by Price (low to high) changes the first product', async ({ page }) => {
      const firstProduct = page.locator('.inventory_item_name').first();

      // Change sort order
      await page.selectOption('.product_sort_container', 'lohi');

      // Verify the first product changes to the expected low-price item
      await expect(firstProduct).toHaveText('Sauce Labs Onesie');
    });

    test('Cart retains added product after page refresh', async ({ page }) => {
      // Add a product to the cart
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');

      // Verify badge shows 1
      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

      // Refresh the page
      await page.reload();

      // Verify badge still shows 1
      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

      // Verify the product is still in the cart
      await page.click('.shopping_cart_link');

      await expect(page).toHaveURL(/cart.html/);

      await expect(page.locator('.inventory_item_name').first()).toHaveText('Sauce Labs Backpack');
    });

    test('Hamburger menu displays all expected menu items', async ({ page }) => {
      // Open the hamburger menu
      await page.click('#react-burger-menu-btn');

      // Verify the menu is displayed
      await expect(
        page.locator('.bm-menu-wrap'),
        'Hamburger menu should be visible after clicking the menu button'
      ).toBeVisible();

      // Verify all menu items
      await expect(
        page.locator('#inventory_sidebar_link'),
        'All Items menu item should be displayed'
      ).toHaveText('All Items');

      await expect(
        page.locator('#about_sidebar_link'),
        'About menu item should be displayed'
      ).toHaveText('About');

      await expect(
        page.locator('#logout_sidebar_link'),
        'Logout menu item should be displayed'
      ).toHaveText('Logout');

      await expect(
        page.locator('#reset_sidebar_link'),
        'Reset App State menu item should be displayed'
      ).toHaveText('Reset App State');

      // Close the menu
      await page.click('#react-burger-cross-btn');

      await expect(
        page.locator('.bm-menu-wrap'),
        'Hamburger menu should be hidden after clicking the close button'
      ).not.toBeVisible();
    });

  });
}); 