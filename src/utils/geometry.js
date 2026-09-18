/**
 * Geometry helpers for pose analysis.
 * All functions are pure — no side effects.
 */

/**
 * Returns the angle in degrees between two points.
 * 0° = directly right, -90° = directly above.
 */
export function getAngle(p1, p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
}

/**
 * Returns the Euclidean distance between two points.
 */
export function getDistance(p1, p2) {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

/**
 * Returns the midpoint between two points.
 */
export function getMidpoint(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}
