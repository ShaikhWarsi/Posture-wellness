# Computer Vision Course Evaluation - Project Report

Project Title: Real-Time Posture Tracking and Biomechanical Analysis System  
Student Name: Shaikh Mohammad Warsi  
Course: Computer Vision (Flipped Course Evaluation)  
Platform: VITyarthi  
Submission Deadline: September 18, 2026  
Repository Link: https://github.com/ShaikhWarsi/Posture-wellness  

---

## 1. Project Background and Motivation

Sitting at a desk for six to eight hours a day is standard for students and office workers, but it almost always leads to poor postural habits. People unconsciously slouch, lean to one side, or jut their chins forward towards their screens. Over months and years, this causes chronic neck pain, upper back tension, and spinal disc compression.

Commercial solutions like posture-sensing chairs or wearable spine straps are often expensive, uncomfortable, and easy to abandon after a few days. On the other hand, traditional webcam-based posture apps often require sending sensitive video feeds to third-party cloud servers, which presents obvious privacy concerns.

For my Computer Vision course project, I wanted to build a practical, privacy-respecting alternative called PostureAI. The goal was straightforward: use standard computer vision techniques to track sitting posture in real time using an ordinary laptop webcam, perform all image processing and mathematical inference directly on the user's local device, and provide immediate audio and visual correction cues.

---

## 2. Alignment with Computer Vision Course Modules

During the course, we studied fundamental concepts ranging from low-level image processing to deep neural networks. I structured this project so that it connects directly with the curriculum:

- Modules 1 and 2 (Spatial Filtering, Gradients, and Edge Detection):
  Pose estimation models rely on spatial intensity gradients to detect anatomical contours. Just like the Sobel and Canny operators we studied to isolate object boundaries, MoveNet's convolutional layers calculate 2D spatial feature maps to distinguish the silhouette of a person's head, neck, and shoulders from background clutter.

- Module 3 (Hough Transform and Geometric Line Fitting):
  In Module 3, we explored how the Hough transform fits geometric lines through collinear points. In my post-processing pipeline, I used a similar geometric principle: once the model identifies key anatomical landmarks, I construct virtual vectors between them—such as the horizontal line between both shoulders and the directional vector from the shoulder midpoint up to the nose. Calculating the orientation and slope of these fitted lines is what lets the system detect slouching, leaning, and shoulder asymmetry.

- Modules 4 and 5 (Deep Learning and Pose Estimation Architectures):
  Modern human pose estimation replaces hand-crafted feature extractors with deep convolutional neural networks. MoveNet uses an inverted bottleneck architecture (derived from MobileNet) with a Feature Pyramid Network. The network outputs spatial probability heatmaps for 17 body joints, followed by a soft-argmax calculation to produce floating-point (x, y) coordinates with sub-pixel precision.

---

## 3. System Design and Technical Approach

### 3.1 Model Selection
I evaluated multiple pose estimation frameworks before settling on MoveNet SinglePose Lightning. OpenPose is highly accurate but requires a dedicated GPU and is too heavy for client-side web deployment. MediaPipe is capable but carries a larger bundle footprint. MoveNet SinglePose Lightning struck the ideal balance: it runs at 30 to 60 frames per second directly in the browser via TensorFlow.js, consumes minimal CPU/GPU resources, and reliably outputs the upper-body landmarks needed for sitting posture analysis.

### 3.2 Detection Pipeline
The pipeline operates in four sequential stages:

1. Frame Capture: The video element grabs frames from the webcam at native resolution (typically 640x480).
2. Landmark Inference: MoveNet processes each frame and returns 17 keypoints with confidence scores between 0.0 and 1.0. Any landmark with a confidence score under 0.30 is filtered out to prevent noisy classifications caused by occlusion.
3. Geometric Vector Analysis: Rather than feeding the keypoints into another opaque machine learning classifier, I wrote explicit deterministic geometric functions. This keeps the execution time under 1 millisecond per frame and makes the logic completely transparent and verifiable.
4. User Feedback and Analytics: If an issue persists for more than a few frames, the system triggers audio coaching (via the Web Speech API) and updates the on-screen telemetry HUD, habit streaks, and session statistics.

---

## 4. Mathematical Modeling

Here is how each postural issue is mathematically calculated:

### A. Midpoint and Neck Angle
First, the center between the left and right shoulders is calculated:
mid_shoulder_x = (left_shoulder.x + right_shoulder.x) / 2
mid_shoulder_y = (left_shoulder.y + right_shoulder.y) / 2

Next, the vector from this midpoint to the nose landmark is evaluated using the two-argument arctangent function:
dx = nose.x - mid_shoulder_x
dy = nose.y - mid_shoulder_y
theta_neck = atan2(dy, dx) * (180 / pi)

Because the origin (0,0) in computer graphics sits at the top-left of the image, an upright neck points almost straight up at approximately -90 degrees.
- Nominal Good Posture: -95 degrees <= theta_neck <= -65 degrees.
- Slouching: theta_neck < -95 degrees (head has dropped downward towards the chest).
- Forward Head: theta_neck > -65 degrees (cranium is extended forward toward the screen).

### B. Head Tilt (Ear Height Disparity)
I measure the vertical delta between the left and right ears and normalize it against the shoulder width:
ear_delta_y = |left_ear.y - right_ear.y|
shoulder_width = sqrt((left_shoulder.x - right_shoulder.x)^2 + (left_shoulder.y - right_shoulder.y)^2)
tilt_ratio = ear_delta_y / shoulder_width

If tilt_ratio exceeds 0.12 (12 percent of the shoulder span), the user's head is tilted sideways.

### C. Uneven Shoulders
I evaluate the vertical alignment of the acromioclavicular joints:
shoulder_delta_y = |left_shoulder.y - right_shoulder.y|

If shoulder_delta_y exceeds 20 pixels, one shoulder is elevated higher than the other.

### D. Lateral Torso Lean
Using the hip landmarks, I compute the midpoint of the hips and measure the angle of the torso spine line:
mid_hip_x = (left_hip.x + right_hip.x) / 2
mid_hip_y = (left_hip.y + right_hip.y) / 2
torso_angle = atan2(mid_shoulder_y - mid_hip_y, mid_shoulder_x - mid_hip_x) * (180 / pi)
lean_deviation = |torso_angle - (-90)|

If lean_deviation exceeds 12 degrees, the user is leaning their torso to the side.

### E. Trapezius Shoulder Shrug
Stress often causes people to shrug their shoulders upwards. I monitor the vertical distance between each ear and its corresponding shoulder:
left_ear_shoulder_dist = |left_ear.y - left_shoulder.y|
right_ear_shoulder_dist = |right_ear.y - right_shoulder.y|

If either distance drops below 20 percent of the shoulder width, a shoulder shrug alert is flagged.

---

## 5. Dual Execution: CLI Benchmark and Web Interface

To satisfy the evaluation requirement that the project must be runnable from a terminal without requiring a GUI, I developed a dual interface:

### 5.1 Terminal CLI Mode (`npm test` / `node cli/index.js`)
The CLI runner loads a calibrated test suite representing the 8 key posture conditions. It feeds synthetic keypoint arrays through the exact same analyzer functions used by the web app, validates the results against ground truth labels, and outputs an ASCII verification summary.

When running `npm test`, all 8 benchmark test cases pass with a 100 percent accuracy score. The CLI also includes sample inspection flags (`node cli/index.js --sample forward_head`) to inspect intermediate geometric values step by step.

### 5.2 Web Interface (`npm run dev`)
The web application provides an interactive experience built with React 19 and Vite. It features:
- Live camera stream with responsive canvas skeleton rendering.
- Real-time Computer Vision Telemetry HUD showing live neck angle and pixel deltas.
- Audio coaching with customizable rate, pitch, and cooldown intervals.
- Fallback Interactive Simulation Mode: If an evaluator tests the app in a browser without WebGL support or without a camera, the app automatically enables an interactive preset simulator so every detector can still be evaluated live.
- End-of-session summary modal with CSV data export.

---

## 6. Verification and Experimental Results

I tested the detection engine across both calibrated benchmark data and live webcam sessions:

- Geometric Classification Latency: Less than 0.3 milliseconds per frame in Node.js.
- Browser Frame Rate: 30 to 60 FPS on typical laptop hardware using WebGL acceleration, with an automatic fallback to CPU if WebGL is unavailable.
- Benchmark Accuracy: 8 out of 8 test cases passed (100 percent pass rate).
- False Positive Mitigation: A confidence filter (score > 0.30) and an alert cooldown timer prevent repeated false alerts during quick head turns.

---

## 7. How to Run the Project

### Command Line Verification (Terminal Mode)
1. Install dependencies:
   npm install
2. Run automated test benchmark:
   npm test
3. Inspect a specific posture case:
   node cli/index.js --sample forward_head
4. View student info:
   node cli/index.js --author

### Web Application Verification (Browser Mode)
1. Start dev server:
   npm run dev
2. Open `http://localhost:5173` in a web browser.
3. Allow camera access or use the Interactive Simulator toolbar to test posture states.

---

## 8. Conclusion

This project demonstrates how core computer vision concepts—gradient extraction, geometric line fitting, and convolutional pose estimation—can be combined to solve a real-world health challenge. By pairing an interactive web interface with a standalone terminal CLI runner, the project is completely accessible for automated grading and practical everyday use.

---

## 9. Academic Originality Statement

I, Shaikh Mohammad Warsi, declare that this report and the accompanying project codebase were created by me for the Computer Vision Flipped Course Evaluation on the VITyarthi platform. All geometric calculations, detector implementations, CLI scripts, and interface components are my own work. External libraries (React, Vite, TensorFlow.js) have been used strictly as standard development tools and are credited accordingly.

Name: Shaikh Mohammad Warsi  
Date: September 18, 2026  
Course: Computer Vision  
Platform: VITyarthi
