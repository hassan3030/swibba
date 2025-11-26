"use client"
import { motion } from "framer-motion"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, ArrowRight, Star, Verified, ShoppingBag } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"
import { useRTL } from "@/hooks/use-rtl"
import { mediaURL, getMediaType } from "@/callAPI/utiles"

const TargetItemHero = ({ 
  targetItem, 
  otherUserData, 
  isSelected,
  onSelect 
}) => {
  const { t } = useTranslations()
  const { isRTL } = useRTL()

  if (!targetItem) return null

  const getImageUrl = () => {
    if (targetItem.images?.[0]?.directus_files_id?.id) {
      return `${mediaURL}${targetItem.images[0].directus_files_id.id}`
    }
    return "/placeholder.svg"
  }

  const getName = () => {
    if (isRTL && targetItem.translations?.[1]?.name) {
      return targetItem.translations[1].name
    }
    return targetItem.translations?.[0]?.name || targetItem.name
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-8"
    >
      <Card 
        className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
          isSelected 
            ? "ring-2 ring-primary shadow-2xl bg-gradient-to-br from-primary/10 via-background to-secondary/10" 
            : "hover:shadow-xl hover:ring-1 hover:ring-primary/50"
        }`}
        onClick={onSelect}
      >
        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 z-10 bg-primary text-white rounded-full p-2 shadow-lg"
          >
            <Check className="h-5 w-5" />
          </motion.div>
        )}

        <CardContent className="p-0">
          <div className={`flex flex-col md:flex-row ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            {/* Image Section */}
            <div className="relative w-full md:w-2/5 aspect-square md:aspect-auto md:min-h-[280px]">
              <Image
                src={getImageUrl()}
                alt={getName()}
                fill
                className="object-cover"
                onError={(e) => { e.target.src = "/placeholder.svg" }}
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/10" />
              
              {/* Mobile price badge */}
              <div className="absolute bottom-4 left-4 md:hidden">
                <Badge className="bg-primary text-white text-lg px-4 py-2 shadow-lg">
                  {Number(targetItem.price).toLocaleString()} {t("LE")}
                </Badge>
              </div>
            </div>

            {/* Content Section */}
            <div className={`flex-1 p-6 md:p-8 flex flex-col justify-between ${isRTL ? 'text-right' : 'text-left'}`}>
              {/* Header */}
              <div>
                <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                    <ShoppingBag className="h-3 w-3 mr-1" />
                    {t("ItemYouWant") || "Item You Want"}
                  </Badge>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 line-clamp-2">
                  {getName()}
                </h2>

                {/* Category & Status */}
                <div className={`flex flex-wrap gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Badge variant="secondary" className="px-3 py-1">
                    {t(targetItem.category) || targetItem.category}
                  </Badge>
                  <Badge 
                    className={`px-3 py-1 ${
                      targetItem.status_swap === 'available' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {t(targetItem.status_swap) || targetItem.status_swap}
                  </Badge>
                </div>

                {/* Price - Desktop */}
                <div className="hidden md:block mb-6">
                  <p className="text-sm text-foreground/60 mb-1">{t("price") || "Price"}</p>
                  <p className="text-3xl font-bold text-primary">
                    {Number(targetItem.price).toLocaleString()} <span className="text-lg">{t("LE")}</span>
                  </p>
                </div>
              </div>

              {/* Seller Info */}
              <div className={`flex items-center gap-4 pt-4 border-t border-border ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage
                      src={otherUserData?.avatar ? `${mediaURL}${otherUserData.avatar}` : "/placeholder.svg"}
                      alt={otherUserData?.first_name || "Seller"}
                    />
                    <AvatarFallback>{otherUserData?.first_name?.[0] || "S"}</AvatarFallback>
                  </Avatar>
                  {(otherUserData?.verified === "true" || otherUserData?.verified === true) && (
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                      <Verified className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {otherUserData?.first_name} {otherUserData?.last_name}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {t("Seller") || "Seller"}
                  </p>
                </div>

                {/* Selection CTA */}
                <motion.div 
                  className={`flex items-center gap-2 ${isSelected ? 'text-primary' : 'text-foreground/60'}`}
                  animate={{ x: isSelected ? 0 : [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: isSelected ? 0 : Infinity }}
                >
                  <span className="text-sm font-medium">
                    {isSelected ? (t("Selected") || "Selected") : (t("ClickToSelect") || "Click to select")}
                  </span>
                  {!isSelected && <ArrowRight className="h-4 w-4" />}
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default TargetItemHero
