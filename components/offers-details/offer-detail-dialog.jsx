"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Star,
  Package,
  ArrowRight,
  DollarSign,
  User,
  Calendar,
  X,
} from "lucide-react"
import { getOfferItemsByOfferId, getReviewsByOfferId } from "@/callAPI/swap"
import { getProductById } from "@/callAPI/products"
import { getUserById } from "@/callAPI/users"
import { mediaURL } from "@/callAPI/utiles"
import Image from "next/image"

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
}

export function OfferDetailDialog({ 
  offer, 
  isOpen, 
  onClose, 
  currentUserId, 
  t, 
  isRTL 
}) {
  const [details, setDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      if (!offer?.id || !isOpen) return
      
      setIsLoading(true)
      try {
        const itemsRes = await getOfferItemsByOfferId(offer.id)
        let myItems = []
        let theirItems = []

        if (itemsRes.success) {
          const itemPromises = itemsRes.data.map(async (item) => {
            const productRes = await getProductById(item.item_id)
            if (productRes.success) {
              return { ...item, product: productRes.data }
            }
            return null
          })
          const populatedItems = (await Promise.all(itemPromises)).filter(Boolean)

          const getUserIdFromOffer = (userField) => {
            if (!userField) return null
            if (typeof userField === 'object' && userField !== null) {
              return userField.id || null
            }
            return String(userField)
          }
          
          const offerFromUserId = getUserIdFromOffer(offer.from_user_id)
          const offerToUserId = getUserIdFromOffer(offer.to_user_id)
          const currentUserIdStr = String(currentUserId)
          
          const fromUserIdStr = offerFromUserId ? String(offerFromUserId) : null
          const toUserIdStr = offerToUserId ? String(offerToUserId) : null
          
          if (fromUserIdStr && toUserIdStr) {
            let myUserIdForItems = null
            if (fromUserIdStr === currentUserIdStr) {
              myUserIdForItems = fromUserIdStr
            } else if (toUserIdStr === currentUserIdStr) {
              myUserIdForItems = toUserIdStr
            }
            
            if (myUserIdForItems) {
              myItems = populatedItems.filter(item => {
                const offeredBy = String(item.offered_by || '')
                return offeredBy === myUserIdForItems
              })
              
              theirItems = populatedItems.filter(item => {
                const offeredBy = String(item.offered_by || '')
                return offeredBy !== myUserIdForItems
              })
            } else {
              myItems = populatedItems.filter(item => {
                const offeredBy = String(item.offered_by || '')
                return offeredBy === fromUserIdStr
              })
              
              theirItems = populatedItems.filter(item => {
                const offeredBy = String(item.offered_by || '')
                return offeredBy === toUserIdStr
              })
            }
          } else {
            theirItems = populatedItems
            myItems = []
          }
        }

        const reviewsRes = await getReviewsByOfferId(offer.id)
        let reviews = []
        if (reviewsRes.success) {
          const reviewPromises = reviewsRes.data.map(async (review) => {
            const userRes = await getUserById(review.from_user_id)
            if (userRes.success) {
              return { ...review, user: userRes.data }
            }
            return review
          })
          reviews = await Promise.all(reviewPromises)
        }

        setDetails({ myItems, theirItems, reviews })
      } catch (error) {
        console.error("Error fetching offer details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [offer?.id, currentUserId, isOpen])

  if (!offer) return null

  const getStatusConfig = (status) => {
    const configs = {
      completed: { 
        label: t("completed") || "Completed", 
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", 
        icon: CheckCircle2 
      },
      pending: { 
        label: t("pending") || "Pending", 
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", 
        icon: Clock 
      },
      accepted: { 
        label: t("accepted") || "Accepted", 
        className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", 
        icon: CheckCircle2 
      },
      rejected: { 
        label: t("rejected") || "Rejected", 
        className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", 
        icon: XCircle 
      },
    }
    return configs[status] || configs.pending
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString(isRTL ? "ar" : "en", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateTotalValue = (items = []) => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.product?.price || 0)
      const quantity = parseInt(item.quantity || 1)
      return sum + (price * quantity)
    }, 0)
  }

  const statusConfig = getStatusConfig(offer.status_offer)
  const StatusIcon = statusConfig.icon

  const renderProductCard = (item) => (
    <motion.div 
      key={item.id} 
      variants={fadeIn}
      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
    >
      <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-background shadow-sm">
        <Image
          src={item.product?.images?.[0]?.directus_files_id?.filename_disk 
            ? `${mediaURL}${item.product.images[0].directus_files_id.filename_disk}` 
            : "/placeholder.svg"}
          alt={item.product?.name || "Product image"}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.product?.name || "Unknown Product"}</p>
        <p className="text-sm text-muted-foreground">
          {t("quantity") || "Qty"}: {item.quantity || 1}
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-primary">
          {(parseFloat(item.product?.price || 0) * (item.quantity || 1)).toFixed(2)} {t("le") || "LE"}
        </p>
        <p className="text-xs text-muted-foreground">
          {parseFloat(item.product?.price || 0).toFixed(2)} {t("le") || "LE"} / {t("each") || "each"}
        </p>
      </div>
    </motion.div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                <AvatarImage 
                  src={offer.otherUser?.avatar ? `${mediaURL}${offer.otherUser.avatar}` : "/placeholder-user.jpg"} 
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {(offer.otherUser?.first_name?.[0] || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-lg">
                  {t("offerWith") || "Offer with"} {offer.otherUser 
                    ? `${offer.otherUser.first_name || ""} ${offer.otherUser.last_name || ""}`.trim() || offer.otherUser.email 
                    : "Unknown"}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`${statusConfig.className} gap-1`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(offer.date_updated || offer.date_created)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">{t("loadingDetails") || "Loading details..."}</p>
              </div>
            ) : !details ? (
              <div className="flex flex-col items-center justify-center py-12 text-destructive">
                <XCircle className="h-10 w-10 mb-2" />
                <p>{t("errorLoadingDetails") || "Could not load offer details."}</p>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { 
                      opacity: 1,
                      transition: { staggerChildren: 0.1 }
                    }
                  }}
                  className="space-y-6"
                >
                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <motion.div variants={fadeIn}>
                      <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary">
                            {calculateTotalValue(details.myItems).toFixed(2)}
                          </div>
                          <p className="text-sm text-muted-foreground">{t("myOfferValue") || "My Offer"} ({t("le") || "LE"})</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                    <motion.div variants={fadeIn}>
                      <Card className="border-muted">
                        <CardContent className="p-4 text-center">
                          <div className={`text-2xl font-bold ${
                            (offer.cash_adjustment || 0) === 0 
                              ? 'text-muted-foreground'
                              : (offer.cash_adjustment || 0) > 0 
                                ? 'text-emerald-600' 
                                : 'text-red-600'
                          }`}>
                            {parseFloat(offer.cash_adjustment || 0) === 0 
                              ? "-"
                              : `${parseFloat(offer.cash_adjustment || 0) > 0 ? "+" : ""}${parseFloat(offer.cash_adjustment || 0).toFixed(2)}`
                            }
                          </div>
                          <p className="text-sm text-muted-foreground">{t("cashAdjustment") || "Cash Adj."} ({t("le") || "LE"})</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                    <motion.div variants={fadeIn}>
                      <Card className="border-secondary/20 bg-secondary/5">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-secondary-foreground">
                            {calculateTotalValue(details.theirItems).toFixed(2)}
                          </div>
                          <p className="text-sm text-muted-foreground">{t("theirOfferValue") || "Their Offer"} ({t("le") || "LE"})</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Items Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* My Items */}
                    <motion.div variants={fadeIn}>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            {t("myOffer") || "My Offer"} 
                            <Badge variant="secondary" className="ml-auto">
                              {details.myItems.length} {t("items") || "items"}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {details.myItems.length > 0 ? (
                            details.myItems.map(renderProductCard)
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              {t("noItems") || "No items in this offer."}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Their Items */}
                    <motion.div variants={fadeIn}>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Package className="h-4 w-4 text-secondary-foreground" />
                            {t("theirOffer") || "Their Offer"}
                            <Badge variant="secondary" className="ml-auto">
                              {details.theirItems.length} {t("items") || "items"}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {details.theirItems.length > 0 ? (
                            details.theirItems.map(renderProductCard)
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              {t("noItems") || "No items in this offer."}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Reviews Section */}
                  {details.reviews.length > 0 && (
                    <motion.div variants={fadeIn}>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {t("reviewsForThisOffer") || "Reviews"}
                            <Badge variant="secondary" className="ml-auto">
                              {details.reviews.length}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {details.reviews.map(review => (
                            <div key={review.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={review.user?.avatar ? `${mediaURL}${review.user.avatar}` : "/placeholder-user.jpg"} />
                                <AvatarFallback>{review.user?.first_name?.[0] || 'U'}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium">{review.user?.first_name} {review.user?.last_name}</p>
                                  <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                                <p className="text-xs text-muted-foreground mt-2">{formatDate(review.date_created)}</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onClose(false)}>
              {t("close") || "Close"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
