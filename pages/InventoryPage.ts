import { type Locator, type Page } from "@playwright/test";

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator(".title");
    this.cartBadge = page.locator(".shopping_cart_badge");
    this.cartLink = page.locator(".shopping_cart_link");
    this.sortDropdown = page.locator(".product_sort_container");
  }

  async addBackpackToCart() {
    await this.page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  }

  async removeBackpack() {
    await this.page.click('[data-test="remove-sauce-labs-backpack"]');
  }

  async addBikeLight() {
    await this.page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
  }

  async addBoltShirt() {
    await this.page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
  }

  async sortLowToHigh() {
    await this.sortDropdown.selectOption("lohi");
  }

  async openCart() {
    await this.cartLink.click();
  }
}