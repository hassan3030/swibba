"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const SimpleLocationPicker = ({ 
  latitude = 30.0444, 
  longitude = 31.2357, 
  onLocationSelect,
  className = "",
  height = "300px"
}) => {
  const [lat, setLat] = useState(latitude.toString())
  const [lng, setLng] = useState(longitude.toString())

  const handleLocationUpdate = () => {
    const numLat = parseFloat(lat)
    const numLng = parseFloat(lng)
    
    if (!isNaN(numLat) && !isNaN(numLng)) {
      if (onLocationSelect) {
        onLocationSelect({
          lat: numLat,
          lng: numLng,
          name: `${numLat.toFixed(6)}, ${numLng.toFixed(6)}`
        })
      }
    }
  }

  return (
    <motion.div 
      className={`${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ height }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-primary" />
            Location Coordinates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="30.0444"
                type="number"
                step="any"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="31.2357"
                type="number"
                step="any"
              />
            </div>
          </div>

          <Button 
            onClick={handleLocationUpdate}
            className="w-full"
            size="sm"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Update Location
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            <p>Enter latitude and longitude coordinates</p>
            <p>Example: Cairo is at 30.0444, 31.2357</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default SimpleLocationPicker
