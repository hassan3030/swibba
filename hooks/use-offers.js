"use client"
import { useState, useEffect, useCallback } from "react"
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
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function useOffers() {
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
  const [showDeleteItemDialog, setShowDeleteItemDialog] = useState(false)
  const [showRejectSwapDialog, setShowRejectSwapDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [pendingDelete, setPendingDelete] = useState({
    idItem: null,
    idOffer: null,
    owner: null,
    itemIdItself: null,
    cashAdjustment: null,
    isReceived: null,
  })
  const [pendingDeleteItem, setPendingDeleteItem] = useState({
    offerItemId: null,
    itemId: null,
    offerId: null,
    isReceived: null,
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
  const [statusFilter, setStatusFilter] = useState("all")

  const router = useRouter()
  const { t } = useTranslations()

  // Helper to normalize quantity
  const _qty = (it) => Number(it?.quantity ?? it?.qty ?? it?.available_quantity ?? 1)

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

    // Ensure data is an array before iterating
    const receivedData = offersReceived?.data && Array.isArray(offersReceived.data) ? offersReceived.data : []

    for (const offer of receivedData) {
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

    const uniqueUsers = Array.from(
      new Map(usersSwaper.map((user) => [user.id, user])).values()
    )

    setReceivedOffers(receivedData)
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

    // Ensure data is an array before iterating
    const sentData = offers?.data && Array.isArray(offers.data) ? offers.data : []

    for (const offer of sentData) {
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

    const uniqueUsers = Array.from(
      new Map(usersSwaper.map((user) => [user.id, user])).values()
    )

    setSentOffers(sentData)
    setSentUserSwaps(uniqueUsers)
    setSentSwapItems(items)
    setSentItemsOffer(offerItems)
  }, [])

  // Chat
  const handleGetMessages = useCallback(async () => {
    const messages = await getAllMessage()
    setChatMessages(messages?.data && Array.isArray(messages.data) ? messages.data : [])
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

    const item = swapItems.find((itm) => itm.id === itemId)
    if (!item) return

    const offer = offers.find((o) => o.id === item.offer_id)
    if (!offer) return

    const allOfferItemsAfterDelete = swapItems.filter(
      (itm) => itm.offer_id === item.offer_id && itm.id !== itemId
    )
    const senderId = offer.from_user_id
    const senderCountAfterDelete = allOfferItemsAfterDelete.filter(
      (itm) => itm.offered_by === senderId
    ).length
    const receiverCountAfterDelete = allOfferItemsAfterDelete.filter(
      (itm) => itm.offered_by !== senderId
    ).length

    // If this is the last item for sender or receiver, show confirmation dialog
    if (senderCountAfterDelete === 0 || receiverCountAfterDelete === 0) {
      setPendingDeleteItem({
        offerItemId,
        itemId,
        offerId: item.offer_id,
        isReceived,
      })
      setShowDeleteItemDialog(true)
      return
    }

    let newCashAdjustment = 0
    const myItemsAfterDelete = allOfferItemsAfterDelete.filter(
      (itm) =>
        itm.offered_by ===
        (isReceived ? offer.to_user_id : offer.from_user_id)
    )
    const theirItemsAfterDelete = allOfferItemsAfterDelete.filter(
      (itm) =>
        itm.offered_by !==
        (isReceived ? offer.to_user_id : offer.from_user_id)
    )

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
      await deleteOfferItemsById(
        offerItemId,
        itemId,
        newCashAdjustment,
        item.offer_id
      )
      toast({
        title: t("successfully") || "Successfully",
        description:
          t("Itemdeletedfromswapsuccessfully") ||
          "Item deleted from swap successfully",
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

  const handleDeleteItemConfirm = async () => {
    try {
      await rejectOfferById(pendingDeleteItem.offerId)
      toast({
        title: t("successfully") || "Successfully",
        description: t("Swapdeletedsuccessfully") || "Swap deleted successfully",
      })
      setShowDeleteItemDialog(false)
      if (pendingDeleteItem.isReceived) {
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

  const handleDeleteSwap = async (swapId, isReceived) => {
    try {
      await rejectOfferById(swapId)
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
        description:
          t("Swap accepted successfully") || "Swap accepted successfully",
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
        description:
          t("Swapcompletedsuccessfully") || "Swap completed successfully",
      })
      router.refresh()
      getSentOffers()
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await fetchUserId()
      await Promise.all([
        getReceivedOffers(),
        getSentOffers(),
        handleGetMessages(),
      ])
      setIsLoading(false)
    }
    fetchData()
  }, [getReceivedOffers, getSentOffers, handleGetMessages])

  return {
    // State
    activeTab,
    receivedOffers,
    sentOffers,
    receivedSwapItems,
    sentSwapItems,
    receivedUserSwaps,
    sentUserSwaps,
    receivedItemsOffer,
    sentItemsOffer,
    showDeleteItemDialog,
    showRejectSwapDialog,
    showCompleteDialog,
    pendingDelete,
    pendingDeleteItem,
    pendingCompleted,
    chatMessages,
    message,
    myUserId,
    isLoading,
    hiddenHints,
    statusFilter,

    // Setters
    setActiveTab,
    setShowDeleteItemDialog,
    setShowRejectSwapDialog,
    setShowCompleteDialog,
    setPendingDelete,
    setPendingDeleteItem,
    setPendingCompleted,
    setMessage,
    setHiddenHints,
    setStatusFilter,

    // Handlers
    handleTabChange,
    getStatusColor,
    handlePriceDifference,
    handleSendMessage,
    handleDeleteFinally,
    handleDeleteItem,
    handleDeleteItemConfirm,
    handleDeleteSwap,
    getAcceptSwap,
    addCompletedSwap,
    getReceivedOffers,
    getSentOffers,
    router,
  }
}
