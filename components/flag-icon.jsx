"use client"
import { useState } from "react"

const FlagIcon = ({ flag, countryCode, className = "" }) => {
  const [hasError, setHasError] = useState(false)

  // Fallback flag representations
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

  // If emoji fails, show a colored circle with country code
  if (hasError) {
    return (
      <div 
        className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full ${className}`}
        title={`${countryCode} flag`}
      >
        {countryCode?.slice(0, 2) || "??"}
      </div>
    )
  }

  return (
    <span 
      className={`inline-block w-6 h-4 rounded-sm overflow-hidden ${className}`}
      style={{
        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "Twemoji Mozilla", sans-serif',
        fontSize: 'inherit',
        display: 'inline-block',
        minWidth: '24px',
        minHeight: '16px',
        textAlign: 'center',
        lineHeight: '16px',
        background: 'linear-gradient(to bottom, #f0f0f0, #e0e0e0)',
        border: '1px solid #ccc'
      }}
      onError={() => setHasError(true)}
      title={`${countryCode} flag`}
    >
      {flag || fallbackFlags[countryCode] || "🏳️"}
    </span>
  )
}

export default FlagIcon
