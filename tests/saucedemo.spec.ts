import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { MenuComponent } from '../pages/MenuComponent';
import { users } from '../test-data/users';

test.describe('SauceDemo', () => {
  test('Login happy path', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.open();
    await loginPage.login(users.standard.username, users.standard.password);

    await expect(
      page,
      'User should be redirected to the inventory page after successful login'
    ).toHaveURL(/inventory/);

    await expect(
      inventoryPage.title,
      'Products page title should be displayed'
    ).toHaveText('Products');
  });

  test('Login error path', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(users.invalid.username, users.invalid.password);

    await expect(
      loginPage.errorMessage,
      'Error message should be displayed for invalid credentials'
    ).toHaveText(
      'Epic sadface: Username and password do not match any user in this service'
    );
  });

  test.describe('Authenticated user actions', () => {
    let loginPage: LoginPage;
    let inventoryPage: InventoryPage;
    let cartPage: CartPage;
    let menu: MenuComponent;

    test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      inventoryPage = new InventoryPage(page);
      cartPage = new CartPage(page);
      menu = new MenuComponent(page);

      await loginPage.open();
      await loginPage.login(users.standard.username, users.standard.password);

      await expect(
        page,
        'User should be redirected to the inventory page before authenticated tests'
      ).toHaveURL(/inventory/);
    });

    test('Add product to cart', async ({ page }) => {
      await inventoryPage.addBackpackToCart();

      await expect(
        inventoryPage.cartBadge,
        'Cart badge should show 1 item after adding Backpack'
      ).toHaveText('1');
    });

    test('Remove product from cart', async ({ page }) => {
      await inventoryPage.addBackpackToCart();

      await expect(
        inventoryPage.cartBadge,
        'Cart badge should show 1 item before removal'
      ).toHaveText('1');

      await inventoryPage.removeBackpack();

      await expect(
        inventoryPage.cartBadge,
        'Cart badge should disappear after removing the product'
      ).toHaveCount(0);
    });

    test('Multiple products can be added independently', async ({ page }) => {
      await inventoryPage.addBackpackToCart();
      await inventoryPage.addBikeLight();
      await inventoryPage.addBoltShirt();

      await expect(
        inventoryPage.cartBadge,
        'Cart badge should show 3 items after adding three products'
      ).toHaveText('3');
    });

    test('Sort products by Price low to high', async ({ page }) => {
      await inventoryPage.sortLowToHigh();

      await expect(
        page.locator('.inventory_item_name').first(),
        'Lowest-priced product should be displayed first'
      ).toHaveText('Sauce Labs Onesie');
    });

    test('Cart retains product after page refresh', async ({ page }) => {
      await inventoryPage.addBackpackToCart();

      await expect(
        inventoryPage.cartBadge,
        'Cart badge should show 1 item before refresh'
      ).toHaveText('1');

      await page.reload();

      await expect(
        inventoryPage.cartBadge,
        'Cart badge should still show 1 item after refresh'
      ).toHaveText('1');

      await inventoryPage.openCart();

      await expect(
        page,
        'User should be redirected to the cart page'
      ).toHaveURL(/cart.html/);

      await expect(
        cartPage.cartItems.first(),
        'Backpack should remain in the cart after refresh'
      ).toHaveText('Sauce Labs Backpack');
    });

    test('Hamburger menu displays all expected menu items', async ({ page }) => {
      await menu.open();

      await expect(
        menu.allItems,
        'All Items menu item should be displayed'
      ).toHaveText('All Items');

      await expect(
        menu.about,
        'About menu item should be displayed'
      ).toHaveText('About');

      await expect(
        menu.logout,
        'Logout menu item should be displayed'
      ).toHaveText('Logout');

      await expect(
        menu.resetAppState,
        'Reset App State menu item should be displayed'
      ).toHaveText('Reset App State');

      await menu.close();
    });
  });
});