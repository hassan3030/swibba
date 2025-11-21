import environment from "../config/environment"

/**
 * Check if a feature is enabled
 * @param {string} featureName - The name of the feature to check
 * @returns {boolean} Whether the feature is enabled
 */
export function isFeatureEnabled(featureName) {
  switch (featureName) {
    case "socialLogin":
      return environment.enableSocialLogin
    case "chat":
      return environment.enableChat
    case "notifications":
      return environment.enableNotifications
    case "mapView":
      return environment.enableMapView
    case "reviews":
      return environment.enableReviews
    case "wishlist":
      return environment.enableWishlist
    case "comparisons":
      return environment.enableComparisons
    case "auctions":
      return environment.enableAuctions
    case "videoChat":
      return environment.enableVideoChat
    case "analytics":
      return environment.enableAnalytics
    case "sharing":
      return environment.enableSharing
    case "following":
      return environment.enableFollowing
    case "likes":
      return environment.enableLikes
    case "comments":
      return environment.enableComments
    case "experimental":
      return environment.enableExperimentalFeatures
    default:
      // Check if it's in the experimental features list
      if (environment.enableExperimentalFeatures && environment.experimentalFeaturesList.includes(featureName)) {
        return true
      }
      return false
  }
}

/**
 * Get the base URL for the application
 * @returns {string} The base URL
 */
export function getDIRECTUS_URL() {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return environment.appUrl
}

/**
 * Get the API URL with an optional path
 * @param {string} path - The path to append to the API URL
 * @returns {string} The complete API URL
 */
export function getApiUrl(path = "") {
  const baseApiUrl = environment.apiUrl.replace(/\/$/, "")
  const formattedPath = path.startsWith("/") ? path : `/${path}`
  return path ? `${baseApiUrl}${formattedPath}` : baseApiUrl
}

/**
 * Get the image URL with an optional path
 * @param {string} path - The path to append to the image storage URL
 * @returns {string} The complete image URL
 */
export function getImageUrl(path = "") {
  if (!path) return ""

  const baseImageUrl = environment.imageStorageUrl.replace(/\/$/, "")
  const formattedPath = path.startsWith("/") ? path : `/${path}`
  return `${baseImageUrl}${formattedPath}`
}

/**
 * Check if the application is running in a specific environment
 * @param {string} env - The environment to check (production, development, test)
 * @returns {boolean} Whether the application is running in the specified environment
 */
export function isEnvironment(env) {
  return environment.nodeEnv === env
}

/**
 * Get a list of supported locales
 * @returns {string[]} Array of supported locale codes
 */
export function getSupportedLocales() {
  return environment.supportedLocales
}

/**
 * Check if a locale is supported
 * @param {string} locale - The locale to check
 * @returns {boolean} Whether the locale is supported
 */
export function isLocaleSupported(locale) {
  return environment.supportedLocales.includes(locale)
}

/**
 * Check if a locale is RTL (right-to-left)
 * @param {string} locale - The locale to check
 * @returns {boolean} Whether the locale is RTL
 */
export function isRtlLocale(locale) {
  return environment.rtlLocales.includes(locale)
}

/**
 * Format a price according to the current locale and currency
 * @param {number} amount - The amount to format
 * @returns {string} The formatted price
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat(environment.defaultLocale, {
    style: "currency",
    currency: environment.currencyCode,
  }).format(amount)
}

/**
 * Format a date according to the current locale and date format
 * @param {Date|string|number} date - The date to format
 * @returns {string} The formatted date
 */
export function formatDate(date) {
  const dateObj = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat(environment.defaultLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj)
}

/**
 * Get the current theme colors
 * @returns {Object} The theme colors
 */
export function getThemeColors() {
  return {
    primary: environment.primaryColor,
    secondary: environment.secondaryColor,
    accent: environment.accentColor,
    error: environment.errorColor,
    warning: environment.warningColor,
    success: environment.successColor,
    info: environment.infoColor,
  }
}

/**
 * Get feature limits
 * @param {string} limitName - The name of the limit to get
 * @returns {number} The limit value
 */
export function getFeatureLimit(limitName) {
  switch (limitName) {
    case "maxItemsPerUser":
      return environment.maxItemsPerUser
    case "maxImagesPerItem":
      return environment.maxImagesPerItem
    case "maxCategoriesPerItem":
      return environment.maxCategoriesPerItem
    case "maxTagsPerItem":
      return environment.maxTagsPerItem
    case "maxOffersPerItem":
      return environment.maxOffersPerItem
    case "maxMessagesPerDay":
      return environment.maxMessagesPerDay
    case "maxUploadSize":
      return environment.maxUploadSize
    default:
      return 0
  }
}

/**
 * Get legal URLs
 * @param {string} documentType - The type of legal document (terms, privacy, cookies)
 * @returns {string} The URL to the legal document
 */
export function getLegalUrl(documentType) {
  switch (documentType) {
    case "terms":
      return environment.termsUrl
    case "privacy":
      return environment.privacyUrl
    case "cookies":
      return environment.cookiePolicyUrl
    default:
      return "/"
  }
}

/**
 * Check if the application is GDPR compliant
 * @returns {boolean} Whether the application is GDPR compliant
 */
export function isGdprCompliant() {
  return environment.gdprCompliant
}

/**
 * Check if the application is CCPA compliant
 * @returns {boolean} Whether the application is CCPA compliant
 */
export function isCcpaCompliant() {
  return environment.ccpaCompliant
}

/**
 * Get app metadata for SEO and social sharing
 * @returns {Object} The app metadata
 */
export function getAppMetadata() {
  return {
    name: environment.appName,
    description: environment.appDescription,
    url: environment.appUrl,
    logo: environment.appLogo,
    favicon: environment.appFavicon,
    version: environment.appVersion,
    contactEmail: environment.contactEmail,
    supportPhone: environment.supportPhone,
  }
}

/**
 * Get map default settings
 * @returns {Object} The map default settings
 */
export function getMapDefaults() {
  return {
    latitude: environment.defaultLatitude,
    longitude: environment.defaultLongitude,
    zoomLevel: environment.defaultZoomLevel,
  }
}

/**
 * Check if a payment method is enabled
 * @param {string} method - The payment method to check
 * @returns {boolean} Whether the payment method is enabled
 */
export function isPaymentMethodEnabled(method) {
  switch (method) {
    case "stripe":
      return !!environment.stripePublicKey
    case "paypal":
      return !!environment.paypalClientId
    case "applePay":
      return environment.applePay
    case "googlePay":
      return environment.googlePay
    default:
      return false
  }
}
