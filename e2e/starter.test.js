describe("complyDesk", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it("should show the login screen", async () => {
    await expect(element(by.text("Sign In"))).toBeVisible();
  });

  it("should navigate to dashboard after login", async () => {
    await element(by.id("email-input")).typeText("admin@complydesk.com");
    await element(by.id("password-input")).typeText("password123");
    await element(by.text("Sign In")).tap();
    await expect(element(by.text("Dashboard"))).toBeVisible();
  });
});
