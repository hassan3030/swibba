"use client"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Handshake, 
  ArrowRightLeft,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Verified,
  Package,
  Eye
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { mediaURL } from "@/callAPI/utiles"

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  hover: {
    y: -4,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
}

export default function OfferListCard({
  offer,
  index,
  isReceived,
  swapItems = [],
  userSwaps = [],
  myUserId,
}) {
  const { t } = useTranslations()
  const { isRTL } = useLanguage()
  const router = useRouter()

  const otherUserId = isReceived ? offer.from_user_id : offer.to_user_id
  const myId = isReceived ? offer.to_user_id : offer.from_user_id
  const otherUser = userSwaps.find((u) => u.id === otherUserId)

  const myItems = swapItems.filter((u) => u.offered_by === myId && u.offer_id === offer.id)
  const theirItems = swapItems.filter((u) => u.offered_by !== myId && u.offer_id === offer.id)

  const myItemsCount = myItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const theirItemsCount = theirItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

  const getStatusConfig = (status) => {
    switch (status) {
      case "accepted":
        return {
          color: "bg-green-500",
          textColor: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
          icon: Handshake,
          label: t("Accepted") || "Accepted",
        }
      case "pending":
        return {
          color: "bg-yellow-500",
          textColor: "text-yellow-600 dark:text-yellow-400",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
          icon: Clock,
          label: t("Pending") || "Pending",
        }
      case "completed":
        return {
          color: "bg-blue-500",
          textColor: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
          icon: CheckCircle2,
          label: t("Completed") || "Completed",
        }
      case "rejected":
        return {
          color: "bg-destructive",
          textColor: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/30",
          icon: XCircle,
          label: t("Rejected") || "Rejected",
        }
      default:
        return {
          color: "bg-gray-500",
          textColor: "text-gray-600",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/30",
          icon: Package,
          label: status,
        }
    }
  }

  const statusConfig = getStatusConfig(offer.status_offer)
  const StatusIcon = statusConfig.icon

  const handleViewDetails = () => {
    router.push(`/offers/${offer.id}`)
  }

  // Get first image from items for preview
  const getPreviewImages = () => {
    const images = []
    if (theirItems[0]?.images?.[0]) {
      images.push(`${mediaURL}${theirItems[0].images[0].directus_files_id}`)
    }
    if (myItems[0]?.images?.[0]) {
      images.push(`${mediaURL}${myItems[0].images[0].directus_files_id}`)
    }
    return images
  }

  const previewImages = getPreviewImages()

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`relative overflow-hidden border ${statusConfig.borderColor} hover:border-primary/40 bg-background/80 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5`}
        onClick={handleViewDetails}
      >
        {/* Status Indicator Line */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${statusConfig.color}`} />
        
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {/* User Avatar & Info */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-border shadow-md">
                  <AvatarImage
                    src={`${mediaURL}${otherUser?.avatar || "/placeholder.svg"}`}
                    alt={otherUser?.first_name || "User"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {otherUser?.first_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                {(otherUser?.verified === "true" || otherUser?.verified === true) && (
                  <div className="absolute -bottom-1 -right-1">
                    <Verified className="h-5 w-5 text-primary bg-background rounded-full p-0.5 border-2 border-background" />
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg truncate">
                    {`${otherUser?.first_name || ""} ${otherUser?.last_name || ""}`.trim().slice(0, 20) || t("User")}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[150px]">
                      {(() => {
                        const city = isRTL
                          ? (otherUser?.translations?.[1]?.city || otherUser?.city || "")
                          : (otherUser?.translations?.[0]?.city || otherUser?.city || "")
                        const country = otherUser?.country || ""
                        return country || city ? `${country} ${city}`.trim().slice(0, 25) : (t("noAddress") || "No address")
                      })()}
                    </span>
                  </div>
                </div>

                <Badge
                  variant="secondary"
                  className={`${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor} flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{statusConfig.label}</span>
                </Badge>
              </div>

              {/* Items Preview Row */}
              <div className="flex items-center gap-3 mb-3">
                {/* Item Images Preview */}
                {previewImages.length > 0 && (
                  <div className="flex -space-x-2">
                    {previewImages.slice(0, 2).map((img, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-lg border-2 border-background shadow-sm overflow-hidden bg-muted"
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {(myItems.length + theirItems.length) > 2 && (
                      <div className="w-10 h-10 rounded-lg border-2 border-background shadow-sm bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                        +{myItems.length + theirItems.length - 2}
                      </div>
                    )}
                  </div>
                )}

                {/* Exchange Info */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-lg">
                    <span className="font-semibold text-primary">{myItemsCount}</span>
                    <span className="text-xs text-muted-foreground">{t("items") || "items"}</span>
                  </div>
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/10 rounded-lg">
                    <span className="font-semibold text-secondary">{theirItemsCount}</span>
                    <span className="text-xs text-muted-foreground">{t("items") || "items"}</span>
                  </div>
                </div>
              </div>

              {/* Footer Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {offer.date_created
                      ? new Date(offer.date_created).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : ""}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10 rounded-lg gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewDetails()
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {t("ViewDetails") || "View Details"}
                  {isRTL ? (
                    <ChevronLeft className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Cash Adjustment Indicator */}
          {offer.cash_adjustment && offer.cash_adjustment !== 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className={`text-xs font-medium ${offer.cash_adjustment > 0 ? "text-destructive" : "text-green-500"}`}>
                {offer.cash_adjustment > 0
                  ? `${t("Youpay") || "You pay"}: ${Math.abs(Math.ceil(offer.cash_adjustment))} ${t("LE") || "LE"}`
                  : `${t("Youget") || "You get"}: ${Math.abs(Math.ceil(offer.cash_adjustment))} ${t("LE") || "LE"}`}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
