/**
 * Settings Context
 * ────────────────
 * Provides app-wide settings via React Context.
 * Settings are persisted to localStorage.
 */

import { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "postureai_settings";

const defaultSettings = {
  // Detection sensitivity
  neckAngleMin: -95,
  neckAngleMax: -65,
  headTiltThreshold: 0.12,
  shoulderTiltThreshold: 0.15,
  leanThreshold: 12,

  // Voice
  voiceEnabled: true,
  voiceRate: 1,
  voicePitch: 1,
  voiceCooldown: 10, // seconds between alerts

  // Break timer
  breakInterval: 30, // minutes
  breakEnabled: true,

  // UI
  showSkeleton: true,
  showNeckGuide: true,
};

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("Failed to save settings:", e);
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
