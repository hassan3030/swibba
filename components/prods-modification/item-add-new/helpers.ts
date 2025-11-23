/**
 * Helper function to determine media type from MIME type
 */
export const getMediaType = (mimeType?: string): 'image' | 'video' | 'audio' => {
  if (!mimeType) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('image/')) return 'image'
  
  // Fallback: check file extension if mime type is not available
  if (typeof mimeType === 'string' && mimeType.includes('.')) {
    const ext = mimeType.toLowerCase().split('.').pop()
    if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'mpeg', 'mpg', 'm4v'].includes(ext || '')) {
      return 'video'
    }
    if (['mp3', 'wav', 'ogg', 'm4a', 'm4b', 'm4p'].includes(ext || '')) {
      return 'audio'
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return 'image'
    }
  }
  return 'image'
}

/**
 * Helper to extract ID from object or string
 */
export const extractId = (value: any): string | null => {
  if (typeof value === 'string') return value
  if (value?.id) {
    if (typeof value.id === 'string') return value.id
    return value.id?.id || value.id
  }
  return null
}

/**
 * Reverse geocoding to get location name from coordinates
 */
export const getLocationName = async (
  lat: number,
  lng: number
): Promise<{ locationName: string; country?: string; city?: string; street?: string }> => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    )
    if (response.ok) {
      const data = await response.json()
      
      console.log('🌍 API Response:', data)
      console.log('📍 Country from API:', data.countryName)
      console.log('🏙️ City from API:', data.city)
      
      // Extract street information
      const street = data.locality || data.localityInfo?.administrative?.[0]?.name || 
                    data.principalSubdivision || data.localityInfo?.informative?.[0]?.name || ''
      
      // Map API country names to match your countries list
      let country = data.countryName
      
      // Common country name mappings
      const countryMappings: { [key: string]: string } = {
        'United States of America': 'United States',
        'USA': 'United States',
        'UK': 'United Kingdom',
        'Great Britain': 'United Kingdom',
        'UAE': 'United Arab Emirates',
        'Czech Republic': 'Czech Republic',
        'Czechia': 'Czech Republic',
        'Republic of Korea': 'South Korea',
        'Korea, South': 'South Korea',
        'Korea, North': 'North Korea',
        'Democratic Republic of the Congo': 'Democratic Republic of the Congo',
        'Congo': 'Congo (Congo-Brazzaville)',
        'DRC': 'Democratic Republic of the Congo',
      }
      
      // Apply mapping if available
      if (countryMappings[country]) {
        country = countryMappings[country]
      }
      
      console.log('✅ Final country to set:', country)
      
      if (data.city && country) {
        return {
          locationName: `${data.city}, ${country}`,
          country: country,
          city: data.city,
          street: street,
        }
      }
    }
  } catch (error) {
    console.log('❌ Reverse geocoding failed:', error)
  }
  return { locationName: 'Current Location' }
}
