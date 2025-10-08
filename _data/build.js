/**
 * Global Data File: _data/build.js
 * Generates a unique version string based on the current build time.
 * This is used for cache busting assets (like main.css) via query strings.
 */
module.exports = {
  // Uses UTC time to prevent issues with local time changes.
  // Format: YYYYMMDDHHMMSS (e.g., 20251007223000)
  version: new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
};