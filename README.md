# PostureAI - Real-Time Computer Vision Posture Coach

Author: Shaikh Mohammad Warsi  
Course: Computer Vision (Flipped Course Evaluation)  
Submission URL: https://github.com/shaikh-mohammad-warsi/posture-ai  
Course Platform: VITyarthi  

---

## What is this project?

Most of us spend hours every day hunched over a laptop or desk. Over time, your head drifts forward, your shoulders creep up towards your ears, and your neck takes on unnecessary strain. 

I built PostureAI for my Computer Vision flipped course evaluation to solve this problem using standard computer vision techniques. It turns any ordinary webcam into a real-time posture monitor. Everything runs completely locally on your machine—no video stream, keypoints, or personal data ever gets uploaded anywhere.

For the course requirements, I also built a dedicated command-line runner (`npm test` or `node cli/index.js`) so evaluators can test and benchmark the entire mathematical detection engine directly inside a terminal window without having to launch a browser or grant camera permissions.

---

## How It Works (Computer Vision & Math)

Rather than treating posture detection like a black box, I broke the problem down into two stages:
1. Extract anatomical body landmarks using a convolutional pose model (MoveNet SinglePose Lightning).
2. Apply 2D vector trigonometry to those landmarks to classify posture states in real time.

### 1. Keypoint Extraction
When a video frame comes in, MoveNet predicts the (x, y) coordinates and confidence scores for 17 body landmarks (nose, eyes, ears, shoulders, elbows, wrists, and hips). If a keypoint has a confidence score below 0.30 (for example, if an arm is hidden behind a desk), the algorithm ignores it to prevent erratic jumps.

### 2. The Geometric Calculations

Here is the exact math I used across the detectors:

- Shoulder Midpoint:
  First, I find the center point between the left and right shoulders:
  mid_x = (left_shoulder.x + right_shoulder.x) / 2
  mid_y = (left_shoulder.y + right_shoulder.y) / 2

- Neck Angle (Slouching and Forward Head):
  I compute the directional angle of the vector going from the shoulder midpoint up to the nose:
  dx = nose.x - mid_x
  dy = nose.y - mid_y
  neck_angle = atan2(dy, dx) * (180 / pi)

  In standard screen coordinates, straight up is roughly -90 degrees.
  - Normal upright sitting falls between -95 degrees and -65 degrees.
  - If the angle drops below -95 degrees, the head has dropped down (slouching).
  - If the angle rises above -65 degrees, the head is craning forward towards the display (forward head posture).

- Head Tilt:
  I take the absolute vertical difference between both ears:
  ear_delta = |left_ear.y - right_ear.y|
  shoulder_width = sqrt((left_shoulder.x - right_shoulder.x)^2 + (left_shoulder.y - right_shoulder.y)^2)

  If ear_delta is greater than 12 percent of the shoulder width, the head is tilted sideways.

- Uneven Shoulders:
  I compare the y-coordinates of both shoulders:
  shoulder_delta = |left_shoulder.y - right_shoulder.y|

  If this delta exceeds 20 pixels, it triggers an uneven shoulder warning.

- Torso Lean:
  I calculate the angle between the shoulder midpoint and the hip midpoint:
  lean_angle = |atan2(mid_shoulder.y - mid_hip.y, mid_shoulder.x - mid_hip.x) * (180 / pi) - (-90)|

  A deviation greater than 12 degrees indicates that the user is leaning their torso to one side.

- Trapezius Shoulder Shrug:
  When stressed, people tend to pull their shoulders up toward their ears. I measure the distance from each ear to its corresponding shoulder. If that gap shrinks below 20 percent of the total shoulder width, it flags a raised shoulder alert.

---

## Posture States Checked

The engine flags 7 specific posture issues:

1. Good Posture: Neck angle is neutral (-95 deg to -65 deg) and shoulders/ears are level.
2. Slouching: Head dropped down (neck angle < -95 deg).
3. Forward Head: Neck craning toward screen (neck angle > -65 deg).
4. Head Tilted: One ear noticeably lower than the other.
5. Uneven Shoulders: One shoulder sitting higher than the other.
6. Leaning Sideways: Upper torso tilted off the vertical centerline.
7. Chin Tucked: Head pulled too far back towards the chest.
8. Shoulders Raised: Shoulders tensed upward toward the ears.

---

## Project Structure

Here is how the repository is organized:

    cli/
      index.js               Command-line benchmark and test runner (runs without GUI)
    src/
      posture/
        analyzer.js          Runs all detector checks on a given pose
        types.js             Definitions of posture states, severity, and alerts
        drawing.js           Draws skeleton overlay lines on the HTML canvas
        demoPoses.js         Calibrated benchmark and simulation poses
        detectors/           Individual detector modules
          neckAngle.js       Slouching and forward head checks
          headTilt.js        Ear height asymmetry check
          shoulderLevel.js   Shoulder height alignment check
          leanDetector.js    Torso lean angle check
          chinTuck.js        Chin retraction check
          shoulderShrug.js   Trapezius shrug check
          screenDistance.js  Monitor proximity estimation
      analytics/             Session recording and local storage persistence
      features/              Settings drawer, break timer, session summary modal
      component/             Navbar and PostureCamera components
      pages/                 Dashboard and HealthTips pages

---

## Requirements

Before running the project, make sure you have:
- Node.js 18 or newer installed (Node 20 or 24 LTS works great).
- npm installed (comes bundled with Node).
- A web browser (Chrome, Edge, Brave, or Firefox).
- A webcam (only needed for live camera mode; the CLI and interactive simulator do not need a webcam).

Check your node installation by running:

    node -v
    npm -v

---

## Step-by-Step Setup and Execution

### 1. Clone this repository

    git clone https://github.com/shaikh-mohammad-warsi/posture-ai.git
    cd posture-ai

### 2. Install dependencies

    npm install

---

### Option A: Run via Terminal (CLI Mode - No GUI Needed)

As required by the course evaluation rubric, the project runs fully from the command line without opening any browser or graphical interface:

Run the automated test suite and verification benchmark:

    npm test

or:

    npm run cli

This runs the posture engine through all 8 test cases and outputs an ASCII verification table showing 100 percent pass rate.

To inspect the raw keypoint coordinates, vector angles, and decision math for a specific posture issue:

    node cli/index.js --sample forward_head
    node cli/index.js --sample slouching
    node cli/index.js --sample head_tilted
    node cli/index.js --sample uneven_shoulders

To view student credentials:

    node cli/index.js --author

---

### Option B: Run the Web Application (Browser GUI Mode)

To start the local development server:

    npm run dev

Once Vite starts, open your browser and go to:

    http://localhost:5173

Click "Allow" when the browser asks for webcam permission. You will see your video feed with the real-time pose skeleton drawn on top.

If you are running on a device without a webcam or where WebGL is disabled, the application automatically provides an Interactive Simulator toolbar right beneath the camera so you can test all posture states and watch the real-time scores update.

To build the project for production:

    npm run build

To preview the built production bundle:

    npm run preview

---

## Keyboard Shortcuts in the Web App

- Space: Pause or resume tracking
- F: Fullscreen camera mode
- M: Mute or unmute voice coaching alerts
- Esc: Close settings drawer or exit fullscreen

---

## Notes on Privacy

Everything in PostureAI runs entirely on the client side inside your browser or Node environment. No video frames, landmark data, or metrics are sent over the internet. All session stats are stored only in your browser's localStorage and can be exported as a CSV file or deleted at any time.

---

## Academic Submission Details

- Student Name: Shaikh Mohammad Warsi
- Course: Computer Vision (Flipped Course Evaluation)
- Platform: VITyarthi
- Repository Visibility: Public
- License: MIT License
