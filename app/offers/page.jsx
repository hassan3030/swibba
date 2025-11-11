"use client"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProductById } from "@/callAPI/products"
import {
  getOfferById,
  getOfferItemsByOfferId,
  rejectOfferById,
  deleteOfferItemsById,
  completedOfferById,
  deleteFinallyOfferById,
  getOffeReceived,
  getAllMessage,
  addMessage,
  acceptedOfferById,
} from "@/callAPI/swap"
import { getUserById } from "@/callAPI/users"
import { getCookie, decodedToken } from "@/callAPI/utiles"
import { useTranslations } from "@/lib/use-translations"
import { TbShoppingCartUp } from "react-icons/tb"
import { BiCartDownload } from "react-icons/bi"
import { Loader } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import OfferCard from "@/components/offers/offer-card"
import OfferStats from "@/components/offers/offer-stats"

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

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
}

export default function OffersPage() {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("offers_active_tab")
        if (saved === "received" || saved === "sent") {
          return saved
        }
      }
    } catch {}
    return "received"
  })
  const [receivedOffers, setReceivedOffers] = useState([])
  const [sentOffers, setSentOffers] = useState([])
  const [receivedSwapItems, setReceivedSwapItems] = useState([])
  const [sentSwapItems, setSentSwapItems] = useState([])
  const [receivedUserSwaps, setReceivedUserSwaps] = useState([])
  const [sentUserSwaps, setSentUserSwaps] = useState([])
  const [receivedItemsOffer, setReceivedItemsOffer] = useState([])
  const [sentItemsOffer, setSentItemsOffer] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [pendingDelete, setPendingDelete] = useState({
    idItem: null,
    idOffer: null,
    owner: null,
    itemIdItself: null,
    cashAdjustment: null,
  })
  const [pendingCompleted, setPendingCompleted] = useState({
    idOffer: null,
    owner: null,
  })
  const [chatMessages, setChatMessages] = useState([])
  const [message, setMessage] = useState("")
  const [myUserId, setMyUserId] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [hiddenHints, setHiddenHints] = useState(new Set())
  const [cashAdjustment, setCashAdjustment] = useState(null)

  const router = useRouter()
  const { t } = useTranslations()

  // Restore last active tab from localStorage and persist on change
  useEffect(() => {
    try {
      const saved = localStorage.getItem("offers_active_tab")
      if (saved !== "received" && saved !== "sent") {
        localStorage.setItem("offers_active_tab", "received")
      }
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem("offers_active_tab", activeTab)
    } catch {}
  }, [activeTab])

  const handleTabChange = useCallback((val) => {
    setActiveTab((prev) => {
      if (prev === val) return prev
      try {
        localStorage.setItem("offers_active_tab", val)
      } catch {}
      return val
    })
  }, [])

  // Helper to normalize quantity
  const _qty = (it) => Number(it?.quantity ?? it?.qty ?? it?.available_quantity ?? 1)

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

  const handlePriceDifference = (userId, cash, isReceived = false) => {
    let text = ""
    let colorClass = "text-gray-500"

    if (isReceived) {
      // For received offers, we are the receiver
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
    } else {
      // For sent offers, we are the sender
      if (userId === myUserId) {
        if (cash > 0) {
          text = `${t("Youpay") || "You pay"}: ${Math.abs(Math.ceil(cash))} ${t("LE") || "LE"}`
          colorClass = "text-destructive"
        } else if (cash < 0) {
          text = `${t("Youget") || "You get"}: ${Math.abs(Math.ceil(cash))} ${t("LE") || "LE"}`
          colorClass = "text-green-500"
        } else {
          text = `${t("Thepriceisequal") || "The price is equal"}`
        }
      } else {
        if (cash < 0) {
          text = `${t("Youpay") || "You pay"}: ${Math.abs(Math.ceil(cash))} ${t("LE") || "LE"}`
          colorClass = "text-destructive"
        } else if (cash > 0) {
          text = `${t("Youget") || "You get"}: ${Math.abs(Math.ceil(cash))} ${t("LE") || "LE"}`
          colorClass = "text-green-500"
        } else {
          text = `${t("Thepriceisequal") || "The price is equal"}`
        }
      }
    }
    return { text, colorClass }
  }

  const fetchUserId = async () => {
    const { id } = await decodedToken()
    setMyUserId(id)
  }

  // Fetch received offers
  const getReceivedOffers = useCallback(async () => {
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
        quantity: item.quantity,
      })
    }

    const uniqueUsers = Array.from(new Map(usersSwaper.map((user) => [user.id, user])).values())

    setReceivedOffers(offersReceived.data)
    setReceivedUserSwaps(uniqueUsers)
    setReceivedSwapItems(items)
    setReceivedItemsOffer(offerItems)
  }, [])

  // Fetch sent offers
  const getSentOffers = useCallback(async () => {
    const token = await getCookie()
    if (!token) {
      setIsLoading(false)
      return
    }

    const offerItems = []
    const items = []
    const usersSwaper = []
    const { id } = await decodedToken()

    const offers = await getOfferById(id)

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
        quantity: item.quantity,
      })
    }

    const uniqueUsers = Array.from(new Map(usersSwaper.map((user) => [user.id, user])).values())

    setSentOffers(offers.data)
    setSentUserSwaps(uniqueUsers)
    setSentSwapItems(items)
    setSentItemsOffer(offerItems)
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

  // Delete handlers
  const handleDeleteFinally = async (offerId, type) => {
    try {
      const deletedOffer = await deleteFinallyOfferById(offerId, type)
      if (deletedOffer.success) {
        toast({
          title: t("successfully") || "Successfully",
          description: t("Swapdeletedsuccessfully") || "Swap deleted successfully",
        })
        router.refresh()
        if (type === "to") {
          getReceivedOffers()
        } else {
          getSentOffers()
        }
      } else {
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

  const handleDeleteItem = async (offerItemId, itemId, isReceived) => {
    const swapItems = isReceived ? receivedSwapItems : sentSwapItems
    const offers = isReceived ? receivedOffers : sentOffers
    const itemsOffer = isReceived ? receivedItemsOffer : sentItemsOffer

    const item = swapItems.find((itm) => itm.id === itemId)
    if (!item) return

    const offer = offers.find((o) => o.id === item.offer_id)
    if (!offer) return

    const allOfferItemsAfterDelete = swapItems.filter((itm) => itm.offer_id === item.offer_id && itm.id !== itemId)
    const senderId = offer.from_user_id
    const senderCountAfterDelete = allOfferItemsAfterDelete.filter((itm) => itm.offered_by === senderId).length
    const receiverCountAfterDelete = allOfferItemsAfterDelete.filter((itm) => itm.offered_by !== senderId).length

    if (senderCountAfterDelete === 0 || receiverCountAfterDelete === 0) {
      try {
        await rejectOfferById(item.offer_id)
        toast({
          title: t("successfully") || "Successfully",
          description: t("Swapdeletedsuccessfully") || "Swap deleted successfully",
        })
        if (isReceived) {
          getReceivedOffers()
        } else {
          getSentOffers()
        }
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

    let newCashAdjustment = 0
    const myItemsAfterDelete = allOfferItemsAfterDelete.filter((itm) => itm.offered_by === (isReceived ? offer.to_user_id : offer.from_user_id))
    const theirItemsAfterDelete = allOfferItemsAfterDelete.filter((itm) => itm.offered_by !== (isReceived ? offer.to_user_id : offer.from_user_id))

    const myTotal = myItemsAfterDelete.reduce((sum, itm) => {
      const qty = _qty(itm)
      return sum + (Number.parseFloat(itm.price || 0) || 0) * qty
    }, 0)

    const theirTotal = theirItemsAfterDelete.reduce((sum, itm) => {
      const qty = _qty(itm)
      return sum + (Number.parseFloat(itm.price || 0) || 0) * qty
    }, 0)

    newCashAdjustment = isReceived ? theirTotal - myTotal : myTotal - theirTotal

    try {
      await deleteOfferItemsById(offerItemId, itemId, newCashAdjustment, item.offer_id)
      toast({
        title: t("successfully") || "Successfully",
        description: t("Itemdeletedfromswapsuccessfully") || "Item deleted from swap successfully",
      })
      if (isReceived) {
        getReceivedOffers()
      } else {
        getSentOffers()
      }
    } catch (err) {
      toast({
        title: t("error") || "Error",
        description: t("Failedtodeleteitem") || "Failed to delete item",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSwap = async (swapId, isReceived) => {
    try {
      await rejectOfferById(swapId)
      toast({
        title: t("successfully") || "Successfully",
        description: t("Swapdeletedsuccessfully") || "Swap deleted successfully",
      })
      setShowDeleteDialog(false)
      if (isReceived) {
        getReceivedOffers()
      } else {
        getSentOffers()
      }
      router.refresh()
    } catch (err) {
      toast({
        title: t("error") || "Error",
        description: t("Failedtodeleteswap") || "Failed to delete swap",
        variant: "destructive",
      })
    }
  }

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
      getReceivedOffers()
    }
  }

  const addCompletedSwap = async (offerId) => {
    const completeSwap = await completedOfferById(offerId)
    if (!completeSwap) {
      toast({
        title: t("error") || "Error",
        description: t("Failedtocompleteswap") || "Failed to complete swap",
        variant: "destructive",
      })
    } else {
      toast({
        title: t("successfully") || "Successfully",
        description: t("Swapcompletedsuccessfully") || "Swap completed successfully",
      })
      router.refresh()
      getSentOffers()
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await fetchUserId()
      await Promise.all([getReceivedOffers(), getSentOffers(), handleGetMessages()])
      setIsLoading(false)
    }
    fetchData()
  }, [getReceivedOffers, getSentOffers, handleGetMessages])

  // Render offer card component
  const renderOfferCard = (offer, index, isReceived) => {
    const swapItems = isReceived ? receivedSwapItems : sentSwapItems
    const userSwaps = isReceived ? receivedUserSwaps : sentUserSwaps
    const itemsOffer = isReceived ? receivedItemsOffer : sentItemsOffer

    return (
      <OfferCard
        key={offer.id}
        offer={offer}
        index={index}
        isReceived={isReceived}
        swapItems={swapItems}
        userSwaps={userSwaps}
        itemsOffer={itemsOffer}
        myUserId={myUserId}
        chatMessages={chatMessages}
        message={message}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
        onDeleteFinally={handleDeleteFinally}
        onDeleteItem={handleDeleteItem}
        onAcceptSwap={getAcceptSwap}
        onRejectSwap={(offerId) => {
          setPendingDelete({
            idItem: null,
            idOffer: offerId,
            owner: null,
          })
          setShowDeleteDialog(true)
        }}
        onCompleteSwap={(offerId) => {
          setPendingCompleted({
            idOffer: offerId,
            owner: null,
          })
          setShowCompleteDialog(true)
        }}
        hiddenHints={hiddenHints}
        onHideHint={(offerId) => {
          setHiddenHints((prev) => new Set([...prev, offerId]))
        }}
        getStatusColor={getStatusColor}
        handlePriceDifference={handlePriceDifference}
      />
    )
  }

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
          <p className="text-muted-foreground">{t("loading") || "Loading..."}</p>
        </motion.div>
      </div>
    )
  }

  const currentOffers = activeTab === "received" ? receivedOffers : sentOffers
  const currentSwapItems = activeTab === "received" ? receivedSwapItems : sentSwapItems
  const currentUserSwaps = activeTab === "received" ? receivedUserSwaps : sentUserSwaps
  const currentItemsOffer = activeTab === "received" ? receivedItemsOffer : sentItemsOffer

  return (
    <>
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
                {t("Thisisthelastiteminyouroffer_deletingitwilldeletetheentireswap") ||
                  "This is the last item in your offer. Deleting it will delete the entire swap. Are you sure?"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              <DialogClose asChild>
                <Button
                  variant="destructive"
                  className="mx-2"
                  onClick={async () => {
                    await handleDeleteSwap(pendingDelete.idOffer, activeTab === "received")
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

      {/* Complete Swap Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <DialogHeader>
              <DialogTitle>{t("CompleteSwap") || "Complete Swap"}</DialogTitle>
              <DialogDescription>
                <ul>
                  <li>{t("AreyousureyouwanttoCompletethisswap") || "Are you sure you want to Complete this swap?"}</li>
                  <li>
                    {t("Ifyoucompletetheswapyouwillnotbeabletoundothisaction") ||
                      "If you complete the swap,you will not be able to undo this action."}
                  </li>
                  <li>{t("Chatwillbeclosed.") || "Chat will be closed."}</li>
                  <li>{t("Itemswillberemoved") || "Items will be removed."}</li>
                </ul>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await addCompletedSwap(pendingCompleted.idOffer)
                    setShowCompleteDialog(false)
                    router.refresh()
                    getSentOffers()
                  }}
                >
                  {t("Complete") || "Complete"}
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowCompleteDialog(false)
                    router.refresh()
                    getSentOffers()
                  }}
                >
                  {t("Cancel") || "Cancel"}
                </Button>
              </DialogClose>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      <motion.div
        className="min-h-screen bg-background "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto px-0 py-8 ">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/10 shadow-sm">
              <TabsTrigger value="received" className="flex items-center gap-2 ">
                <BiCartDownload className="h-4 w-4" />
                {t("Received") || "Received"} ({receivedOffers.length})
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <TbShoppingCartUp className="h-4 w-4" />
                {t("Sent") || "Sent"} ({sentOffers.length})
              </TabsTrigger>
            </TabsList>

            {/* Swap Summary Stats */}
            <OfferStats
              offers={currentOffers}
              icon={activeTab === "received" ? BiCartDownload : TbShoppingCartUp}
              label={activeTab === "received" ? (t("AllNotifications") || "All Notifications") : (t("AllSwaps") || "All Swaps")}
            />

            {/* Received Offers Tab */}
            <TabsContent value="received" className="mt-0">
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <AnimatePresence mode="popLayout">
                  {[...receivedOffers]
                    .sort((a, b) => new Date(b.date_created) - new Date(a.date_created))
                    .map((offer, index) => renderOfferCard(offer, index, true))}
                </AnimatePresence>

                {receivedOffers.length === 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="p-12 text-center mt-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                      >
                        <BiCartDownload className="h-16 w-16 mx-auto mb-4 text-primary/90" />
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-2">{t("noRecivedOffers") || "No Received Offers"}</h3>
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
              </motion.div>
            </TabsContent>

            {/* Sent Offers Tab */}
            <TabsContent value="sent" className="mt-0">
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <AnimatePresence mode="popLayout">
                  {[...sentOffers]
                    .sort((a, b) => new Date(b.date_created) - new Date(a.date_created))
                    .map((offer, index) => renderOfferCard(offer, index, false))}
                </AnimatePresence>

                {sentOffers.length === 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="p-12 text-center mt-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                      >
                        <TbShoppingCartUp className="h-16 w-16 mx-auto mb-4 text-primary/90" />
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-2">{t("NoCart") || "No offers up till now"}</h3>
                      <p className="text-muted-foreground">
                        {t("YoureallcaughtupNewAddincartwillappearhere") ||
                          "You're all caught up! New Add in cart items offers will appear here."}
                      </p>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button variant="outline" className="mt-4" onClick={() => router.push("/products")}>
                          {t("MakeSwap") || "Make Swap"}
                        </Button>
                      </motion.div>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </>
  )
}
