import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { theme, themes, changeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = Object.keys(themes);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] px-3 py-1.5 rounded text-sm font-medium hover:bg-[var(--color-surfaceSecondary)] transition-colors"
        aria-label="Change theme"
        aria-expanded={isOpen}
      >
        <span className="mr-2">🎨</span>
        {themes[theme].name}
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded shadow-lg z-20">
            <div className="py-1">
              {themeOptions.map((themeKey) => (
                <button
                  key={themeKey}
                  onClick={() => {
                    changeTheme(themeKey);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    theme === themeKey
                      ? 'bg-[var(--color-primary)] text-[var(--color-primaryText)]'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-surfaceSecondary)]'
                  }`}
                >
                  {themes[themeKey].name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ThemeToggle;

