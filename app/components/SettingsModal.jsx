"use client";
import { useState, useEffect } from "react";

const THEMES = [
  { id: "comix", name: "Comix Dark", bg: "#0d0f12", card: "#16191e", accent: "#06b6d4" },
  { id: "oled", name: "OLED Black", bg: "#000000", card: "#0c0c0e", accent: "#a855f7" },
  { id: "cyberpunk", name: "Cyberpunk Dusk", bg: "#0a0914", card: "#131126", accent: "#ec4899" },
  { id: "nord", name: "Nord Arctic", bg: "#1a202c", card: "#2d3748", accent: "#38bdf8" },
];

export default function SettingsModal({ isOpen, onClose }) {
  const [currentTheme, setCurrentTheme] = useState("comix");
  const [allowNsfw, setAllowNsfw] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("comichwa_theme") || "comix";
      const savedNsfw = localStorage.getItem("comichwa_allow_nsfw") === "true";
      setCurrentTheme(savedTheme);
      setAllowNsfw(savedNsfw);
    }
  }, [isOpen]);

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem("comichwa_theme", themeId);
    document.documentElement.setAttribute("data-theme", themeId);
    window.dispatchEvent(new Event("comichwa_settings_changed"));
  };

  const handleNsfwToggle = () => {
    const nextVal = !allowNsfw;
    setAllowNsfw(nextVal);
    localStorage.setItem("comichwa_allow_nsfw", String(nextVal));
    window.dispatchEvent(new Event("comichwa_settings_changed"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-6 text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-lg font-extrabold tracking-tight">Preferences & Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-border transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Theme Switcher */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
            Appearance / Theme
          </label>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-[0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-primary"
                      : "border-border hover:border-zinc-500 bg-background/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{theme.name}</span>
                    {isSelected && <span className="text-xs text-primary font-bold">✓</span>}
                  </div>
                  {/* Swatch Preview */}
                  <div className="flex gap-1.5 items-center">
                    <div className="w-4 h-4 rounded-full border border-zinc-700 shadow-inner" style={{ backgroundColor: theme.bg }} />
                    <div className="w-4 h-4 rounded-full border border-zinc-700 shadow-inner" style={{ backgroundColor: theme.card }} />
                    <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: theme.accent }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mature / Brutal Content (18+) Toggle */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Mature / Brutal Content (18+)
              </label>
              <p className="text-[11px] text-zinc-400 mt-0.5 max-w-[260px] leading-tight">
                Unlock 18+ content ratings (Erotica) and mature tags (Mature, Adult, Smut) in filters & search.
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={handleNsfwToggle}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                allowNsfw ? "bg-amber-500" : "bg-zinc-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  allowNsfw ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {allowNsfw ? (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] flex items-start gap-2">
              <span className="text-xs">⚠️</span>
              <span>18+ Content Enabled: Mature, Adult, Smut & Erotica filters unlocked (strictly no pornographic content).</span>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-start gap-2">
              <span className="text-xs">🛡️</span>
              <span>Safe Content Mode (Default): All 18+ adult & brutal tags are strictly filtered out.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-md"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
