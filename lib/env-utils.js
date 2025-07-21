/**
 * Environment utilities for Next.js
 * These utilities help with loading and validating environment variables
 */

/**
 * Get an environment variable with validation
 * @param {string} key - The environment variable key
 * @param {*} defaultValue - Default value if not found
 * @param {boolean} required - Whether the variable is required
 * @returns {string} The environment variable value
 */
export function getEnv(key, defaultValue = "", required = false) {
  const value = process.env[key] || defaultValue

  if (required && !value) {
    throw new Error(`Environment variable ${key} is required but not set`)
  }

  return value
}

/**
 * Get a boolean environment variable
 * @param {string} key - The environment variable key
 * @param {boolean} defaultValue - Default value if not found
 * @returns {boolean} The environment variable as a boolean
 */
export function getBoolEnv(key, defaultValue = false) {
  const value = process.env[key]

  if (value === undefined || value === null) {
    return defaultValue
  }

  return value === "true" || value === "1" || value === "yes"
}

/**
 * Get a number environment variable
 * @param {string} key - The environment variable key
 * @param {number} defaultValue - Default value if not found
 * @returns {number} The environment variable as a number
 */
export function getNumEnv(key, defaultValue = 0) {
  const value = process.env[key]

  if (value === undefined || value === null) {
    return defaultValue
  }

  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

/**
 * Get an array environment variable (comma-separated)
 * @param {string} key - The environment variable key
 * @param {Array} defaultValue - Default value if not found
 * @returns {Array} The environment variable as an array
 */
export function getArrayEnv(key, defaultValue = []) {
  const value = process.env[key]

  if (!value) {
    return defaultValue
  }

  return value.split(",").map((item) => item.trim())
}

/**
 * Validate required environment variables
 * @param {Array} requiredVars - Array of required environment variable keys
 * @throws {Error} If any required variable is missing
 */
export function validateRequiredEnv(requiredVars) {
  const missing = []

  for (const key of requiredVars) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}
