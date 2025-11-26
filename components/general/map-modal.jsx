"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-provider"
import { useTranslations } from "@/lib/use-translations"

export function MapModal({ isOpen, onClose, geoLocation, title, subtitle }) {
  const { isRTL } = useLanguage()
  const { t } = useTranslations()

  if (!geoLocation?.lat || !geoLocation?.lng) return null

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998]"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="relative w-full max-w-6xl h-[85vh] sm:h-[90vh] bg-background rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
                      {title || t("Location") || "Location"}
                    </h3>
                  
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                  aria-label={t("close") || "Close"}
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </div>

              {/* Map Container */}
              <div className="flex-1 relative bg-muted/20">
                <iframe
                  src={`https://maps.google.com/maps?q=${geoLocation.lat},${geoLocation.lng}&z=15&output=embed&gesture=greedy`}
                  className="absolute inset-0 w-full h-full border-0"
                  style={{ 
                    touchAction: 'auto',
                    filter: 'contrast(1.05) saturate(1.1)',
                    pointerEvents: 'auto'
                  }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  title={title || t("Location") || "Location"}
                  scrolling="yes"
                />
              </div>

              {/* Footer - Coordinates and Actions */}
              <div className="px-4 sm:px-6 py-2 sm:py-3 bg-muted/30 border-t">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-md shrink-0">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                        {t("coordinates") || "Coordinates"}
                      </p>
                      <p className="text-xs sm:text-sm font-mono text-foreground truncate">
                        {geoLocation.lat.toFixed(6)}, {geoLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 text-xs sm:text-sm"
                    onClick={() => window.open(
                      `https://www.google.com/maps?q=${geoLocation.lat},${geoLocation.lng}`,
                      '_blank'
                    )}
                  >
                    {t("openInMaps") || "Open in Maps"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
