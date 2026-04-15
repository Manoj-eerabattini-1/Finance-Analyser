/**
 * Utility to clean up old mock localStorage keys
 * These keys were used for the old mock authentication and data storage
 * They should be removed to prevent conflicts with the new API-based approach
 */

const OLD_MOCK_KEYS = [
  'finance-planner-transactions', // Old mock transactions
  'finance-planner-goals',         // Old mock goals
  'finance-planner-users',         // Old mock users
  'finance-planner-auth',          // Old auth state
  'finance-planner-user',          // Old current user
  'finance-planner-reports',       // Old shared reports
];

export function cleanupOldMockData(): void {
  try {
    OLD_MOCK_KEYS.forEach(key => {
      if (localStorage.getItem(key) !== null) {
        console.log(`Clearing old localStorage key: ${key}`);
        localStorage.removeItem(key);
      }
    });
    console.log('Old mock data cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up old localStorage data:', error);
  }
}

/**
 * Call this function early in the app lifecycle (e.g., in main.tsx or App.tsx)
 * It will safely remove all old mock localStorage entries without affecting new API-based storage
 */
