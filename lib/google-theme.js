// Google's color palette
export const googleColors = {
  blue: "#4285f4",
  red: "#ea4335",
  yellow: "#fbbc05",
  green: "#34a853",
  purple: "#673ab7",
}

// Function to get a Google color with opacity
export const getGoogleColor = (color, opacity = 1) => {
  const hexColor = googleColors[color] || googleColors.blue

  if (opacity === 1) return hexColor

  // Convert hex to rgba
  const r = Number.parseInt(hexColor.slice(1, 3), 16)
  const g = Number.parseInt(hexColor.slice(3, 5), 16)
  const b = Number.parseInt(hexColor.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// Function to get a gradient with Google colors
export const getGoogleGradient = (direction = "to right", color1 = "blue", color2 = "purple") => {
  return `linear-gradient(${direction}, ${googleColors[color1]}, ${googleColors[color2]})`
}

// CSS variables for the theme
export const googleThemeVariables = {
  primary: googleColors.blue,
  secondary: googleColors.purple,
  accent: googleColors.yellow,
  success: googleColors.green,
  error: googleColors.red,
  background: "#ffffff",
  foreground: "#202124",
  muted: "#f1f3f4",
  "muted-foreground": "#5f6368",
  border: "#dadce0",
}
