"use client"
import { ArrowRightLeft, Loader, TrendingUp, Package } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import OfferCard from "@/components/offers/offer-card"
import PageHeader from "@/components/general/page-header"
import { StatCard, StatCardGrid } from "@/components/general/stat-card"
import LoadingSpinner from "@/components/loading/loading-spinner"
import {
  DeleteItemDialog,
  RejectSwapDialog,
  CompleteSwapDialog,
} from "@/components/offers/offer-dialogs"
import OffersTabs from "@/components/offers/offers-tabs"
import { useOffers } from "@/hooks/use-offers"

export default function OffersPage() {
  const { t } = useTranslations()
  const { isRTL } = useLanguage()

  const {
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
    pendingCompleted,
    chatMessages,
    message,
    myUserId,
    isLoading,
    hiddenHints,
    statusFilter,

    // Setters
    setShowDeleteItemDialog,
    setShowRejectSwapDialog,
    setShowCompleteDialog,
    setPendingDelete,
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
    getSentOffers,
    router,
  } = useOffers()

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
            isReceived: isReceived,
          })
          setShowRejectSwapDialog(true)
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
      <div className="min-h-screen py-4 bg-background dark:bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      {/* Dialogs */}
      <DeleteItemDialog
        open={showDeleteItemDialog}
        onOpenChange={setShowDeleteItemDialog}
        onConfirm={handleDeleteItemConfirm}
      />

      <RejectSwapDialog
        open={showRejectSwapDialog}
        onOpenChange={setShowRejectSwapDialog}
        onConfirm={async () => {
          await handleDeleteSwap(pendingDelete.idOffer, pendingDelete.isReceived)
          setShowRejectSwapDialog(false)
        }}
      />

      <CompleteSwapDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        onConfirm={async () => {
          await addCompletedSwap(pendingCompleted.idOffer)
          setShowCompleteDialog(false)
          router.refresh()
          getSentOffers()
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-gray-950 dark:via-gray-950 dark:to-primary/10">
        {/* Hero Header Section */}
        <PageHeader
          icon={ArrowRightLeft}
          title={isRTL ? "عروضك" : "Your Offers"}
          description={
            isRTL
              ? "إدارة جميع مبادلاتك في مكان واحد. تابع العروض المستلمة والمرسلة وأكمل عمليات التبادل بسهولة."
              : "Manage all your swaps in one place. Track received and sent offers and complete exchanges easily."
          }
          iconAnimation="flip"
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Quick Stats Cards */}
          <StatCardGrid className="mb-8">
            <StatCard
              icon={Package}
              value={receivedOffers.length + sentOffers.length}
              label={t("TotalOffers") || "Total Offers"}
              color="text-primary"
              bgColor="bg-primary/10"
              borderColor="border-primary/20"
              glowColor="from-primary/20 to-primary/10"
            />
            <StatCard
              icon={Loader}
              value={
                [...receivedOffers, ...sentOffers].filter(
                  (o) => o.status_offer === "pending"
                ).length
              }
              label={t("Pending") || "Pending"}
              color="text-yellow-500"
              bgColor="bg-yellow-500/10"
              borderColor="border-yellow-500/20"
              glowColor="from-yellow-500/20 to-yellow-500/10"
            />
            <StatCard
              icon={TrendingUp}
              value={
                [...receivedOffers, ...sentOffers].filter(
                  (o) => o.status_offer === "accepted"
                ).length
              }
              label={t("Active") || "Active"}
              color="text-green-500"
              bgColor="bg-green-500/10"
              borderColor="border-green-500/20"
              glowColor="from-green-500/20 to-green-500/10"
            />
            <StatCard
              icon={ArrowRightLeft}
              value={
                [...receivedOffers, ...sentOffers].filter(
                  (o) => o.status_offer === "completed"
                ).length
              }
              label={t("Completed") || "Completed"}
              color="text-blue-500"
              bgColor="bg-blue-500/10"
              borderColor="border-blue-500/20"
              glowColor="from-blue-500/20 to-blue-500/10"
            />
          </StatCardGrid>

          {/* Tabs */}
          <OffersTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            receivedOffers={receivedOffers}
            sentOffers={sentOffers}
            renderOfferCard={renderOfferCard}
          />
        </div>
      </div>
    </>
  )
}
