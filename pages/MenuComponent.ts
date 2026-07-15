import { type Locator, type Page } from "@playwright/test";

export class MenuComponent {
  readonly page: Page;
  readonly menuButton: Locator;
  readonly closeButton: Locator;
  readonly allItems: Locator;
  readonly about: Locator;
  readonly logout: Locator;
  readonly resetAppState: Locator;

  constructor(page: Page) {
    this.page = page;

    this.menuButton = page.locator("#react-burger-menu-btn");
    this.closeButton = page.locator("#react-burger-cross-btn");

    this.allItems = page.locator("#inventory_sidebar_link");
    this.about = page.locator("#about_sidebar_link");
    this.logout = page.locator("#logout_sidebar_link");
    this.resetAppState = page.locator("#reset_sidebar_link");
  }

  async open() {
    await this.menuButton.click();
  }

  async close() {
    await this.closeButton.click();
  }
}