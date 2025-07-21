/**
 * Theme constants for DeelDeal
 * This file centralizes all theme-related constants
 */

// DeelDeal orange/yellow palette
export const COLORS = {
  primary: {
    DEFAULT: "hsl(var(--primary))",
    yellow: "hsl(var(--primary))",
    orange: "hsl(var(--secondary))",
    deep: "hsl(15 89% 57%)",
    foreground: "hsl(var(--primary-foreground))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    orange: "hsl(var(--accent))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    orange: "hsl(20 89% 57%)",
    foreground: "hsl(var(--accent-foreground))",
  },
  // Legacy hex values for backward compatibility
  hex: {
    primaryYellow: "#f1c232",
    primaryOrange: "#f1b932",
    secondaryOrange: "#f1b032",
    accentOrange: "#f19732",
    deepOrange: "#f17e32",
  },
  // Dark mode specific colors (v0-inspired)
  dark: {
    surface: "#171717",
    card: "#212121",
    accent: "#3291ff",
    text: "#fafafa",
    muted: "#262626",
    mutedText: "#a6a6a6",
    border: "#2e2e2e",
    hover: "#2e2e2e",
  },
  // v0-specific colors
  v0: {
    blue: "#3291ff",
    darkBlue: "#0070f3",
    gray: {
      100: "#fafafa",
      200: "#eaeaea",
      300: "#999999",
      400: "#888888",
      500: "#666666",
      600: "#444444",
      700: "#333333",
      800: "#212121",
      900: "#171717",
    },
  },
}

// CSS class names for common styling patterns
export const CLASSES = {
  hoverEffects: {
    primary: "hover:bg-primary hover:text-primary-foreground",
    secondary: "hover:bg-secondary hover:text-secondary-foreground",
    accent: "hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-muted hover:text-foreground",
    v0: "dark:hover:bg-[#2e2e2e]",
  },
  buttons: {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90",
    v0: "dark:bg-[#3291ff] dark:text-white dark:hover:bg-[#0070f3]",
  },
  transitions: {
    default: "transition-all duration-200 ease-in-out",
    fast: "transition-all duration-150 ease-in-out",
    slow: "transition-all duration-300 ease-in-out",
  },
  dark: {
    surface: "dark:bg-dark-surface",
    card: "dark:bg-dark-card",
    accent: "dark:bg-dark-accent",
    text: "dark:text-dark-text",
    muted: "dark:bg-[#262626]",
    mutedText: "dark:text-[#a6a6a6]",
    border: "dark:border-[#2e2e2e]",
  },
  v0: {
    card: "dark:bg-[#212121] dark:border-[#2e2e2e] dark:text-white",
    input: "dark:bg-[#171717] dark:border-[#2e2e2e] dark:text-white dark:focus:border-[#3291ff]",
    button: "dark:bg-[#3291ff] dark:text-white dark:hover:bg-[#0070f3]",
    link: "dark:text-[#3291ff] dark:hover:text-[#0070f3]",
  },
}

// Media query breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

// Z-index values
export const Z_INDEX = {
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
}
