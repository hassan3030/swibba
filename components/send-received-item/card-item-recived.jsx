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
// CardItemRecived component
const CardItemRecived = ({ id, name, description, price, status_item, images, deleteItem, translations, quantity, available_quantity , isAccepted=true}) => {
    const router = useRouter()
    const { isRTL } = useLanguage()
    const { t } = useTranslations()
  
    const unitPrice = Number(price || 0)
    const qty = Number(quantity ?? available_quantity ?? 1)
    const totalPrice = unitPrice * qty
  
    const handleView = (id) => {
      router.push(`/products/in_offer/${id}`)
    }
   
     return (
       <motion.div 
         whileHover={{ scale: 1.02 }} 
         transition={{ type: "spring", stiffness: 300, damping: 20 }}
       >
         <Card key={id} className="overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300">
           <div className="flex flex-col sm:flex-row gap-3 p-3 sm:p-4">
             {/* Image Section */}
             <motion.div
               className="relative w-full h-24 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted mx-auto sm:mx-0 max-w-40"
               whileHover={{ scale: 1.05 }}
               transition={{ duration: 0.3 }}
                 >
               {(() => {
                 const mediaUrl = {
                   id: images[0]?.directus_files_id.id,
                   type: images[0]?.directus_files_id.type,
                   url: `${mediaURL}${images[0]?.directus_files_id.id}`
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
             <div className="flex-1 min-w-0 flex flex-col justify-between w-full">
               <div className="text-center sm:text-start">
                 <h4 className="font-bold text-sm mb-1 line-clamp-1">{isRTL ? translations?.[1]?.name || name : translations?.[0]?.name || name}</h4>
                 <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{!isRTL ? translations?.[0]?.description || description : translations?.[1]?.description || description}</p>
               </div>
               
               <div className="space-y-2">
                 {/* Price & Quantity (unit + total based on quantity) */}
                 <div className="flex items-center justify-between gap-4">
                   <div className="text-center sm:text-start">
                     <div className="text-xs text-muted-foreground"> {t("unitPrice") || "Unit"}</div>
                     <div className="font-bold text-primary text-sm">{unitPrice.toLocaleString()} {t("LE") || "LE"}</div>
                   </div>
                   <div className="text-center sm:text-right">
                     <div className="text-xs text-muted-foreground">{t("quantity") || "Qty"}: {qty}</div>
                     <div className="font-semibold">{totalPrice.toLocaleString()} {t("LE") || "LE"}</div>
                   </div>
                 </div>
  
                 {/* Action Buttons */}
                 <div className="flex flex-col sm:flex-row gap-2">
                   <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="w-full h-8 sm:h-7 text-xs gap-1.5" 
                       onClick={() => handleView(id)}
                     >
                       <Eye className="h-3 w-3" />
                       {t("view") || "View"}
                     </Button>
                   </motion.div>

                   {
                    !isAccepted?( <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                      <Button 
                        size="sm" 
                        className="w-full h-8 sm:h-7 text-xs gap-1.5 " 
                        onClick={deleteItem}
                      >
                        <Trash2 className="h-3 w-3" />
                        {t("Remove") || "Remove"}
                      </Button>
                    </motion.div>):null
                   }
                  
                 </div>
               </div>
             </div>
           </div>
         </Card>
       </motion.div>
     )
  }
  export default CardItemRecived;