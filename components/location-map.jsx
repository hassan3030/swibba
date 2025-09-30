"use client"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { MapPin, ZoomIn, ZoomOut, RotateCcw, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import SimpleLocationPicker from "./simple-location-picker"

const LocationMap = ({ 
  latitude = 30.0444, 
  longitude = 31.2357, 
  onLocationSelect,
  className = "",
  height = "300px"
}) => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const [zoom, setZoom] = useState(13)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFallback, setShowFallback] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Intersection Observer to detect when map becomes visible
  useEffect(() => {
    if (!mapRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Delay setting isVisible to allow parent animations to settle
            setTimeout(() => {
                setIsVisible(true)
            }, 500); // Wait 500ms before initializing the map
            // Force a refresh when becoming visible (this will only run if map is already initialized)
            setTimeout(() => {
              if (map) {
                map.invalidateSize()
              }
            }, 600) // A bit after the isVisible delay
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(mapRef.current)

    return () => {
      observer.disconnect()
    }
  }, [map])

  useEffect(() => {
    // Dynamically import Leaflet only on client side
    let leafletMap
    let leafletMarker

    const initMap = async () => {
      try {
        // Check if map is already initialized
        if (map || !mapRef.current) {
          return
        }

        // Dynamic import to avoid SSR issues
        const L = (await import('leaflet')).default
        
        // Fix for default markers in webpack
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Check if the container already has a map
        if (mapRef.current._leaflet_id) {
          console.warn('Map container already initialized, skipping...')
          return
        }

        // Ensure container has proper dimensions
        const container = mapRef.current
        console.log('Map container dimensions:', {
          width: container.offsetWidth,
          height: container.offsetHeight,
          clientWidth: container.clientWidth,
          clientHeight: container.clientHeight,
          scrollWidth: container.scrollWidth,
          scrollHeight: container.scrollHeight
        })
        
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
          console.warn('Map container has zero dimensions, waiting for proper sizing...')
          // Wait a bit and try again
          setTimeout(() => {
            console.log('Retrying map initialization...')
            if (container.offsetWidth > 0 && container.offsetHeight > 0) {
              initMap()
            } else {
              console.error('Map container still has zero dimensions after retry, forcing initialization...')
              // Force initialization even with zero dimensions - Leaflet might handle it
              initMap()
            }
          }, 200)
          return
        }

        // Initialize map
        leafletMap = L.map(mapRef.current, {
          center: [latitude, longitude],
          zoom: zoom,
          zoomControl: false, // We'll add custom controls
          preferCanvas: true, // Use canvas renderer for better performance
        })

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(leafletMap)

        // Add marker
        leafletMarker = L.marker([latitude, longitude], {
          draggable: true,
        }).addTo(leafletMap)

        // Handle marker drag
        leafletMarker.on('dragend', function(e) {
          const position = e.target.getLatLng()
          if (onLocationSelect) {
            onLocationSelect({
              lat: position.lat,
              lng: position.lng,
              name: `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
            })
          }
        })

        // Handle map click
        leafletMap.on('click', function(e) {
          leafletMarker.setLatLng(e.latlng)
          if (onLocationSelect) {
            onLocationSelect({
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              name: `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`
            })
          }
        })

        setMap(leafletMap)
        setMarker(leafletMarker)
        setIsLoading(false)

        // Force map to invalidate size multiple times to ensure proper rendering
        const invalidateMap = () => {
          if (leafletMap) {
            leafletMap.invalidateSize()
          }
        }

        // Use an interval to repeatedly invalidate size for a short period
        let invalidateCount = 0;
        const invalidateInterval = setInterval(() => {
            invalidateMap();
            invalidateCount++;
            if (invalidateCount >= 10) { // Invalidate 10 times over 1 second
                clearInterval(invalidateInterval);
            }
        }, 100); // Every 100ms
        
        // Also invalidate when the map is ready
        leafletMap.whenReady(() => {
          invalidateMap()
          // Check if map is actually rendering properly
          setTimeout(() => {
            const mapContainer = leafletMap.getContainer()
            if (mapContainer && mapContainer.offsetWidth > 0 && mapContainer.offsetHeight > 0) {
              // Map seems to be rendering, do one final invalidation
              invalidateMap()
            } else {
              console.warn('Map container still has zero dimensions after initialization')
              // Try to force a refresh
              setTimeout(() => {
                invalidateMap()
              }, 1000)
            }
          }, 200)
        })

      } catch (error) {
        console.error('Error loading map:', error)
        setError('Failed to load map. Please check your internet connection.')
        setIsLoading(false)
      }
    }

    // Only initialize when visible and container is ready
    if (isVisible && mapRef.current) {
      // Wait for the next tick to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        initMap()
      })
    }

    return () => {
      if (map) {
        map.remove()
        setMap(null)
        setMarker(null)
      }
    }
  }, [isVisible]) // Depend on visibility

  useEffect(() => {
    if (map && marker) {
      // Only update if coordinates have actually changed
      const currentCenter = map.getCenter()
      const currentMarkerPos = marker.getLatLng()
      
      if (Math.abs(currentCenter.lat - latitude) > 0.0001 || 
          Math.abs(currentCenter.lng - longitude) > 0.0001) {
        map.setView([latitude, longitude], zoom)
        marker.setLatLng([latitude, longitude])
      }
    }
  }, [latitude, longitude, map, marker, zoom])

  // Handle container resize
  useEffect(() => {
    if (!map || !mapRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      if (map) {
        // Use requestAnimationFrame to ensure the resize happens after the DOM update
        requestAnimationFrame(() => {
          map.invalidateSize()
        })
      }
    })

    resizeObserver.observe(mapRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [map])

  // Additional invalidation on window resize
  useEffect(() => {
    if (!map) return

    const handleResize = () => {
      if (map) {
        setTimeout(() => {
          map.invalidateSize()
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [map])

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      if (map) {
        try {
          map.remove()
        } catch (error) {
          console.warn('Error removing map:', error)
        }
      }
    }
  }, [map])

  const handleZoomIn = () => {
    if (map) {
      const newZoom = Math.min(map.getZoom() + 1, 19)
      map.setZoom(newZoom)
      setZoom(newZoom)
    }
  }

  const handleZoomOut = () => {
    if (map) {
      const newZoom = Math.max(map.getZoom() - 1, 1)
      map.setZoom(newZoom)
      setZoom(newZoom)
    }
  }

  const handleReset = () => {
    if (map && marker) {
      map.setView([latitude, longitude], 13)
      marker.setLatLng([latitude, longitude])
      setZoom(13)
    }
  }

  const handleForceRefresh = () => {
    if (map) {
      // Destroy and recreate the map
      map.remove()
      setMap(null)
      setMarker(null)
      setIsLoading(true)
      setError(null)
      
      // Wait a bit then reinitialize
      setTimeout(() => {
        setIsVisible(true)
      }, 100)
    }
  }

  // Show fallback if explicitly requested
  if (showFallback) {
    return (
      <SimpleLocationPicker
        latitude={latitude}
        longitude={longitude}
        onLocationSelect={onLocationSelect}
        className={className}
        height={height}
      />
    )
  }

  return (
    <motion.div 
      className={`relative rounded-lg overflow-hidden border ${className}`}
      style={{ width: '100%' }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ 
          height,
          width: '100%',
          minHeight: '200px',
          position: 'relative',
          display: 'block'
        }} 
        className="w-full"
      />

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 bg-muted/80 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <MapPin className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="text-sm text-muted-foreground">Loading map...</span>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-muted/80 flex items-center justify-center">
          <Card className="mx-4">
            <CardContent className="flex flex-col items-center gap-3 p-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div className="text-center">
                <p className="text-sm font-medium text-destructive">Map Loading Failed</p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setError(null)
                    setIsLoading(true)
                    window.location.reload()
                  }}
                >
                  Retry
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => setShowFallback(true)}
                >
                  Use Simple Picker
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Controls */}
      {!isLoading && !error && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={handleZoomIn}
              className="shadow-lg bg-background/90 backdrop-blur-sm"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={handleZoomOut}
              className="shadow-lg bg-background/90 backdrop-blur-sm"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={handleReset}
              className="shadow-lg bg-background/90 backdrop-blur-sm"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={handleForceRefresh}
              className="shadow-lg bg-background/90 backdrop-blur-sm"
              title="Refresh Map"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      )}

      {/* Map Info */}
      {!isLoading && !error && (
        <motion.div 
          className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>Click or drag marker to select location</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default LocationMap
