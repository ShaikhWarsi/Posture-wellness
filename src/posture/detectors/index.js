/**
 * Posture Detectors — Barrel Export
 *
 * Each detector follows the same interface:
 *   detectXxx(keypointMap) → { issue: PostureType | null, ...metrics }
 *
 * To add a new posture detector:
 *   1. Create a new file in this folder
 *   2. Export a function matching the interface above
 *   3. Import and re-export it here
 *   4. Register it in ../analyzer.js
 */

export { detectNeckAngle } from "./neckAngle.js";
export { detectHeadTilt } from "./headTilt.js";
export { detectShoulderLevel } from "./shoulderLevel.js";
export { detectLean } from "./leanDetector.js";
export { detectChinTuck } from "./chinTuck.js";
export { detectShoulderShrug } from "./shoulderShrug.js";
export { detectScreenDistance } from "./screenDistance.js";
