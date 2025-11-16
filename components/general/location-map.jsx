"use client"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { MapPin, ZoomIn, ZoomOut, RotateCcw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const LocationMap = ({
  latitude = 30.0444,
  longitude = 31.2357,
  onLocationSelect,
  className = "",
  height = "300px",
}) => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mapInstance
    let L

    const initMap = async () => {
      // Check if map already exists or container is not ready
      if (!mapRef.current || map || mapRef.current._leaflet_id) return

      setIsLoading(true)
      setError(null)
      
      try {
        L = (await import("leaflet")).default
        await import("leaflet/dist/leaflet.css")

        // Fix for default markers
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        mapInstance = L.map(mapRef.current, {
          center: [latitude, longitude],
          zoom: 13,
          zoomControl: false,
        })

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance)

        const currentMarker = L.marker([latitude, longitude], {
          draggable: true,
        }).addTo(mapInstance)

        currentMarker.on("dragend", (e) => {
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
          currentMarker.setLatLng(e.latlng)
          if (onLocationSelect) {
            onLocationSelect({
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              name: `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`,
            })
          }
        })

        setMap(mapInstance)
        setMarker(currentMarker)
      } catch (err) {
        // console.error("Error loading map:", err)
        setError("Failed to load map.")
      } finally {
        setIsLoading(false)
      }
    }

    initMap()

    // Cleanup function
    return () => {
      if (mapInstance) {
        mapInstance.remove()
        mapInstance = null
      }
    }
  }, [latitude, longitude, onLocationSelect]) // Include dependencies

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      if (map) {
        map.remove()
        setMap(null)
        setMarker(null)
      }
    }
  }, [map])

  useEffect(() => {
    // Invalidate size when the component is visible and has dimensions
    if (!map || !mapRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })

    resizeObserver.observe(mapRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [map])

  useEffect(() => {
    if (map && marker) {
      const newLatLng = [latitude, longitude]
      map.setView(newLatLng)
      marker.setLatLng(newLatLng)
    }
  }, [latitude, longitude, map, marker])


  const handleZoomIn = () => map?.zoomIn()
  const handleZoomOut = () => map?.zoomOut()
  const handleReset = () => {
    if (map) {
      map.setView([latitude, longitude], 13)
    }
  }

  return (
    <motion.div
      className={`relative rounded-lg overflow-hidden border ${className}`}
      style={{ width: "100%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div ref={mapRef} style={{ height, width: "100%" }} />

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
        <>
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <Button size="sm" variant="secondary" onClick={handleZoomIn} className="shadow-lg"><ZoomIn className="h-4 w-4" /></Button>
            <Button size="sm" variant="secondary" onClick={handleZoomOut} className="shadow-lg"><ZoomOut className="h-4 w-4" /></Button>
            <Button size="sm" variant="secondary" onClick={handleReset} className="shadow-lg"><RotateCcw className="h-4 w-4" /></Button>
          </div>
          <div className="absolute bottom-2 left-2 bg-background/80 p-2 rounded-md shadow-lg text-xs text-muted-foreground">
            Click map or drag marker to select location.
          </div>
        </>
      )}
    </motion.div>
  )
}

export default LocationMap