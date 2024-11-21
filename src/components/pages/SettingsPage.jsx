import React from "react";
import GlassCard from "../ui/GlassCard";
import { User, Palette, Volume2, Bell, Globe, Shield, Key } from "lucide-react";
import useUserStore from "../../stores/userStore";
import AudioModeToggle from "../AudioModeToggle";

const SettingsPage = () => {
  const { preferences, setPreference } = useUserStore();

  const settingSections = [
    {
      title: "Profile",
      icon: User,
      settings: [
        {
          label: "Username",
          type: "text",
          value: preferences.userName,
          onChange: (value) => setPreference("userName", value),
        },
      ],
    },
    {
      title: "Appearance",
      icon: Palette,
      settings: [
        {
          label: "Theme",
          type: "select",
          value: preferences.theme,
          onChange: (value) => setPreference("theme", value),
          options: [
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System Default" },
          ],
        },
      ],
    },
    {
      title: "Voice",
      icon: Volume2,
      settings: [
        {
          label: "Assistant Voice",
          type: "select",
          value: preferences.voiceId,
          onChange: (value) => setPreference("voiceId", value),
          options: [
            { value: "alloy", label: "Alloy" },
            { value: "echo", label: "Echo" },
            { value: "fable", label: "Fable" },
            { value: "onyx", label: "Onyx" },
            { value: "nova", label: "Nova" },
            { value: "shimmer", label: "Shimmer" },
          ],
        },
        {
          label: "Speech Rate",
          type: "range",
          value: preferences.speechRate || 1,
          onChange: (value) => setPreference("speechRate", value),
          min: 0.5,
          max: 2,
          step: 0.1,
        },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      settings: [
        {
          label: "Enable Notifications",
          type: "toggle",
          value: preferences.notifications,
          onChange: (value) => setPreference("notifications", value),
        },
      ],
    },
  ];

  const renderSetting = ({
    type,
    label,
    value,
    onChange,
    options,
    min,
    max,
    step,
  }) => {
    switch (type) {
      case "text":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-white/40"
          />
        );
      case "select":
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-white/40">
            {options.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        );
      case "range":
        return (
          <div className="flex items-center gap-4">
            <input
              type="range"
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              min={min}
              max={max}
              step={step}
              className="flex-1"
            />
            <span className="text-sm w-12 text-center">{value}x</span>
          </div>
        );
      case "toggle":
        return (
          <button
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? "bg-purple-300" : "bg-gray-300"
            }`}>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <GlassCard className="p-6">
        <h1 className="text-2xl font-light mb-6">Settings</h1>
        <div className="space-y-8">
          {settingSections.map(({ title, icon: Icon, settings }) => (
            <div key={title} className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Icon className="w-5 h-5" />
                {title}
              </div>
              <div className="space-y-4 pl-7">
                {settings.map((setting) => (
                  <div key={setting.label} className="space-y-2">
                    <label className="text-sm font-medium">
                      {setting.label}
                    </label>
                    {renderSetting(setting)}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="space-y-4">
            <AudioModeToggle
              mode={preferences.audioMode}
              onModeChange={(value) => setPreference("audioMode", value)}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default SettingsPage;
