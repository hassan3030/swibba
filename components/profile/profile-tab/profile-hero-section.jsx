"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Star, MapPin, Verified, BadgeX, Clock, Settings, Package } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { MapModal } from "@/components/general/map-modal"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const avatarVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { scale: 1, rotate: 0 },
  transition: {
    type: "spring",
    stiffness: 260,
    damping: 20,
    delay: 0.2
  }
}

export function ProfileHeroSection({ user, rate, completedOffersCount, myAvailableItems = [] }) {
  const { t } = useTranslations()
  const { isRTL } = useLanguage()
  const [isMapOpen, setIsMapOpen] = useState(false)
  const hasAvailableItems = Array.isArray(myAvailableItems) && myAvailableItems.length > 0

  const fullName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`.trim() 
    : t("account") || "Account"

  const location = user?.country || user?.city || user?.street
    ? `${isRTL ? user?.translations?.[1]?.country || "" : user?.translations?.[0]?.country || ""} ${isRTL ? user?.translations?.[1]?.city || "" : user?.translations?.[0]?.city || ""} ${isRTL ? user?.translations?.[1]?.street || "" : user?.translations?.[0]?.street || ""}`.trim()
    : t("noAddress") || "No address provided"

  const fullStars = Math.floor(rate || 0)
  const hasHalfStar = (rate || 0) % 1 >= 0.5
  const hasGeoLocation = user?.geo_location?.lat && user?.geo_location?.lng

  return (
    <div className="relative bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pb-16 sm:pb-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className={`max-w-7xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          {/* Avatar Section */}
          <motion.div
            variants={avatarVariants}
            initial="initial"
            animate="animate"
            className="relative flex-shrink-0"
          >
            <Avatar className="h-28 w-28 sm:h-32 sm:w-32 lg:h-40 lg:w-40 ring-4 ring-background shadow-2xl">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={fullName} />
              <AvatarFallback className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                {fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            {/* Verified Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 500 }}
              className="absolute -bottom-2 -right-2"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-background rounded-full p-1.5 sm:p-2 shadow-lg ring-2 sm:ring-4 ring-background">
                      {user?.verified == "true" || user?.verified == true ? (
                        <Verified className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary fill-primary" />
                      ) : (
                        <BadgeX className="h-6 w-6 text-destructive" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      {user?.verified == "true" || user?.verified == true 
                        ? (t("verified") || "Verified Account") 
                        : (t("notVerified") || "Not Verified")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          </motion.div>

          {/* Info Section */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className={`flex-1 space-y-4 sm:space-y-5 w-full`}
          >
            <div className="space-y-3">
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent `}>
                {fullName}
              </h1>
              
              <div className={`flex flex-wrap items-center gap-3 sm:gap-4 ${isRTL ? 'justify-end sm:justify-end' : 'justify-center sm:justify-start'}`}>
                <button 
                  onClick={() => hasGeoLocation && setIsMapOpen(true)}
                  className={`flex items-center gap-1.5 sm:gap-2 text-muted-foreground ${hasGeoLocation ? 'hover:text-primary cursor-pointer transition-colors' : ''}`}
                  disabled={!hasGeoLocation}
                >
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm line-clamp-1">{location}</span>
                </button>
                
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                        star <= fullStars
                          ? "fill-yellow-400 text-yellow-400"
                          : star === fullStars + 1 && hasHalfStar
                          ? "fill-yellow-400/50 text-yellow-400"
                          : "fill-none text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                
                {user?.date_created && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">
                      {t("joined") || "Joined"} {new Date(user.date_created).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start w-full sm:w-auto">
              <Button className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow" asChild>
                <Link href="/profile/edit-profile">
                  <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t("editProfile") || "Edit Profile"}
                </Link>
              </Button>
              
              {hasAvailableItems && (
                <Button variant="outline" className="w-full sm:w-auto shadow-sm" asChild>
                  <Link href="/profile/my-items">
                    <Package className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t("manageItems") || "Manage Items"}
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Map Modal */}
      <MapModal 
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        geoLocation={user?.geo_location}
      />
    </div>
  )
}
