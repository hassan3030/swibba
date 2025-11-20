"use client"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  getOfferItemsByOfferId,
  rejectOfferById,
  deleteOfferItemsById,
  getOffeReceived,
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
  Camera,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "@/lib/use-translations"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import SwapRating from "@/components/reviews/reviews"
import Image from "next/image"
import { getMediaType } from "@/lib/utils"
import { useLanguage } from "@/lib/language-provider"
import { mediaURL } from "@/callAPI/utiles";
import CardItemRecived from "@/components/send-received-item/card-item-recived"

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
  const [hiddenHints, setHiddenHints] = useState(new Set()) // Track hidden hints by offer ID

  const router = useRouter()
  const { t } = useTranslations()

  // Handler to permanently delete a swap (used by top-left icon)
  const handleDeleteFinally = async (offerId) => {
    //  if (!confirm(t("Areyousureyouwanttodeletethisswap") || "Are you sure you want to delete this swap permanently?")) return
     try {
    // alert(offerId)
       const deletedOffer = await deleteFinallyOfferById(offerId, "to")
       console.log("deleteFinallyOfferById", deletedOffer)
       console.log("deletedOffer.success:", deletedOffer.success)
       if(deletedOffer.success){
       console.log("Calling router.refresh()")
       toast({
         title: t("successfully") || "Successfully",
         description: t("Swapdeletedsuccessfully") || "Swap deleted successfully",
       })
        //  await getNotifications()
         router.refresh()
       }
       else {
         console.log("deletedOffer.success is false, not calling router.refresh()")
         toast({
           title: t("error") || "Error",
           description: t("Failedtodeleteswap") || "Failed to delete swap",
           variant: "destructive",
         })
       }
     } catch (err) {
       toast({
         title: t("error") || "Error",
         description: t("Failedtodeleteswap") || "Failed to delete swap",
         variant: "destructive",
       })
     }
   }

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

    const offersReceived = await getOffeReceived(id)
console.log(offersReceived.data)
    for (const offer of offersReceived.data) {
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
        quantity: item.quantity, // Get quantity from Offer_Items collection
      })
    }

    const uniqueUsers = Array.from(new Map(usersSwaper.map((user) => [user.id, user])).values())

    setOffers(offersReceived.data)
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

  // helper to normalize quantity
  const _qty = (it) => Number(it?.quantity ?? it?.qty ?? it?.available_quantity ?? 1)

  const handleDeleteItem = async (offerItemId, itemId) => {
    const item = swapItems.find((itm) => itm.id === itemId)
    if (!item) return

    // Get offer
    const offer = offers.find((o) => o.id === item.offer_id)
    if (!offer) return

    // Items for this offer excluding the item to delete
    const allOfferItemsAfterDelete = swapItems.filter((itm) => itm.offer_id === item.offer_id && itm.id !== itemId)
    const senderId = offer.from_user_id
    const senderCountAfterDelete = allOfferItemsAfterDelete.filter((itm) => itm.offered_by === senderId).length
    const receiverCountAfterDelete = allOfferItemsAfterDelete.filter((itm) => itm.offered_by !== senderId).length

    // If either would be 0 after deletion, reject the entire offer
    if (senderCountAfterDelete === 0 || receiverCountAfterDelete === 0) {
      try {
        await rejectOfferById(item.offer_id)
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
      return
    }

    // Otherwise, delete the single offer item
    // Calculate new cash adjustment after removing this item
    let newCashAdjustment = 0
    const myItemsAfterDelete = allOfferItemsAfterDelete.filter((itm) => itm.offered_by === senderId)
    const theirItemsAfterDelete = allOfferItemsAfterDelete.filter((itm) => itm.offered_by !== senderId)

    const myTotal = myItemsAfterDelete.reduce((sum, itm) => {
      const qty = _qty(itm)
      return sum + (Number.parseFloat(itm.price || 0) || 0) * qty
    }, 0)

    const theirTotal = theirItemsAfterDelete.reduce((sum, itm) => {
      const qty = _qty(itm)
      return sum + (Number.parseFloat(itm.price || 0) || 0) * qty
    }, 0)

    newCashAdjustment = myTotal - theirTotal

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
  }

  const handleDeleteSwap = async (swapId) => {
    try {
      await rejectOfferById(swapId)
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
      router.refresh()

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
      <div className="min-h-screen bg-background dark:bg-gray-950 flex items-center justify-center">
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
          <p className="text-muted-foreground">Loading Received Items...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-background dark:bg-gray-950"
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="pb-6">
          <AnimatePresence mode="popLayout">
            {[...offers]
              .sort((a, b) => new Date(b.date_created) - new Date(a.date_created))
              .map((offer, index) => (
                <motion.div
                  key={offer.id}
                  variants={cardVariants}
                  layout
                  layoutId={`notification-${offer.id}`}
                  className="mb-3"
                > 
                  <Card
                    id={`offer-card-${offer.id}`}
                    className="relative overflow-hidden border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300"
                     >
                    {/* Top-left quick delete for rejected/completed swaps */}
                    {(offer.status_offer === "rejected" || offer.status_offer === "completed") && (
                      <div className="absolute z-30 top-1 right-12">
                        <Button
                          size="icon"
                          // variant="ghost"
                          className="h-8 w-8 p-1 !bg-background  rounded-full hover:!bg-primary/20"
                          onClick={() => {handleDeleteFinally(offer.id) }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" /> 
                        </Button>
                      </div>
                    )}
                    
                    {/* Top-right screenshot button for all cards */}
                    <div className="absolute z-30 mb-4 top-1 right-2" id={`screenshot-btn-${offer.id}`}>
                      <Button
                        size="icon"
                        // variant="ghost"
                        className="h-8 w-8 p-1 !bg-background  rounded-full hover:!bg-primary/20"
                        onClick={async () => {
                          try {
                            const html2canvas = (await import("html2canvas")).default
                            const cardElement = document.getElementById(`offer-card-${offer.id}`)
                            if (cardElement) {
                              const canvas = await html2canvas(cardElement, { 
                                useCORS: true, 
                                logging: false,
                                backgroundColor: '#ffffff',
                                scale: 2
                              })
                              const link = document.createElement('a')
                              link.download = `offer-${offer.id}-screenshot.png`
                              link.href = canvas.toDataURL()
                              link.click()
                              toast.success(t("Screenshot saved") || "Screenshot saved successfully!")
                              // Hide the hint when screenshot is taken
                              setHiddenHints(prev => new Set([...prev, offer.id]))
                            }
                          } catch (error) {
                            toast.error(t("Failed to take screenshot") || "Failed to take screenshot")
                          }
                        }}
                        >
                        <Camera className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                    
                    {/* Hint tooltip for accepted offers - pointing to screenshot icon */}
                    {offer.status_offer === "accepted" && !hiddenHints.has(offer.id) && (
                      <motion.div
                        className="absolute z-40 top-12 right-2 w-64 p-3 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg shadow-lg"
                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -10 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      >
                        {/* Close button */}
                        <button
                          onClick={() => {
                            setHiddenHints(prev => new Set([...prev, offer.id]))
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-800/50 transition-colors"
                          aria-label="Close hint"
                        >
                          <X className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                        </button>
                        
                        {/* Arrow pointing up to screenshot icon */}
                        <motion.div 
                          className="absolute -top-2 right-6"
                          initial={{ y: -5 }}
                          animate={{ y: 0 }}
                          transition={{ 
                            delay: 0.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 1.5,
                            ease: "easeInOut"
                          }}
                        >
                          {/* Arrow shape pointing upward */}
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 16 16" 
                            fill="none" 
                            className="text-yellow-400 dark:text-yellow-600"
                          >
                            <path 
                              d="M8 0L4 8H12L8 0Z" 
                              fill="currentColor"
                            />
                            <path 
                              d="M8 0L12 8H4L8 0Z" 
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="0.5"
                            />
                          </svg>
                        </motion.div>
                        
                        <div className="flex items-start gap-2 pr-4">
                          <Camera className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                              {t("TakeScreenshot") || "Take a Screenshot!"}
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                              {t("IfCompletedSwapAllProductsHidden") || "If the swap is completed, all products will be hidden"}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 pb-4 pt-9">
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
                                  `${mediaURL}${
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
                            {offer.date_created ? new Date(offer.date_created).toLocaleDateString('en-US') : ""}
                          </div>
                        </motion.div>

                        {offer.status_offer !== 'completed' && offer.status_offer !== 'rejected' && (
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
                              {itemsOffer.filter((u) => u.offered_by === offer.to_user_id && u.offer_id === offer.id).reduce((sum, item) => sum + (item.quantity || 1), 0)} ↔️ {itemsOffer.filter((u) => u.offered_by !== offer.to_user_id && u.offer_id === offer.id).reduce((sum, item) => sum + (item.quantity || 1), 0)}
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
                                  <span className="text-sm font-bold text-primary">{swapItems.filter((u) => u.offered_by === offer.to_user_id && u.offer_id === offer.id).reduce((sum, item) => sum + (item.quantity || 1), 0)}</span>
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
                                      <CardItemRecived
                                        {...item    }
                                        isAccepted = {offer.status_offer=="pending"?false:true}
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
                                  <span className="text-sm font-bold text-accent">{swapItems.filter((u) => u.offered_by !== offer.to_user_id && u.offer_id === offer.id).reduce((sum, item) => sum + (item.quantity || 1), 0)}</span>
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
                                      <CardItemRecived
                                        {...item}
                                        isAccepted = {offer.status_offer=="pending"?false:true}
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
                               className="w-full"
                             >
                               <Card className="mb-6 mt-2 hover:shadow-md transition-shadow w-full">
                                 <CardHeader className="px-4 py-3">
                                   <motion.div
                                     className="flex items-center"
                                     whileHover={{ x: 5 }}
                                     transition={{ type: "spring", stiffness: 400 }}
                                   >
                                     <MessageCircle className="h-5 w-5 mr-2" />
                                     {t("ChatwithSwapPartner") || "Chat with Swap Partner"}
                                   </motion.div>
                                 </CardHeader>
                                 <CardContent className="px-4 py-3">
                                   <ScrollArea className="h-40 w-full border rounded-md p-1 mb-4">
                                    <motion.div
                                      className="space-y-3"
                                      variants={containerVariants}
                                      initial="hidden"
                                      animate="visible"
                                    >
                                      <AnimatePresence>
                                        {chatMessages
                                          .filter((m) => m.offer_id === offer.id)
                                          .sort((a, b) => new Date(a.date_created) - new Date(b.date_created))
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
                                                    ? "bg-primary/50 text-primary-foreground ml-auto mx-1"
                                                    : "bg-primary/60"
                                                }`}
                                                whileHover={{ scale: 1.02 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                              >
                                                <div className="text-sm">{msg.message}</div>
                                                <div className="text-xs opacity-70 mt-1">
                                                  {new Date(msg.date_created).toLocaleString('en-US')}
                                                </div>
                                              </motion.div>
                                            </motion.div>
                                          ))}
                                      </AnimatePresence>
                                    </motion.div>
                                  </ScrollArea>
                                   <div className="flex space-x-2 w-full">
                                     <Input
                                       placeholder="Type your message..."
                                       value={message}
                                       onChange={(e) => setMessage(e.target.value)}
                                       onKeyDown={(e) =>
                                         e.key === "Enter" && handleSendMessage(offer.from_user_id, offer.id)
                                       }
                                       className="flex-1 w-full"
                                     />
                                     <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                                       <Button onClick={() => handleSendMessage(offer.from_user_id, offer.id)} 
                                       size="icon"
                                       disabled={!message.trim()}
                                       className="flex-shrink-0"
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
                                    ? `${mediaURL}${userToRate.avatar}`
                                    : "/placeholder.svg"
                                }
                                onRatingSubmitted={() => {
                                  // Refresh the page data when rating is submitted
                                  getNotifications()
                                  router.refresh()
                                }}
                              />
                            )})()}
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
                           
                              <Trash2 className="h-8 w-8 mx-auto my-2  hover:scale-110  cursor-pointer" />
                          
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
                          className="flex justify-around gap-2 mt-4"
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
                              variant="secondary"
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
                                className="flex items-center gap-1 "
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
                <BiCartDownload className="h-16 w-16 mx-auto mb-4 text-primary/90" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">
                {t("noRecivedOffers") || "No Recived Offers"}
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
