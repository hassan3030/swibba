"use client"
import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { getCookie, decodedToken } from "@/callAPI/utiles"
import { getProductById } from "@/callAPI/products"
import { getUserById } from "@/callAPI/users"
import {
  getOfferByIdSingle,
  getOfferItemsByOfferId,
  rejectOfferById,
  completedOfferById,
  deleteFinallyOfferById,
  acceptedOfferById,
  getAllMessage,
  addMessage,
  getReviewConditins,
} from "@/callAPI/swap"
import LoadingSpinner from "@/components/loading/loading-spinner"
import {
  RejectSwapDialog,
  CompleteSwapDialog,
} from "@/components/offers/offer-dialogs"

// Import components from swap-offer folder
import {
  staggerContainer,
  FloatingCTAs,
  ChatPanel,
  ReviewPanel,
  PartnerCard,
  ItemsSection,
  CompletedState,
  RejectedState,
  ActionButtons,
  OfferHeader,
  OfferNotFound,
  getStatusConfig,
  getPriceDifference,
} from "@/components/swap/swap-offer"

export default function OfferDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslations()
  const { isRTL } = useLanguage()
  const offerId = params.id

  // States
  const [offer, setOffer] = useState(null)
  const [myUserId, setMyUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [otherUser, setOtherUser] = useState(null)
  const [myItems, setMyItems] = useState([])
  const [theirItems, setTheirItems] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [message, setMessage] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [isReceived, setIsReceived] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [phoneCopied, setPhoneCopied] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasReviewed, setHasReviewed] = useState(false)

  // Fetch offer data
  const fetchOfferData = useCallback(async () => {
    try {
      const token = await getCookie()
      if (!token) {
        router.push("/auth/login")
        return
      }

      const { id: userId } = await decodedToken()
      setMyUserId(userId)

      const offerRes = await getOfferByIdSingle(offerId)
      if (!offerRes?.success || !offerRes.data) {
        router.push("/offers")
        return
      }

      const offerData = offerRes.data
      setOffer(offerData)

      const received = offerData.to_user_id === userId
      setIsReceived(received)

      const otherUserId = received ? offerData.from_user_id : offerData.to_user_id
      const otherUserRes = await getUserById(otherUserId)
      if (otherUserRes?.success) {
        setOtherUser(otherUserRes.data)
      }

      const itemsRes = await getOfferItemsByOfferId(offerId)
      if (itemsRes?.success && Array.isArray(itemsRes.data)) {
        const myId = received ? offerData.to_user_id : offerData.from_user_id
        
        const itemsWithProducts = await Promise.all(
          itemsRes.data.map(async (item) => {
            const productRes = await getProductById(item.item_id)
            return {
              ...productRes.data,
              offer_item_id: item.id,
              offered_by: item.offered_by,
              offer_id: item.offer_id,
              quantity: item.quantity,
            }
          })
        )

        setMyItems(itemsWithProducts.filter(item => item.offered_by === myId))
        setTheirItems(itemsWithProducts.filter(item => item.offered_by !== myId))
      }

      const messagesRes = await getAllMessage()
      if (messagesRes?.success && Array.isArray(messagesRes.data)) {
        const offerMessages = messagesRes.data.filter(m => m.offer_id === offerId)
        setChatMessages(offerMessages)
        // Count unread messages (messages from other user that are not read)
        const unread = offerMessages.filter(m => m.from_user_id !== userId && !m.read).length
        setUnreadCount(unread)
      }

      // Check if user has already reviewed this offer
      if (offerData.status_offer === "completed") {
        try {
          const reviewRes = await getReviewConditins(userId, offerId)
          if (reviewRes?.data?.has_reviewed) {
            setHasReviewed(true)
          }
        } catch (error) {
          console.error("Error checking review status:", error)
        }
      }

    } catch (error) {
      console.error("Error fetching offer:", error)
      toast.error(t("Error loading offer") || "Error loading offer")
    } finally {
      setIsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId, router])

  useEffect(() => {
    fetchOfferData()
  }, [fetchOfferData])

  // Handlers
  const handleSendMessage = async () => {
    if (!message.trim() || isSendingMessage) return
    
    setIsSendingMessage(true)
    const toUserId = isReceived ? offer.from_user_id : offer.to_user_id
    
    try {
      await addMessage(message.trim(), toUserId, offerId)
      setMessage("")
      
      const messagesRes = await getAllMessage()
      if (messagesRes?.success) {
        setChatMessages(messagesRes.data.filter(m => m.offer_id === offerId))
      }
    } catch (error) {
      toast.error(t("Failed to send message") || "Failed to send message")
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleCopyPhone = async () => {
    if (otherUser?.phone_number) {
      await navigator.clipboard.writeText(otherUser.phone_number)
      setPhoneCopied(true)
      toast.success(t("Phone number copied") || "Phone number copied")
      setTimeout(() => setPhoneCopied(false), 2000)
    }
  }

  const handleAcceptSwap = async () => {
    const result = await acceptedOfferById(offerId)
    if (result) {
      toast.success(t("Swap accepted successfully") || "Swap accepted successfully")
      fetchOfferData()
    } else {
      toast.error(t("Failed to accept swap") || "Failed to accept swap")
    }
  }

  const handleRejectSwap = async () => {
    const result = await rejectOfferById(offerId)
    if (result) {
      toast.success(t("Swap rejected") || "Swap rejected")
      setShowRejectDialog(false)
      router.push("/offers")
    } else {
      toast.error(t("Failed to reject swap") || "Failed to reject swap")
    }
  }

  const handleCompleteSwap = async () => {
    const result = await completedOfferById(offerId)
    if (result) {
      toast.success(t("Swap completed successfully") || "Swap completed successfully")
      setShowCompleteDialog(false)
      fetchOfferData()
    } else {
      toast.error(t("Failed to complete swap") || "Failed to complete swap")
    }
  }

  const handleDeleteFinally = async () => {
    const type = isReceived ? "to" : "from"
    const result = await deleteFinallyOfferById(offerId, type)
    if (result?.success) {
      toast.success(t("Swap deleted") || "Swap deleted")
      router.push("/offers")
    } else {
      toast.error(t("Failed to delete swap") || "Failed to delete swap")
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Not found state
  if (!offer) {
    return <OfferNotFound router={router} t={t} />
  }

  // Get computed values
  const statusConfig = getStatusConfig(offer.status_offer, t)
  const priceInfo = getPriceDifference(offer, isReceived, t)
  const showCTAs = ["pending", "accepted", "completed"].includes(offer.status_offer)

  return (
    <>
      {/* Dialogs */}
      <RejectSwapDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onConfirm={handleRejectSwap}
      />
      <CompleteSwapDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        onConfirm={handleCompleteSwap}
      />

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        myUserId={myUserId}
        onSendMessage={handleSendMessage}
        message={message}
        setMessage={setMessage}
        isSending={isSendingMessage}
        otherUser={otherUser}
        t={t}
        isRTL={isRTL}
      />

      {/* Review Panel */}
      <ReviewPanel
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        myUserId={myUserId}
        otherUser={otherUser}
        offerId={offer.id}
        t={t}
      />

      {/* Floating CTAs */}
      {showCTAs && (
        <FloatingCTAs
          onChatClick={() => {
            setIsChatOpen(true)
            setUnreadCount(0) // Clear unread count when chat opens
          }}
          onReviewClick={() => setIsReviewOpen(true)}
          showReview={offer.status_offer === "completed" && !hasReviewed}
          chatCount={isChatOpen ? 0 : unreadCount}
          t={t}
          isRTL={isRTL}
          isReviewOpen={isReviewOpen}
        />
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <OfferHeader
          router={router}
          statusConfig={statusConfig}
          isRTL={isRTL}
          t={t}
        />

        {/* Main Content */}
        <motion.main
          className="max-w-4xl mx-auto px-4 py-6 pb-24"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Partner Card */}
          <PartnerCard
            offer={offer}
            otherUser={otherUser}
            statusConfig={statusConfig}
            priceInfo={priceInfo}
            handleCopyPhone={handleCopyPhone}
            phoneCopied={phoneCopied}
            isRTL={isRTL}
            t={t}
          />

          {/* Items Section */}
          <ItemsSection
            offer={offer}
            myItems={myItems}
            theirItems={theirItems}
            isReceived={isReceived}
            t={t}
          />

          {/* Completed State */}
          {offer.status_offer === "completed" && (
            <CompletedState
              onReviewClick={() => setIsReviewOpen(true)}
              onChatClick={() => setIsChatOpen(true)}
              otherUser={otherUser}
              handleCopyPhone={handleCopyPhone}
              phoneCopied={phoneCopied}
              t={t}
            />
          )}

          {/* Rejected State */}
          {offer.status_offer === "rejected" && (
            <RejectedState t={t} />
          )}

          {/* Action Buttons */}
          <ActionButtons
            offer={offer}
            isReceived={isReceived}
            handleAcceptSwap={handleAcceptSwap}
            handleRejectSwap={handleRejectSwap}
            handleCompleteSwap={handleCompleteSwap}
            handleDeleteFinally={handleDeleteFinally}
            setShowRejectDialog={setShowRejectDialog}
            setShowCompleteDialog={setShowCompleteDialog}
            t={t}
          />
        </motion.main>
      </div>
    </>
  )
}
