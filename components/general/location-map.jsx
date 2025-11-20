"use client"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { MapPin, ZoomIn, ZoomOut, RotateCcw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const LocationMap = ({
  latitude = 30.0444,
  longitude = 31.2357,
  onLocationSelect,
  className = "",
  height = "300px",
}) => {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize map once per mount, assuming container is visible
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    let L
    let isMounted = true
    let mapInstance = null

    const initMap = async () => {
      try {
        setIsLoading(true)
        setError(null)

        L = (await import("leaflet")).default
        await import("leaflet/dist/leaflet.css")

        if (!isMounted || !mapContainerRef.current) return

        // Ensure container has dimensions before initializing
        const container = mapContainerRef.current
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
          console.warn("Map container has no dimensions yet")
          setIsLoading(false)
          return
        }

        // Fix for default markers
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        mapInstance = L.map(container, {
          center: [latitude, longitude],
          zoom: 13,
          zoomControl: false,
        })

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(mapInstance)

        const marker = L.marker([latitude, longitude], {
          draggable: true,
        }).addTo(mapInstance)

        marker.on("dragend", (e) => {
          const position = e.target.getLatLng()
          if (onLocationSelect) {
            onLocationSelect({
              lat: position.lat,
              lng: position.lng,
              name: `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`,
            })
          }
        })

        mapInstance.on("click", (e) => {
          marker.setLatLng(e.latlng)
          if (onLocationSelect) {
            onLocationSelect({
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              name: `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`,
            })
          }
        })

        mapInstanceRef.current = mapInstance
        markerRef.current = marker

        // Ensure correct size once rendered
        setTimeout(() => {
          if (isMounted && mapInstanceRef.current) {
            try {
              mapInstanceRef.current.invalidateSize()
            } catch (err) {
              console.error("Error invalidating map size:", err)
            }
          }
        }, 100)

        setIsLoading(false)
      } catch (err) {
        console.error("Map initialization error:", err)
        if (isMounted) {
          setError("Failed to load map")
          setIsLoading(false)
        }
      }
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (err) {
          console.error("Error removing map:", err)
        }
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  // Update map view and marker when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      try {
        const newLatLng = [latitude, longitude]
        mapInstanceRef.current.setView(newLatLng, mapInstanceRef.current.getZoom())
        markerRef.current.setLatLng(newLatLng)
      } catch (err) {
        console.error("Error updating map position:", err)
      }
    }
  }, [latitude, longitude])

  // Extra safeguard: re-invalidate size shortly after mount/layout changes
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const timeoutId = setTimeout(() => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.invalidateSize()
        } catch (err) {
          console.error("Error invalidating map size:", err)
        }
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [])

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn()
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut()
  const handleReset = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 13)
    }
  }

  return (
    <div
      className={`relative rounded-lg overflow-hidden border ${className}`}
    >
      <div
        ref={mapContainerRef}
        style={{
          height,
          width: "100%",
          position: "relative",
        }}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-muted/80 flex items-center justify-center">
          <MapPin className="h-6 w-6 text-primary animate-bounce" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-destructive/90 flex flex-col items-center justify-center text-center p-4">
          <AlertCircle className="h-8 w-8 text-destructive-foreground" />
          <p className="text-destructive-foreground font-semibold mt-2">Map Error</p>
          <p className="text-xs text-destructive-foreground/80">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-lg text-xs text-muted-foreground">
          Click map or drag marker to select location
        </div>
      )}
    </div>
  )
}

export default LocationMap