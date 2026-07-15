# Final Project — Playwright Test Suite

## Test Target
SauceDemo (https://www.saucedemo.com)

## Covered User Journeys
- User login
- Login validation
- Product management
- Shopping cart functionality
- Product sorting
- Hamburger menu navigation
- Cart persistence after page refresh

## Test Cases
- Valid user can log in
- Invalid user sees an error message
- Username required validation
- Password required validation
- User can add a product to the cart
- User can remove a product from the cart
- User can add multiple products
- Cart badge updates correctly
- Products can be sorted by price (low to high)
- Cart retains items after page refresh
- Hamburger menu displays all expected menu items

## Project Structure

- `pages/` — Page Object classes (`LoginPage`, `InventoryPage`, `CartPage`)
- `components/` — Reusable UI components (`MenuComponent`)
- `tests/` — Playwright test specifications
- `test-data/` — Test data (user credentials)
- `playwright.config.ts` — Playwright configuration

## How to Run

```bash
npm install
npx playwright install
npx playwright test
```

To run tests in Chromium only:

```bash
npx playwright test --project=chromium
```

To view the HTML report:

```bash
npx playwright show-report
```

## Notes

- Page Object Model (POM) is used to improve test maintainability.
- Test data is separated from test logic.
- Semantic Playwright locators are used (`getByRole`, `getByPlaceholder`, `getByTestId` where applicable).
- No hard waits (`waitForTimeout`) are used.

## Known Limitations

- The suite covers the main user flows only.
- Not all SauceDemo functionality is automated.