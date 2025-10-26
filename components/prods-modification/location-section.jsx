import { motion } from "framer-motion"
import { MapPin, Navigation, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "@/lib/use-translations"
import LocationMap from "@/components/general/location-map"

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
}

export const LocationSection = ({
  geoLocation,
  selectedPosition,
  currentPosition,
  isGettingLocation,
  isMapRefreshing,
  onGetCurrentLocation,
  onSetSelectedPosition,
  onSetCurrentPosition,
  onSetIsMapRefreshing
}) => {
  const { t } = useTranslations()

  return (
    <motion.div variants={cardVariants}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-blue-500" />
            {t("Location") || "Location"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              onClick={onGetCurrentLocation}
              disabled={isGettingLocation}
              className="flex-1"
              variant="outline"
            >
              {isGettingLocation ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {t("GettingLocation") || "Getting Location..."}
                </>
              ) : (
                <>
                  <Navigation className="mr-2 h-4 w-4" />
                  {t("UseCurrentLocation") || "Use Current Location"}
                </>
              )}
            </Button>
            
            <Button
              type="button"
              onClick={() => onSetIsMapRefreshing(!isMapRefreshing)}
              variant="outline"
              size="icon"
            >
              <RefreshCw className={`h-4 w-4 ${isMapRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Location Map */}
          <div className="h-64 rounded-lg overflow-hidden border">
            <LocationMap
              selectedPosition={selectedPosition}
              onPositionSelect={onSetSelectedPosition}
              currentPosition={currentPosition}
              refreshTrigger={isMapRefreshing}
            />
          </div>

          {/* Location Info */}
          {(selectedPosition || geoLocation) && (
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>{t("Latitude") || "Latitude"}:</strong> {(selectedPosition || geoLocation)?.latitude?.toFixed(6)}
              </p>
              <p>
                <strong>{t("Longitude") || "Longitude"}:</strong> {(selectedPosition || geoLocation)?.longitude?.toFixed(6)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
