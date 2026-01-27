/**
 * User utilities (frontend)
 * Centralizes how we detect the current logged-in user.
 *
 * NOTE: This project stores "authToken" as the PHP session id returned by login.php.
 * Some pages do not store userId in localStorage; in that case we resolve it via get_profile.php.
 */

import CONFIG from "../config.js";
import { apiCall } from "./api.js";

/**
 * @returns {number|null} userId
 */
export function getCachedUserId() {
  const raw = localStorage.getItem("userId");
  if (!raw) return null;
  const id = parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/**
 * Resolve userId for already-authenticated users (token exists but userId not cached).
 * @returns {Promise<number|null>}
 */
export async function ensureCurrentUserId() {
  const cached = getCachedUserId();
  if (cached) return cached;

  const token = localStorage.getItem("authToken");
  if (!token) return null;

  const profile = await apiCall(`${CONFIG.PROFILE_API_URL}/get_profile.php`, "GET");
  const id = profile?.data?.id ?? profile?.data?.user_id ?? null;
  const parsed = parseInt(id, 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    localStorage.setItem("userId", String(parsed));
    return parsed;
  }
  return null;
}



