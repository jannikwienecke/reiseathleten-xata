import { type Page, expect, test } from "@playwright/test";

const login = async (page: Page) => {
  await page.goto("/login");
  await page.getByLabel("Email address").click();
  await page.getByLabel("Email address").fill("admin@admin.de");
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill("admin");
  await page.getByRole("button", { name: "Login" }).click();
};

test("basic walkthrough", async ({ page }) => {
  await login(page);

  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "All Vacations" }).click();

  await page
    .getByRole("link", {
      name: "My Vacation Mon Jul 10 2023 - Mon Jul 17 2023",
    })
    .click();

  await page
    .locator("div")
    .filter({ hasText: /Sightseeing$/ })
    .click();
  await page.getByRole("button", { name: "Book a time" }).click();
  await page.getByRole("textbox").click();
  await page.getByRole("button", { name: "Go back to dashboard" }).click();

  await page.getByText("10").click();
  await page
    .locator("div")
    .filter({ hasText: /^Hike the Teide$/ })
    .click();
  await page.getByRole("button", { name: "Go back to dashboard" }).click();
});

test("set the time of an activity", async ({ page }) => {
  // clear cookies
  await page.context().clearCookies();
  await page.goto("/login");
  await login(page);

  await page.getByText(/my vacation/i).click();

  await page.waitForTimeout(2000);

  await page.getByText(/personal training/i).click();
  await page.getByText(/book a time/i).click();

  let tommorow = new Date();
  tommorow.setDate(tommorow.getDate() + 1);

  await page.getByRole("textbox").fill(tommorow.toISOString().slice(0, 16));

  expect(await page.isVisible("text=Confirm")).toBe(true);

  await page.getByRole("button", { name: "Confirm" }).click();

  await page.waitForTimeout(3000);

  expect(await page.getByText(/personal training/i).isVisible()).toBe(false);
});
