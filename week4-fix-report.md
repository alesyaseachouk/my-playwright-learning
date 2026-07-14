
Test 1 
Root cause: The error locator used getByTestId("error"), but SauceDemo uses the data-test attribute. The expected error message was also incorrect.

Fix: Replaced the locator with page.locator('[data-test="error"]') and updated the expected text. 


Test 2
Root cause: The error locator used getByTestId("error"), but SauceDemo uses the data-test attribute. The expected error message was also incorrect.

Fix: Replaced the locator with page.locator('[data-test="error"]') and updated the expected text.

Test 3

Root cause: The click action was missing await, so Playwright could continue before the click completed.

Fix: Added await before .click().