import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme definitions
const themes = {
  dark: {
    name: 'Dark',
    colors: {
      background: '#1a1a1a',
      surface: '#2d2d2d',
      surfaceSecondary: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#cccccc',
      textTertiary: '#999999',
      border: '#3d3d3d',
      borderLight: '#555555',
      primary: '#ffffff',
      primaryHover: '#cccccc',
      primaryText: '#1a1a1a',
      secondary: '#3d3d3d',
      secondaryHover: '#555555',
      success: '#2d5a2d',
      error: '#5a2d2d',
      errorLight: '#7a3d3d',
      warning: '#5a4d2d',
      info: '#2d4d5a',
      link: '#60a5fa',
      codeBackground: '#404040',
      codeText: '#ffffff',
      blockquoteBorder: '#555555',
      blockquoteText: '#cccccc',
    }
  },
  light: {
    name: 'Light',
    colors: {
      background: '#ffffff',
      surface: '#f5f5f5',
      surfaceSecondary: '#e8e8e8',
      text: '#1a1a1a',
      textSecondary: '#333333',
      textTertiary: '#666666',
      border: '#d1d1d1',
      borderLight: '#e0e0e0',
      primary: '#1a1a1a',
      primaryHover: '#333333',
      primaryText: '#ffffff',
      secondary: '#d1d1d1',
      secondaryHover: '#b8b8b8',
      success: '#4a7c4a',
      error: '#7c4a4a',
      errorLight: '#9c6a6a',
      warning: '#7c6a4a',
      info: '#4a6a7c',
      link: '#0066cc',
      codeBackground: '#f5f5f5',
      codeText: '#1a1a1a',
      blockquoteBorder: '#d1d1d1',
      blockquoteText: '#666666',
    }
  },
  blue: {
    name: 'Blue',
    colors: {
      background: '#0f172a',
      surface: '#1e293b',
      surfaceSecondary: '#334155',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textTertiary: '#94a3b8',
      border: '#334155',
      borderLight: '#475569',
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryText: '#ffffff',
      secondary: '#334155',
      secondaryHover: '#475569',
      success: '#10b981',
      error: '#ef4444',
      errorLight: '#f87171',
      warning: '#f59e0b',
      info: '#3b82f6',
      link: '#60a5fa',
      codeBackground: '#1e293b',
      codeText: '#f1f5f9',
      blockquoteBorder: '#3b82f6',
      blockquoteText: '#cbd5e1',
    }
  },
  green: {
    name: 'Green',
    colors: {
      background: '#0a1f0a',
      surface: '#1a3a1a',
      surfaceSecondary: '#2a4a2a',
      text: '#e8f5e8',
      textSecondary: '#c8e5c8',
      textTertiary: '#a8d5a8',
      border: '#2a4a2a',
      borderLight: '#3a5a3a',
      primary: '#22c55e',
      primaryHover: '#16a34a',
      primaryText: '#0a1f0a',
      secondary: '#2a4a2a',
      secondaryHover: '#3a5a3a',
      success: '#22c55e',
      error: '#ef4444',
      errorLight: '#f87171',
      warning: '#eab308',
      info: '#3b82f6',
      link: '#4ade80',
      codeBackground: '#1a3a1a',
      codeText: '#e8f5e8',
      blockquoteBorder: '#22c55e',
      blockquoteText: '#c8e5c8',
    }
  },
  purple: {
    name: 'Purple',
    colors: {
      background: '#1a0a2a',
      surface: '#2a1a3a',
      surfaceSecondary: '#3a2a4a',
      text: '#f5e8ff',
      textSecondary: '#e5d8ff',
      textTertiary: '#d5c8ff',
      border: '#3a2a4a',
      borderLight: '#4a3a5a',
      primary: '#a855f7',
      primaryHover: '#9333ea',
      primaryText: '#ffffff',
      secondary: '#3a2a4a',
      secondaryHover: '#4a3a5a',
      success: '#22c55e',
      error: '#ef4444',
      errorLight: '#f87171',
      warning: '#f59e0b',
      info: '#3b82f6',
      link: '#c084fc',
      codeBackground: '#2a1a3a',
      codeText: '#f5e8ff',
      blockquoteBorder: '#a855f7',
      blockquoteText: '#e5d8ff',
    }
  },
  custom: {
    name: 'Custom',
    colors: {
      background: '#1a1a1a',
      surface: '#2d2d2d',
      surfaceSecondary: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#cccccc',
      textTertiary: '#999999',
      border: '#3d3d3d',
      borderLight: '#555555',
      primary: '#ffffff',
      primaryHover: '#cccccc',
      primaryText: '#1a1a1a',
      secondary: '#3d3d3d',
      secondaryHover: '#555555',
      success: '#2d5a2d',
      error: '#5a2d2d',
      errorLight: '#7a3d3d',
      warning: '#5a4d2d',
      info: '#2d4d5a',
      link: '#60a5fa',
      codeBackground: '#404040',
      codeText: '#ffffff',
      blockquoteBorder: '#555555',
      blockquoteText: '#cccccc',
    }
  }
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [customColors, setCustomColors] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch theme from server
    const fetchTheme = async () => {
      try {
        const response = await fetch('/api/theme');
        if (response.ok) {
          const data = await response.json();
          if (data.theme && themes[data.theme]) {
            setTheme(data.theme);
            // If custom theme, update colors
            if (data.theme === 'custom' && data.customColors) {
              setCustomColors(data.customColors);
              // Update the custom theme colors
              themes.custom.colors = { ...themes.custom.colors, ...data.customColors };
            }
          }
        }
      } catch (error) {
        console.error('Error fetching theme:', error);
        // Fallback to dark theme on error
        setTheme('dark');
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, []);

  useEffect(() => {
    // Apply theme to document root
    const currentTheme = themes[theme];
    if (currentTheme) {
      const root = document.documentElement;
      Object.entries(currentTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
      
      // Also set a data attribute for CSS selectors
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Poll for theme changes every 5 seconds (for when admin changes it)
  useEffect(() => {
    if (!loading) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/theme');
          if (response.ok) {
            const data = await response.json();
            if (data.theme && themes[data.theme] && data.theme !== theme) {
              setTheme(data.theme);
              // Update custom colors if needed
              if (data.theme === 'custom' && data.customColors) {
                setCustomColors(data.customColors);
                themes.custom.colors = { ...themes.custom.colors, ...data.customColors };
              }
            }
          }
        } catch (error) {
          console.error('Error polling theme:', error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [loading, theme]);

  const changeTheme = async (newTheme, newCustomColors = null) => {
    // This is only called from admin panel after server update
    if (themes[newTheme]) {
      setTheme(newTheme);
      if (newTheme === 'custom' && newCustomColors) {
        setCustomColors(newCustomColors);
        themes.custom.colors = { ...themes.custom.colors, ...newCustomColors };
      }
    }
  };

  const value = {
    theme,
    themes,
    currentTheme: themes[theme],
    customColors,
    loading,
    changeTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;

