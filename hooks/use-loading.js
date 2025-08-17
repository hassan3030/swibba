"use client"

import { useState, useCallback } from 'react'

/**
 * A hook to manage loading states with automatic timeout functionality
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.initialState - Initial loading state (default: false)
 * @param {number} options.timeout - Automatic timeout in milliseconds (default: 0, no timeout)
 * @returns {Array} - [isLoading, startLoading, stopLoading, toggleLoading]
 * 
 * @example
 * // Basic usage
 * const [isLoading, startLoading, stopLoading] = useLoading();
 * 
 * // With automatic timeout (stops loading after 3 seconds)
 * const [isLoading, startLoading, stopLoading] = useLoading({ timeout: 3000 });
 * 
 * // With custom initial state
 * const [isLoading, startLoading, stopLoading] = useLoading({ initialState: true });
 */
const useLoading = (options = {}) => {
  const { initialState = false, timeout = 0 } = options
  const [isLoading, setIsLoading] = useState(initialState)
  
  // Start loading with optional custom timeout
  const startLoading = useCallback((customTimeout) => {
    setIsLoading(true)
    
    // If timeout is provided (either in options or as parameter), automatically stop loading after timeout
    const timeoutToUse = customTimeout || timeout
    if (timeoutToUse > 0) {
      setTimeout(() => {
        setIsLoading(false)
      }, timeoutToUse)
    }
  }, [timeout])
  
  // Stop loading
  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])
  
  // Toggle loading state
  const toggleLoading = useCallback(() => {
    setIsLoading(prev => !prev)
  }, [])
  
  return [isLoading, startLoading, stopLoading, toggleLoading]
}

export default useLoading