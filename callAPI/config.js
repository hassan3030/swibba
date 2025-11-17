import axios from "axios"

// Create axios instance with default config
const api = axios.create({
  DIRECTUS_URL:  process.env.NEXT_PUBLIC_API_URL,
  timeout: process.env.NEXT_PUBLIC_API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle specific error codes
    if (error.response) {
      // Handle 401 Unauthorized - redirect to login
      if (error.response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME)
          localStorage.removeItem(process.env.NEXT_PUBLIC_USER_DATA_NAME)
          // Redirect to login page if not already there
          if (window.location.pathname !== "/auth/login") {
            window.location.href = `/auth/login?returnUrl=${window.location.pathname}`
          }
        }
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error("Permission denied")
      }

      // Handle 404 Not Found
      if (error.response.status === 404) {
        console.error("Resource not found")
      }

      // Handle 500 Server Error
      if (error.response.status >= 500) {
        console.error("Server error")
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network error - no response received")
    } else {
      // Something happened in setting up the request
      // console.error("Error", error.message)
    }

    return Promise.reject(error)
  },
)

export default api
