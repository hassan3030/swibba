"use client"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  getOfferItemsByOfferId,
  deleteOfferById,
  deleteOfferItemsById,
  getOffersNotifications,
  getAllMessage,
  addMessage,
  acceptedOfferById,
  deleteFinallyOfferById,
} from "@/callAPI/swap"
import { getUserById } from "@/callAPI/users"
import { getCookie, decodedToken } from "@/callAPI/utiles"
import { getProductById } from "@/callAPI/products"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { BiCartDownload } from "react-icons/bi";

import {
  Calendar,
  Trash2,
  Eye,
  ShieldCheck,
  MessageCircle,
  Send,
  MapPin,
  ArrowRightLeft,
  Handshake,
  Scale,
  BadgeX,
  CheckCheck,
  Loader,
  CircleDot,
  Verified,
} from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "@/lib/use-translations"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import SwapRating from "@/components/reviews"
import Image from "next/image"
import { getMediaType } from "@/lib/utils"
import { useLanguage } from "@/lib/language-provider"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
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
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

const statsVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
}

const messageVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
}

const RecivedItems = () => {
  const [offers, setOffers] = useState([])
  const [swapItems, setSwapItems] = useState([])
  const [userSwaps, setUserSwaps] = useState([])
  const [itemsOffer, setItemsOffer] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [pendingDelete, setPendingDelete] = useState({
    idItem: null,
    idOffer: null,
    owner: null,
    itemIdItslfe: null,
    cashAdjustment: null,
  })
  const [chatMessages, setChatMessages] = useState([])
  const [message, setMessage] = useState("")
  const [myUserId, setMyUserId] = useState()
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const { t } = useTranslations()

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "completed":
        return "bg-blue-500"
      case "rejected":
        return "bg-destructive"
      default:
        return "bg-gray-500"
    }
  }

  const handlePriceDifference = (userId, cash) => {
    let text = ""
    let colorClass = "text-gray-500"

    if (userId === myUserId) {
      if (cash < 0) {
        text = `${t("Youpay") || "You pay"}: ${Math.abs(Math.ceil(cash))} ${t("LE") || "LE"}`
        colorClass = "text-destructive"
      } else if (cash > 0) {
        text = `${t("Youget") || "You get"}: ${Math.abs(Math.ceil(cash))} ${t("LE") || "LE"}`
        colorClass = "text-green-500"
      } else {
        text = `${t("Thepriceisequal") || "The price is equal"}`
      }
    } else {
      if (cash > 0) {
        text = `${t("Youpay") || "You pay"}: ${Math.abs(Math.ceil(cash))} ${t("LE") || "LE"}`
        colorClass = "text-destructive"
      } else if (cash < 0) {
        text = `${t("Youget") || "You get"}: ${Math.abs(Math.ceil(cash))} ${t("LE") || "LE"}`
        colorClass = "text-green-500"
      } else {
        text = `${t("Thepriceisequal") || "The price is equal"}`
      }
    }
    return { text, colorClass }
  }

  const fetchUserId = async () => {
    const { id } = await decodedToken()
    setMyUserId(id)
  }

  // Fetch notifications where I am the to_user_id
  const getNotifications = useCallback(async () => {
    setIsLoading(true)
    const token = await getCookie()
    if (!token) {
      setIsLoading(false)
      return
    }

    const offerItems = []
    const items = []
    const usersSwaper = []
    const { id } = await decodedToken()

    const offers = await getOffersNotifications(id)

    for (const offer of offers.data) {
      const offerItem = await getOfferItemsByOfferId(offer.id)
      const user_from = await getUserById(offer.from_user_id)
      const user_to = await getUserById(offer.to_user_id)
      usersSwaper.push(user_from.data, user_to.data)
      if (offerItem?.success && Array.isArray(offerItem.data)) {
        offerItems.push(...offerItem.data)
      }
    }

    for (const item of offerItems) {
      const product = await getProductById(item.item_id)
      items.push({
        ...product.data,
        offer_item_id: item.id,
        offered_by: item.offered_by,
        offer_id: item.offer_id,
        user_id: product.data.user_id,
      })
    }

    const uniqueUsers = Array.from(new Map(usersSwaper.map((user) => [user.id, user])).values())

    setOffers(offers.data)
    setUserSwaps(uniqueUsers)
    setSwapItems(items)
    setItemsOffer(offerItems)
    setIsLoading(false)
  }, [])

  // Chat
  const handleGetMessages = useCallback(async () => {
    const messages = await getAllMessage()
    setChatMessages(messages.data)
  }, [])

  const handleSendMessage = async (to_user_id, offer_id) => {
    if (!message.trim()) return
    await addMessage(message.trim(), to_user_id, offer_id)
    setMessage("")
    handleGetMessages()
  }

  const handleDeleteItem = async (offerItemId, itemId) => {
    const item = swapItems.find((itm) => itm.id === itemId)
    if (!item) return

    const theirItems = swapItems.filter((itm) => itm.offer_id === item.offer_id && itm.offered_by === item.offered_by)

    // Calculate new cash adjustment after removing this item
    const offer = offers.find((o) => o.id === item.offer_id)
    let newCashAdjustment = 0
    
    if (offer) {
      const offerItems = swapItems.filter((itm) => itm.offer_id === item.offer_id && itm.id !== itemId) // Exclude current item
      const myItemsAfterDelete = offerItems.filter((itm) => itm.offered_by === offer.from_user_id)
      const theirItemsAfterDelete = offerItems.filter((itm) => itm.offered_by !== offer.from_user_id)
      
      const myTotal = myItemsAfterDelete.reduce((sum, itm) => sum + (Number.parseFloat(itm.price) || 0), 0)
      const theirTotal = theirItemsAfterDelete.reduce((sum, itm) => sum + (Number.parseFloat(itm.price) || 0), 0)
      newCashAdjustment = myTotal - theirTotal
    }
 
    if (theirItems.length > 1) {
      try {
        await deleteOfferItemsById(offerItemId, itemId, newCashAdjustment, item.offer_id)
        toast({
          title: t("successfully") || "Successfully",
          description: t("Itemdeletedfromswapsuccessfully") || "Item deleted from swap successfully",
        })
        getNotifications()
      } catch (err) {
        toast({
          title: t("error") || "Error",
          description: t("Failedtodeleteitem") || "Failed to delete item",
          variant: "destructive",
        })
      }
    } else {
      setPendingDelete({
        idItem: offerItemId,
        idOffer: item.offer_id,
        owner: item.offered_by,
        itemIdItslfe: itemId,
        cashAdjustment: newCashAdjustment,
      })
      setShowDeleteDialog(true)
    }
  }

  const handleDeleteSwap = async (swapId) => {
    try {
      await deleteOfferById(swapId)
      toast({
        title: t("successfully") || "Successfully",
        description: t("Swapdeletedsuccessfully") || "Swap deleted successfully",
      })
      setShowDeleteDialog(false)
      getNotifications()
      router.refresh()
    } catch (err) {
      toast({
        title: t("error") || "Error",
        description: t("Failedtodeleteswap") || "Failed to delete swap",
        variant: "destructive",
      })
    }
  }



  // accepted swap
  const getAcceptSwap = async (offerId) => {
    const acceptSwap = await acceptedOfferById(offerId)
    if (!acceptSwap) {
      toast({
        title: t("error") || "Error",
        description: t("Failedtoacceptswap") || "Failed to accept swap",
        variant: "destructive",
      })
    } else {
      toast({
        title: t("successfully") || "Successfully",
        description: t("Swap accepted successfully") || "Swap accepted successfully",
      })
      router.refresh()
    }
  }

  useEffect(() => {
    fetchUserId()
    getNotifications()
    handleGetMessages()
  }, [getNotifications, handleGetMessages])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-muted-foreground">Loading notifications...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Delete Swap Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <DialogHeader>
              <DialogTitle>{t("DeleteEntireSwapConfirmation") || "Delete Entire Swap?"}</DialogTitle>
              <DialogDescription>
                {t("Thisisthelastiteminyouroffer_deletingitwilldeletetheentireswap") || "This is the last item in your offer. Deleting it will delete the entire swap. Are you sure?"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              <DialogClose asChild>
                <Button
                  variant="destructive"
                  className="mx-2"
                  onClick={async () => {
                    await handleDeleteSwap(pendingDelete.idOffer)
                  }}
                >
                  {t("DeleteEntireSwap") || "Delete Entire Swap"}
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button className="mx-2" variant="secondary" onClick={() => setShowDeleteDialog(false)}>
                  {t("Cancel") || "Cancel"}
                </Button>
              </DialogClose>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Swap Summary Stats */}
        <motion.div
          className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              count: offers.length,
              icon: BiCartDownload,
              label: t("AllNotifications") || "All Notifications",
              color: "text-blue-500",
            },
            {
              count: offers.filter((o) => o.status_offer === "pending").length,
              icon: Loader,
              label: t("pending") || "Pending",
              color: "text-yellow-500",
            },
            {
              count: offers.filter((o) => o.status_offer === "accepted").length,
              icon: Handshake,
              label: t("accepted") || "Accepted",
              color: "text-green-500",
            },
            {
              count: offers.filter((o) => o.status_offer === "completed").length,
              icon: CheckCheck,
              label: t("completed") || "Completed",
              color: "text-blue-500",
            },
            {
              count: offers.filter((o) => o.status_offer === "rejected").length,
              icon: BadgeX,
              label: t("rejected") || "Rejected",
              color: "text-destructive",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={statsVariants}
              className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow"
              whileHover={{ y: -2 }}
            >
              <span className="text-lg font-bold">{stat.count === 0 ? t("no") || "No" : stat.count}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Notifications List */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <AnimatePresence mode="popLayout">
            {[...offers]
              .sort((a, b) => new Date(b.date_created) - new Date(a.date_created))
              .map((offer, index) => (
                <motion.div
                  key={offer.id}
                  variants={cardVariants}
                  layout
                  layoutId={`notification-${offer.id}`}
                  className="my-2"
                > 
                  <Card
                    id={offer.id}
                    className="overflow-hidden border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300"
                  >
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 pb-4">
                      {/* Top Section: User Info & Status Badge */}
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <motion.div
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400 }} className="relative">
                            <Avatar className="h-14 w-14 border-2 border-primary shadow-md">
                              <AvatarImage
                                src={
                                  `https://deel-deal-directus.csiwm3.easypanel.host/assets/${
                                    userSwaps.find((u) => u.id === offer.from_user_id)?.avatar || "/placeholder.svg"
                                  }` || "/placeholder.svg"
                                }
                                alt={
                                  userSwaps.find((u) => u.id === offer.from_user_id)?.first_name || t("User") || "User"
                                }
                              />
                              <AvatarFallback>
                                {userSwaps.find((u) => u.id === offer.from_user_id)?.first_name?.[0] ||
                                  t("User") ||
                                  "U"}
                              </AvatarFallback>
                            </Avatar>
                            {(userSwaps.find((u) => u.id === offer.from_user_id)?.verified === "true" || userSwaps.find((u) => u.id === offer.from_user_id)?.verified === true) && (
                              <div className="absolute -bottom-1 -right-1">
                                <Verified className="h-5 w-5 text-primary bg-background rounded-full p-0.5 border-2 border-background shadow-sm" />
                              </div>
                            )}
                          </motion.div>

                          <div className="flex-1">
                            <div className="font-bold text-lg">
                              {`${(String(userSwaps.find((u) => u.id === offer.from_user_id)?.first_name).length <= 11 ? (String(userSwaps.find((u) => u.id === offer.from_user_id)?.first_name)) : (String(userSwaps.find((u) => u.id === offer.from_user_id)?.first_name).slice(0, 10)) )|| t("account")} 
                             `}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="line-clamp-1">
                                {`${userSwaps.find((u) => u.id === offer.from_user_id)?.country||''} ${
                                  userSwaps.find((u) => u.id === offer.from_user_id)?.city||''
                                } ${userSwaps.find((u) => u.id === offer.from_user_id)?.street||''}`}
                                {`${userSwaps.find((u) => u.id === offer.from_user_id)?.country &&
                                  userSwaps.find((u) => u.id === offer.from_user_id)?.city &&
                                  userSwaps.find((u) => u.id === offer.from_user_id)?.street? "": `${t("noAddress") || "No address"}`
                                }`}
                              </span>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                        >
                          <Badge 
                            className={`${getStatusColor(offer.status_offer)} text-white px-4 py-2 text-sm font-semibold capitalize shadow-md`}
                          >
                            {t(offer.status_offer)}
                          </Badge>
                        </motion.div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <motion.div
                          className="bg-background/60 backdrop-blur-sm rounded-lg p-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.1 }}
                        >
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Calendar className="w-3 h-3" />
                            <span>{t("Date") || "Date"}</span>
                          </div>
                          <div className="text-sm font-medium">
                            {offer.date_created ? new Date(offer.date_created).toLocaleDateString() : ""}
                          </div>
                        </motion.div>

                        {offer.status_offer !== 'completed' && (
                          <motion.div
                            className="bg-background/60 backdrop-blur-sm rounded-lg p-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                          >
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>{t("Items") || "Items"}</span>
                            </div>
                            <div className="text-sm font-medium">
                              {itemsOffer.filter((u) => u.offered_by === offer.to_user_id && u.offer_id === offer.id).length} ↔️ {itemsOffer.filter((u) => u.offered_by !== offer.to_user_id && u.offer_id === offer.id).length}
                            </div>
                          </motion.div>
                        )}

                        {offer.cash_adjustment && (
                          <motion.div
                            className="bg-background/60 backdrop-blur-sm rounded-lg p-3 col-span-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                          >
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Scale className="w-3 h-3" />
                              <span>{t("CashAdjustment") || "Cash Adjustment"}</span>
                            </div>
                            <div className={`text-sm font-bold ${handlePriceDifference(offer.from_user_id, offer.cash_adjustment).colorClass}`}>
                              {handlePriceDifference(offer.from_user_id, offer.cash_adjustment).text}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      {["pending", "accepted"].includes(offer.status_offer) ? (
                        <>
                          <motion.div
                            className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            {/* My Items */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary">{swapItems.filter((u) => u.offered_by === offer.to_user_id && u.offer_id === offer.id).length}</span>
                                </div>
                                <h4 className="font-bold text-lg text-start">{t("Myitems") || "My items"}</h4>
                              </div>
                              <div className="space-y-3">
                                {swapItems
                                  .filter((u) => u.offered_by === offer.to_user_id && u.offer_id === offer.id)
                                  .map((item, itemIndex) => (
                                    <motion.div
                                      key={item.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: itemIndex * 0.1 }}
                                    >
                                      <CardItemRecivedItem
                                        {...item}
                                        deleteItem={() => handleDeleteItem(item.offer_item_id, item.id)}
                                      />
                                    </motion.div>
                                  ))}
                              </div>
                            </div>

                            {/* Swap Arrow */}
                            <div className="hidden lg:flex flex-col items-center justify-center py-8">
                              <motion.div
                                className="flex flex-col items-center gap-3"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                              >
                                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                                  <ArrowRightLeft className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">{t("Exchange") || "Exchange"}</span>
                              </motion.div>
                            </div>

                            {/* Mobile Divider */}
                            <div className="lg:hidden flex items-center gap-3 my-4">
                              <Separator className="flex-1" />
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                                <ArrowRightLeft className="h-5 w-5 text-white" />
                              </div>
                              <Separator className="flex-1" />
                            </div>

                            {/* Their Items */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                                  <span className="text-sm font-bold text-accent">{swapItems.filter((u) => u.offered_by !== offer.to_user_id && u.offer_id === offer.id).length}</span>
                                </div>
                                <h4 className="font-bold text-lg text-start">{t("Theiritems") || "Their Items"}</h4>
                              </div>
                              <div className="space-y-3">
                                {swapItems
                                  .filter((u) => u.offered_by !== offer.to_user_id && u.offer_id === offer.id)
                                  .map((item, itemIndex) => (
                                    <motion.div
                                      key={item.id}
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: itemIndex * 0.1 }}
                                    >
                                      <CardItemRecivedItem
                                        {...item}
                                        deleteItem={() => handleDeleteItem(item.offer_item_id, item.id)}
                                      />
                                    </motion.div>
                                  ))}
                              </div>
                            </div>
                          </motion.div>

                          {/* Chat Section */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <Card className="mb-6 mt-2 hover:shadow-md transition-shadow">
                              <CardHeader>
                                <motion.div
                                  className="flex items-center"
                                  whileHover={{ x: 5 }}
                                  transition={{ type: "spring", stiffness: 400 }}
                                >
                                  <MessageCircle className="h-5 w-5 mr-2" />
                                  {t("ChatwithSwapPartner") || "Chat with Swap Partner"}
                                </motion.div>
                              </CardHeader>
                              <CardContent>
                                <ScrollArea className="h-40 w-full border rounded-md p-4 mb-4">
                                  <motion.div
                                    className="space-y-3"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                  >
                                    <AnimatePresence>
                                      {chatMessages
                                        .filter((m) => m.offer_id === offer.id)
                                        .map((msg, msgIndex) => (
                                          <motion.div
                                            key={msg.id}
                                            variants={messageVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className={`flex ${
                                              msg.from_user_id === myUserId ? "justify-end" : "justify-start"
                                            }`}
                                          >
                                            <motion.div
                                              className={`max-w-xs rounded-lg p-3 ${
                                                msg.from_user_id === myUserId
                                                  ? "bg-primary text-primary-foreground ml-auto"
                                                  : "bg-muted"
                                              }`}
                                              whileHover={{ scale: 1.02 }}
                                              transition={{ type: "spring", stiffness: 400 }}
                                            >
                                              <div className="text-sm">{msg.message}</div>
                                              <div className="text-xs opacity-70 mt-1">
                                                {new Date(msg.date_created).toLocaleString()}
                                              </div>
                                            </motion.div>
                                          </motion.div>
                                        ))}
                                    </AnimatePresence>
                                  </motion.div>
                                </ScrollArea>
                                <div className="flex space-x-2">
                                  <Input
                                    placeholder="Type your message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) =>
                                      e.key === "Enter" && handleSendMessage(offer.from_user_id, offer.id)
                                    }
                                    className="flex-1"
                                  />
                                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                                    <Button onClick={() => handleSendMessage(offer.from_user_id, offer.id)} 
                                    size="icon"
                                    disabled={!message.trim()}
                                    className="mr-1"
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  </motion.div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </>
                      ) : offer.status_offer === "completed" ? (
                        <motion.div
                          className="text-center text-green-600"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                          >
                            <ShieldCheck className="h-8 w-8 mx-auto mb-2" />
                          </motion.div>
                          <h3 className="text-xl font-semibold mb-2">
                            {t("SwapCompletedSuccessfully") || "Swap Completed Successfully!"}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {t("Thankyouforcompletingtheswap") || "Thank you for completing the swap!"}
                          </p>
                          <p className="text-muted-foreground mb-4">
                            {t("Contactphone") || "Contact phone"}: {(() => {
                              const userToContact =
                                userSwaps.find(
                                  (u) =>
                                    u.id === (myUserId === offer.from_user_id ? offer.from_user_id : offer.to_user_id),
                                ) || {}
                              return userToContact.phone_number || t("Nophoneavailable") || "No phone available"
                            })()}
                          </p>
                          {(() => {
                            const userToRate =
                              userSwaps.find(
                                (u) =>
                                  u.id === (myUserId === offer.from_user_id ? offer.to_user_id : offer.from_user_id),
                              ) || {}

                            return (
                              <SwapRating
                                from_user_id={myUserId}
                                to_user_id={userToRate.id}
                                offer_id={offer.id}
                                userName={`${(String(userToRate.first_name).length <= 11 ? (String(userToRate.first_name)) : (String(userToRate.first_name).slice(0, 10)) )|| t("account")} 
                                ${(String(userToRate.last_name).length <= 11 ? (String(userToRate.last_name)) : (String(userToRate.last_name).slice(0, 10)) )|| ""}`.trim()
                                }
                                userAvatar={
                                  userToRate.avatar
                                    ? `https://deel-deal-directus.csiwm3.easypanel.host/assets/${userToRate.avatar}`
                                    : "/placeholder.svg"
                                }
                              />
                            )
                          })()}
                        </motion.div>
                      ) : (
                        <motion.div
                          className="text-center text-destructive" 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                          >
                            <button onClick={async () => {
                              try {
                                await deleteFinallyOfferById(offer.id)
                                toast({
                                  title: t("successfully") || "Successfully",
                                  description: t("Swapdeletedsuccessfully") || "Swap deleted successfully",
                                })
                                getNotifications()
                                router.refresh()
                              } catch (err) {
                                toast({
                                  title: t("error") || "Error",
                                  description: t("Failedtodeleteswap") || "Failed to delete swap",
                                  variant: "destructive",
                                })
                              }
                            }}>
                              <Trash2 className="h-8 w-8 mx-auto mb-2 hover:scale-110 hover:rotate-45 cursor-pointer" />
                            </button>
                          </motion.div>
                          <h3 className="text-xl font-semibold mb-2">{t("SwapRejected") || "Swap Rejected"}</h3>
                          <p className="text-muted-foreground mb-4">
                            {t("Theswapwasrejectedbyyou") || "The swap was rejected by you."}
                          </p>
                        </motion.div>
                      )}

                      <Separator className="my-4" />

                      {/* Action Buttons */}
                      {offer.status_offer === "pending" && (
                        <motion.div
                          className="flex justify-around space-x-2 mt-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                            <Button
                              size="sm"
                              onClick={() => {
                                getAcceptSwap(offer.id)
                              }}
                              className="flex items-center gap-1"
                            >
                              <Handshake className="h-4 w-4" />
                              {t("AcceptSwap") || "Accept Swap"}
                            </Button>
                          </motion.div>

                          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setPendingDelete({
                                  idItem: null,
                                  idOffer: offer.id,
                                  owner: null,
                                })
                                setShowDeleteDialog(true)
                              }}
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              {t("RejectSwap") || "Reject Swap"}
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}

                      {offer.status_offer === "accepted" && (
                        <>
                          {/* Waiting message for accepted swaps */}
                          <motion.div
                            className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <div className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              >
                                <Loader className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                              </motion.div>
                              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                                {t("YouarewaitingtocompletswapfromanotherUser") || "You are waiting to complete swap from another user"}
                              </p>
                            </div>
                          </motion.div>

                          <motion.div
                            className="flex justify-around space-x-2 mt-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                          >
                            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setPendingDelete({
                                    idItem: null,
                                    idOffer: offer.id,
                                    owner: null,
                                  })
                                  setShowDeleteDialog(true)
                                }}
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="h-4 w-4" />
                                {t("RejectSwap") || "Reject Swap"}
                              </Button>
                            </motion.div>
                          </motion.div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {offers.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-12 text-center mt-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
              >
                <BiCartDownload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">
                {t("no") || "No"} {t("notifications") || "notifications"}
              </h3>
              <p className="text-muted-foreground">
                {t("YoureallcaughtupNewnotificationswillappearhere") ||
                  "You're all caught up! New notifications will appear here."}
              </p>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button variant="outline" className="mt-4" onClick={() => router.push("/products")}>
                  {t("MakeSwap") || "Make Swap"}
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default RecivedItems

// CardItemRecivedItem component
const CardItemRecivedItem = ({ id, name, description, price, status_item, images, deleteItem, translations, quantity }) => {
  const router = useRouter()
  const { isRTL } = useLanguage()
  const { t } = useTranslations()

  const handleView = (id) => {
    router.push(`/products/${id}`)
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }} 
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card key={id} className="overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300">
        <div className="flex gap-4 p-4">
          {/* Image Section */}
          <motion.div
            className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            {(() => {
              const mediaUrl = {
                id: images[0]?.directus_files_id.id,
                type: images[0]?.directus_files_id.type,
                url: `https://deel-deal-directus.csiwm3.easypanel.host/assets/${images[0]?.directus_files_id.id}`
              }
              const mediaType = getMediaType(mediaUrl.type)
              if (mediaType === 'video') {
                return (
                  <video src={mediaUrl.url} alt={isRTL ? translations?.[1]?.name || name : translations?.[0]?.name || name} className="w-full h-full object-cover" />
                )
              } else if (mediaType === 'audio') {
                return (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
                    <span className="text-2xl">🎵</span>
                  </div>
                )
              } else {
                return (
                  <Image 
                    src={mediaUrl.url} 
                    alt={isRTL ? translations?.[1]?.name || name : translations?.[0]?.name || name} 
                    fill
                    className="object-cover"
                  />
                )
              }
            })()}
            
            {/* Badge Overlay */}
            <div className="absolute top-1 left-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 shadow-md">
                {t(status_item) || status_item}
              </Badge>
            </div>
          </motion.div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm mb-1 line-clamp-1 text-start">{isRTL ? translations?.[1]?.name || name : translations?.[0]?.name || name}</h4>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2 text-start">{!isRTL ? translations?.[0]?.description || description : translations?.[1]?.description || description}</p>
            </div>
            
            <div className="space-y-2">
              {/* Price & Quantity */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-primary text-sm">{price} {t("LE") || "LE"}</span>
                <span className="text-xs text-muted-foreground">
                  {t("quantity") || "Qty"}: <span className="font-semibold">{quantity || 1}</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-7 text-xs gap-1.5" 
                    onClick={() => handleView(id)}
                  >
                    <Eye className="h-3 w-3" />
                    {t("view") || "View"}
                  </Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full h-7 text-xs gap-1.5" 
                    onClick={deleteItem}
                  >
                    <Trash2 className="h-3 w-3" />
                    {t("Remove") || "Remove"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
