// Server-side SEO data fetching functions

// Use hardcoded URLs to ensure they work on server-side
// These match the values in utiles.js
const baseItemsURL = process.env.BASE_ITEMS_URL || "https://dev-dashboard.swibba.com/items/"
const mediaURL = process.env.MEDIA_URL || 'https://deel-deal-directus.csiwm3.easypanel.host/assets/'
const siteURL = process.env.SWIBBA_URL || "https://dev.swibba.com"
/**
 * Fetch product with SEO data for meta tags (server-side only)
 * @param {string} id - Product ID
 * @param {string} lang - Language code (en-US or ar-SA)
 * @returns {Promise<object>} Product data with SEO
 */
export async function getProductWithSEO(id, lang = "en-US") {
  try {
    if (!id) {
      throw new Error("Product ID is required")
    }

    const url = `${baseItemsURL}Items/${id}?fields=*,seo.*,seo.translations.*,translations.*,images.*,images.directus_files_id.*`
    
    console.log("getProductWithSEO: Fetching URL:", url)
    
    const response = await fetch(url, {
      cache: 'no-store', // Disable cache to ensure fresh data
    })

    console.log("getProductWithSEO: Response status:", response.status)

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: "Product not found", status: 404 }
      }
      console.error(`getProductWithSEO: API returned status ${response.status}`)
      throw new Error(`Failed to fetch product: ${response.status}`)
    }

    const data = await response.json()
    
    console.log("getProductWithSEO: Data received:", !!data.data)
    
    if (!data.data) {
      return { success: false, error: "Product not found", status: 404 }
    }

    return {
      success: true,
      data: data.data,
      message: "Product with SEO retrieved successfully",
    }
  } catch (error) {
    console.error("getProductWithSEO Error:", error.message, error.stack)
    // Return success: false but don't treat network errors as 404
    // This allows the page to handle errors gracefully
    return {
      success: false,
      error: error.message || "Unknown error occurred",
      status: 500,
    }
  }
}

/**
 * Get SEO translation based on language
 * @param {object} seo - SEO object with translations
 * @param {string} lang - Language code (en-US or ar-SA)
 * @returns {object} SEO translation for the language
 */
export function getSEOTranslation(seo, lang = "en-US") {
  if (!seo || !seo.translations || !Array.isArray(seo.translations)) {
    return null
  }

  // Find translation for the specified language
  const translation = seo.translations.find(
    (t) => t.languages_code === lang
  )

  // Fallback to first available translation
  return translation || seo.translations[0] || null
}

/**
 * Build OG image URL
 * @param {string} imageId - Image ID from Directus
 * @returns {string} Full image URL
 */
export function buildOGImageURL(imageId) {
  if (!imageId) return null
  return `${mediaURL}${imageId}`
}

/**
 * Build canonical URL for product
 * @param {string} productId - Product ID
 * @returns {string} Canonical URL
 */
export function buildProductURL(productId) {
  return `${siteURL}/products/${productId}`
}

/**
 * Get first product image URL
 * @param {object} product - Product object with images
 * @returns {string|null} Image URL or null
 */
export function getProductImageURL(product) {
  if (!product?.images || !Array.isArray(product.images) || product.images.length === 0) {
    return null
  }

  const firstImage = product.images[0]
  const imageId = firstImage?.directus_files_id?.id || firstImage?.directus_files_id

  if (!imageId) return null

  return `${mediaURL}${imageId}`
}
