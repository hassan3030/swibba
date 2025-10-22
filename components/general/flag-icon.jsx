"use client"
import { useState, useEffect } from "react"

const FlagIcon = ({ flag, countryCode, className = "" }) => {
  const [hasError, setHasError] = useState(false)
  const [isEmojiSupported, setIsEmojiSupported] = useState(true)

  // Check emoji support on mount
  useEffect(() => {
    // Test if emoji rendering works by checking if flag emoji renders properly
    const testEmoji = () => {
      try {
        // Create a test element
        const testDiv = document.createElement('div')
        testDiv.style.position = 'absolute'
        testDiv.style.left = '-9999px'
        testDiv.style.fontSize = '16px'
        testDiv.style.fontFamily = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
        testDiv.textContent = '🇪🇬'
        document.body.appendChild(testDiv)
        
        // Check if the emoji rendered as a single character
        const rect = testDiv.getBoundingClientRect()
        const isEmoji = rect.width > 10 && rect.height > 10
        
        document.body.removeChild(testDiv)
        setIsEmojiSupported(isEmoji)
      } catch (error) {
        // console.warn('Emoji support test failed:', error)
        setIsEmojiSupported(false)
      }
    }

    testEmoji()
  }, [])

  // Fallback flag representations with country codes
  const fallbackFlags = {
    "EG": "🇪🇬",
    "US": "🇺🇸", 
    "CA": "🇨🇦",
    "GB": "🇬🇧",
    "FR": "🇫🇷",
    "DE": "🇩🇪",
    "IT": "🇮🇹",
    "ES": "🇪🇸",
    "SA": "🇸🇦",
    "AE": "🇦🇪"
  }

  // If emoji is not supported or fails, show a colored circle with country code
  if (hasError || !isEmojiSupported) {
    return (
      <div 
        className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full ${className}`}
        title={`${countryCode} flag`}
      >
        {countryCode?.slice(0, 2) || "??"}
      </div>
    )
  }

  // Display flag using CSS classes from flag-icon-css library
  return (
    <span 
      className={`flag-icon flag-icon-${flag?.toLowerCase()} ${className}`}
      title={`${countryCode} flag`}
    ></span>
  )
}

export default FlagIcon
