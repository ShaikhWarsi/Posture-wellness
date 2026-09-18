/**
 * Posture Wellness — Interactive Demo & Benchmark Poses
 * Developed by: Shaikh Mohammad Warsi
 * 
 * Provides calibrated landmark configurations for simulation mode,
 * automated testing, and fallback when hardware camera/WebGL is unavailable.
 */

export function createSimulatedPose({
  nose = { x: 320, y: 160 },
  leftShoulder = { x: 260, y: 280 },
  rightShoulder = { x: 380, y: 280 },
  leftEar = { x: 280, y: 160 },
  rightEar = { x: 360, y: 160 },
  leftEye = { x: 305, y: 150 },
  rightEye = { x: 335, y: 150 },
  leftElbow = { x: 240, y: 380 },
  rightElbow = { x: 400, y: 380 },
  leftWrist = { x: 260, y: 440 },
  rightWrist = { x: 380, y: 440 },
  leftHip = { x: 270, y: 440 },
  rightHip = { x: 370, y: 440 },
  score = 0.95,
} = {}) {
  return {
    score: 0.98,
    keypoints: [
      { name: "nose", x: nose.x, y: nose.y, score },
      { name: "left_eye", x: leftEye.x, y: leftEye.y, score },
      { name: "right_eye", x: rightEye.x, y: rightEye.y, score },
      { name: "left_ear", x: leftEar.x, y: leftEar.y, score },
      { name: "right_ear", x: rightEar.x, y: rightEar.y, score },
      { name: "left_shoulder", x: leftShoulder.x, y: leftShoulder.y, score },
      { name: "right_shoulder", x: rightShoulder.x, y: rightShoulder.y, score },
      { name: "left_elbow", x: leftElbow.x, y: leftElbow.y, score },
      { name: "right_elbow", x: rightElbow.x, y: rightElbow.y, score },
      { name: "left_wrist", x: leftWrist.x, y: leftWrist.y, score },
      { name: "right_wrist", x: rightWrist.x, y: rightWrist.y, score },
      { name: "left_hip", x: leftHip.x, y: leftHip.y, score },
      { name: "right_hip", x: rightHip.x, y: rightHip.y, score },
    ],
  };
}

export const DEMO_PRESETS = [
  {
    id: "good",
    label: "Nominal Upright",
    pose: createSimulatedPose({
      nose: { x: 320, y: 160 },
      leftShoulder: { x: 260, y: 280 },
      rightShoulder: { x: 380, y: 280 },
      leftEar: { x: 285, y: 160 },
      rightEar: { x: 355, y: 160 },
    }),
  },
  {
    id: "slouch",
    label: "Slouching",
    pose: createSimulatedPose({
      nose: { x: 295, y: 215 },
      leftShoulder: { x: 260, y: 280 },
      rightShoulder: { x: 380, y: 280 },
    }),
  },
  {
    id: "forward_head",
    label: "Forward Head",
    pose: createSimulatedPose({
      nose: { x: 420, y: 210 },
      leftShoulder: { x: 260, y: 280 },
      rightShoulder: { x: 380, y: 280 },
    }),
  },
  {
    id: "head_tilted",
    label: "Head Tilted",
    pose: createSimulatedPose({
      nose: { x: 320, y: 160 },
      leftShoulder: { x: 260, y: 280 },
      rightShoulder: { x: 380, y: 280 },
      leftEar: { x: 280, y: 130 },
      rightEar: { x: 360, y: 185 },
    }),
  },
  {
    id: "uneven_shoulders",
    label: "Uneven Shoulders",
    pose: createSimulatedPose({
      nose: { x: 320, y: 160 },
      leftShoulder: { x: 260, y: 250 },
      rightShoulder: { x: 380, y: 310 },
    }),
  },
  {
    id: "leaning",
    label: "Torso Leaning",
    pose: createSimulatedPose({
      nose: { x: 380, y: 160 },
      leftShoulder: { x: 320, y: 280 },
      rightShoulder: { x: 440, y: 280 },
      leftHip: { x: 250, y: 440 },
      rightHip: { x: 350, y: 440 },
    }),
  },
  {
    id: "chin_tucked",
    label: "Chin Tucked",
    pose: createSimulatedPose({
      nose: { x: 320, y: 250 },
      leftShoulder: { x: 250, y: 270 },
      rightShoulder: { x: 390, y: 270 },
    }),
  },
  {
    id: "shoulders_raised",
    label: "Shoulders Raised",
    pose: createSimulatedPose({
      nose: { x: 320, y: 110 },
      leftShoulder: { x: 260, y: 175 },
      rightShoulder: { x: 380, y: 175 },
      leftEar: { x: 275, y: 160 },
      rightEar: { x: 365, y: 160 },
    }),
  },
];
