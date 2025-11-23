"use client"
import { motion } from "framer-motion"
import { Star, ArrowLeftRight, Verified, BadgeX } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export function SellerInfo({ user, name, avatar, rate, completedOffersCount, t }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 border"
    >
      <h3 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
        {t("soldBy") || t("seller") || "Sold by"}
      </h3>
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
        <div className="relative shrink-0">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-2 ring-primary/20 shadow-lg">
            <AvatarImage src={avatar || "/placeholder.svg"} alt={name || "User"} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {name ? name.charAt(0) : "U"}
            </AvatarFallback>
          </Avatar>
          {user?.Verified === "true" || user?.Verified === true ? (
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 sm:p-1 shadow-md">
              <Verified className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          ) : (
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 sm:p-1 shadow-md">
              <BadgeX className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
          <h4 className="font-bold text-lg sm:text-xl text-foreground truncate">
            {name || "Unknown"}
          </h4>
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-wrap">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-secondary2 text-secondary2" />
              <span className="text-sm font-medium text-foreground">
                {rate ? `${rate}/5.0` : (t("noRate") || "No rating")}
              </span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <ArrowLeftRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {completedOffersCount > 1000 
                  ? "1000+ swaps"
                  : `${completedOffersCount || 0} swaps`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
