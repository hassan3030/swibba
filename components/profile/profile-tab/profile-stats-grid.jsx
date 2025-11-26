"use client"

import { Package, ArrowLeftRight, ShoppingBag, Star } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"
import { StatCard, StatCardGrid } from "@/components/general/stat-card"

export function ProfileStatsGrid({ myAvailableItems, completedOffersCount, myUnavailableItems, rate }) {
  const { t } = useTranslations()

  const activeItemsCount = Array.isArray(myAvailableItems) ? myAvailableItems.length : 0
  const inOffersCount = Array.isArray(myUnavailableItems) ? myUnavailableItems.length : 0
  const ratingValue = rate || 0

  return (
    <StatCardGrid className="-mt-12 sm:-mt-16 mb-6 sm:mb-8 relative z-10">
      <StatCard
        icon={Package}
        value={activeItemsCount}
        label={t("activeItems") || "Active Items"}
        color="text-primary"
        bgColor="bg-primary/10"
        borderColor="border-primary/20"
        glowColor="from-primary/20 to-primary/10"
      />
      <StatCard
        icon={ArrowLeftRight}
        value={completedOffersCount || 0}
        label={t("completedSwaps") || "Completed Swaps"}
        color="text-green-500"
        bgColor="bg-green-500/10"
        borderColor="border-green-500/20"
        glowColor="from-green-500/20 to-green-500/10"
      />
      <StatCard
        icon={ShoppingBag}
        value={inOffersCount}
        label={t("inOffers") || "In Offers"}
        color="text-purple-500"
        bgColor="bg-purple-500/10"
        borderColor="border-purple-500/20"
        glowColor="from-purple-500/20 to-purple-500/10"
      />
      <StatCard
        icon={Star}
        value={ratingValue}
        label={t("rating") || "Rating"}
        color="text-yellow-500"
        bgColor="bg-yellow-500/10"
        borderColor="border-yellow-500/20"
        glowColor="from-yellow-500/20 to-yellow-500/10"
        isRating={true}
      />
    </StatCardGrid>
  )
}
