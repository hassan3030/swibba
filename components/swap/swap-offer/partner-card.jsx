"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Wallet, Phone, MapPin, Verified, Copy, Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mediaURL } from "@/callAPI/utiles"
import { fadeInUp } from "./animation-variants"
import { MapModal } from "@/components/general/map-modal"

export function PartnerCard({ 
  offer, 
  otherUser, 
  statusConfig, 
  priceInfo, 
  handleCopyPhone, 
  phoneCopied, 
  isRTL, 
  t 
}) {
  const [isMapOpen, setIsMapOpen] = useState(false)
  const hasGeoLocation = otherUser?.geo_location?.lat && otherUser?.geo_location?.lng

  return (
    <>
    <motion.div variants={fadeInUp}>
      <Card className={`mb-6 overflow-hidden border-2 ${statusConfig.borderClass} shadow-lg`}>
        <div className={`bg-gradient-to-br ${statusConfig.bgClass} p-6`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            {/* User Info */}
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="relative">
                <Avatar className="h-16 w-16 border-3 border-white shadow-xl">
                  <AvatarImage
                    src={`${mediaURL}${otherUser?.avatar || "/placeholder.svg"}`}
                    alt={otherUser?.first_name || "User"}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xl font-bold">
                    {otherUser?.first_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                {(otherUser?.verified === "true" || otherUser?.verified === true) && (
                  <motion.div 
                    className={`absolute -bottom-1 ${isRTL ? '-left-1' : '-right-1'}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                      <Verified className="h-4 w-4 text-white" />
                    </div>
                  </motion.div>
                )}
              </div>
              
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className="text-xl font-bold">
                  {`${otherUser?.first_name || ""} ${otherUser?.last_name || ""}`.trim() || t("User")}
                </h1>
                <button 
                  onClick={() => hasGeoLocation && setIsMapOpen(true)}
                  className={`flex items-center gap-1.5 text-sm text-muted-foreground mt-1 ${isRTL ? 'flex-row-reverse' : ''} ${hasGeoLocation ? 'hover:text-primary cursor-pointer transition-colors' : ''}`}
                  disabled={!hasGeoLocation}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>
                    {(() => {
                      const city = isRTL
                        ? (otherUser?.translations?.[1]?.city || otherUser?.city || "")
                        : (otherUser?.translations?.[0]?.city || otherUser?.city || "")
                      const country = otherUser?.country || ""
                      return country || city ? `${city}${city && country ? ", " : ""}${country}` : (t("noAddress") || "No address")
                    })()}
                  </span>
                </button>
                
                {/* Phone - visible on accepted/completed */}
                {["completed", "accepted"].includes(offer.status_offer) && otherUser?.phone_number && (
                  <button
                    onClick={handleCopyPhone}
                    className={`flex items-center gap-1.5 text-sm mt-1.5 text-primary hover:underline ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{otherUser.phone_number}</span>
                    {phoneCopied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Date & Price Info */}
            <div className={`space-y-2 ${isRTL ? 'text-left sm:text-left' : 'sm:text-right'}`}>
              <div className={`inline-flex items-center gap-2 text-sm text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar className="h-3.5 w-3.5" />
                {new Date(offer.date_created).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </div>
              
              {offer.cash_adjustment !== 0 && (
                <div className={`flex items-center gap-2 ${isRTL ? 'justify-start sm:justify-start flex-row-reverse' : 'sm:justify-end'} ${priceInfo.colorClass}`}>
                  <Wallet className="h-4 w-4" />
                  <span className="font-semibold text-sm">{priceInfo.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Map Modal */}
      <MapModal 
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        geoLocation={otherUser?.geo_location}
        title={`${otherUser?.first_name || ""} ${otherUser?.last_name || ""}`.trim() || t("User")}
      />
    </motion.div>
    </>
  )
}

export default PartnerCard
