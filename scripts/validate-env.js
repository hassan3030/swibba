/**
 * Script to validate environment variables during build
 * Run this script before building the application to ensure all required
 * environment variables are set.
 */

// Load environment variables from .env files
require("dotenv").config()

// List of required environment variables
const requiredVars = [
  // API Configuration
  "NEXT_PUBLIC_API_URL",

  // Authentication (required for user functionality)
  "NEXT_PUBLIC_AUTH_TOKEN_NAME",
  "NEXT_PUBLIC_USER_DATA_NAME",

  // App Configuration (required for SEO and branding)
  "NEXT_PUBLIC_APP_NAME",
  "NEXT_PUBLIC_APP_DESCRIPTION",
  "NEXT_PUBLIC_APP_URL",

  // Image Storage (required for product images)
  "NEXT_PUBLIC_IMAGE_STORAGE_URL",

  // Locale (required for internationalization)
  "NEXT_PUBLIC_DEFAULT_LOCALE",
  "NEXT_PUBLIC_SUPPORTED_LOCALES",
]

// List of production-only required variables
const productionOnlyVars = [
  // Analytics (only required in production)
  "NEXT_PUBLIC_GA_ID",

  // Social Media (only required if social login is enabled)
  ...(process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN === "true"
    ? ["NEXT_PUBLIC_FACEBOOK_APP_ID", "NEXT_PUBLIC_GOOGLE_CLIENT_ID"]
    : []),

  // Payment Gateway (only required in production)
  "NEXT_PUBLIC_STRIPE_PUBLIC_KEY",

  // Security (only required in production)
  "NEXT_PUBLIC_RECAPTCHA_SITE_KEY",

  // Critical server-side variables for production
  "JWT_SECRET",
  "STRIPE_SECRET_KEY",
  "DATADIRECTUS_URL",
]

// Feature-dependent required variables
const featureDependentVars = {
  // If chat is enabled, require chat-related variables
  ...(process.env.NEXT_PUBLIC_ENABLE_CHAT === "true"
    ? {
        NEXT_PUBLIC_PUSHER_APP_ID: "Chat feature requires Pusher App ID",
        NEXT_PUBLIC_PUSHER_KEY: "Chat feature requires Pusher Key",
        PUSHER_SECRET: "Chat feature requires Pusher Secret",
      }
    : {}),

  // If map view is enabled, require map-related variables
  ...(process.env.NEXT_PUBLIC_ENABLE_MAP_VIEW === "true"
    ? {
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "Map view feature requires Google Maps API Key",
      }
    : {}),

  // If video chat is enabled, require video-related variables
  ...(process.env.NEXT_PUBLIC_ENABLE_VIDEO_CHAT === "true"
    ? {
        NEXT_PUBLIC_TWILIO_API_KEY: "Video chat feature requires Twilio API Key",
        TWILIO_API_SECRET: "Video chat feature requires Twilio API Secret",
      }
    : {}),

  // If search is enabled, require search-related variables
  ...(process.env.NEXT_PUBLIC_ENABLE_SEARCH === "true"
    ? {
        NEXT_PUBLIC_ALGOLIA_APP_ID: "Search feature requires Algolia App ID",
        NEXT_PUBLIC_ALGOLIA_API_KEY: "Search feature requires Algolia API Key",
      }
    : {}),
}

// Only check production variables in production environment
const varsToCheck = process.env.NODE_ENV === "production" ? [...requiredVars, ...productionOnlyVars] : requiredVars

// Check for missing variables
const missing = []
for (const key of varsToCheck) {
  if (!process.env[key]) {
    missing.push(key)
  }
}

// Check feature-dependent variables
const missingFeatureVars = []
for (const [key, message] of Object.entries(featureDependentVars)) {
  if (!process.env[key]) {
    missingFeatureVars.push(`${key}: ${message}`)
  }
}

// Exit with error if any required variables are missing
if (missing.length > 0) {
  console.error("\x1b[31m%s\x1b[0m", "Error: Missing required environment variables:")
  console.error("\x1b[31m%s\x1b[0m", missing.join(", "))
  console.error("\x1b[33m%s\x1b[0m", "Please set these variables in your .env.local file or deployment environment.")
  process.exit(1)
}

// Warning for feature-dependent variables
if (missingFeatureVars.length > 0) {
  console.warn("\x1b[33m%s\x1b[0m", "Warning: Missing feature-dependent environment variables:")
  console.warn("\x1b[33m%s\x1b[0m", missingFeatureVars.join("\n"))
  console.warn("\x1b[33m%s\x1b[0m", "Some features may not work correctly without these variables.")
}

console.log("\x1b[32m%s\x1b[0m", "✓ All required environment variables are set.")
process.exit(0)
