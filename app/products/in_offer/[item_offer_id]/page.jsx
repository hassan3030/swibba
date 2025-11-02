"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { notFound, useRouter, useParams } from "next/navigation"
import {  ArrowLeftRight, Repeat, Star, Verified, Plus, Minus, BadgeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ProductGallery } from "@/components/products/product-gallery"
import { useTranslations } from "@/lib/use-translations"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getProductById } from "@/callAPI/products"
import { decodedToken, getCookie, validateAuth ,setTarget } from "@/callAPI/utiles"
import { getKYC, getUserByProductId, getUserById } from "@/callAPI/users"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/lib/language-provider"
import { getCompletedOffer, getReview  , getOfferItemsByItemIdItself} from "@/callAPI/swap"
import { mediaURL } from "@/callAPI/utiles";
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
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

export default function ProductPage() {
  const { toast } = useToast()
  const [product, setProduct] = useState(null)
  const [images, setImages] = useState([])
  const [user, setUser] = useState(null)
  const [name, setName] = useState("")
  const [tokenId, setTokenId] = useState()
  const [avatar, setAvatar] = useState("")
  const [offerQuantity, setOfferQuantity] = useState(1) 
  const [totalQuantity, setTotalQuantity] = useState()
  const [totalPrice, setTotalPrice] = useState(0)
  const [completedOffersCount, setCompletedOffersCount] = useState(0)
  const [rate, setRate] = useState(0)
  const [partnerUsers, setPartnerUsers] = useState([])
  const { t } = useTranslations()
  const params = useParams()
  const id = params.item_offer_id
  const { isRTL, toggleLanguage } = useLanguage()


  const getToken = async () => {
    try {
      const { userId } = await validateAuth()
      setTokenId(userId)
    } catch (error) {
      // User is not authenticated, tokenId will remain undefined
      // This is expected for public visitors, so we can ignore the error.
    }
  }

  

 

  
const getOfferQuantity = async () => {
  try {
    const offerItems = await getOfferItemsByItemIdItself(id)
    console.log("offerItems", offerItems)
    if (offerItems.success && offerItems.data) {
      setTotalQuantity(offerItems.data.total_quantity || 0)
      
      // Extract unique partner users from offer items (excluding current user)
      const uniqueUsers = []
      const userIds = new Set()
      
      offerItems.data.offer_items?.forEach(offer => {
        // Only include users who are not the current user (if tokenId is available)
        if (offer.offered_by && !userIds.has(offer.offered_by) && 
            (tokenId ? offer.offered_by !== tokenId : true)) {
          userIds.add(offer.offered_by)
          uniqueUsers.push({
            id: offer.offered_by,
            quantity: offer.quantity,
            total_price: offer.total_price,
            email_user_from: offer.email_user_from,
            email_user_to: offer.email_user_to
          })
        }
      })
      
      setPartnerUsers(uniqueUsers)
      
      // Fetch user details for each partner
      const fetchPartnerDetails = async () => {
        const usersWithDetails = await Promise.all(
          uniqueUsers.map(async (partner) => {
            try {
              const userDetails = await getUserById(partner.id)
              return {
                ...partner,
                name: userDetails.data ? 
                  `${userDetails.data.first_name || ''} ${userDetails.data.last_name || ''}`.trim() || partner.email_user_from :
                  partner.email_user_from,
                avatar: userDetails.data?.avatar ? 
                  `${mediaURL}${userDetails.data.avatar}` : 
                  null
              }
            } catch (error) {
              console.error(`Error fetching user details for ${partner.id}:`, error)
              return {
                ...partner,
                name: partner.email_user_from,
                avatar: null
              }
            }
          })
        )
        setPartnerUsers(usersWithDetails)
      }
      
      fetchPartnerDetails()
    } else {
      setTotalQuantity(0)
      setPartnerUsers([])
    }
  } catch (error) {
    console.error("Error fetching offer quantity:", error)
    setTotalQuantity(0)
    setPartnerUsers([])
  }
}
  useEffect(() => {
    getOfferQuantity()
  }, [id])

  // Fetch product and related data
  useEffect(() => {
    getToken()
    const fetchData = async () => {
      try {
        const prod = await getProductById(id)
        
  
        if (!prod.data) {
         return notFound()
          
        }
        setProduct(prod.data)

        // Images
        if (prod.data.images && prod.data.images.length > 0) {
          // const filesArray = prod.data.images.map((item ) => `https://deel-deal-directus.csiwm3.easypanel.host/assets/${item.directus_files_id}`)
          setImages(prod.data.images)
        } else {
          setImages([])
        }

        // User
        if (id) {
          const userData = await getUserByProductId(id)
          setUser(userData.data)
          setName(
            `${(String(userData.data?.first_name).length <= 11 ? (String(userData.data?.first_name)) : (String(userData.data?.first_name).slice(0, 10)) )|| t("account")} 
            ${(String(userData.data?.last_name).length <= 11 ? (String(userData.data?.last_name)) : (String(userData.data?.last_name).slice(0, 10)) )|| ""}`.trim()
          
          )
          setAvatar(userData.data?.avatar ? `${mediaURL}${userData.data.avatar}` : "")
        } else {
          setUser(null)
          setName("")
          setAvatar("")
        }
      } catch (err) {
        notFound()
      }
    }
    fetchData()
  }, [id])

  const getCompletedOffers = async () => {
    try {
      const userId = user?.id
      if (!userId) {
        return
      } else {
      const completedOffers = await getCompletedOffer(userId)
      setCompletedOffersCount(completedOffers.count)
    }
  } catch (error) {
    console.error("Error fetching completed offers:", error)
    setCompletedOffersCount(0)
  }
  }

  const handleGetBreviousRating = async (id) => {
    try {
      const response = await getReview(id) 
      if (!response.data) {
        setRate(0)
      } else {
        const rates = response.data.average_rating
        setRate(rates)
      }
    } catch (error) {
      console.error("Error fetching rating:", error)
      setRate(0)
    }
  }

  useEffect(() => {
    getCompletedOffers()
    if (user?.id) {
      handleGetBreviousRating(user.id)
    }
  }, [user])


  if (!product) {
    return null
  }

  return (
    <motion.div
      className="container py-3 sm:py-5 px-4 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
     

      <motion.div className="grid gap-4 md:gap-6 md:grid-cols-2" variants={containerVariants} initial="hidden" animate="visible" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Product Gallery - Left side in Arabic (RTL), Right side in English (LTR) */}
        <motion.div variants={itemVariants} className={`order-1 ${isRTL ? 'md:order-2' : 'md:order-2'}`}>
          <ProductGallery images={images} productName={product.name} />
        </motion.div>

        {/* Product Info - Right side in Arabic (RTL), Left side in English (LTR) */}
        <motion.div className={`flex flex-col gap-3 sm:gap-4 order-2 ${isRTL ? 'md:order-1' : 'md:order-1'}`} variants={itemVariants}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold capitalize break-words line-clamp-2 sm:line-clamp-3 text-start">
                  {(!isRTL ? product.translations[0]?.name: product.translations[1]?.name) || product.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 truncate text-start">
                  {t(product.category)}
                </p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                className="flex-shrink-0"
              >
                <Badge
                  variant="outline"
                  className="text-primary border-primary/90 hover:cursor-pointer hover:scale-105 text-xs sm:text-sm px-2 py-1"
                >
                  {t(product.status_item)}
                </Badge>
              </motion.div>
            </div>
          </motion.div>

          {/* Price */}
          <motion.div
            className="mt-2 flex flex-col gap-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 sm:gap-3 text-secondary2/90">
              <div className="flex items-baseline min-w-0 gap-1">
                <span className="text-xs sm:text-sm font-medium flex-shrink-0">{t("le")}</span>
                <motion.span
                  className="text-2xl sm:text-3xl md:text-4xl font-bold truncate"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                  title={Number(product.price).toLocaleString('en-US')}
                >
                  {Number(product.price).toLocaleString('en-US')}
                </motion.span>
              </div>
            </div>
            <div className="text-xs text-secondary2/85 line-clamp-2">
              {t("searcAboutProdPrice") || "Search About Product Or More With The Same Price"}: {Number(product.price).toLocaleString('en-US')} {t("le")}
            </div>
            <div className="text-xs text-secondary2/85 line-clamp-2">
              {t("quantity")}: {totalQuantity || product.quantity || 0}
            </div>
          </motion.div>


          <motion.div
            className="text-muted-foreground text-sm sm:text-base leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="font-medium block mb-1 text-start">{isRTL ? `: ${t("description")}` : `${t("description")}:`}</span>
            <div className="text-break-responsive whitespace-pre-wrap leading-relaxed line-clamp-1 overflow-ellipsis text-start">
              {(!isRTL ? product.translations[0]?.description: product.translations[1]?.description) || product.description}
            </div>
          </motion.div>

          <Separator />

          {/* Owner */}
          <motion.div
            className="flex items-start gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                transition={{ type: "spring", stiffness: 400 }} 
                className="flex-shrink-0 relative"
              >
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-border">
                  <AvatarImage src={avatar || "/placeholder.svg"} alt={name || "User"} />
                  <AvatarFallback className="text-sm sm:text-base bg-muted">{name ? name.charAt(0) : "U"}</AvatarFallback>
                </Avatar>
                {user?.Verified === "true" || user?.Verified === true ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 400 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Verified className="h-5 w-5 text-primary bg-background rounded-full p-0.5 shadow-md ring-2 ring-background" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 400 }}
                    className="absolute -top-1 -right-1"
                  >
                    <BadgeX className="h-5 w-5 text-destructive bg-background rounded-full p-0.5 shadow-md ring-2 ring-background" />
                  </motion.div>
                )}
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-base sm:text-lg truncate" title={name || "Unknown"}>
                    {name || "Unknown"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-secondary2 text-secondary2" />
                    <span className="font-medium">{rate ? `${rate} / 5.0 ${t("Rating") || "Rating"}` : (t("noRate") || "No ratings yet")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <ArrowLeftRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <span className="font-medium">
                      {completedOffersCount > 1000 
                        ? (t("moreThan1000CompletedSwaps") || "More than 1000 completed swaps")
                        : `${completedOffersCount || 0} ${t("completedSwaps") || "Completed swaps"}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Product Details Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Tabs defaultValue="features" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-primary/30">
                <TabsTrigger value="features" className="text-xs sm:text-sm px-3 py-2.5 h-auto data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                  {t("features")}
                </TabsTrigger>
                <TabsTrigger value="Category" className="text-xs sm:text-sm px-3 py-2.5 h-auto data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                  {t("category")}
                </TabsTrigger>
                <TabsTrigger value="swap_status" className="text-xs sm:text-sm px-3 py-2.5 h-auto data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                  {t("statusSwap")}
                </TabsTrigger>
              </TabsList>
                <TabsContent value="features" className="mt-3 sm:mt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm sm:text-base w-full"
                  >
                    <h2 className="text-lg sm:text-xl font-bold mb-1 text-start text-secondary">{isRTL ? `: ${t("name")}` : `${t("name")}:`}</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full text-start">
                      {(!isRTL ? product.translations[0]?.name: product.translations[1]?.name) || product.name}
                    </div>
                    <Separator />
                    <h2 className="text-lg sm:text-xl font-bold mb-1 text-start text-secondary">{isRTL ? `: ${t("location")}` : `${t("location")}:`}</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full text-start">
                      {t(product.country)} - {(!isRTL ? product.translations[0]?.city: product.translations[1]?.city) || product.city} - {(!isRTL ? product.translations[0]?.street: product.translations[1]?.street) || product.street}
                    </div>
                    <Separator />
                    <h2 className="text-lg sm:text-xl font-bold mb-1 text-start text-secondary">{isRTL ? `: ${t("listedOn") || "Listed on"}` : `${t("listedOn") || "Listed on"}:`}</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full text-start">
                      {new Date(product.date_created).toLocaleDateString('en-US')}
                    </div>

                    <Separator />
                    <h2 className="text-lg sm:text-xl font-bold mb-1 text-start text-secondary">{isRTL ? `: ${t("AllowTo")}` : `${t("AllowTo")}:`}</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full text-start">
                     {
                      product.allowed_categories.map((cat, index) => (
                        <div key={index} className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full text-start">
                         {cat=="all" ? t("allCategories") : t(cat)}
                        </div>
                      ))
                     }
                    </div>


                    <Separator />
                    <h2 className="text-lg sm:text-xl font-bold mb-1 text-start text-secondary">{isRTL ? `: ${t("category")}` : `${t("category")}:`}</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full text-start">
                      {t(product.category)}
                    </div>
                    <Separator />
                    <h2 className="text-lg sm:text-xl font-bold mb-1 text-start text-secondary">{isRTL ? `: ${t("price")}` : `${t("price")}:`}</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full text-secondary2 text-start">
                      {Number(product.price).toLocaleString('en-US')} {t("le")}
                    </div>
                    <Separator />
                    <h2 className="text-lg sm:text-xl font-bold mb-1 text-start text-secondary">{isRTL ? `: ${t("quantity")}` : `${t("quantity")}:`}</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full text-start">
                      {totalQuantity || product.quantity || 0}
                    </div>
                    <Separator />
                    <h2 className="text-lg sm:text-xl font-bold mb-1 text-start text-secondary">{isRTL ? `: ${t("status")}` : `${t("status")}:`}</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full text-primary text-start">
                      {t(product.status_item)}
                    </div>
                    
                    
                    <Separator />

                    <h2 className="text-lg sm:text-xl font-bold mb-1 text-start text-secondary">{isRTL ? `: ${t("description")}` : `${t("description")}:`}</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full text-start">
                      {(!isRTL ? product.translations[0]?.description: product.translations[1]?.description) || product.description}
                    </div>
                    <Separator />
                  </motion.div>
                </TabsContent>
                <TabsContent value="Category" className="mt-3 sm:mt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid gap-2 text-primary text-sm sm:text-base"
                  >
                    {t(product.category)}
                  </motion.div>
                </TabsContent>
                <TabsContent value="swap_status" className="mt-3 sm:mt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm sm:text-base"
                  >
                    <p className="text-destructive mx-1 line-clamp-2">
                  {t("statusSwap")} : 
                  {t("unAvailableItems")}
                </p>
                    {/* {product.status_swap === "available" ? (
                      <p className="text-primary/85 mx-1 line-clamp-2">
                        {t("statusSwap")}: 
                        {t("availableItems")}
                      </p>
                    ) : (
                      <p className="text-destructive mx-1 line-clamp-2">
                        {t("statusSwap")}:
                        {t("unAvailableItems")}
                      </p>
                    )} */}
                  </motion.div>
                </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
