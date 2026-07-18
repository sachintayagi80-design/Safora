import { createContext, useContext, useState, type ReactNode } from 'react';

export interface SOSSettings {
  liveLocationSharing: boolean;
  smsAlerts: boolean;
  alarmTrigger: boolean;
  autoCallPolice: boolean;
  shakeToActivate: boolean;
}

interface SettingsContextValue {
  settings: SOSSettings;
  toggle: (key: keyof SOSSettings) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const DEFAULTS: SOSSettings = {
  liveLocationSharing: true,
  smsAlerts: true,
  alarmTrigger: false,
  autoCallPolice: false,
  shakeToActivate: false,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SOSSettings>(DEFAULTS);

  function toggle(key: keyof SOSSettings) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return <SettingsContext.Provider value={{ settings, toggle }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be inside SettingsProvider');
  return ctx;
}
