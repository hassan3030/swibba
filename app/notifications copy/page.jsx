// "use client"
// import { useState, useEffect, useCallback } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import {
//   getOfferItemsByOfferId,
//   deleteOfferById,
//   deleteOfferItemsById,
//   getOffersNotifications,
//   getAllMessage,
//   addMessage,
//   acceptedOfferById,
// } from "@/callAPI/swap"
// import { getUserById } from "@/callAPI/users"
// import { getCookie, decodedToken } from "@/callAPI/utiles"
// import { getProductById, getImageProducts } from "@/callAPI/products"
// import { useRouter } from "next/navigation"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogFooter,
//   DialogTitle,
//   DialogDescription,
//   DialogClose,
// } from "@/components/ui/dialog"
// import { BiCartDownload } from "react-icons/bi";

// import {
//   Calendar,
//   Trash2,
//   Eye,
//   ShieldCheck,
//   MessageCircle,
//   Send,
//   MapPin,
//   ArrowRightLeft,
//   Handshake,
//   Scale,
//   BadgeX,
//   CheckCheck,
//   Loader,
//   CircleDot,
//   Verified,
// } from "lucide-react"
// import { toast } from "sonner"
// import { useTranslations } from "@/lib/use-translations"
// import { Card, CardContent, CardHeader } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Input } from "@/components/ui/input"
// import SwapRating from "@/components/reviews"
// import Image from "next/image"

// // Animation variants
// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//       delayChildren: 0.2,
//     },
//   },
// }

// const cardVariants = {
//   hidden: { opacity: 0, y: 20, scale: 0.95 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: {
//       type: "spring",
//       stiffness: 300,
//       damping: 24,
//     },
//   },
//   exit: {
//     opacity: 0,
//     y: -20,
//     scale: 0.95,
//     transition: { duration: 0.2 },
//   },
// }

// const statsVariants = {
//   hidden: { opacity: 0, scale: 0.8 },
//   visible: {
//     opacity: 1,
//     scale: 1,
//     transition: {
//       type: "spring",
//       stiffness: 400,
//       damping: 25,
//     },
//   },
// }

// const buttonVariants = {
//   hover: {
//     scale: 1.05,
//     transition: { type: "spring", stiffness: 400, damping: 10 },
//   },
//   tap: { scale: 0.95 },
// }

// const messageVariants = {
//   hidden: { opacity: 0, x: 20 },
//   visible: {
//     opacity: 1,
//     x: 0,
//     transition: {
//       type: "spring",
//       stiffness: 400,
//       damping: 25,
//     },
//   },
// }

// const Notifications = () => {
//   const [offers, setOffers] = useState([])
//   const [swapItems, setSwapItems] = useState([])
//   const [userSwaps, setUserSwaps] = useState([])
//   const [itemsOffer, setItemsOffer] = useState([])
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false)
//   const [pendingDelete, setPendingDelete] = useState({
//     idItem: null,
//     idOffer: null,
//     owner: null,
//     itemIdItslfe: null,
//   })
//   const [chatMessages, setChatMessages] = useState([])
//   const [message, setMessage] = useState("")
//   const [myUserId, setMyUserId] = useState()
//   const [isLoading, setIsLoading] = useState(true)

//   const router = useRouter()
//   const { t } = useTranslations()

//   // Fetch notifications where I am the to_user_id
//   const getNotifications = useCallback(async () => {
//     const token = await getCookie()
//     if (!token) return

//     const offerItems = []
//     const items = []
//     const usersSwaper = []
//     const { id } = await decodedToken()

//     const offers = await getOffersNotifications(id)

//     for (const offer of offers.data) {
//       const offerItem = await getOfferItemsByOfferId(offer.id)
//       const user_from = await getUserById(offer.from_user_id)
//       const user_to = await getUserById(offer.to_user_id)
//       usersSwaper.push(user_from.data, user_to.data)
//       if (offerItem?.success && Array.isArray(offerItem.data)) {
//         offerItems.push(...offerItem.data)
//       }
//     }

//     for (const item of offerItems) {
//       const product = await getProductById(item.item_id)
//       items.push({
//         ...product.data,
//         offer_item_id: item.id,
//         offered_by: item.offered_by,
//         offer_id: item.offer_id,
//         user_id: product.data.user_id,
//       })
//     }

//     const uniqueUsers = Array.from(new Map(usersSwaper.map((user) => [user.id, user])).values())

//     setOffers(offers.data)
//     setUserSwaps(uniqueUsers)
//     setSwapItems(items)
//     setItemsOffer(offerItems)
//   }, [])

//   // Chat
//   const handleGetMessages = useCallback(async () => {
//     const messages = await getAllMessage()
//     setChatMessages(messages.data)
//   }, [])

//   const handleSendMessage = async (to_user_id, offer_id) => {
//     if (!message.trim()) return
//     await addMessage(message.trim(), to_user_id, offer_id)
//     setMessage("")
//     handleGetMessages()
//   }

//   const handleDeleteItem = async (offerItemId, itemId) => {
//     const item = swapItems.find((itm) => itm.id === itemId)
//     if (!item) return

//     const theirItems = swapItems.filter((itm) => itm.offer_id === item.offer_id && itm.offered_by === item.offered_by)

//     if (theirItems.length > 1) {
//       try {
//         await deleteOfferItemsById(offerItemId, itemId)
//         toast({
//           title: t("successfully") || "Successfully",
//           description: t("Itemdeletedfromswapsuccessfully") || "Item deleted from swap successfully",
//         })
//         getNotifications()
//       } catch (err) {
//         toast({
//           title: t("error") || "Error",
//           description: t("Failedtodeleteitem") || "Failed to delete item",
//           variant: "destructive",
//         })
//       }
//     } else {
//       setPendingDelete({
//         idItem: offerItemId,
//         idOffer: item.offer_id,
//         owner: item.offered_by,
//         itemIdItslfe: itemId,
//       })
//       setShowDeleteDialog(true)
//     }
//   }

//   const handleDeleteSwap = async (swapId) => {
//     try {
//       await deleteOfferById(swapId)
//       toast({
//         title: t("successfully") || "Successfully",
//         description: t("Swapcompletedsuccessfully") || "Swap completed successfully",
//       })
//       setShowDeleteDialog(false)
//       getNotifications()
//       router.refresh()
//     } catch (err) {
//       toast({
//         title: t("error") || "Error",
//         description: t("Failedtodeleteswap") || "Failed to delete swap",
//         variant: "destructive",
//       })
//     }
//   }

//   // accepted swap
//   const getAcceptSwap = async (offerId) => {
//     const acceptSwap = await acceptedOfferById(offerId)
//     if (!acceptSwap) {
//       toast({
//         title: t("error") || "Error",
//         description: t("Failedtoacceptswap") || "Failed to accept swap",
//         variant: "destructive",
//       })
//     } else {
//       toast({
//         title: t("successfully") || "Successfully",
//         description: t("Swap accepted successfully") || "Swap accepted successfully",
//       })
//       router.refresh()
//     }
//   }

//   const handlePriceDifference = (userId, cash) => {
//     const { id } = decodedToken()
//     if (userId === id) {
//       if (cash < 0) return `${t("Youpay") || "You pay"}: ${Math.abs(Math.ceil(cash))} ${t("LE") || "LE"}`
//       if (cash > 0) return `${t("Youget") || "You get"}: ${Math.abs(Math.ceil(cash))} ${t("LE") || "LE"}`
//       return `${t("Thepriceisequal") || "The price is equal"}`
//     } else {
//       if (cash > 0) return `${t("Youpay") || "You pay"}: ${Math.abs(Math.ceil(cash))} ${t("LE") || "LE"}`
//       if (cash < 0) return `${t("Youget") || "You get"}: ${Math.abs(Math.ceil(cash))} ${t("LE") || "LE"}`
//       return `${t("Thepriceisequal") || "The price is equal"}`
//     }
//   }

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true)
//       const fetchUserId = async () => {
//         const { id } = await decodedToken()
//         setMyUserId(id)
//       }
//       await Promise.all([fetchUserId(), getNotifications(), handleGetMessages()])
//       setIsLoading(false)
//     }
//     fetchData()
//   }, [getNotifications, handleGetMessages])

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5 }}
//           className="text-center"
//         >
//           <motion.div
//             animate={{ rotate: 360 }}
//             transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
//             className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
//           />
//           <p className="text-muted-foreground">Loading notifications...</p>
//         </motion.div>
//       </div>
//     )
//   }

//   return (
//     <motion.div
//       className="min-h-screen bg-background"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.5 }}
//     >
//       {/* Delete Swap Dialog */}
//       <AnimatePresence>
//         {showDeleteDialog && (
//           <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//             <DialogContent asChild>
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.9 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
//               >
//                 <DialogHeader>
//                   <DialogTitle>{t("DeleteSwap") || "Delete Swap"}</DialogTitle>
//                   <DialogDescription>
//                     {t("Areyousureyouwanttodeletethisswap") || "Are you sure you want to delete this swap?"}
//                   </DialogDescription>
//                 </DialogHeader>
//                 <DialogFooter>
//                   <DialogClose asChild>
//                     <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
//                       <Button
//                         variant="destructive"
//                         onClick={async () => {
//                           await handleDeleteSwap(pendingDelete.idOffer)
//                         }}
//                       >
//                         {t("delete") || "Delete"}
//                       </Button>
//                     </motion.div>
//                   </DialogClose>
//                   <DialogClose asChild>
//                     <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
//                       <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>
//                         {t("Cancel") || "Cancel"}
//                       </Button>
//                     </motion.div>
//                   </DialogClose>
//                 </DialogFooter>
//               </motion.div>
//             </DialogContent>
//           </Dialog>
//         )}
//       </AnimatePresence>

//       <div className="max-w-5xl mx-auto px-4 py-8">
//         {/* Swap Summary Stats */}
//         <motion.div
//           className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4"
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//         >
//           {[
//             {
//               count: offers.length,
//               icon: BiCartDownload,
//               label: t("AllNotifications") || "All Notifications",
//               color: "text-blue-500",
//             },
//             {
//               count: offers.filter((o) => o.status_offer === "pending").length,
//               icon: Loader,
//               label: t("pending") || "Pending",
//               color: "text-yellow-500",
//             },
//             {
//               count: offers.filter((o) => o.status_offer === "accepted").length,
//               icon: Handshake,
//               label: t("accepted") || "Accepted",
//               color: "text-green-500",
//             },
//             {
//               count: offers.filter((o) => o.status_offer === "completed").length,
//               icon: CheckCheck,
//               label: t("completed") || "Completed",
//               color: "text-blue-500",
//             },
//             {
//               count: offers.filter((o) => o.status_offer === "rejected").length,
//               icon: BadgeX,
//               label: t("rejected") || "Rejected",
//               color: "text-destructive",
//             },
//           ].map((stat, index) => (
//             <motion.div
//               key={index}
//               variants={statsVariants}
//               className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow"
//               whileHover={{ y: -2 }}
//             >
//               <span className="text-lg font-bold">{stat.count === 0 ? t("no") || "No" : stat.count}</span>
//               <stat.icon className={`w-5 h-5 ${stat.color}`} />
//               <span className="text-xs text-muted-foreground">{stat.label}</span>
//             </motion.div>
//           ))}
//         </motion.div>

//         {/* Notifications List */}
//         <motion.div variants={containerVariants} initial="hidden" animate="visible">
//           <AnimatePresence mode="popLayout">
//             {[...offers]
//               .sort((a, b) => new Date(b.date_created) - new Date(a.date_created))
//               .map((offer, index) => (
//                 <motion.div
//                   key={offer.id}
//                   variants={cardVariants}
//                   layout
//                   layoutId={`notification-${offer.id}`}
//                   className="my-2"
//                 >
//                   <Card
//                     id={offer.id}
//                     className="overflow-hidden border-primary/50 bg-primary/5 hover:shadow-lg transition-shadow"
//                   >
//                     <CardHeader>
//                       <div className="flex flex-col md:flex-row md:justify-between md:items-center">
//                         <motion.div
//                           initial={{ opacity: 0, x: -20 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           transition={{ delay: index * 0.1 }}
//                         >
//                           <div className="text-sm text-muted-foreground">
//                             {t("Myitems") || "My items"}:{" "}
//                             {
//                               itemsOffer.filter((u) => u.offered_by === offer.to_user_id && u.offer_id === offer.id)
//                                 .length
//                             }{" "}
//                             | {t("Theiritems") || "Their items"}:{" "}
//                             {
//                               itemsOffer.filter((u) => u.offered_by !== offer.to_user_id && u.offer_id === offer.id)
//                                 .length
//                             }
//                           </div>
//                           <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
//                             <Calendar className="w-3 h-3" />
//                             {offer.date_created ? new Date(offer.date_created).toLocaleString() : ""}
//                           </div>

//                           <div
//                             className={`text-xs mt-1 flex items-center gap-1 ${
//                               offer.cash_adjustment > 0
//                                 ? "text-green-500"
//                                 : offer.cash_adjustment < 0
//                                   ? "text-destructive"
//                                   : "text-gray-500"
//                             }`}
//                           >
//                             <Scale className="w-3 h-3" />
//                             {offer.cash_adjustment
//                               ? `${t("CashAdjustment") || "Cash Adjustment"}: ${handlePriceDifference(
//                                   offer.from_user_id,
//                                   offer.cash_adjustment,
//                                 )}`
//                               : ""}
//                           </div>

//                           <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1 capitalize">
//                             <CircleDot className="w-3 h-3" />
//                             {t("Offerstate") || "Offer state"}: {t(offer.status_offer)}
//                           </div>
                         
//                         </motion.div>

//                         <motion.div
//                           className="flex items-center gap-3 mt-2 md:mt-0"
//                           initial={{ opacity: 0, x: 20 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           transition={{ delay: index * 0.1 + 0.2 }}
//                         >
//                           <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400 }} className="relative">
//                             <Avatar className="h-10 w-10 border">
//                               <AvatarImage
//                                 src={
//                                   `https://deel-deal-directus.csiwm3.easypanel.host/assets/${
//                                     userSwaps.find((u) => u.id === offer.from_user_id)?.avatar || "/placeholder.svg"
//                                   }` || "/placeholder.svg"
//                                 }
//                                 alt={
//                                   userSwaps.find((u) => u.id === offer.from_user_id)?.first_name || t("User") || "User"
//                                 }
//                               />
//                               <AvatarFallback>
//                                 {userSwaps.find((u) => u.id === offer.from_user_id)?.first_name?.[0] ||
//                                   t("User") ||
//                                   "User"}
//                               </AvatarFallback>
//                             </Avatar>
//                             {userSwaps.find((u) => u.id === offer.from_user_id)?.verified && (
//                               <div className="absolute -top-1 -right-1">
//                                 <Verified className="h-4 w-4 text-[#49c5b6] bg-background rounded-full p-0.5" />
//                               </div>
//                             )}
//                           </motion.div>

//                           <div>
//                             <div className="font-semibold text-base">
//                               {`${(String(userSwaps.find((u) => u.id === offer.from_user_id)?.first_name).length <= 11 ? (String(userSwaps.find((u) => u.id === offer.from_user_id)?.first_name)) : (String(userSwaps.find((u) => u.id === offer.from_user_id)?.first_name).slice(0, 10)) )|| t("account")} 
//                              `}
//                             </div>
//                           </div>
//                         </motion.div>

//                         {/* User Info Section */}
//                         <motion.div
//                           className="flex items-center space-x-4 mb-4 p-3 bg-muted/30 rounded-lg"
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: index * 0.1 + 0.3 }}
//                         >
//                           <div className="flex items-center space-x-2">
//                             <MapPin className="h-4 w-4 text-muted-foreground" />

// {/* 
// {user?.country &&  user?.city && user?.street? "":  `${t("noAddress") || "No address provided"}`}
//                       {`${user?.country || ''} ${user?.city || ''} ${user?.street || ''}`} */}


//                             <span className="text-sm">
//                               {`${userSwaps.find((u) => u.id === offer.from_user_id)?.country||''} ${
//                                 userSwaps.find((u) => u.id === offer.from_user_id)?.city||''
//                               } ${userSwaps.find((u) => u.id === offer.from_user_id)?.street||''}`}

//                               {`${userSwaps.find((u) => u.id === offer.from_user_id)?.country &&
//                                 userSwaps.find((u) => u.id === offer.from_user_id)?.city &&
//                                 userSwaps.find((u) => u.id === offer.from_user_id)?.street? "": `${t("noAddress") || "No address provided"}`
//                               }`}
//                             </span>
//                           </div>
//                         </motion.div>
//                       </div>
//                     </CardHeader>

//                     <CardContent>
//                       {["pending", "accepted"].includes(offer.status_offer) ? (
//                         <>
//                           <motion.div
//                             className="grid bg-muted/50 p-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 sm:grid-cols-3 xs:grid-cols-1 gap-4 mb-4 items-center"
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: 0.4 }}
//                           >
//                             {/* My Items */}
//                             <div className="text-center">
//                               <h4 className="font-semibold mb-2">{t("Myitems") || "My items"}</h4>
//                               <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mb-4">
//                                 {swapItems
//                                   .filter((u) => u.offered_by === offer.to_user_id && u.offer_id === offer.id)
//                                   .map((item, itemIndex) => (
//                                     <motion.div
//                                       key={item.id}
//                                       initial={{ opacity: 0, scale: 0.9 }}
//                                       animate={{ opacity: 1, scale: 1 }}
//                                       transition={{ delay: itemIndex * 0.1 }}
//                                     >
//                                       <CardItemSwap
//                                         {...item}
//                                         deleteItem={() => handleDeleteItem(item.offer_item_id, item.id)}
//                                       />
//                                     </motion.div>
//                                   ))}
//                               </div>
//                             </div>

//                             {/* Swap Arrow */}
//                             <motion.div
//                               className="flex flex-col items-center space-y-2"
//                               animate={{ x: [0, 10, -10, 0] }}
//                               transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
//                             >
//                               <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
//                               <span className="text-xs text-muted-foreground">{t("Exchange") || "Exchange"}</span>
//                             </motion.div>

//                             {/* Their Items */}
//                             <div className="text-center">
//                               <h4 className="font-semibold mb-2">{t("Theiritems") || "Their Items"}</h4>
//                               <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mb-4">
//                                 {swapItems
//                                   .filter((u) => u.offered_by !== offer.to_user_id && u.offer_id === offer.id)
//                                   .map((item, itemIndex) => (
//                                     <motion.div
//                                       key={item.id}
//                                       initial={{ opacity: 0, scale: 0.9 }}
//                                       animate={{ opacity: 1, scale: 1 }}
//                                       transition={{ delay: itemIndex * 0.1 }}
//                                     >
//                                       <CardItemSwap
//                                         {...item}
//                                         deleteItem={() => handleDeleteItem(item.offer_item_id, item.id)}
//                                       />
//                                     </motion.div>
//                                   ))}
//                               </div>
//                             </div>
//                           </motion.div>

//                           {/* Chat Section */}
//                           <motion.div
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: 0.5 }}
//                           >
//                             <Card className="mb-6 mt-2 hover:shadow-md transition-shadow">
//                               <CardHeader>
//                                 <motion.div
//                                   className="flex items-center"
//                                   whileHover={{ x: 5 }}
//                                   transition={{ type: "spring", stiffness: 400 }}
//                                 >
//                                   <MessageCircle className="h-5 w-5 mr-2" />
//                                   {t("ChatwithSwapPartner") || "Chat with Swap Partner"}
//                                 </motion.div>
//                               </CardHeader>
//                               <CardContent>
//                                 <ScrollArea className="h-40 w-full border rounded-md p-4 mb-4">
//                                   <motion.div
//                                     className="space-y-3"
//                                     variants={containerVariants}
//                                     initial="hidden"
//                                     animate="visible"
//                                   >
//                                     <AnimatePresence>
//                                       {chatMessages
//                                         .filter((m) => m.offer_id === offer.id)
//                                         .map((msg, msgIndex) => (
//                                           <motion.div
//                                             key={msg.id}
//                                             variants={messageVariants}
//                                             initial="hidden"
//                                             animate="visible"
//                                             exit="exit"
//                                             className={`flex ${
//                                               msg.from_user_id === myUserId ? "justify-end" : "justify-start"
//                                             }`}
//                                           >
//                                             <motion.div
//                                               className={`max-w-xs rounded-lg p-3 ${
//                                                 msg.from_user_id === myUserId
//                                                   ? "bg-primary text-primary-foreground ml-auto"
//                                                   : "bg-muted"
//                                               }`}
//                                               whileHover={{ scale: 1.02 }}
//                                               transition={{ type: "spring", stiffness: 400 }}
//                                             >
//                                               <div className="text-sm">{msg.message}</div>
//                                               <div className="text-xs opacity-70 mt-1">
//                                                 {new Date(msg.date_created).toLocaleString()}
//                                               </div>
//                                             </motion.div>
//                                           </motion.div>
//                                         ))}
//                                     </AnimatePresence>
//                                   </motion.div>
//                                 </ScrollArea>
//                                 <div className="flex space-x-2">
//                                   <Input
//                                     placeholder="Type your message..."
//                                     value={message}
//                                     onChange={(e) => setMessage(e.target.value)}
//                                     onKeyDown={(e) =>
//                                       e.key === "Enter" && handleSendMessage(offer.from_user_id, offer.id)
//                                     }
//                                     className="flex-1"
//                                   />
//                                   <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
//                                     <Button onClick={() => handleSendMessage(offer.from_user_id, offer.id)} 
//                                     size="icon"
//                                     disabled={!message.trim()}
//                                     className="mr-1"
//                                     >
//                                       <Send className="h-4 w-4" />
//                                     </Button>
//                                   </motion.div>
//                                 </div>
//                               </CardContent>
//                             </Card>
//                           </motion.div>
//                         </>
//                       ) : offer.status_offer === "completed" ? (
//                         <motion.div
//                           className="text-center text-green-600"
//                           initial={{ opacity: 0, scale: 0.9 }}
//                           animate={{ opacity: 1, scale: 1 }}
//                           transition={{ type: "spring", stiffness: 300, damping: 30 }}
//                         >
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
//                           >
//                             <ShieldCheck className="h-8 w-8 mx-auto mb-2" />
//                           </motion.div>
//                           <h3 className="text-xl font-semibold mb-2">
//                             {t("SwapCompletedSuccessfully") || "Swap Completed Successfully!"}
//                           </h3>
//                           <p className="text-muted-foreground mb-4">
//                             {t("Thankyouforcompletingtheswap") || "Thank you for completing the swap!"}
//                           </p>
//                           <p className="text-muted-foreground mb-4">
//                             {t("Contactphone") || "Contact phone"}: {(() => {
//                               const userToContact =
//                                 userSwaps.find(
//                                   (u) =>
//                                     u.id === (myUserId === offer.from_user_id ? offer.from_user_id : offer.to_user_id),
//                                 ) || {}
//                               return userToContact.phone_number || t("Nophoneavailable") || "No phone available"
//                             })()}
//                           </p>
//                           {(() => {
//                             const userToRate =
//                               userSwaps.find(
//                                 (u) =>
//                                   u.id === (myUserId === offer.from_user_id ? offer.to_user_id : offer.from_user_id),
//                               ) || {}

//                             return (
//                               <SwapRating
//                                 from_user_id={myUserId}
//                                 to_user_id={userToRate.id}
//                                 offer_id={offer.id}
//                                 userName={`${(String(userToRate.first_name).length <= 11 ? (String(userToRate.first_name)) : (String(userToRate.first_name).slice(0, 10)) )|| t("account")} 
//                                 ${(String(userToRate.last_name).length <= 11 ? (String(userToRate.last_name)) : (String(userToRate.last_name).slice(0, 10)) )|| ""}`.trim()
//                                 }
//                                 userAvatar={
//                                   userToRate.avatar
//                                     ? `https://deel-deal-directus.csiwm3.easypanel.host/assets/${userToRate.avatar}`
//                                     : "/placeholder.svg"
//                                 }
//                               />
//                             )
//                           })()}
//                         </motion.div>
//                       ) : (
//                         <motion.div
//                           className="text-center text-destructive" 
//                           initial={{ opacity: 0, scale: 0.9 }}
//                           animate={{ opacity: 1, scale: 1 }}
//                           transition={{ type: "spring", stiffness: 300, damping: 30 }}
//                         >
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
//                           >
//                             <Trash2 className="h-8 w-8 mx-auto mb-2" />
//                           </motion.div>
//                           <h3 className="text-xl font-semibold mb-2">{t("SwapRejected") || "Swap Rejected"}</h3>
//                           <p className="text-muted-foreground mb-4">
//                             {t("Theswapwasrejectedbyyou") || "The swap was rejected by you."}
//                           </p>
//                         </motion.div>
//                       )}

//                       <Separator className="my-4" />

//                       {/* Action Buttons */}
//                       {offer.status_offer === "pending" && (
//                         <motion.div
//                           className="flex justify-around space-x-2 mt-4"
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: 0.6 }}
//                         >
//                           <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
//                             <Button
//                               size="sm"
//                               onClick={() => {
//                                 getAcceptSwap(offer.id)
//                               }}
//                               className="flex items-center gap-1"
//                             >
//                               <Handshake className="h-4 w-4" />
//                               {t("AcceptSwap") || "Accept Swap"}
//                             </Button>
//                           </motion.div>

//                           <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
//                             <Button
//                               variant="destructive"
//                               size="sm"
//                               onClick={() => {
//                                 setPendingDelete({
//                                   idItem: null,
//                                   idOffer: offer.id,
//                                   owner: null,
//                                 })
//                                 setShowDeleteDialog(true)
//                               }}
//                               className="flex items-center gap-1"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                               {t("RejectSwap") || "Reject Swap"}
//                             </Button>
//                           </motion.div>
//                         </motion.div>
//                       )}

//                       {offer.status_offer === "accepted" && (
//                         <motion.div
//                           className="flex justify-around space-x-2 mt-4"
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: 0.6 }}
//                         >
//                           <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
//                             <Button
//                               variant="destructive"
//                               size="sm"
//                               onClick={() => {
//                                 setPendingDelete({
//                                   idItem: null,
//                                   idOffer: offer.id,
//                                   owner: null,
//                                 })
//                                 setShowDeleteDialog(true)
//                               }}
//                               className="flex items-center gap-1"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                               {t("RejectSwap") || "Reject Swap"}
//                             </Button>
//                           </motion.div>
//                         </motion.div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//               ))}
//           </AnimatePresence>
//         </motion.div>

//         {/* Empty state */}
//         {offers.length === 0 && (
//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
//             <Card className="p-12 text-center mt-8">
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
//               >
//                 <BiCartDownload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
//               </motion.div>
//               <h3 className="text-xl font-semibold mb-2">
//                 {t("no") || "No"} {t("notifications") || "notifications"}
//               </h3>
//               <p className="text-muted-foreground">
//                 {t("YoureallcaughtupNewnotificationswillappearhere") ||
//                   "You're all caught up! New notifications will appear here."}
//               </p>
//               <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
//                 <Button variant="outline" className="mt-4" onClick={() => router.push("/products")}>
//                   {t("MakeSwap") || "Make Swap"}
//                 </Button>
//               </motion.div>
//             </Card>
//           </motion.div>
//         )}
//       </div>
//     </motion.div>
//   )
// }

// export default Notifications

// // CardItemSwap component
// const CardItemSwap = ({ id, name, description, price, status_item, images, deleteItem ,translations}) => {
//   const router = useRouter()
//   // const [bigImage, setBigImage] = useState("")
//   const { t } = useTranslations()

//   // useEffect(() => {
//   //   const getDataImage = async () => {
//   //     if (images) {
//   //       const images2 = await getImageProducts(images)
//   //       setBigImage(images2.data[0]?.directus_files_id || "")
//   //     }
//   //   }
//   //   getDataImage()
//   // }, [images])

//   const handleView = (id) => {
//     router.push(`/products/${id}`)
//   }

//   return (
//     <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
//       <Card key={id} className="overflow-hidden hover:shadow-lg transition-shadow">
//         <motion.div
//           className="h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
//           whileHover={{ scale: 1.05 }}
//           transition={{ duration: 0.3 }}
//         >
//           <Image
//             width={100}
//             height={100}
//             src={images[0]?.directus_files_id ? `https://deel-deal-directus.csiwm3.easypanel.host/assets/${images[0]?.directus_files_id}` : "/placeholder.svg"}
//             alt={name}
//             className="w-full h-full object-cover"
//           />
//         </motion.div>
//         <CardContent className="p-4">
//           <h4 className="font-semibold text-sm mb-1">{name}</h4>
//           <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{description}</p>
//           <div className="flex justify-between items-center mb-3">
//             <Badge variant="outline" className="text-xs">
//               {t(status_item) || status_item}
//             </Badge>
//             <span className="font-bold text-primary text-sm">{price}</span>
//           </div>
//           <div className="flex gap-2">
//             <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
//               <Button variant="outline" size="sm" className="w-full" onClick={() => handleView(id)}>
//                 <Eye className="h-3 w-3 mr-1" />
//                 {t("view") || "View"}
//               </Button>
//             </motion.div>
//             <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
//               <Button variant="destructive" size="sm" className="w-full" onClick={deleteItem}>
//                 <Trash2 className="h-3 w-3 mr-1" />
//                 {t("delete") || "Delete"}
//               </Button>
//             </motion.div>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   )
// }
