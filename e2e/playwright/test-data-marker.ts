/**
 * Test data marker - used to identify e2e test data
 * All test data should be prefixed with this marker
 */

export const E2E_TEST_MARKER = "E2E_TEST";

/**
 * Check if a pk/sk belongs to test data
 */
export function isTestData(pk: string | null | undefined): boolean {
  if (!pk) return false;
  return pk.startsWith(E2E_TEST_MARKER);
}

/**
 * Create a test data pk with the marker prefix
 */
export function createTestDataPk(prefix: string): string {
  return `${E2E_TEST_MARKER}_${prefix}`;
}
