import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "AI Posture Coach", icon: "🧘" },
    { path: "/health", label: "Health & Ergonomics", icon: "🌿" },
  ];

  return (
    <nav className="nav-container">
      <div className="nav-brand-pill">
        <div className="nav-brand-dot" />
        <div className="nav-brand-texts">
          <span className="nav-brand-name">PostureAI</span>
          <span className="nav-brand-author">by <strong>Shaikh Mohammad Warsi</strong></span>
        </div>
      </div>

      <div className="nav-glass-wrapper">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="nav-cv-pill" title="Computer Vision Evaluated Project — VITyarthi">
        <span className="nav-cv-tag">CV 2026</span>
        <span className="nav-cv-author">Shaikh Mohammad Warsi</span>
      </div>
    </nav>
  );
};

export default Navbar;