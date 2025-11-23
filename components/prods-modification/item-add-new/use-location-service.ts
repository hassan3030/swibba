import { useState, useEffect } from 'react'
import { getLocationName } from './helpers'

interface Position {
  lat: number
  lng: number
  accuracy?: number
  name?: string
}

interface GeoLocation {
  lat: number
  lng: number
  accuracy?: number
  name?: string
}

export const useLocationService = (
  toast: any,
  t: (key: string) => string,
  formSetValue: (field: string, value: any) => void
) => {
  const [geo_location, set_geo_location] = useState<GeoLocation>({} as GeoLocation)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [isMapRefreshing, setIsMapRefreshing] = useState(false)

  // Remove auto-refresh - it was causing unnecessary updates
  // The map will only refresh when explicitly requested by user

  const getCurrentPosition = () => {
    setIsGettingLocation(true)

    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: t('geolocationNotSupported') || 'Geolocation is not supported by this browser',
        variant: 'destructive',
      })
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        const locationData = await getLocationName(lat, lng)

        console.log('📦 Location data received:', locationData)

        // Auto-fill all form fields with detected location data
        if (locationData.country) {
          console.log('🔧 Setting country to:', locationData.country)
          formSetValue('country', locationData.country)
        }
        if (locationData.city) {
          console.log('🔧 Setting city to:', locationData.city)
          formSetValue('city', locationData.city)
        }
        if (locationData.street) {
          console.log('🔧 Setting street to:', locationData.street)
          formSetValue('street', locationData.street)
        }

        const pos: Position = {
          lat,
          lng,
          accuracy: position.coords.accuracy,
          name: locationData.locationName,
        }
        setCurrentPosition(pos)
        setSelectedPosition(pos)

        set_geo_location({
          lat: pos.lat,
          lng: pos.lng,
          accuracy: pos.accuracy,
          name: pos.name,
        })

        setIsGettingLocation(false)
        toast({
          title: t('CurrentLocationFound') || 'Current location found',
          description: `${locationData.locationName} - ${t('Latitude')}: ${pos.lat.toFixed(6)}, ${t('Longitude')}: ${pos.lng.toFixed(6)}`,
        })
      },
      (error) => {
        let message = t('Unabletoretrieveyourlocation') || 'Unable to retrieve your location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = t('Locationaccessdeniedbyuser') || 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            message = t('Locationinformationisunavailable') || 'Location information is unavailable'
            break
          case error.TIMEOUT:
            message = t('Locationrequesttimedout') || 'Location request timed out'
            break
        }
        toast({
          title: t('LocationError') || 'Location Error',
          description: message,
          variant: 'destructive',
        })
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    )
  }

  const handleLocationSelect = async (location: Position) => {
    const locationData = await getLocationName(location.lat, location.lng)

    // Auto-fill all form fields when location is selected from map
    if (locationData.country) {
      formSetValue('country', locationData.country)
    }
    if (locationData.city) {
      formSetValue('city', locationData.city)
    }
    if (locationData.street) {
      formSetValue('street', locationData.street)
    }

    const updatedLocation = {
      ...location,
      name: locationData.locationName,
    }

    set_geo_location({
      lat: location.lat,
      lng: location.lng,
      accuracy: 0,
      name: locationData.locationName,
    })
    setSelectedPosition(updatedLocation)

    toast({
      title: t('locationSelected') || 'Location',
      description: `${locationData.locationName} - ${t('Latitude')}: ${location.lat.toFixed(6)}, ${t('Longitude')}: ${location.lng.toFixed(6)}`,
    })
  }

  return {
    geo_location,
    set_geo_location,
    isGettingLocation,
    currentPosition,
    selectedPosition,
    isMapRefreshing,
    setIsMapRefreshing,
    getCurrentPosition,
    handleLocationSelect,
  }
}
