// Utility functions for products list

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Get the item name based on RTL setting
 * @param {Object} item - The item object
 * @param {boolean} isRTL - Is right-to-left language
 * @returns {string} The item name
 */
export const getItemName = (item, isRTL) => {
  return !isRTL 
    ? item.translations?.[0]?.name || item.name
    : item.translations?.[1]?.name || item.name
}

/**
 * Get the item description based on RTL setting
 * @param {Object} item - The item object
 * @param {boolean} isRTL - Is right-to-left language
 * @returns {string} The item description
 */
export const getItemDescription = (item, isRTL) => {
  return !isRTL 
    ? item.translations?.[0]?.description || item.description
    : item.translations?.[1]?.description || item.description
}

/**
 * Extract ID from an object or return the value itself
 * @param {Object|number|string} value - The value to extract ID from
 * @returns {number|string} The extracted ID
 */
export const extractId = (value) => {
  return typeof value === 'object' ? value?.id : value
}

/**
 * Get translated name from static data with RTL support
 * @param {Object} item - The item object (category, brand, etc.)
 * @param {boolean} isRTL - Is right-to-left language
 * @returns {string} The translated name
 */
export const getTranslatedName = (item, isRTL) => {
  if (!item) return ""
  return !isRTL 
    ? (item.translations?.[0]?.name || item.name || "")
    : (item.translations?.[1]?.name || item.name || "")
}
