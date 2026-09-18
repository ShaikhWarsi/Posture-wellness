#!/usr/bin/env node

/**
 * Posture Wellness — Command Line Interface (CLI)
 * Developed by: Shaikh Mohammad Warsi
 * 
 * Project: Computer Vision - Evaluated Project
 * Description: Command-line execution engine for on-device posture classification,
 *              vector angle calculations, and benchmark verification.
 */

import { analyzePosture } from "../src/posture/analyzer.js";
import { POSTURE_TYPES } from "../src/posture/types.js";
import { getAngle, getDistance, getMidpoint } from "../src/utils/geometry.js";
import fs from "fs";
import path from "path";

// Color helpers for terminal output (ANSI escape codes)
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
};

/**
 * Factory for creating synthetic MoveNet keypoint sets
 */
function createPose({
  nose = { x: 320, y: 160 },
  leftShoulder = { x: 260, y: 280 },
  rightShoulder = { x: 380, y: 280 },
  leftEar = { x: 280, y: 160 },
  rightEar = { x: 360, y: 160 },
  leftHip = { x: 270, y: 440 },
  rightHip = { x: 370, y: 440 },
  score = 0.95,
} = {}) {
  return {
    score: 0.98,
    keypoints: [
      { name: "nose", x: nose.x, y: nose.y, score },
      { name: "left_ear", x: leftEar.x, y: leftEar.y, score },
      { name: "right_ear", x: rightEar.x, y: rightEar.y, score },
      { name: "left_shoulder", x: leftShoulder.x, y: leftShoulder.y, score },
      { name: "right_shoulder", x: rightShoulder.x, y: rightShoulder.y, score },
      { name: "left_hip", x: leftHip.x, y: leftHip.y, score },
      { name: "right_hip", x: rightHip.x, y: rightHip.y, score },
    ],
  };
}

// Benchmark test suite covering all detectable posture variations
const BENCHMARK_SUITE = [
  {
    id: "good_posture",
    name: "Standard Neutral Upright Posture",
    expected: "Good Posture",
    pose: createPose({
      nose: { x: 320, y: 160 },
      leftShoulder: { x: 260, y: 280 },
      rightShoulder: { x: 380, y: 280 },
      leftEar: { x: 285, y: 160 },
      rightEar: { x: 355, y: 160 },
    }),
  },
  {
    id: "slouching",
    name: "Head Dropped Slouching (Angle < -95 deg)",
    expected: "Slouching",
    pose: createPose({
      nose: { x: 295, y: 215 }, // dropped angle < -95 deg
      leftShoulder: { x: 260, y: 280 },
      rightShoulder: { x: 380, y: 280 },
    }),
  },
  {
    id: "forward_head",
    name: "Cervical Forward Head Extension (Angle > -65 deg)",
    expected: "Forward Head",
    pose: createPose({
      nose: { x: 420, y: 210 },
      leftShoulder: { x: 260, y: 280 },
      rightShoulder: { x: 380, y: 280 },
    }),
  },
  {
    id: "head_tilted",
    name: "Cranial Lateral Tilt Asymmetry",
    expected: "Head Tilted",
    pose: createPose({
      nose: { x: 320, y: 160 },
      leftShoulder: { x: 260, y: 280 },
      rightShoulder: { x: 380, y: 280 },
      leftEar: { x: 280, y: 130 },
      rightEar: { x: 360, y: 185 },
    }),
  },
  {
    id: "uneven_shoulders",
    name: "Acromioclavicular Height Disparity",
    expected: "Uneven Shoulders",
    pose: createPose({
      nose: { x: 320, y: 160 },
      leftShoulder: { x: 260, y: 250 },
      rightShoulder: { x: 380, y: 310 },
      leftEar: { x: 285, y: 160 },
      rightEar: { x: 355, y: 160 },
    }),
  },
  {
    id: "leaning_sideways",
    name: "Torso Axial Lean Deviation",
    expected: "Leaning Sideways",
    pose: createPose({
      nose: { x: 380, y: 160 },
      leftShoulder: { x: 320, y: 280 },
      rightShoulder: { x: 440, y: 280 },
      leftHip: { x: 250, y: 440 },
      rightHip: { x: 350, y: 440 },
    }),
  },
  {
    id: "chin_tucked",
    name: "Excessive Cervical Retraction / Chin Tuck",
    expected: "Chin Tucked",
    pose: createPose({
      nose: { x: 320, y: 250 },
      leftShoulder: { x: 250, y: 270 },
      rightShoulder: { x: 390, y: 270 },
      leftEar: { x: 280, y: 200 },
      rightEar: { x: 360, y: 200 },
    }),
  },
  {
    id: "shoulders_raised",
    name: "Trapezius Stress Shrug Elevation",
    expected: "Shoulders Raised",
    pose: createPose({
      nose: { x: 320, y: 110 },
      leftShoulder: { x: 260, y: 175 }, // shoulders raised closer to ears
      rightShoulder: { x: 380, y: 175 },
      leftEar: { x: 275, y: 160 },
      rightEar: { x: 365, y: 160 },
    }),
  },
];

function printBanner() {
  console.log("");
  console.log(`${colors.cyan}${colors.bold}================================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  POSTURE WELLNESS -- COMPUTER VISION EVALUATION ENGINE         ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  Created & Developed by: Shaikh Mohammad Warsi                 ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  Academic Coursework: Computer Vision (Flipped Course)          ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}================================================================${colors.reset}`);
  console.log("");
}

function runBenchmark() {
  printBanner();
  console.log(`${colors.bold}Running Automated Computer Vision Posture Verification Benchmark...${colors.reset}`);
  console.log(`${colors.dim}Evaluating pose landmark geometry, vector trigonometry, and classification precision.${colors.reset}\n`);

  let passed = 0;
  let total = BENCHMARK_SUITE.length;

  console.log(
    `${colors.bold}${"ID".padEnd(20)} ${"TEST DESCRIPTION".padEnd(38)} ${"EXPECTED".padEnd(18)} ${"DETECTED".padEnd(18)} ${"STATUS"}${colors.reset}`
  );
  console.log("-".repeat(105));

  for (const test of BENCHMARK_SUITE) {
    const result = analyzePosture(test.pose);
    const primaryLabel = result.primary ? result.primary.label : "None";
    const detectedIssues = result.issues.map((i) => i.label);

    const isMatch =
      primaryLabel.toLowerCase() === test.expected.toLowerCase() ||
      detectedIssues.some((issue) => issue.toLowerCase() === test.expected.toLowerCase());

    const statusStr = isMatch
      ? `${colors.green}[PASS]${colors.reset}`
      : `${colors.red}[FAIL]${colors.reset}`;

    if (isMatch) passed++;

    console.log(
      `${test.id.padEnd(20)} ${test.name.substring(0, 36).padEnd(38)} ${test.expected.padEnd(18)} ${primaryLabel.padEnd(18)} ${statusStr}`
    );
  }

  console.log("-".repeat(105));
  console.log("");
  const passRate = ((passed / total) * 100).toFixed(1);
  console.log(`${colors.bold}BENCHMARK RESULTS SUMMARY:${colors.reset}`);
  console.log(`  Tests Executed : ${total}`);
  console.log(`  Tests Passed   : ${passed}`);
  console.log(`  Tests Failed   : ${total - passed}`);
  console.log(`  Accuracy Score : ${passed === total ? colors.green : colors.yellow}${passRate}%${colors.reset}`);
  console.log(`  Developer      : Shaikh Mohammad Warsi`);
  console.log(`  System Status  : ${passed === total ? colors.green + "ALL SYSTEMS OPERATIONAL (VERIFIED)" : colors.red + "ISSUES DETECTED"}${colors.reset}\n`);

  return passed === total;
}

function inspectSample(sampleId) {
  printBanner();
  const test = BENCHMARK_SUITE.find((t) => t.id.toLowerCase().includes(sampleId.toLowerCase()));
  if (!test) {
    console.log(`${colors.red}Error: Sample "${sampleId}" not found.${colors.reset}`);
    console.log(`Available samples: ${BENCHMARK_SUITE.map((s) => s.id).join(", ")}`);
    process.exit(1);
  }

  console.log(`${colors.bold}Detailed Biomechanical Analysis for: ${test.name}${colors.reset}\n`);

  const result = analyzePosture(test.pose);
  const nose = test.pose.keypoints.find((k) => k.name === "nose");
  const ls = test.pose.keypoints.find((k) => k.name === "left_shoulder");
  const rs = test.pose.keypoints.find((k) => k.name === "right_shoulder");
  const midShoulder = getMidpoint(ls, rs);
  const neckAngle = getAngle(midShoulder, nose);
  const shoulderDist = getDistance(ls, rs);
  const shoulderYDelta = Math.abs(ls.y - rs.y);

  console.log(`${colors.cyan}[1] Keypoint Coordinates Mapping:${colors.reset}`);
  console.log(`    Nose Position             : (x: ${nose.x.toFixed(1)}, y: ${nose.y.toFixed(1)})`);
  console.log(`    Left Shoulder Position    : (x: ${ls.x.toFixed(1)}, y: ${ls.y.toFixed(1)})`);
  console.log(`    Right Shoulder Position   : (x: ${rs.x.toFixed(1)}, y: ${rs.y.toFixed(1)})`);
  console.log(`    Calculated Shoulder Mid   : (x: ${midShoulder.x.toFixed(1)}, y: ${midShoulder.y.toFixed(1)})`);
  console.log("");
  console.log(`${colors.cyan}[2] Trigonometric & Vector Metrics:${colors.reset}`);
  console.log(`    Neck Vector Angle (atan2) : ${neckAngle.toFixed(2)} deg  (Nominal range: -95 deg to -65 deg)`);
  console.log(`    Shoulder Bi-lateral Width : ${shoulderDist.toFixed(2)} px`);
  console.log(`    Shoulder Y-Axis Disparity : ${shoulderYDelta.toFixed(2)} px`);
  console.log("");
  console.log(`${colors.cyan}[3] Classification Output:${colors.reset}`);
  console.log(`    Primary Classification    : ${colors.bold}${result.primary.label}${colors.reset} [Level: ${result.primary.level.toUpperCase()}]`);
  console.log(`    All Detected Flags        : ${result.issues.map((i) => i.label).join(", ") || "None"}`);
  console.log(`    Voice Coaching Feedback   : "${result.primary.voice || "Maintained correct alignment."}"`);
  console.log(`    Developer                 : Shaikh Mohammad Warsi`);
  console.log("");
}

function printHelp() {
  printBanner();
  console.log(`Usage:`);
  console.log(`  node cli/index.js [options]`);
  console.log(`  npm run cli`);
  console.log(`  npm test\n`);
  console.log(`Options:`);
  console.log(`  --benchmark, -b       Run complete test suite and verification benchmark (default)`);
  console.log(`  --sample <name>, -s   Inspect keypoint math for a specific posture condition`);
  console.log(`                        (options: good, slouching, forward_head, head_tilted, etc.)`);
  console.log(`  --file <path>, -f     Analyze a custom JSON file containing keypoints`);
  console.log(`  --author              Show project credentials & author statement`);
  console.log(`  --help, -h            Show this help manual\n`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  if (args.includes("--author")) {
    printBanner();
    console.log("Author Name   : Shaikh Mohammad Warsi");
    console.log("Project       : Posture Wellness - Computer Vision Evaluated Project");
    console.log("Institution   : VITyarthi Flipped Course Evaluation");
    console.log("Deadline      : Sep 18, 2026, 11:59 PM");
    console.log("Technology    : TensorFlow.js, MoveNet SinglePose, Geometric Vector Analysis\n");
    return;
  }

  const sampleIdx = args.findIndex((a) => a === "--sample" || a === "-s");
  if (sampleIdx !== -1 && args[sampleIdx + 1]) {
    inspectSample(args[sampleIdx + 1]);
    return;
  }

  const fileIdx = args.findIndex((a) => a === "--file" || a === "-f");
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    const filePath = path.resolve(process.cwd(), args[fileIdx + 1]);
    if (!fs.existsSync(filePath)) {
      console.log(`${colors.red}File not found: ${filePath}${colors.reset}`);
      process.exit(1);
    }
    const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const result = analyzePosture(rawData);
    printBanner();
    console.log(`Loaded: ${filePath}`);
    console.log(`Primary Detection: ${result.primary.label}`);
    console.log(`Detected Issues: ${result.issues.map((i) => i.label).join(", ")}`);
    return;
  }

  // Default: run benchmark
  const success = runBenchmark();
  if (!success) {
    process.exit(1);
  }
}

main();
