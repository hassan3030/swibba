"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation, MapPin, Loader2, Map, RefreshCw, Search } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { itemVariants, buttonVariants } from "./constants"
import { countriesListWithFlags } from "@/lib/countries-data"
import FlagIcon from "@/components/general/flag-icon"
import LocationMap from "@/components/general/location-map"

interface LocationSectionProps {
  form: any
  t: (key: string) => string
  geo_location: any
  isGettingLocation: boolean
  selectedPosition: any
  isMapRefreshing: boolean
  setIsMapRefreshing: (value: boolean) => void
  getCurrentPosition: () => void
  handleLocationSelect: (location: any) => void
}

export function LocationSection({
  form,
  t,
  geo_location,
  isGettingLocation,
  selectedPosition,
  isMapRefreshing,
  setIsMapRefreshing,
  getCurrentPosition,
  handleLocationSelect,
}: LocationSectionProps) {
  return (
    <motion.div className="space-y-2" variants={itemVariants}>
      <div className="grid gap-2 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">{t("Country") || "Country"}</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <SelectTrigger className="bg-background border-input text-foreground focus:border-ring focus:ring-2 focus:ring-ring">
                    <SelectValue placeholder={t("SelectCountry") || "Select country/countries"}>
                      {field.value && (
                        <div className="flex items-center gap-2">
                          <FlagIcon
                            flag={countriesListWithFlags.find((c) => c.name === field.value)?.flag}
                            countryCode={field.value}
                            className="text-lg"
                          />
                          <span>{t(field.value) || field.value}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-background border-input text-foreground h-40">
                    <div className="flex items-center px-2 pb-2 sticky top-0 bg-background z-10">
                      <Search className="h-4 w-4 opacity-50 mr-2" />
                      <input
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={t("SearchCountry") || "Search country..."}
                        onChange={(e) => {
                          const value = e.currentTarget.value.toLowerCase()
                          document.querySelectorAll("[data-country-item]").forEach((item) => {
                            const countryName = item.getAttribute("data-country-name")?.toLowerCase() || ""
                            const translatedName = item.getAttribute("data-country-translated")?.toLowerCase() || ""
                            item.style.display = countryName.includes(value) || translatedName.includes(value) ? "" : "none"
                          })
                        }}
                      />
                    </div>
                    <div className="pt-1 max-h-[300px] overflow-auto">
                      {countriesListWithFlags.map((country) => (
                        <SelectItem
                          key={country.name}
                          value={country.name}
                          className="text-right"
                          data-country-item
                          data-country-name={country.name.toLowerCase()}
                          data-country-translated={(t(country.name) || country.name).toLowerCase()}
                        >
                          <div className="flex items-center gap-2">
                            <FlagIcon flag={country.flag} countryCode={country.name} className="text-lg" />
                            <span>{t(country.name) || country.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">{t("City") || "City"}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("e.g., Sohage") || "e.g., Sohage"}
                  {...field}
                  className="rounded-lg bg-background border-input text-foreground focus:border-ring focus:ring-2 focus:ring-ring transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="street"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground">{t("Street") || "Street"}</FormLabel>
            <FormControl>
              <Input
                placeholder={t("egOmarebnElkhtab") || "e.g., Omar ebn Elkhtab"}
                {...field}
                className="rounded-lg bg-background border-input text-foreground focus:border-ring focus:ring-2 focus:ring-ring transition-all"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <motion.div variants={itemVariants}>
        <Card className="rounded-xl shadow-md bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Navigation className="h-5 w-5 text-primary" />
              {t("CurrentPosition") || "Current Position"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <motion.div variants={buttonVariants} whileTap="tap">
              <Button
                type="button"
                onClick={getCurrentPosition}
                disabled={isGettingLocation}
                className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all shadow-md"
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("GettingLocation") || "Getting Location..."}
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    {t("GetCurrentLocation") || "Get Current Location"}
                  </>
                )}
              </Button>
            </motion.div>
          </CardContent>

          <AnimatePresence>
            {selectedPosition && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="rounded-lg border border-border bg-card/50 mt-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <MapPin className="h-5 w-5 text-primary" />
                      {t("SelectedPosition") || "Selected Position"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <p className="text-sm text-foreground/70">
                        <strong>{t("Name") || "Name"}:</strong> {selectedPosition.name}
                      </p>
                      <p className="text-sm text-foreground/70">
                        <strong>{t("Latitude") || "Latitude"}:</strong> {selectedPosition.lat.toFixed(6)}
                      </p>
                      <p className="text-sm text-foreground/70">
                        <strong>{t("Longitude") || "Longitude"}:</strong> {selectedPosition.lng.toFixed(6)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="rounded-xl shadow-md bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              >
                <Map className="h-5 w-5 text-primary" />
              </motion.div>
              {t("InteractiveMap") || "Interactive Map"}
              {isMapRefreshing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center text-sm text-foreground ml-auto z-10"
                >
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  <span>Updating...</span>
                </motion.div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <LocationMap
                latitude={selectedPosition?.lat || geo_location?.lat || 30.0444}
                longitude={selectedPosition?.lng || geo_location?.lng || 31.2357}
                onLocationSelect={handleLocationSelect}
                height="300px"
                className="shadow-lg"
              />
            </motion.div>

            <motion.div className="flex flex-wrap gap-4 justify-center" variants={itemVariants}>
              <motion.div whileHover="hover" whileTap="tap">
                <Button
                  type="button"
                  onClick={getCurrentPosition}
                  disabled={isGettingLocation}
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg"
                >
                  {isGettingLocation ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Loader2 className="mr-2 h-4 w-4" />
                      </motion.div>
                      {t("GettingLocation") || "Getting Location..."}
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      {t("GetCurrentLocation") || "Get Current Location"}
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.div whileHover="hover" whileTap="tap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsMapRefreshing(true)
                    setTimeout(() => setIsMapRefreshing(false), 1000)
                  }}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t("RefreshMap") || "Refresh Map"}
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
