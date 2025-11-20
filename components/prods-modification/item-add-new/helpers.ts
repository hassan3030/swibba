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
): Promise<{ locationName: string; country?: string; city?: string }> => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    )
    if (response.ok) {
      const data = await response.json()
      if (data.city && data.countryName) {
        return {
          locationName: `${data.city}, ${data.countryName}`,
          country: data.countryName,
          city: data.city,
        }
      }
    }
  } catch (error) {
    console.log('Reverse geocoding failed, using coordinates only')
  }
  return { locationName: 'Current Location' }
}
