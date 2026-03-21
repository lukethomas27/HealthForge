import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'medbridge-settings';

const DEFAULTS = {
  // Accessibility (shared)
  theme: 'light',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  colorBlindFriendly: false,

  // Doctor-specific
  patientSortOrder: 'lastVisit',
  autoExpandSessions: false,
  criticalScoreAlerts: true,
  autoSaveTranscriptions: true,

  // Patient-specific
  hideCompletedActions: false,
  reminderFrequency: 'weekly',
  dataSharing: true,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  });

  // Apply DOM attributes whenever settings change
  useEffect(() => {
    const root = document.documentElement;

    // Theme
    if (settings.theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }

    // Font size
    root.setAttribute('data-font-size', settings.fontSize);

    // High contrast
    if (settings.highContrast) {
      root.setAttribute('data-high-contrast', '');
    } else {
      root.removeAttribute('data-high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.setAttribute('data-reduced-motion', '');
    } else {
      root.removeAttribute('data-reduced-motion');
    }

    // Screen reader
    if (settings.screenReader) {
      root.setAttribute('data-screen-reader', '');
    } else {
      root.removeAttribute('data-screen-reader');
    }

    // Color blind friendly
    if (settings.colorBlindFriendly) {
      root.setAttribute('data-color-blind', '');
    } else {
      root.removeAttribute('data-color-blind');
    }
  }, [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch { /* quota exceeded, silently fail */ }
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULTS });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* silently fail */ }
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
