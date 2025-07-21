import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"

export const baseItemsURL = "http://localhost:8055/items"
export const baseURL = "http://localhost:8055"

// Enhanced error handling utility
const handleApiError = (error, context) => {
  const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred"
  console.error(`${context} Error:`, errorMessage)

  // Return structured error for consistency
  return {
    success: false,
    error: errorMessage,
    status: error.response?.status || 500,
    context,
  }
}

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000
    return decoded.exp && decoded.exp < currentTime
  } catch {
    return true
  }
}

// Get a cookie with improved error handling and expiration check
export const getCookie = async () => {
  try {
    const tokenValue = Cookies.get("Token")

    if (!tokenValue) {
      console.warn("Token not found in cookies")
      return null
    }

    if (typeof tokenValue !== "string") {
      console.error("Token is not a string:", typeof tokenValue)
      await removeCookie() // Clean up invalid token
      return null
    }

    // Check if token is expired
    if (isTokenExpired(tokenValue)) {
      console.warn("Token has expired, removing from cookies")
      await removeCookie()
      return null
    }

    console.log("Token retrieved successfully")
    return tokenValue
  } catch (error) {
    console.error("Get Cookie Error:", error.message)
    await removeCookie() // Clean up on error
    return null
  }
}

// Remove a cookie with confirmation
export const removeCookie = async () => {
  try {
    Cookies.remove("Token", { path: "/" })
    Cookies.remove("Token", { path: "/", domain: window.location.hostname })
    console.log("Token removed successfully")
    return { success: true, message: "Token removed" }
  } catch (error) {
    console.error("Remove Cookie Error:", error.message)
    return { success: false, message: "Failed to remove token" }
  }
}

// Decode JWT token with enhanced validation and expiration handling
export const decodedToken = async () => {
  try {
    const token = await getCookie()

    if (!token) {
      console.warn("No token available for decoding")
      return null
    }

    if (typeof token !== "string") {
      console.error("Token is not a string")
      await removeCookie()
      return null
    }

    // Validate JWT structure
    const tokenParts = token.split(".")
    if (tokenParts.length !== 3) {
      console.error("Invalid JWT token structure")
      await removeCookie()
      return null
    }

    const decoded = jwtDecode(token)

    // Check if token is expired
    const currentTime = Date.now() / 1000
    if (decoded.exp && decoded.exp < currentTime) {
      console.warn("Token has expired during decode")
      await removeCookie()
      return null
    }

    // Check if token expires soon (within 5 minutes)
    if (decoded.exp && decoded.exp - currentTime < 300) {
      console.warn("Token expires soon, consider refreshing")
    }

    console.log("Token decoded successfully, user ID:", decoded.id)
    return decoded
  } catch (error) {
    console.error("Failed to decode token:", error.message)
    await removeCookie() // Remove invalid token
    return null
  }
}

// Set a cookie with enhanced options and validation
export const setCookie = async (jwtToken, options = {}) => {
  try {
    if (!jwtToken || typeof jwtToken !== "string") {
      throw new Error("Invalid JWT token provided")
    }

    // Validate token before setting
    try {
      const decoded = jwtDecode(jwtToken)
      if (!decoded.id) {
        throw new Error("Token missing user ID")
      }
    } catch (decodeError) {
      throw new Error("Invalid token format")
    }

    const defaultOptions = {
      expires: 7, // 7 days
      secure: window.location.protocol === "https:",
      sameSite: "strict",
      path: "/",
      ...options,
    }

    Cookies.set("Token", jwtToken, defaultOptions)
    console.log("Token set successfully")
    return { success: true, message: "Token set successfully" }
  } catch (error) {
    console.error("Set Cookie Error:", error.message)
    return { success: false, message: `Failed to set token: ${error.message}` }
  }
}

// Utility to check if user is authenticated with token validation
export const isAuthenticated = async () => {
  try {
    const token = await decodedToken()
    return !!token && !!token.id
  } catch (error) {
    console.error("Authentication check failed:", error.message)
    return false
  }
}

// Utility to get current user ID with error handling
export const getCurrentUserId = async () => {
  try {
    const decoded = await decodedToken()
    return decoded?.id || null
  } catch (error) {
    console.error("Get current user ID failed:", error.message)
    return null
  }
}

// Utility to refresh token if needed (placeholder for future implementation)
export const refreshTokenIfNeeded = async () => {
  try {
    const token = await getCookie()
    if (!token) return false

    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000

    // If token expires in less than 1 hour, consider refreshing
    if (decoded.exp && decoded.exp - currentTime < 3600) {
      console.log("Token refresh recommended")
      // TODO: Implement token refresh logic with your backend
      return false
    }

    return true
  } catch (error) {
    console.error("Token refresh check failed:", error.message)
    return false
  }
}

// Utility to handle API requests with automatic token validation
export const makeAuthenticatedRequest = async (requestFn) => {
  try {
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      throw new Error("Authentication required")
    }

    return await requestFn()
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("Authentication failed, removing token")
      await removeCookie()
    }
    throw error
  }
}

// Export error handler for use in other modules
export { handleApiError }
