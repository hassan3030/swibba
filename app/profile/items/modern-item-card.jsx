"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Play,
  Calendar,
  Package,
  TrendingUp,
  AlertCircle,
  Banknote
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { deleteProduct, updateProductQuantity } from "@/callAPI/products"
import { checkItemInOfferItems, checkItemUpdate } from "@/callAPI/swap"
import { getMediaType } from "@/lib/utils"
import { mediaURL } from "@/callAPI/utiles"

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
}

const imageVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
}

export default function ModernItemCard({ item }) {
  const { toast } = useToast()
  const { t } = useTranslations()
  const { isRTL } = useLanguage()
  const router = useRouter()

  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showQuantityDialog, setShowQuantityDialog] = useState(false)
  const [newQuantity, setNewQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const itemName = !isRTL ? item.translations?.[0]?.name : item.translations?.[1]?.name || item.name
  const itemDescription = !isRTL ? item.translations?.[0]?.description : item.translations?.[1]?.description || item.description

  const handleUpdateQuantity = async (quantity, status_swap, completed_offer) => {
    setIsProcessing(true)
    try {
      await updateProductQuantity(item.id, quantity, status_swap, completed_offer)
      setShowQuantityDialog(false)
      router.refresh()
      toast({
        title: t("success") || "Success",
        description: t("quantityUpdated") || "Quantity updated successfully",
      })
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: t("updateError") || "Failed to update. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const offerCheck = await checkItemInOfferItems(item.id)
      
      if (offerCheck.exists) {
        const itemUpdatedCheck = await checkItemUpdate(item.id)
        
        if (itemUpdatedCheck.data.updated) {
          toast({
            title: t("itemDeleted") || "Item Deleted",
            description: t("itemDeletedDesc") || "Item has been removed successfully.",
          })
        } else {
          await handleUpdateQuantity(0, "unavailable", "false")
          toast({
            title: t("itemDeleted") || "Item Deleted",
            description: t("itemDeletedDesc") || "Item has been removed successfully.",
          })
        }
        router.refresh()
      } else {
        await deleteProduct(item.id)
        toast({
          title: t("itemDeleted") || "Item Deleted",
          description: t("itemDeletedDesc") || "Item has been removed successfully.",
        })
        router.refresh()
      }
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: t("deleteError") || "Failed to delete. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleUpdate = async () => {
    setIsProcessing(true)
    try {
      const offerCheck = await checkItemInOfferItems(item.id)
      
      if (offerCheck.success && offerCheck.exists) {
        const checkUpdate = await checkItemUpdate(item.id)
        
        if (checkUpdate.success && checkUpdate.data.updated) {
          router.push(`/profile/settings/editItem/${item.id}`)
        } else {
          setShowQuantityDialog(true)
        }
      } else {
        router.push(`/profile/settings/editItem/${item.id}`)
      }
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: t("updateError") || "Failed to update. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const renderMedia = () => {
    if (!item.images?.[0]?.directus_files_id) return null

    const mediaUrl = {
      id: item.images[0].directus_files_id.id,
      type: item.images[0].directus_files_id.type,
      url: `${mediaURL}${item.images[0].directus_files_id.id}`,
    }
    const mediaType = getMediaType(mediaUrl.type)

    if (mediaType === "video") {
      return (
        <div className="relative w-full h-full group">
          <video
            src={mediaUrl.url}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            onLoadedData={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="bg-white/90 rounded-full p-3 group-hover:scale-110 transition-transform">
              <Play className="h-6 w-6 text-gray-800 fill-current" />
            </div>
          </div>
        </div>
      )
    } else if (mediaType === "audio") {
      return (
        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-5xl mb-2">🎵</div>
            <div className="text-sm font-medium">Audio File</div>
          </div>
        </div>
      )
    } else {
      return (
        <Image
          src={mediaUrl.url || "/placeholder.svg"}
          alt={itemName}
          fill
          className="object-cover"
          onLoad={() => setImageLoaded(true)}
        />
      )
    }
  }

  const statusColor = item.status_item === "available" 
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" 
    : "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700"

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="group h-full"
      >
        <div className={`relative bg-background dark:bg-gray-950 rounded-2xl overflow-hidden border border-border/50 hover:border-border transition-all duration-300 hover:shadow-xl h-full flex flex-col`} dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Image Section */}
          <div className="relative h-48 w-full overflow-hidden bg-muted">
            <motion.div
              variants={imageVariants}
              whileHover="hover"
              className="w-full h-full"
            >
              {renderMedia()}
            </motion.div>
            
            {/* Status Badge Overlay */}
            <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'}`}>
              <Badge className={`${statusColor} backdrop-blur-sm text-xs font-medium px-2.5 py-1`}>
                {t(item.status_item)}
              </Badge>
            </div>

            {/* Quantity Badge */}
            {item.quantity === 0 && (
              <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'}`}>
                <Badge variant="destructive" className="backdrop-blur-sm text-xs font-medium px-2.5 py-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {t("outOfStock") || "Out of Stock"}
                </Badge>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4 flex flex-col flex-1">
            <div className="flex-1 space-y-3">
            {/* Title & Swap Status Badge */}
            <div className={`flex justify-between gap-2 `} >
              <h3 className={`font-bold text-lg line-clamp-1`}>
                {itemName}
              </h3>
              <Badge variant="secondary" className="text-xs shrink-0">
                {t(item.status_swap)}
              </Badge>
            </div>

            {/* Description */}
            <p className={`text-sm text-muted-foreground `} >
              {itemDescription}
            </p>

            {/* Value & Quantity Row */}
            <div className={`flex items-center gap-3 sm:gap-6 lg:gap-8 pt-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="p-1.5 rounded-lg bg-green-500/10">
                  <Banknote className="h-4 w-4 text-green-600" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-xs text-muted-foreground">{t("price") || "Price"}</p>
                  <p className="text-sm font-bold text-green-600">{item.price} {t("currencyLE") || "LE"}</p>
                </div>
              </div>

              <div className="hidden sm:block h-8 w-[1px] bg-border/50" />

              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-xs text-muted-foreground">{t("quantity") || "Qty"}</p>
                  <p className="text-sm font-bold">{item.quantity}</p>
                </div>
              </div>
            </div>

            {/* Date & Category Row */}
            <div className={`flex items-center justify-between gap-2 pb-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar className="h-3 w-3" />
                <span>{new Date(item.date_created).toLocaleDateString()}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {t(item.category)}
              </Badge>
            </div>
            </div>

            {/* Actions */}
            <div className={`flex items-center gap-2 pt-3 mt-auto border-t border-border/50 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 min-w-[80px]"
                asChild
              >
                <Link href={item.quantity > 0 ? `/products/out_offer/${item.id}` : `/products/in_offer/${item.id}`} className={`flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Eye className="h-4 w-4" />
                  {t("view") || "View"}
                </Link>
              </Button>

              {item.quantity > 0 && item.status_swap === "available" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 min-w-[80px]"
                  onClick={handleUpdate}
                  disabled={isProcessing}
                >
                  <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t("edit") || "Edit"}
                </Button>
              )}

              {item.quantity > 0 && item.status_swap === "available" && item.completed_offer === "false" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? "start" : "end"}>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t("soldOut") || "Mark as Sold"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteOneItem") || "Mark Item as Sold"}</DialogTitle>
            <DialogDescription>
              {t("deleteDialogDesc") || "Are you sure you want to mark this item as sold? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  {t("deleting") || "Processing..."}
                </>
              ) : (
                t("confirm") || "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quantity Dialog */}
      <Dialog open={showQuantityDialog} onOpenChange={setShowQuantityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addQuantity") || "Add Quantity"}</DialogTitle>
            <DialogDescription>
              {t("addQuantityDesc") || "This item is in an offer. Add new quantity to make it available again."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t("quantity") || "Quantity"}</label>
              <input
                type="number"
                min="1"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuantityDialog(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button onClick={() => handleUpdateQuantity(newQuantity, "available", "false")} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  {t("adding") || "Adding..."}
                </>
              ) : (
                t("addQuantity") || "Add Quantity"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
