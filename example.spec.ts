// Note the import now comes from our fixtures file rather than Playwright
import { TestConfig } from '../../../framework/config';
import { test, expect } from '../../../framework/fixtures';

// See tests/e2e/ui/example.spec.ts for some more info on the pattern used for the test.describe
test.describe('Feature: Accelerator API Example Tests:', { tag: ['@Accelerator', '@Example-Tests', '@API'] }, () => {
  let token: string;
  // This could be abstracted out into a worker fixture, a separate API authentication project, or even a test setup function called in the playwright.config.ts file
  // For now, this should serve as an example of how we configure these tests with the other fixtures provided and allows for only one authentication call for all tests
  test.beforeAll('Authenticate with the service', async ({ bookingService }) => {
    const requestBody = {
      username: TestConfig.credentials.api.username,
      password: TestConfig.credentials.api.password
    };

    const response = await bookingService.authenticate(requestBody);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('token');

    token = responseBody.token;
  });

  // As we created the service fixture, we can have very granular control over which APIs the tests use, and it simplifies them greatly
  test('Add a booking', async ({ bookingService }) => {
    const requestBody = {
      firstname: 'Alice',
      lastname: 'Tester',
      totalprice: 1011,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-01-01',
        checkout: '2025-02-01'
      },
      additionalneeds: 'none'
    };
    const response = await bookingService.addBooking(requestBody, token);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();

    // Use the expect().toHaveProperty to gracefully fail when we don't get back something we need - the second argument is an assertion of equality
    expect(responseBody).toHaveProperty('bookingid', expect.any(Number));
    expect(responseBody).toHaveProperty('booking', requestBody);
  });
});
