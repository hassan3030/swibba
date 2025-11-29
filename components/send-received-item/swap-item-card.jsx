"use client"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { getMediaType } from "@/lib/utils"
import { mediaURL } from "@/callAPI/utiles"

const buttonVariants = {
  hover: {
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.98 },
}

const SwapItemCard = ({ 
  id, 
  name, 
  description, 
  price, 
  status_item, 
  images, 
  translations, 
  quantity, 
  available_quantity 
}) => {
  const router = useRouter()
  const { isRTL } = useLanguage()
  const { t } = useTranslations()

  const unitPrice = Number(price || 0)
  const qty = Number(quantity ?? available_quantity ?? 1)

  const handleView = (id) => {
    router.push(`/products/${id}`)
  }

  // Get the display name and description based on language
  const displayName = isRTL 
    ? translations?.[1]?.name || name 
    : translations?.[0]?.name || name
  
  const displayDescription = isRTL 
    ? translations?.[1]?.description || description 
    : translations?.[0]?.description || description

  // Truncate description to max 400 characters
  const truncatedDescription = displayDescription 
    ? displayDescription.length > 400 
      ? displayDescription.substring(0, 400) + "..." 
      : displayDescription
    : ""

  // Get media info
  const mediaInfo = images?.[0]?.directus_files_id ? {
    id: images[0].directus_files_id.id,
    type: images[0].directus_files_id.type,
    url: `${mediaURL}${images[0].directus_files_id.id}`
  } : null

  const mediaType = mediaInfo ? getMediaType(mediaInfo.type) : 'image'

  return (
    <motion.div 
      whileHover={{ y: -4 }} 
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Card className="overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full flex flex-col min-h-[420px]">
        {/* Image Header with Badge */}
        <div className="relative w-full h-48 bg-muted overflow-hidden flex-shrink-0">
          {mediaInfo && (
            <>
              {mediaType === 'video' ? (
                <video 
                  src={mediaInfo.url} 
                  alt={displayName} 
                  className="w-full h-full object-cover"
                  muted
                />
              ) : mediaType === 'audio' ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
                  <span className="text-4xl">🎵</span>
                </div>
              ) : (
                <Image 
                  src={mediaInfo.url} 
                  alt={displayName} 
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              )}
            </>
          )}
          
          {/* Badge Overlay */}
          <div className="absolute top-3 left-3">
            <Badge className="text-xs px-2 py-1 shadow-lg backdrop-blur-sm bg-primary text-primary-foreground">
              {t(status_item) || status_item}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          {/* Title */}
          <h4 className="font-bold text-lg line-clamp-1">{displayName}</h4>
          
          {/* Description - max 400 chars */}
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {truncatedDescription || " "}
          </p>
          
          {/* Price (left) & Quantity (right) */}
          <div className="flex items-center justify-between pt-2 mt-auto">
            <div>
              <div className="font-bold text-primary text-lg">
                {unitPrice.toLocaleString()} {t("LE") || "LE"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                {t("quantity") || "Qty"}: <span className="font-semibold text-foreground">{qty}</span>
              </div>
            </div>
          </div>

          {/* View Button Footer */}
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-10 text-sm gap-2 mt-2" 
              onClick={() => handleView(id)}
            >
              <Eye className="h-4 w-4" />
              {t("view") || "View"}
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}

export default SwapItemCard
