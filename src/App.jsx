import "./App.css";
import Navbar from "./component/Navbar";
import HealthTips from "./pages/HealthTips";
import Dashboard from "./pages/Dashboard";
import { Routes, Route } from "react-router-dom";
import { SettingsProvider } from "./features/settings/SettingsContext";

function App() {
  return (
    <SettingsProvider>
      <div className="app-shell">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/health" element={<HealthTips />} />
        </Routes>
        <footer className="app-footer">
          <div className="footer-inner">
            <div className="footer-main">
              <span className="footer-lead">Posture Wellness</span>
              <span className="footer-divider">/</span>
              <span>Engineered & Developed by <strong>Shaikh Mohammad Warsi</strong></span>
            </div>
            <div className="footer-sub">
              <span>Computer Vision Evaluated Project</span>
              <span className="footer-dot">•</span>
              <span>VITyarthi Flipped Course Evaluation</span>
              <span className="footer-dot">•</span>
              <span>Real-Time Pose Landmark Inference</span>
            </div>
          </div>
        </footer>
      </div>
    </SettingsProvider>
  );
}

export default App;
