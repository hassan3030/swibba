"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Repeat, Check, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/lib/use-translations"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { getWishList, deleteWishList, addWishList } from "@/callAPI/swap"
import { decodedToken, getCookie  , setTarget} from "@/callAPI/utiles"
import { getMediaType } from "@/lib/utils"
import { useLanguage } from "@/lib/language-provider"
import { getKYC } from "@/callAPI/users"
 

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
}

const imageVariants = {
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
}

const heartVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.2 },
  tap: { scale: 0.9 },
  liked: {
    scale: [1, 1.3, 1],
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
}

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  loading: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8, x: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      delay: 0.2,
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

const priceVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3,
      duration: 0.4,
      ease: "easeOut",
    },
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
}

export function SwibbaProductCard({
  id,
  name,
  price,
  images,
  translations,
  quantity,
  status_item,
  city,
  street,
  date_created,
  showSwitchHeart = true,
}) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [switchHeart, setSwitchHeart] = useState(false)
  const [loading, setLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const { isRTL, toggleLanguage } = useLanguage()

  const { t } = useTranslations()
  const { toast } = useToast()
  const router = useRouter()
  

  const makeSwap = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const token = await getCookie()
    const decoded = await decodedToken(token)
    if (token) {
      const kyc = await getKYC(decoded.id) /// ------------- take id user
      if (kyc.data === false) {
        toast({
          title: t("faildSwap") || "Failed Swap",
          description: t("DescFaildSwapKYC") || "Required information for swap. Please complete your information.",
          variant: "default",
        })
      }
      else {
        router.push(`/swap/${id}`)
      }
    } else {
    await setTarget(id)
      toast({
        title: t("faildSwap") || "Failed Swap",
        description: t("DescFaildSwapLogin") ||   "Invalid swap without login. Please try to login.",
        variant: "default",
      })
      router.push(`/auth/login`)
    }
  }



  const handleGetWishItem = async () => {
    try {
      const user = await decodedToken()
      if (!user?.id) return
      const WishItem = await getWishList(user.id)
      if (WishItem?.success && Array.isArray(WishItem.data)) {
        const isItem = WishItem.data.some((i) => i.item_id == id)
        setSwitchHeart(isItem)
      }
    } catch (error) {
      // console.error("Error getting wish item:", error)
    }
  }

  const handleAddWishItem = async () => {
    try {
      const user = await decodedToken()
      if (!user?.id) {
        toast({
          title: t("faildWish") || "Login required",
          description: t("pleaseLoginWish") || "Please login to manage your wishlist.",
          variant: "destructive",
        })
        return
      }
      const WishItem = await getWishList(user.id)
      const items = Array.isArray(WishItem?.data) ? WishItem.data : []
      const existing = items.find((i) => i.item_id == id)

      if (existing) {
        await deleteWishList(existing.id)
        setSwitchHeart(false)
        toast({
          title: t("successAddWish") || "Success",
          description: t("deletedWishDesc") || "Removed from wishlist",
        })
      } else {
        const res = await addWishList(id, user.id)
        if (res?.success) {
          setSwitchHeart(true)
          toast({
            title: t("successAddWish") || "Success",
            description: t("successAddWishDesc") || "Added to wishlist successfully.",
          })
        }
      }
    } catch (error) {
      //  console.error("Error handling wish item:", error)
    }
  }




      useEffect(() => {
    handleGetWishItem()
  }, [switchHeart])

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover" className="group">
    
      
      <Link href={`/products/${id}`}>
        <div className="group relative flex lg:w-[210px] w-[150px] flex-col overflow-hidden rounded-md border bg-background transition-all hover:shadow-md">
          {/* Image container */}
          <div className="relative aspect-square overflow-hidden">
            <AnimatePresence>
              {/* {loading ? (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-muted"
                >
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </motion.div>
              ) : ( */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  {(() => {
                    const mediaUrl = {
                      id: images[0]?.directus_files_id.id,
                      type: images[0]?.directus_files_id.type,
                      url: `https://deel-deal-directus.csiwm3.easypanel.host/assets/${images[0]?.directus_files_id.id}`
                    }
                    const mediaType = getMediaType(mediaUrl.type)
                    
                    if (mediaType === 'video') {
                      return (
                        <motion.div variants={imageVariants} className="w-full h-full relative">
                          <video
                            src={mediaUrl.url}
                            className="w-full h-full object-cover transition-transform duration-300"
                            muted
                            loop
                            playsInline
                            onLoadedData={() => setImageLoaded(true)}
                          />
                          {/* Video play overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                            <div className="bg-white/90 rounded-full p-2 group-hover:scale-110 transition-transform">
                              <Play className="h-6 w-6 text-gray-800 fill-current" />
                            </div>
                          </div>
                        </motion.div>
                      )
                    } else if (mediaType === 'audio') {
                      return (
                        <motion.div variants={imageVariants} className="w-full h-full relative bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="text-4xl mb-2">🎵</div>
                            <div className="text-sm font-medium">Audio File</div>
                          </div>
                          <audio
                            src={mediaUrl.url}
                            className="hidden"
                            onLoadedData={() => setImageLoaded(true)}
                          />
                        </motion.div>
                      )
                    } else {
                      return (
                        <motion.div variants={imageVariants} className="w-full h-full">
                          <Image
                            src={mediaUrl.url || "/placeholder.svg"}
                            alt={!isRTL ? translations[0]?.name: translations[1]?.name || name}
                            fill
                            className="transition-transform duration-300 object-fill"
                            placeholder="blur"
                            blurDataURL="/placeholder.svg?height=300&width=300"
                            priority
                            onLoad={() => setImageLoaded(true)}
                          />
                        </motion.div>
                      )
                    }
                  })()}
                </motion.div>
              {/* )} */}
            </AnimatePresence>

            {/* Heart button above photo */}
            {showSwitchHeart && (
              <motion.button
                type="button"
                className="absolute top-2 right-2 z-10  backdrop-blur-sm  rounded-full p-2 bg-transparent hover:bg-white/90 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleAddWishItem()
                }}
                variants={heartVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                animate={switchHeart ? "liked" : "initial"}
              >
                <Heart
                  className={`h-4 w-4 transition-colors -mt-1 ${
                    switchHeart ? "text-red-500 fill-current" : "text-muted-foreground"
                  }`}
                />
              </motion.button>
            )}

            {/* Badges */}
            <motion.div className="absolute left-2 top-2 flex flex-col gap-1" variants={badgeVariants}>
              <Badge className="bg-accent-orange text-white capitalize">{t(status_item)}</Badge>
            </motion.div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-3">
            {/* Title */}
            <motion.h3
              className="mb-1 line-clamp-1 overflow-ellipsis text-sm font-medium capitalize"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {(!isRTL ? translations[0]?.name: translations[1]?.name) || name}
            </motion.h3>

            {/* Price */}
            <motion.div className="mb-1 " variants={priceVariants}>
              <div className="flex items-baseline gap-1">
                <motion.span className="text-lg font-bold line-clamp-1 text-secondary2">
                  {Number(price).toLocaleString('en-US')} {t("LE") || "LE"}
                </motion.span>
              </div>
            </motion.div>

            {/* ------------------------------------------ */}
           
            <motion.div className="mb-1 " variants={priceVariants}>
              <div className="flex items-baseline gap-1">
                <motion.span className="text-sm  line-clamp-1 text-gray-400">
                 {new Date(date_created).toLocaleDateString('en-US')}
                </motion.span>
              </div>
            </motion.div>
            <motion.div className="mb-1 " variants={priceVariants}>
              <div className="flex items-baseline gap-1">
                <motion.span className="text-sm  line-clamp-1 text-gray-400" >
                {(!isRTL ? translations[0]?.city: translations[1]?.city) || city},
                {(!isRTL ? translations[0]?.street: translations[1]?.street) || street}
                
                </motion.span>
              </div>
            </motion.div>
         
           
           
            {/* Swap button */}
            <motion.div
              className="mt-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <motion.div
                variants={buttonVariants}
                animate={isAddingToCart ? "loading" : "idle"}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  className="w-full bg-primary-yellow text-gray-800 hover:bg-primary-orange hover:text-white transition-colors"
                  size="sm"
                  onClick={(e) => makeSwap(e)}
                  disabled={isAddingToCart || isAddedToCart}
                >
                  <AnimatePresence mode="wait">
                    {isAddingToCart ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1"
                      >
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        {t("requesting")}
                      </motion.span>
                    ) : isAddedToCart ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1"
                      >
                        <Check className="h-4 w-4" />
                        {t("requested")}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="swap"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1"
                      >
                        <Repeat className="h-4 w-4" />
                        {t("swap")}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
