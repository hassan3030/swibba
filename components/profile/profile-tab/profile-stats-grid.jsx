"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Package, ArrowLeftRight, ShoppingBag, Star } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export function ProfileStatsGrid({ myAvailableItems, completedOffersCount, myUnavailableItems, rate }) {
  const { t } = useTranslations()

  const stats = [
    { 
      label: t("activeItems") || "Active Items", 
      value: Array.isArray(myAvailableItems) ? myAvailableItems.length : 0, 
      icon: Package, 
      color: "text-blue-600", 
      bgColor: "bg-blue-50 dark:bg-blue-950/30" 
    },
    { 
      label: t("completedSwaps") || "Completed", 
      value: completedOffersCount || 0, 
      icon: ArrowLeftRight, 
      color: "text-green-600", 
      bgColor: "bg-green-50 dark:bg-green-950/30" 
    },
    { 
      label: t("inOffers") || "In Offers", 
      value: Array.isArray(myUnavailableItems) ? myUnavailableItems.length : 0, 
      icon: ShoppingBag, 
      color: "text-purple-600", 
      bgColor: "bg-purple-50 dark:bg-purple-950/30" 
    },
    { 
      label: t("rating") || "Rating", 
      value: rate || 0, 
      icon: Star, 
      color: "text-yellow-600", 
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30" 
    }
  ]

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 -mt-12 sm:-mt-16 mb-6 sm:mb-8 relative z-10"
    >
      {stats.map((stat, index) => (
        <motion.div key={index} variants={fadeInUp}>
          <Card className="overflow-hidden border border-border/40 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/95 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-5 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 sm:p-2.5 rounded-lg ${stat.bgColor} shrink-0`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                    {stat.label === (t("rating") || "Rating") && stat.value > 0 
                      ? stat.value.toFixed(1) 
                      : stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
