/**
 * Script to generate environment variable documentation
 * This script reads the environment configuration and generates markdown documentation
 */

const fs = require("fs")
const path = require("path")
const environment = require("../config/environment").default

// Group environment variables by category
const categories = {
  "API Configuration": ["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_API_TIMEOUT", "NEXT_PUBLIC_API_VERSION", "API_KEY"],
  Authentication: [
    "NEXT_PUBLIC_AUTH_TOKEN_NAME",
    "NEXT_PUBLIC_USER_DATA_NAME",
    "JWT_SECRET",
    "TOKEN_EXPIRATION",
    "REFRESH_TOKEN_NAME",
    "REFRESH_TOKEN_EXPIRATION",
  ],
  "Feature Flags": [
    "NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN",
    "NEXT_PUBLIC_ENABLE_CHAT",
    "NEXT_PUBLIC_ENABLE_NOTIFICATIONS",
    "NEXT_PUBLIC_ENABLE_MAP_VIEW",
    "NEXT_PUBLIC_ENABLE_REVIEWS",
    "NEXT_PUBLIC_ENABLE_WISHLIST",
    "NEXT_PUBLIC_ENABLE_COMPARISONS",
    "NEXT_PUBLIC_ENABLE_AUCTIONS",
    "NEXT_PUBLIC_ENABLE_VIDEO_CHAT",
    "NEXT_PUBLIC_ENABLE_ANALYTICS",
  ],
  // Add more categories as needed
}

// Generate markdown documentation
let markdown = "# DeelDeal Environment Variables\n\n"
markdown += "This document describes all environment variables used in the DeelDeal application.\n\n"

// Generate table of contents
markdown += "## Table of Contents\n\n"
for (const category in categories) {
  markdown += `- [${category}](#${category.toLowerCase().replace(/\s+/g, "-")})\n`
}
markdown += "\n"

// Generate documentation for each category
for (const category in categories) {
  markdown += `## ${category}\n\n`
  markdown += "| Variable | Description | Default Value | Required |\n"
  markdown += "| --- | --- | --- | --- |\n"

  for (const variable of categories[category]) {
    const description = getVariableDescription(variable)
    const defaultValue = getDefaultValue(variable)
    const required = isRequired(variable) ? "✅" : "❌"

    markdown += `| \`${variable}\` | ${description} | \`${defaultValue}\` | ${required} |\n`
  }

  markdown += "\n"
}

// Write the markdown file
fs.writeFileSync(path.join(__dirname, "../docs/environment-variables.md"), markdown)
console.log("✅ Environment variable documentation generated successfully.")

// Helper functions
function getVariableDescription(variable) {
  // Add descriptions for each variable
  const descriptions = {
    NEXT_PUBLIC_API_URL: "Base URL for API requests",
    NEXT_PUBLIC_API_TIMEOUT: "Timeout for API requests in milliseconds",
    // Add more descriptions as needed
  }

  return descriptions[variable] || "No description available"
}

function getDefaultValue(variable) {
  // Get default values from environment.js
  // This is a simplified example
  const variableName = variable
    .toLowerCase()
    .replace(/^next_public_/, "")
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())

  return environment[variableName] || "No default value"
}

function isRequired(variable) {
  // List of required variables
  const requiredVars = [
    "NEXT_PUBLIC_API_URL",
    "NEXT_PUBLIC_AUTH_TOKEN_NAME",
    "NEXT_PUBLIC_USER_DATA_NAME",
    "NEXT_PUBLIC_APP_NAME",
    "NEXT_PUBLIC_APP_DESCRIPTION",
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_IMAGE_STORAGE_URL",
    "NEXT_PUBLIC_DEFAULT_LOCALE",
    "NEXT_PUBLIC_SUPPORTED_LOCALES",
  ]

  return requiredVars.includes(variable)
}
