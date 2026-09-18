# PostureAI - Real-Time Computer Vision Posture Assessment System

Author and Developer: Shaikh Mohammad Warsi
Academic Coursework: Computer Vision (Flipped Course Evaluation Project)
Repository Root URL: https://github.com/shaikh-mohammad-warsi/posture-ai
Evaluation Deadline: September 18, 2026

---

## 1. Executive Summary

PostureAI is an on-device, real-time computer vision system engineered by Shaikh Mohammad Warsi that assesses human sitting posture and biomechanical alignment through landmark pose estimation and vector geometry. 

Designed to meet the evaluation requirements of the Computer Vision coursework, the project operates in two complementary modes:
1. Command Line Interface (CLI): Fully executable in terminal environments without requiring a graphical display or browser, executing deterministic landmark verification, vector angle calculations, and benchmark test suites.
2. Web-Based Vision Interface (GUI): An interactive, client-side web application running TensorFlow.js with the MoveNet SinglePose Lightning deep neural network, providing real-time skeleton visual tracking, auditory coaching alerts, and ergonomic session analytics.

All computation is performed strictly locally on the user's hardware. No video frames, landmark coordinates, or telemetry data leave the local machine.

---

## 2. Computer Vision and Mathematical Methodology

The system translates raw 2D image coordinates from camera frames into biomechanical posture classifications via a multi-stage computer vision pipeline.

### 2.1 Deep Pose Estimation (MoveNet Architecture)
The vision engine employs the MoveNet SinglePose Lightning model, a convolutional neural network (CNN) optimized with a Feature Pyramid Network (FPN) backbone. The network outputs 17 keypoint coordinates corresponding to COCO landmark definitions (nose, left/right ears, left/right shoulders, left/right hips, etc.), each represented as:

    P_i = (x_i, y_i, c_i)

where x_i and y_i represent pixel space coordinates and c_i represents the prediction confidence score. Keypoints with c_i < 0.30 are filtered to prevent false positive classifications under occlusion or poor lighting.

### 2.2 Mathematical Formulations

#### A. Euclidean Distance
The spatial distance between any two anatomical landmarks P_1(x_1, y_1) and P_2(x_2, y_2) is computed as:

    d(P_1, P_2) = sqrt((x_2 - x_1)^2 + (y_2 - y_1)^2)

This distance formulation calculates shoulder span W_s = d(P_left_shoulder, P_right_shoulder) for scale normalization and screen proximity detection.

#### B. Directional Vector Angle (atan2)
To calculate cervical spine orientation (neck angle), the vector V from the shoulder midpoint M_s to the cranial anchor (nose) is evaluated:

    M_s = ((x_left_shoulder + x_right_shoulder) / 2, (y_left_shoulder + y_right_shoulder) / 2)
    V = (x_nose - x_mid, y_nose - y_mid)
    theta = atan2(V_y, V_x) * (180 / pi)

Because the screen coordinate system defines the origin (0,0) at the top-left corner, an upright neck yields approximately -90 degrees.

#### C. Cranial Lateral Tilt (Ear Asymmetry)
Head tilt asymmetry evaluates the vertical disparity between the left and right ear landmarks relative to the total shoulder span:

    Delta_ear = |y_left_ear - y_right_ear|
    Tilt_Ratio = Delta_ear / W_s

If Tilt_Ratio exceeds 0.12 (12 percent of shoulder width), lateral cranial tilt is flagged.

#### D. Acromioclavicular Height Disparity (Uneven Shoulders)
Shoulder elevation asymmetry is detected by measuring vertical delta:

    Delta_shoulder = |y_left_shoulder - y_right_shoulder|

A vertical delta exceeding 20 pixels flags uneven shoulder posture.

#### E. Torso Axial Lean
Torso lean measures the angular deviation between the shoulder midpoint M_s and hip midpoint M_h:

    M_h = ((x_left_hip + x_right_hip) / 2, (y_left_hip + y_right_hip) / 2)
    Lean_Angle = |atan2(M_sy - M_hy, M_sx - M_hx) * (180 / pi) - (-90)|

Deviations exceeding 12 degrees flag lateral torso leaning.

---

## 3. Posture Classification Matrix

| Biomechanical State | Severity Level | Quantitative Decision Boundary | Corrective Action |
|:---|:---:|:---|:---|
| Good Posture | Normal | Neck angle between -95 deg and -65 deg; Deltas within tolerance | Maintained correct alignment |
| Slouching | Critical | Neck angle < -95 deg (head dropped downward) | Sit upright, elevate chest |
| Forward Head | Critical | Neck angle > -65 deg (cranium jutting forward toward screen) | Retract cervical spine backward |
| Head Tilted | Warning | Vertical ear disparity > 12 percent of shoulder width | Level head horizontally |
| Leaning Sideways | Warning | Torso vector angle deviation > 12 deg from vertical axis | Re-center weight over chair base |
| Uneven Shoulders | Warning | Vertical shoulder delta > 20 pixels | Level shoulders evenly |
| Chin Tucked | Warning | Nose-to-shoulder midpoint distance < 35 percent of shoulder span | Release excessive chin retraction |
| Shoulders Raised | Warning | Ear-to-shoulder vertical distance < 20 percent of shoulder span | Drop trapezius muscles downward |
| Proximity Alert | Warning | Dynamic shoulder width > 130 percent of calibrated baseline | Step or lean back from monitor |

---

## 4. System Architecture

The codebase adheres to a modular, decoupled architecture separating mathematical analysis, landmark detectors, analytics persistence, and UI rendering:

    cli/
      index.js                         Command-line executable engine and benchmark suite
    src/
      posture/
        types.js                       Biomechanical classifications and severity levels
        analyzer.js                    Primary inference orchestrator
        drawing.js                     Canvas landmark overlay and skeleton renderer
        detectors/
          index.js                     Barrel export of all active detectors
          neckAngle.js                 Cervical spine angle calculator
          headTilt.js                  Ear level disparity detector
          shoulderLevel.js             Acromioclavicular delta detector
          leanDetector.js              Torso midline lean detector
          chinTuck.js                  Cervical retraction detector
          shoulderShrug.js             Trapezius shrug detector
          screenDistance.js            Monitor proximity tracker
      utils/
        geometry.js                    Trigonometric angle and distance utilities
        insights.js                    Ergonomic feedback generator
        exportReport.js                CSV session data serializer
      analytics/
        sessionTracker.js              Per-frame posture telemetry recorder
        storage.js                     Local browser storage persistence
      features/
        settings/                      Configurable sensitivity controls
        sessionSummary/                Post-session statistical assessment modal
        breakReminder/                 Ergonomic interval timer overlay
        gamification/                  Health score and achievement system
      component/
        Navbar.jsx                     Navigation bar with author attribution
        PostureCamera.jsx              Live vision stream and telemetry HUD
      pages/
        Dashboard.jsx                  Primary live analysis view
        HealthTips.jsx                 Biomechanical ergonomics guide

---

## 5. Prerequisites and Environment Setup

### 5.1 System Requirements
- Operating System: Windows 10/11, macOS 11+, or Linux (Ubuntu 20.04+)
- Runtime Environment: Node.js version 18.0.0 or higher (Node.js 20 LTS or 24 recommended)
- Package Manager: npm version 9.0.0 or higher
- Hardware: Standard x86_64 or ARM64 processor; webcam required only for web camera mode

### 5.2 Verification of Prerequisites
Open a terminal and verify the installed Node.js and npm versions:

    node -v
    npm -v

---

## 6. Installation Guide

Follow these step-by-step instructions to clone the repository and install all necessary dependencies:

### Step 1: Clone the Repository
Clone the repository to your local system:

    git clone https://github.com/shaikh-mohammad-warsi/posture-ai.git
    cd posture-ai

### Step 2: Install Dependencies
Execute npm install to download and link all required dependencies:

    npm install

---

## 7. Execution Instructions

The project provides dual execution options: a command-line interface (CLI) for automated headless environments and a graphical web application.

### 7.1 Command Line Execution (CLI Mode - No GUI Required)

As mandated by evaluation requirements, the project is fully executable via the command line without launching a browser or graphical desktop.

#### A. Run Automated Posture Benchmark (Default Verification)
Executes the comprehensive 8-point computer vision posture verification suite and outputs accuracy scores:

    npm test

or directly:

    npm run cli

or:

    node cli/index.js

Expected output:
- Formatted ASCII benchmark table
- 8 posture test conditions evaluated against ground truth
- 100 percent pass rate confirmation
- Author statement and system status

#### B. Inspect Specific Posture Keypoint Trigonometry
To examine step-by-step landmark vectors, Euclidean distances, and angle measurements for an individual posture state:

    node cli/index.js --sample forward_head
    node cli/index.js --sample slouching
    node cli/index.js --sample head_tilted
    node cli/index.js --sample uneven_shoulders

#### C. Evaluate External Keypoint JSON File
To run posture classification on a custom keypoint file:

    node cli/index.js --file path/to/keypoints.json

#### D. Verify Project Credentials
To display developer metadata and submission parameters:

    node cli/index.js --author

---

### 7.2 Web Application Execution (Browser GUI Mode)

#### A. Start Development Server
To launch the interactive web application:

    npm run dev

Open your browser and navigate to:

    http://localhost:5173

Grant webcam permissions when prompted by the browser to initiate live pose estimation.

#### B. Build for Production Deployment
To generate an optimized production bundle:

    npm run build

#### C. Preview Production Build Locally
To preview the compiled production distribution:

    npm run preview

---

## 8. Interactive Features and Controls

### 8.1 Keyboard Shortcuts
- Spacebar: Pause or resume live detection
- F key: Toggle fullscreen camera mode
- M key: Toggle voice alerts on or off
- Escape key: Close configuration panel or exit fullscreen

### 8.2 Real-Time Computer Vision Telemetry HUD
Click the "CV Telemetry" button located on the camera header bar to toggle the live engineering telemetry display. The HUD overlays:
- Calculated Neck Angle in degrees
- Left/Right Shoulder Vertical Delta (px)
- Cranial Ear Tilt Delta (px)
- Active Classification State
- Developer Watermark: Shaikh Mohammad Warsi

---

## 9. Alignment with Course Curriculum

This evaluated project directly implements core concepts taught across the Computer Vision curriculum:
- Module 1 and 2 (Feature and Edge Detection): Spatial gradient analysis, thresholding, and anatomical boundary localization.
- Module 3 (Hough Transform and Geometric Line Fitting): Collinear shoulder line modeling and neck orientation vector extraction.
- Module 4 and 5 (Deep Pose Estimation and Recognition): Convolutional neural network landmark regression, probability heatmaps, and spatial coordinate inference.

---

## 10. Privacy and Security

- 100% On-Device Processing: Video stream keypoint estimation occurs exclusively inside the local browser or Node.js runtime.
- Zero Cloud Transmission: No camera frames, keypoint vectors, or telemetry metrics are transmitted to any remote server.
- Browser Storage: Session statistics are stored strictly in client-side localStorage and can be exported as CSV or cleared at any time.

---

## 11. Academic Integrity and Originality Declaration

This project has been researched, designed, and coded by Shaikh Mohammad Warsi for the Computer Vision Flipped Course Evaluation (VITyarthi). All geometric formulas, detection algorithms, CLI test harnesses, and user interface modules were written specifically for this coursework submission. External libraries utilized (React, TensorFlow.js, MoveNet, Vite) are standard open-source tools credited appropriately.

---

## 12. License

This project is released under the MIT License. See the LICENSE file for details.

Developed by Shaikh Mohammad Warsi
Computer Vision Evaluated Project | VITyarthi 2026
