import { type Locator, type Page } from "@playwright/test";

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator(".inventory_item_name");
  }

  async removeBackpack() {
    await this.page.click('[data-test="remove-sauce-labs-backpack"]');
  }

  async getFirstItemName() {
    return await this.cartItems.first().textContent();
  }
}