/**
 * Guest query limiter — allows 2 free queries without login.
 * Stored in localStorage so it persists across page refreshes.
 */

const GUEST_QUERY_KEY = "nyayasahay_guest_queries";
const FREE_QUERY_LIMIT = 2;

export function getGuestQueryCount(): number {
  try {
    return parseInt(localStorage.getItem(GUEST_QUERY_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

export function incrementGuestQueries(): number {
  const count = getGuestQueryCount() + 1;
  localStorage.setItem(GUEST_QUERY_KEY, String(count));
  return count;
}

export function hasGuestReachedLimit(): boolean {
  return getGuestQueryCount() >= FREE_QUERY_LIMIT;
}

export function resetGuestQueries(): void {
  localStorage.removeItem(GUEST_QUERY_KEY);
}

export const FREE_LIMIT = FREE_QUERY_LIMIT;
