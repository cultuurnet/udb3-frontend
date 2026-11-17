// Set E2E_TEST_BASE_URL to run against a deployed environment instead of a local server
const baseURL = process.env.E2E_TEST_BASE_URL ?? 'http://localhost:3000';
const cookieDomain = new URL(baseURL).hostname;

export { baseURL, cookieDomain };
