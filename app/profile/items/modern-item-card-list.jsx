"use client"
import { useState } from "react"
import { motion } from "framer-motion"
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

export default function ModernItemCardList({ item }) {
  const { toast } = useToast()
  const { t } = useTranslations()
  const { isRTL } = useLanguage()
  const router = useRouter()

  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showQuantityDialog, setShowQuantityDialog] = useState(false)
  const [newQuantity, setNewQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

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
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="bg-white/90 rounded-full p-2 group-hover:scale-110 transition-transform">
              <Play className="h-4 w-4 text-gray-800 fill-current" />
            </div>
          </div>
        </div>
      )
    } else if (mediaType === "audio") {
      return (
        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-3xl mb-1">🎵</div>
            <div className="text-xs font-medium">Audio</div>
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group"
      >
        <div className="relative bg-background dark:bg-gray-950 rounded-xl overflow-hidden border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} flex-col sm:flex-row min-h-[180px] gap-3 p-3`}>
            {/* Image Section - 30% width */}
            <div className="relative w-full sm:w-[30%] h-[200px] sm:h-[156px] flex-shrink-0 overflow-hidden rounded-lg bg-muted border border-border/30">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                {renderMedia()}
              </motion.div>
              
              {/* Status Badge on Image */}
              <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'}`}>
                <Badge className={`${statusColor} backdrop-blur-sm text-xs font-medium px-2 py-0.5`}>
                  {t(item.status_item)}
                </Badge>
              </div>

              {/* Quantity Badge */}
              {item.quantity === 0 && (
                <div className={`absolute bottom-2 ${isRTL ? 'right-2' : 'left-2'}`}>
                  <Badge variant="destructive" className="backdrop-blur-sm text-xs font-medium px-2 py-0.5">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {t("outOfStock") || "Out"}
                  </Badge>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className={`flex-1 min-w-0 flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
              {/* Title & Status */}
              <div className="w-full flex-1">
                <div className={`flex items-start justify-between gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className={`font-bold text-base line-clamp-1 flex-1 ${isRTL ? 'text-right force-rtl' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                    {itemName}
                  </h3>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {t(item.status_swap)}
                  </Badge>
                </div>

                {/* Description */}
                <p className={`text-sm text-muted-foreground line-clamp-2 mb-2 ${isRTL ? 'text-right force-rtl' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                  {itemDescription}
                </p>
              </div>

              <div className="w-full mt-auto">
                {/* Value & Quantity Row */}
                <div className={`flex items-center gap-2 sm:gap-4 mb-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Banknote className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-bold text-green-600">
                      {t("price") || "Price"} {item.price} {t("currencyLE") || "LE"}
                    </span>
                  </div>
                  
                  <div className="hidden sm:block h-4 w-[1px] bg-border/50" />

                  <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.quantity}</span>
                  </div>

                  <div className={`flex items-center gap-1.5 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(item.date_created).toLocaleDateString()}</span>
                  </div>

                  <Badge variant="outline" className="text-xs">
                    {t(item.category)}
                  </Badge>
                </div>

                {/* Actions */}
                <div className={`flex items-center gap-2 pt-2 mt-2 border-t border-border/50 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={item.quantity > 0 ? `/products/out_offer/${item.id}` : `/products/in_offer/${item.id}`} className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Eye className="h-3.5 w-3.5" />
                      {t("view") || "View"}
                    </Link>
                  </Button>

                  {item.quantity > 0 && item.status_swap === "available" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUpdate}
                      disabled={isProcessing}
                    >
                      <Edit className={`h-3.5 w-3.5 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                      {t("edit") || "Edit"}
                    </Button>
                  )}

                  {item.quantity > 0 && item.status_swap === "available" && item.completed_offer === "false" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className={`h-3.5 w-3.5 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                      {t("soldOut") || "Sold"}
                    </Button>
                  )}
                </div>
              </div>
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
