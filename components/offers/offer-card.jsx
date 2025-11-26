"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  Trash2,
  Handshake,
  ShieldCheck,
  Loader,
  Scale,
  Verified,
  MapPin,
  ArrowRightLeft,
  X,
  MessageCircle,
  Send,
  Phone,
} from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "@/lib/use-translations"
import { mediaURL } from "@/callAPI/utiles"
import CardItemRecived from "@/components/send-received-item/card-item-recived"
import CardItemSend from "@/components/send-received-item/card-item-send"
import SwapRating from "@/components/reviews/reviews"
import { useLanguage } from "@/lib/language-provider"



const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
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
    y: -30,
    scale: 0.95,
    transition: { duration: 0.3 },
  },
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

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function OfferCard({
  offer,
  index,
  isReceived,
  swapItems,
  userSwaps,
  itemsOffer,
  myUserId,
  chatMessages = [],
  message = "",
  onMessageChange,
  onSendMessage,
  onDeleteFinally,
  onDeleteItem,
  onAcceptSwap,
  onRejectSwap,
  onCompleteSwap,
  hiddenHints = new Set(),
  onHideHint,
  getStatusColor,
  handlePriceDifference,
}) {
  const { t } = useTranslations()
  const [localHiddenHints, setLocalHiddenHints] = useState(hiddenHints)
  const { isRTL, toggleLanguage } = useLanguage()
  const otherUserId = isReceived ? offer.from_user_id : offer.to_user_id
  const myId = isReceived ? offer.to_user_id : offer.from_user_id
  const otherUser = userSwaps.find((u) => u.id === otherUserId)

  // const handleScreenshot = async () => {
  //   try {
  //     const html2canvas = (await import("html2canvas")).default
  //     const cardElement = document.getElementById(`offer-card-${offer.id}`)
  //     if (cardElement) {
  //       const canvas = await html2canvas(cardElement, {
  //         useCORS: true,
  //         logging: false,
  //         backgroundColor: "#ffffff",
  //         scale: 2,
  //       })
  //       const link = document.createElement("a")
  //       link.download = `offer-${offer.id}-screenshot.png`
  //       link.href = canvas.toDataURL()
  //       link.click()
  //       toast.success(t("Screenshot saved") || "Screenshot saved successfully!")
  //       const newHiddenHints = new Set([...localHiddenHints, offer.id])
  //       setLocalHiddenHints(newHiddenHints)
  //       if (onHideHint) onHideHint(offer.id)
  //     }
  //   } catch (error) {
  //     toast.error(t("Failed to take screenshot") || "Failed to take screenshot")
  //   }
  // }

  const myItems = swapItems.filter((u) => u.offered_by === myId && u.offer_id === offer.id)
  const theirItems = swapItems.filter((u) => u.offered_by !== myId && u.offer_id === offer.id)

  return (
    <motion.div
      key={offer.id}
      variants={cardVariants}
      layout
      layoutId={`offer-${offer.id}`}
      className="mb-4"
    >
      <Card
        id={`offer-card-${offer.id}`}
        className="relative overflow-hidden border border-border/50 bg-background/80 backdrop-blur-sm hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-2xl"
      >
        {/* Top-left quick delete for rejected/completed swaps */}
        {(offer.status_offer === "rejected" || offer.status_offer === "completed") && (
          <motion.div 
            className="absolute z-30 top-3 right-14"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, delay: 0.2 }}
          >
            <Button
              size="icon"
              className="h-9 w-9 p-1.5 !bg-background/90 backdrop-blur-sm rounded-xl hover:!bg-destructive/10 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
              onClick={() => onDeleteFinally?.(offer.id, isReceived ? "to" : "from")}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </motion.div>
        )}

        {/* Top-right screenshot button */}
        {/* <div className="absolute z-30 mb-4 top-1 right-2" id={`screenshot-btn-${offer.id}`}>
          <Button
            size="icon"
            className="h-8 w-8 p-1 !bg-background rounded-full hover:!bg-primary/20"
            onClick={handleScreenshot}
          >
            <Camera className="h-4 w-4 text-primary" />
          </Button>
        </div> */}

        {/* Hint tooltip for accepted offers */}
        {/* {offer.status_offer === "accepted" && !localHiddenHints.has(offer.id) && (
          <motion.div
            className="absolute z-40 top-12 right-2 w-64 p-3 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg shadow-lg"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <button
              onClick={() => {
                const newHiddenHints = new Set([...localHiddenHints, offer.id])
                setLocalHiddenHints(newHiddenHints)
                if (onHideHint) onHideHint(offer.id)
              }}
              className="absolute top-1 right-1 p-1 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-800/50 transition-colors"
              aria-label="Close hint"
            >
              <X className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
            </button>
            <motion.div
              className="absolute -top-2 right-6"
              initial={{ y: -5 }}
              animate={{ y: 0 }}
              transition={{
                delay: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1.5,
                ease: "easeInOut",
              }}
                >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-yellow-400 dark:text-yellow-600">
                <path d="M8 0L4 8H12L8 0Z" fill="currentColor" />
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
        )} */}

        <CardHeader className="relative bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pb-5 pt-10 rounded-t-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/10 to-transparent rounded-tr-full" />
          
          {/* Top Section: User Info & Status Badge */}
          <div className="relative flex items-center justify-between gap-4 mb-5">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400 }} className="relative ">
                <Avatar className="h-14 w-14 border-2 border-primary shadow-md">
                  <AvatarImage
                    src={`${mediaURL}${otherUser?.avatar || "/placeholder.svg"}`}
                    alt={otherUser?.first_name || t("User") || "User"}
                  />
                  <AvatarFallback>
                    {otherUser?.first_name?.[0] || t("User") || "U"}
                  </AvatarFallback>
                </Avatar>
                {(otherUser?.verified === "true" || otherUser?.verified === true) && (
                  <div className="absolute -bottom-1 -right-1">
                    <Verified className="h-5 w-5 text-primary bg-background rounded-full p-0.5 border-2 border-background shadow-sm" />
                  </div>
                )}
              </motion.div>

              <div className="flex-1">
                <div className={`font-bold text-lg ${isRTL?'force-rtl':''} `}>
                  {`${String(otherUser?.first_name || "").slice(0, 11) || t("account")}`}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1 ">
                    {(() => {
                      const city = isRTL
                        ? (otherUser?.translations?.[1]?.city || otherUser?.city || "")
                        : (otherUser?.translations?.[0]?.city || otherUser?.city || "")
                      const street = isRTL
                        ? (otherUser?.translations?.[1]?.street || otherUser?.street || "")
                        : (otherUser?.translations?.[0]?.street || otherUser?.street || "")
                      const country = otherUser?.country ? (t(otherUser.country) || otherUser.country) : ""
                      const hasAddress = Boolean(country || city || street)
                      return hasAddress
                        ? `${country} ${city} ${street}`.trim()
                        : (t("noAddress") || "No address")
                    })()}
                  </span>
                </div>
                      {
                   ["completed", "accepted"].includes(offer.status_offer) &&
                        <div className="flex items-center gap-2 text-md text-muted-foreground mt-1">
                  <Phone className="h-3 w-3" />
                  <span className="line-clamp-1">
                    {otherUser?.phone_number
                      ? otherUser?.phone_number
                      : t("NoPhone") || "No Phone"}
                  </span>
                </div>
                 }
                

              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              <Badge className={`${getStatusColor(offer.status_offer)} text-white px-4 py-2.5 text-sm font-semibold capitalize shadow-lg rounded-xl`}>
                {t(offer.status_offer)}
              </Badge>
            </motion.div>
          </div>

          {/* Info Grid */}
          <div className="relative grid grid-cols-2 gap-3">
            <motion.div
              className="bg-background/70 backdrop-blur-sm rounded-xl p-3.5 border border-border/30 hover:border-primary/30 transition-colors duration-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="font-medium">{t("Date") || "Date"}</span>
              </div>
              <div className="text-sm font-semibold text-foreground pl-8">
                {offer.date_created ? new Date(offer.date_created).toLocaleDateString("en-US", { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                }) : ""}
              </div>
            </motion.div>

            {offer.status_offer !== "completed" && offer.status_offer !== "rejected" && (
              <motion.div
                className="bg-background/70 backdrop-blur-sm rounded-xl p-3.5 border border-border/30 hover:border-primary/30 transition-colors duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-secondary" />
                  </div>
                  <span className="font-medium">{t("Items") || "Items"}</span>
                </div>
                <div className="text-sm font-semibold text-foreground pl-8">
                  <span className="text-primary">{itemsOffer
                    .filter((u) => u.offered_by === myId && u.offer_id === offer.id)
                    .reduce((sum, item) => sum + (item.quantity || 1), 0)}</span>
                  {" "}
                  <span className="text-muted-foreground">↔</span>
                  {" "}
                  <span className="text-secondary">{itemsOffer
                    .filter((u) => u.offered_by !== myId && u.offer_id === offer.id)
                    .reduce((sum, item) => sum + (item.quantity || 1), 0)}</span>
                </div>
              </motion.div>
            )}

            {offer.cash_adjustment && (
              <motion.div
                className="bg-background/70 backdrop-blur-sm rounded-xl p-3.5 col-span-2 border border-border/30 hover:border-primary/30 transition-colors duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Scale className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <span className="font-medium">{t("CashAdjustment") || "Cash Adjustment"}</span>
                </div>
                <div className={`text-sm font-bold pl-8 ${handlePriceDifference(offer.from_user_id, offer.cash_adjustment, isReceived).colorClass}`}>
                  {handlePriceDifference(offer.from_user_id, offer.cash_adjustment, isReceived).text}
                </div>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
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
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-primary">
                        {myItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-start">{t("Myitems") || "My items"}</h4>
                      <p className="text-xs text-muted-foreground">{t("ItemsYouOffer") || "Items you offer"}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {myItems.map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIndex * 0.1 }}
                      >
                        {isReceived ? (
                          <CardItemRecived
                            {...item}
                            isAccepted={offer.status_offer === "pending" ? false : true}
                            deleteItem={() => onDeleteItem?.(item.offer_item_id, item.id, isReceived)}
                          />
                        ) : (
                          <CardItemSend
                            {...item}
                            isAccepted={offer.status_offer === "pending" ? false : true}
                            deleteItem={() => onDeleteItem?.(item.offer_item_id, item.id, isReceived)}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Swap Arrow */}
                <div className="hidden lg:flex flex-col items-center justify-center py-8">
                  <motion.div
                    className="flex flex-col items-center gap-3"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-xl opacity-50" />
                      <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary flex items-center justify-center shadow-lg">
                        <ArrowRightLeft className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{t("Exchange") || "Exchange"}</span>
                  </motion.div>
                </div>

                {/* Mobile Divider */}
                <div className="lg:hidden flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  <motion.div 
                    className="relative"
                    animate={{ rotate: [0, 180, 360] }}
                    transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-lg opacity-40" />
                    <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                      <ArrowRightLeft className="h-5 w-5 text-white" />
                    </div>
                  </motion.div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>

                {/* Their Items */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-secondary">
                        {theirItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-start">{t("Theiritems") || "Their Items"}</h4>
                      <p className="text-xs text-muted-foreground">{t("ItemsYouReceive") || "Items you receive"}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {theirItems.map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIndex * 0.1 }}
                      >
                        {isReceived ? (
                          <CardItemRecived
                            {...item}
                            isAccepted={offer.status_offer === "pending" ? false : true}
                            deleteItem={() => onDeleteItem?.(item.offer_item_id, item.id, isReceived)}
                          />
                        ) : (
                          <CardItemSend
                            {...item}
                            isAccepted={offer.status_offer === "pending" ? false : true}
                            deleteItem={() => onDeleteItem?.(item.offer_item_id, item.id, isReceived)}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Chat Section - Only for received offers */}
              {isReceived && (
                <OfferChat
                  offer={offer}
                  chatMessages={chatMessages}
                  message={message}
                  onMessageChange={onMessageChange}
                  onSendMessage={onSendMessage}
                  myUserId={myUserId}
                />
              )}
            </>
          ) : offer.status_offer === "completed" ? (
            <OfferCompleted
              offer={offer}
              userSwaps={userSwaps}
              myUserId={myUserId}
              isReceived={isReceived}
            />
          ) : (
            <OfferRejected />
          )}

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-4" />

          {/* Action Buttons */}
          <OfferActions
            offer={offer}
            isReceived={isReceived}
            onAcceptSwap={onAcceptSwap}
            onRejectSwap={onRejectSwap}
            onCompleteSwap={onCompleteSwap}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Chat Component
function OfferChat({ offer, chatMessages, message, onMessageChange, onSendMessage, myUserId }) {
  const { t } = useTranslations()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="w-full"
    >
      <Card className="mb-6 mt-2 border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden w-full">
        <CardHeader className="px-5 py-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border/30">
          <motion.div 
            className="flex items-center gap-3" 
            whileHover={{ x: 5 }} 
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">{t("ChatwithSwapPartner") || "Chat with Swap Partner"}</h4>
              <p className="text-xs text-muted-foreground">{t("SendMessages") || "Send messages to coordinate"}</p>
            </div>
          </motion.div>
        </CardHeader>
        <CardContent className="p-4">
          <ScrollArea className="h-48 w-full rounded-xl border border-border/30 bg-muted/30 p-3 mb-4">
            <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
              <AnimatePresence>
                {chatMessages
                  .filter((m) => m.offer_id === offer.id)
                  .sort((a, b) => new Date(a.date_created) - new Date(b.date_created))
                  .map((msg) => (
                    <motion.div
                      key={msg.id}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className={`flex ${msg.from_user_id === myUserId ? "justify-end" : "justify-start"}`}
                    >
                      <motion.div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                          msg.from_user_id === myUserId
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-background border border-border/50 rounded-bl-md"
                        }`}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <div className="text-sm">{msg.message}</div>
                        <div className={`text-[10px] mt-1 ${msg.from_user_id === myUserId ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {new Date(msg.date_created).toLocaleString("en-US", {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </motion.div>
          </ScrollArea>
          <div className="flex gap-2 w-full">
            <Input
              placeholder={t("Type your message...") || "Type your message..."}
              value={message}
              onChange={(e) => onMessageChange?.(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSendMessage?.(offer.from_user_id, offer.id)}
              className="flex-1 w-full rounded-xl border-border/50 bg-background/50 focus:bg-background transition-colors"
            />
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                onClick={() => onSendMessage?.(offer.from_user_id, offer.id)}
                size="icon"
                disabled={!message.trim()}
                className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Completed Offer Component
function OfferCompleted({ offer, userSwaps, myUserId, isReceived }) {
  const { t } = useTranslations()

  const userToContact = userSwaps.find(
    (u) => u.id === (myUserId === offer.from_user_id ? offer.to_user_id : offer.from_user_id),
  ) || {}
  const userToRate = userSwaps.find(
    (u) => u.id === (myUserId === offer.from_user_id ? offer.to_user_id : offer.from_user_id),
  ) || {}

  return (
    <motion.div
      className="text-center py-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
        className="relative inline-block mb-4"
      >
        <div className="absolute inset-0 bg-green-500/30 rounded-full blur-2xl" />
        <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
          <ShieldCheck className="h-10 w-10 text-white" />
        </div>
      </motion.div>
      <h3 className="text-2xl font-bold mb-2 text-green-600 dark:text-green-400">
        {t("SwapCompletedSuccessfully") || "Swap Completed Successfully!"}
      </h3>
      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
        {t("Thankyouforcompletingtheswap") || "Thank you for completing the swap!"}
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl mb-6">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {t("Contactphone") || "Contact"}: {userToContact.phone_number || t("Nophoneavailable") || "No phone available"}
        </span>
      </div>
      <SwapRating
        from_user_id={myUserId}
        to_user_id={userToRate.id}
        offer_id={offer.id}
        userName={`${String(userToRate.first_name || "").slice(0, 11) || t("account")} ${String(userToRate.last_name || "").slice(0, 11) || ""}`.trim()}
        userAvatar={userToRate.avatar ? `${mediaURL}${userToRate.avatar}` : "/placeholder.svg"}
      />
    </motion.div>
  )
}

// Rejected Offer Component
function OfferRejected() {
  const { t } = useTranslations()

  return (
    <motion.div
      className="text-center py-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
        className="relative inline-block mb-4"
      >
        <div className="absolute inset-0 bg-destructive/30 rounded-full blur-2xl" />
        <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-destructive to-red-600 flex items-center justify-center shadow-lg shadow-destructive/30">
          <Trash2 className="h-10 w-10 text-white" />
        </div>
      </motion.div>
      <h3 className="text-2xl font-bold mb-2 text-destructive">{t("SwapRejected") || "Swap Rejected"}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {t("Theswapwasrejectedbyyou") || "This swap was rejected and is no longer active."}
      </p>
    </motion.div>
  )
}

// Action Buttons Component
function OfferActions({ offer, isReceived, onAcceptSwap, onRejectSwap, onCompleteSwap }) {
  const { t } = useTranslations()

  const buttonVariants = {
    hover: {
      scale: 1.03,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: { scale: 0.97 },
  }

  if (isReceived && offer.status_offer === "pending") {
    return (
      <motion.div
        className="flex flex-col sm:flex-row justify-center gap-3 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1 sm:flex-initial">
          <Button 
            size="lg" 
            onClick={() => onAcceptSwap?.(offer.id)} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25 rounded-xl px-6"
          >
            <Handshake className="h-5 w-5" />
            {t("AcceptSwap") || "Accept Swap"}
          </Button>
        </motion.div>
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1 sm:flex-initial">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => onRejectSwap?.(offer.id)} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl px-6"
          >
            <Trash2 className="h-5 w-5" />
            {t("RejectSwap") || "Reject Swap"}
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  if (isReceived && offer.status_offer === "accepted") {
    return (
      <motion.div
        className="mb-4 p-5 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-2xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Loader className="h-5 w-5 text-amber-500" />
            </motion.div>
          </div>
          <div>
            <p className="text-amber-700 dark:text-amber-300 font-semibold">
              {t("WaitingForCompletion") || "Waiting for completion"}
            </p>
            <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
              {t("YouarewaitingtocompletswapfromanotherUser") || "The other user needs to complete the swap"}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (!isReceived && offer.status_offer === "pending") {
    return (
      <motion.div
        className="flex justify-center gap-3 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            variant="outline"
            size="lg"
            onClick={() => onRejectSwap?.(offer.id)}
            className="flex items-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl px-6"
          >
            <Trash2 className="h-5 w-5" />
            {t("cancelSwap") || "Cancel Swap"}
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  if (!isReceived && offer.status_offer === "accepted") {
    return (
      <motion.div
        className="flex justify-center gap-3 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button 
            size="lg" 
            onClick={() => onCompleteSwap?.(offer.id)} 
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 rounded-xl px-8"
          >
            <ShieldCheck className="h-5 w-5" />
            {t("CompleteSwap") || "Complete Swap"}
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  return null
}

