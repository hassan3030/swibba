"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation, Loader2, MapPin } from "lucide-react"
import { inputVariants, cardVariants, buttonVariants } from "./edit-profile-animations"
import LocationMap from "@/components/general/location-map"

export default function LocationSection({
  isGettingLocation,
  getCurrentPosition,
  selectedPosition,
  geo_location,
  handleLocationSelect,
  activeTab,
  t,
  isRTL,
  getDirectionClass,
  getDirectionValue,
}) {
  return (
    <div>
      <Card className="bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg rtl:flex-row-reverse">
              <Navigation className="h-5 w-5 text-primary" />
              {t("CurrentPosition") || "Current Position"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              onClick={getCurrentPosition}
              disabled={isGettingLocation}
              className="w-full bg-secondary text-background shadow-lg hover:bg-secondary/90 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            >
                {isGettingLocation ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                    >
                      <Loader2 className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
                    </motion.div>
                    {t("GettingLocation") || "Getting Location..."}
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
                    {t("GetCurrentLocation") || "Get Current Location"}
                  </>
                )}
              </Button>

            {/* Interactive Map - always rendered, key ensures proper remount */}
            <div className="pt-4">
              <LocationMap
                key={`map-${activeTab}`}
                latitude={selectedPosition?.lat || geo_location?.lat || 30.0444}
                longitude={selectedPosition?.lng || geo_location?.lng || 31.2357}
                onLocationSelect={handleLocationSelect}
                height="250px"
                className="shadow-lg"
              />
            </div>

            <AnimatePresence>
              {selectedPosition && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-background/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base rtl:flex-row-reverse">
                        <MapPin className="h-4 w-4 text-primary" />
                        {t("SelectedPosition") || "Selected Position"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className={`space-y-2 ${isRTL ? 'force-rtl' : ''}`}>
                      <motion.p
                        className="text-sm"
                        initial={{ opacity: 0, x: getDirectionValue(-10, 10) }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <strong>{t("Name") || "Name"}:</strong> {selectedPosition.name}
                      </motion.p>
                      <motion.p
                        className="text-sm"
                        initial={{ opacity: 0, x: getDirectionValue(-10, 10) }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <strong>{t("Latitude") || "Latitude"}:</strong>{" "}
                        {selectedPosition.lat.toFixed(6)}
                      </motion.p>
                      <motion.p
                        className="text-sm"
                        initial={{ opacity: 0, x: getDirectionValue(-10, 10) }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <strong>{t("Longitude") || "Longitude"}:</strong>{" "}
                        {selectedPosition.lng.toFixed(6)}
                      </motion.p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
    </div>
  )
}
