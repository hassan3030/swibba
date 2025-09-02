"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/lib/use-translations"

import { Send, Search, MessageCircle, ArrowLeft, ShoppingCart, Bell, Verified } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getOfferById, getOffersNotifications, getMessage, addMessage } from "@/callAPI/swap"
import { getUserById } from "@/callAPI/users"
import { getCookie, decodedToken } from "@/callAPI/utiles"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
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
    scale: 0.9,
    transition: { duration: 0.2 },
  },
}

const chatMessageVariants = {
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

const Messages = () => {
  const router = useRouter()
  const [offers, setOffers] = useState([])
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [partner, setPartner] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [myUserId, setMyUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useTranslations()

  // Fetch my offers (sent and received) on mount
  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true)
      const token = await getCookie()
      if (!token) {
        setIsLoading(false)
        return
      }
      const { id } = await decodedToken(token)
      setMyUserId(id)

      // Get offers where I am sender
      const sentOffers = await getOfferById(id)
      // Get offers where I am receiver
      const receivedOffers = await getOffersNotifications(id)

      // Combine and remove duplicates (by offer id)
      const allOffers = [...sentOffers.data, ...receivedOffers.data].filter(
        (offer, idx, arr) => arr.findIndex((o) => o.id === offer.id) === idx,
      )

      // Attach partner info to each offer
      const offersWithPartner = await Promise.all(
        allOffers.map(async (offer) => {
          const partnerId = offer.from_user_id === id ? offer.to_user_id : offer.from_user_id
          const partnerUser = await getUserById(partnerId)
          return {
            ...offer,
            partner_id: partnerId,
            partner_name: partnerUser.data
              ? `${partnerUser.data.first_name} ${partnerUser.data.last_name || ""}`
              : `${t("Unknown") || "Unknown"}`,
            partner_avatar: partnerUser.data?.avatar || "/placeholder.svg",
          }
        }),
      )
      setOffers(offersWithPartner)
      setIsLoading(false)
    }
    fetchOffers()
  }, [])

  // When an offer is selected, fetch partner and messages
  useEffect(() => {
    const fetchPartnerAndMessages = async () => {
      if (!selectedOffer || !myUserId) return
      // Partner info is already attached to offer
      const partnerUser = await getUserById(selectedOffer.partner_id)
      setPartner(partnerUser.data)

      // Fetch messages for this offer
      const msgs = await getMessage(selectedOffer.id)
      setMessages(msgs.data || [])
    }
    fetchPartnerAndMessages()
  }, [selectedOffer, myUserId])

  // Filter offers by partner name
  const filteredOffers = offers.filter((offer) => offer.partner_name?.toLowerCase().includes(searchQuery.toLowerCase()))

  // Handle send message
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedOffer || !partner) return
    const newMsg = await addMessage(message, selectedOffer.partner_id, selectedOffer.id)
    setMessages((prev) => [...prev, newMsg.data])
    setMessage("")
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
          <p className="text-muted-foreground">Loading messages...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
  <motion.div
      className="min-h-full bg-background"
      style={{ minHeight: "calc(100vh - 80px)", height: "calc(100vh - 80px)", overflowY: "hidden" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex h-full">
        {/* Offers List */}
        <motion.div
          className={`${selectedOffer ? "hidden lg:block" : "block"} w-full lg:w-1/3 border-r bg-card/30`}
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="p-4">
            <motion.div
              className="flex items-center mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MessageCircle className="h-6 w-6 mr-3 text-primary" />
              <h2 className="text-xl font-bold">{t("Messages") || "Messages"}</h2>
            </motion.div>

            {/* Search */}
            <motion.div
              className="relative mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </motion.div>

            {/* Offers List */}
            <ScrollArea className="h-[calc(100vh-200px)]">
              <motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
                <AnimatePresence mode="popLayout">
                  {filteredOffers.map((offer, index) => (
                    <motion.div
                      key={offer.id}
                      variants={messageVariants}
                      layout
                      layoutId={`offer-${offer.id}`}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 mt-1 mx-1 ${
                          selectedOffer?.id === offer.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedOffer(offer)}
                      >
                        <CardContent className="p-0 mt-0">
                          <div className="flex items-start space-x-3">
                            <div className="flex items-center text-sm">
                              <motion.div
                                className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 relative"
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <Avatar className="h-12 w-12">
                                  <AvatarImage
                                    src={
                                      `https://deel-deal-directus.csiwm3.easypanel.host/assets/${offer.partner_avatar || "/placeholder.svg"}` ||
                                      "/placeholder.svg"
                                    }
                                    alt={offer.partner_name || t("Unknown")}
                                  />
                                  <AvatarFallback>{offer.partner_name?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                                {offer.partner_verified && (
                                  <div className="absolute -top-1 -right-1">
                                    <Verified className="h-4 w-4 text-[#49c5b6] bg-background rounded-full p-0.5" />
                                  </div>
                                )}
                              </motion.div>
                              <div className="flex flex-col ml-2">
                                <span className="px-1 text-gray-400 capitalize">{offer.partner_name || ""}</span>
                                <span className="px-1 text-gray-400 ">{offer.last_message || ""}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </ScrollArea>
          </div>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          className={`${selectedOffer ? "block" : "hidden lg:block"} flex-1 flex flex-col`}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
        >
          {selectedOffer && partner ? (
            <>
              {/* Chat Header */}
              <motion.div
                className="p-4 border-b bg-card/30"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedOffer(null)}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </motion.div>
                  <div className="relative">
                    <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400 }}>
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage
                          src={
                            `https://deel-deal-directus.csiwm3.easypanel.host/assets/${partner.avatar || "/placeholder.svg"}` || "/placeholder.svg"
                          }
                          alt={partner.first_name || t("User") || "User"}
                        />
                        <AvatarFallback>{partner.first_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      {partner.verified && (
                        <div className="absolute -top-1 -right-1">
                          <Verified className="h-4 w-4 text-[#49c5b6] bg-background rounded-full p-0.5" />
                        </div>
                      )}
                    </motion.div>
                  </div>

                  <div>
                    <h3 className="font-semibold capitalize">
                      {partner.first_name} {partner.last_name}
                    </h3>
                  </div>

                  {myUserId === selectedOffer.from_user_id ? (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative hover:text-primary group"
                        onClick={() => {
                          router.push(`/cart#${selectedOffer.id}`)
                        }}
                      >
                        <ShoppingCart className="h-8 w-8" />
                        <span className="pointer-events-none absolute top-8 right-0 z-10 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                          {t("goToCart") || "Go to Cart"}
                        </span>
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative hover:text-primary group"
                        onClick={() => {
                          router.push(`/notifications#${selectedOffer.id}`)
                        }}
                      >
                        <Bell className="h-8 w-8" />
                        <span className="pointer-events-none absolute top-8 right-0 z-10 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                          {t("goToNotifications") || "Go to Notifications"}
                        </span>
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Chat messages area with space for input */}
              <div className="flex flex-col h-[calc(100vh-270px)]">
                <ScrollArea className="flex-1 p-4 overflow-y-auto">
                  <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                    <AnimatePresence>
                      {messages.map((msg, index) => (
                        <motion.div
                          key={msg.id}
                          variants={chatMessageVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={`flex ${msg.from_user_id === myUserId ? "justify-end" : "justify-start"}`}
                        >
                          <motion.div
                            className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${
                              msg.from_user_id === myUserId ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <div className="text-sm">{msg.message}</div>
                            <div className="text-xs opacity-70 mt-1">{new Date(msg.date_created).toLocaleString()}</div>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </ScrollArea>
                {/* Static message input at the end */}
                <div className="w-full flex justify-center p-4 border-t bg-card/30">
                  <div className="flex space-x-2 max-w-3xl w-full">
                    <Input
                      placeholder={t("Typeyourmessage") || "Type your message..."}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} >
                      <Button
                        onClick={handleSendMessage}
                        size="icon"
                        disabled={!message.trim()}
                        className="mr-2"
                      >
                        <Send className="h-4 w-4 " />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <motion.div
              className="hidden lg:flex flex-1 items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">{t("Selectaconversation") || "Select a conversation"}</h3>
                <p className="text-muted-foreground">
                  {t("Chooseaswapoffertostartchatting") || "Choose a swap offer to start chatting"}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>

    </>
  
  )
}

export default Messages
