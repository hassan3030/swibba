"use client"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"
// import { useRTL } from "@/lib/rtl-provider" 
import { useToast } from "@/components/ui/use-toast"
import { useRTL } from "@/hooks/use-rtl"
import { getMediaType } from "@/lib/utils"
import { mediaURL } from "@/callAPI/utiles";

// ItemCard component
const ItemCard = ({ id, name, description, price, images, allowed_categories,translations, status_swap, category, quantity: originalQuantity = 1, onQuantityChange, selectedQuantity = 1, hasOtherItemsSelected = false }) => {
    // const [bigImage, setBigImage] = useState("")
    const [currentQuantity, setCurrentQuantity] = useState(Number(selectedQuantity) || 1)
    const [totalPrice, setTotalPrice] = useState(Number(price || 0) * (Number(selectedQuantity) || 1))
    const { t } = useTranslations()
    const { isRTL, getDirectionClass } = useRTL()
    const { toast } = useToast()
    const maxQty = Number(originalQuantity || 1)
  
    // Keep local quantity in sync when parent changes selectedQuantity
    useEffect(() => {
      const sq = Number(selectedQuantity) || 1
      if (sq !== currentQuantity) {
        setCurrentQuantity(sq)
        setTotalPrice(Number(price || 0) * sq)
        if (onQuantityChange) onQuantityChange(id, sq, Number(price || 0) * sq)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedQuantity, price, id])
  
    // Update total price and notify parent when currentQuantity changes
    useEffect(() => {
      const total = Number(price || 0) * currentQuantity
      setTotalPrice(total)
      if (onQuantityChange) {
        onQuantityChange(id, currentQuantity, total)
      }
    }, [currentQuantity, price, id, onQuantityChange])
  
    // Use functional updater to avoid stale closures
    const handleQuantityChangeInternal = useCallback((updater) => {
      setCurrentQuantity((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        return Math.max(1, Math.min(next, maxQty))
      })
    }, [maxQty])
  
    // Quantity handlers
    const increaseQuantity = useCallback(() => {
      setCurrentQuantity((prev) => {
        if (prev >= maxQty) {
          toast({
            title: t("quantityExceeded") || "Quantity Exceeded",
            description: t("quantityExceededDescription") || "Cannot exceed available quantity",
            variant: "destructive",
          })
          return prev
        }
        return prev + 1
      })
    }, [maxQty, toast, t])
  
    const decreaseQuantity = useCallback(() => {
      setCurrentQuantity((prev) => {
        if (prev <= 1) {
          toast({
            title: t("minimumQuantity") || "Minimum Quantity",
            description: t("minimumQuantityDescription") || "Minimum quantity is 1",
            variant: "destructive",
          })
          return prev
        }
        return prev - 1
      })
    }, [toast, t])
  
    const getConditionColor = (itemsStatus) => {
      switch (itemsStatus) {
        case "new":
        case "like-new":
        case "excellent":
          return "bg-secondary2/10 text-secondary2 border border-secondary2/20"
        case "good":
          return "bg-primary/10 text-primary border border-primary/20"
        case "fair":
          return "bg-accent/10 text-accent border border-accent/20"
        case "old":
          return "bg-destructive/10 text-destructive border border-destructive/20"
        default:
          return "bg-card/50 text-foreground/70 border border-border"
      }
    }
  
    return (
      <motion.div
        className="flex flex-row rtl:flex-row-reverse items-start gap-4 w-full p-3 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all bg-card/50"
        whileHover={{ x: isRTL ? -5 : 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {(() => {
          // Check if images exist and have the expected structure
          if (!images || !Array.isArray(images) || images.length === 0 || !images[0]?.directus_files_id) {
            // console.log("No valid image data found:", { images, hasImages: !!images, isArray: Array.isArray(images), length: images?.length, firstImage: images?.[0] })
            return (
              <div className="w-24 h-24 bg-card/50 rounded-xl flex-shrink-0 shadow-md flex items-center justify-center border border-border">
                <span className="text-foreground/70 text-xs">No Image</span>
              </div>
            )
          }
          
          const currentMedia = {
            id: images[0].directus_files_id.id,
            type: images[0].directus_files_id.type,
            url: `${mediaURL}${images[0].directus_files_id.id}`
          }
          
          // Get media type from the MIME type
          const mimeType = images[0].directus_files_id.type || images[0].directus_files_id.mime_type || 'image/jpeg'
          const mediaType = getMediaType(mimeType)
          
          // console.log("Image data:", { 
          //   id: currentMedia.id, 
          //   type: currentMedia.type, 
          //   mimeType, 
          //   mediaType, 
          //   url: currentMedia.url,
          //   fullImageData: images[0],
          //   directusFilesId: images[0].directus_files_id
          // })
          
          if (mediaType === 'video') {
            return (
              <video
                src={currentMedia.url}
                className="w-24 h-24 object-cover rounded-xl flex-shrink-0 shadow-md"
                width={96}
                height={96}
              />
            )
          } else if (mediaType === 'audio') {
            return (
              <audio
                src={currentMedia.url}
                className="w-24 h-24 object-cover rounded-xl flex-shrink-0 shadow-md"
                width={96}
                height={96}
              />
            )
          } else if (mediaType === 'image' || !mediaType || mediaType === 'unknown') {
            // Default to image for unknown types or when mediaType is undefined
            return (
              <div className="w-24 h-24 rounded-xl flex-shrink-0 shadow-md overflow-hidden">
                <Image
                  src={currentMedia.url}
                  alt={name}
                  className="w-full h-full object-cover"
                  width={96}
                  height={96}
                  onError={(e) => {
                    // console.error("Image failed to load:", currentMedia.url)
                    // Show a placeholder instead of hiding the image
                    e.target.src = "/placeholder.svg"
                    e.target.alt = "Image not available"
                  }}
                  onLoad={() => {
                    // console.log("Image loaded successfully:", currentMedia.url)
                  }}
                />
              </div>
            )
          } else {
            // Fallback for any other media type
            return (
              <div className="w-24 h-24 bg-card/50 rounded-xl flex-shrink-0 shadow-md flex items-center justify-center border border-border">
                <span className="text-foreground/70 text-xs">Unsupported Media</span>
              </div>
            )
          }
        })()}
        
        <div className="flex-1 min-w-0">
          <motion.h3
            className="font-semibold text-xl mb-2 text-foreground"
            whileHover={{ x: isRTL ? -5 : 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {isRTL ? translations[1]?.name || name : translations[0]?.name || name}
          </motion.h3>
          <motion.div
            className="flex flex-wrap gap-2 mb-3"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 },
              }}
              whileHover={{ scale: 1.05 }}
            >
              <Badge variant="secondary" className="px-3 py-1">{t(category) || category}</Badge>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 },
              }}
              whileHover={{ scale: 1.05 }}
            >
              <Badge className={`px-3 py-1 ${getConditionColor(status_swap)}`}>{t(status_swap) || status_swap}</Badge>
            </motion.div>
            <Separator className="mx-2" />
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 },
              }}
              whileHover={{ scale: 1.05 }}
            >
              <Badge variant="outline" className="px-3 py-1">{t("AllowTo") || "Allow To:"}</Badge>
            </motion.div>
            {allowed_categories &&
              allowed_categories.length > 0 &&
              allowed_categories.map((cat, idx) => (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge variant="outline" className="px-3 py-1">
                    {t(cat) || cat}
                  </Badge>
                </motion.div>
              ))}
          </motion.div>
          
          {/* Quantity Controls */}
          <motion.div
            className="flex items-center justify-between mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col">
              <span className="text-xs text-foreground/70">{t("quantity") || "Quantity"}</span>
              <span className="text-sm font-medium">{maxQty} {t("items") || "items"}</span>
            </div>
  
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full border-primary/20 hover:border-primary hover:bg-primary/10 transition-all"
                  onClick={decreaseQuantity}
                  disabled={currentQuantity <= 1 || !hasOtherItemsSelected}
                >
                  <Minus className="h-3 w-3 text-foreground" />
                </Button>
              </motion.div>
  
              <motion.span
                className="text-sm font-bold min-w-[2rem] text-center text-primary px-2 py-1 rounded-md bg-primary/5 border border-primary/10"
                key={currentQuantity}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {currentQuantity}
              </motion.span>
  
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full border-primary/20 hover:border-primary hover:bg-primary/10 transition-all"
                  onClick={increaseQuantity}
                  disabled={currentQuantity >= maxQty || !hasOtherItemsSelected}
                >
                  <Plus className="h-3 w-3 text-foreground" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
  
          {/* Price Display */}
          <motion.div
            className="flex items-center justify-between mt-2"
            key={totalPrice}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex flex-col">
              <span className="text-xs text-foreground/70">{t("unitPrice") || "Unit Price"}</span>
              <span className="text-sm font-medium">{Number(price).toLocaleString()} {t("LE")}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs text-foreground/70">{t("totalPrice") || "Total Price"}</span>
              <span className="text-lg font-bold text-secondary2">{Number(totalPrice).toLocaleString()} {t("LE")}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
  }
  export default ItemCard