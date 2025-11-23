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
import { decodedToken, getCookie  , setTarget , removeTarget} from "@/callAPI/utiles"
import { getMediaType } from "@/lib/utils"
import { useLanguage } from "@/lib/language-provider"
import { checkUserHasProducts, getKYC } from "@/callAPI/users"
import { mediaURL } from "@/callAPI/utiles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"

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
  const [showSwapDialog, setShowSwapDialog] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { isRTL, toggleLanguage } = useLanguage()

  const { t } = useTranslations()
  const { toast } = useToast()
  const router = useRouter()




  // const makeSwap = async (e) => {
  //   e.preventDefault()
  //   e.stopPropagation()
  //   const token = await getCookie()
  //   const decoded = await decodedToken(token)
  //   if (token) {
  //     const kyc = await getKYC(decoded.id) /// ------------- take id user
  //     if (kyc.data === false) {
  //       setShowSwapDialog(true)
  //     }
  //     else {
  //       router.push(`/swap/${id}`)
  //     }
  //   } else {
  //   await setTarget({})
  //     toast({
  //       title: t("faildSwap") || "Failed Swap",
  //       description: t("DescFaildSwapLogin") ||  "Invalid swap without login. Please try to login.",
  //       variant: "default",
  //     })
  //     router.push(`/auth/login`)
  //   }
  // }


  const makeSwap = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const token = await getCookie()
    const decoded = await decodedToken()
    await setTarget(id)

    try{
      // check user exsit
      if (token) {
        const kyc = await getKYC(decoded.id) /// ------------- take id user
        const makeCheckUserHasProducts = await checkUserHasProducts(decoded.id)
        if (kyc.data === false) {
          toast({
            title: t("faildSwap") || "Failed Swap",
            description: t("DescFaildSwapKYC") || "Required information for swap. Please complete your information.",
            variant: "default",
          })
          router.push(`/profile/settings/editProfile`)
        }
        else {
          if(makeCheckUserHasProducts.count > 0){
            router.push(`/swap/${id}`)
            await removeTarget()
          }
          else{
            toast({
              title: t("addItem") || "Add Item",
              description: t("addItemToMakeSwapSesc") || "Please add new product to make swap with it",
              variant: "default",
            })
            router.push(`/profile/settings/editItem/new`)
          }
        }
      } else {
        toast({
          title: t("faildSwap") || "Failed Swap",
          description: t("DescFaildSwapLogin") ||   "Invalid swap without login. Please try to login.",
          variant: "default",
        })
        router.push(`/auth/login`)
      }
    }catch(error){
// console,log(error , "error in swap operation")
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

    <>
     <motion.div 
       variants={cardVariants} 
       initial="hidden" 
       animate="visible" 
       className="group h-full relative z-10 snap-center snap-always flex-shrink-0 w-[70vw] xs:w-[260px] sm:w-[280px] md:w-[280px] lg:w-[300px] max-w-[300px]"
       onHoverStart={() => setIsHovered(true)}
       onHoverEnd={() => setIsHovered(false)}
     >
      
      <Link href={`/products/out_offer/${id}`}>
        <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-background dark:bg-background/20 shadow-sm hover:shadow-md hover:border-primary dark:hover:border-primary transition-all duration-300">
          {/* Image container */}
          <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
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
                      url: `${mediaURL}${images[0]?.directus_files_id.id}`
                    }
                    const mediaType = getMediaType(mediaUrl.type)
                    
                    if (mediaType === 'video') {
                      return (
                        <div className="w-full h-full relative">
                          <video
                            src={mediaUrl.url}
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
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
                        </div>
                      )
                    } else if (mediaType === 'audio') {
                      return (
                        <div className="w-full h-full relative bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-110">
                          <div className="text-center text-white">
                            <div className="text-4xl mb-2">🎵</div>
                            <div className="text-sm font-medium">Audio File</div>
                          </div>
                          <audio
                            src={mediaUrl.url}
                            className="hidden"
                            onLoadedData={() => setImageLoaded(true)}
                          />
                        </div>
                      )
                    } else {
                      return (
                        <Image
                          src={mediaUrl.url || "/placeholder.svg"}
                          alt={!isRTL ? translations[0]?.name: translations[1]?.name || name}
                          fill
                          sizes="(max-width: 640px) 90vw, (max-width: 768px) 260px, (max-width: 1024px) 280px, 300px"
                          quality={90}
                          className="transition-transform duration-500 ease-out  group-hover:scale-105"
                          onLoad={() => setImageLoaded(true)}
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                      )
                    }
                  })()}
                </motion.div>
              {/* )} */}
            </AnimatePresence>

            {/* Heart button above photo */}
            {showSwitchHeart &&  (
              <motion.button
                type="button"
                className="absolute top-3 right-3 z-10 backdrop-blur-md rounded-full p-2.5 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-lg"
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
                  className={`h-5 w-5 transition-all duration-300 ${
                    switchHeart ? "text-red-500 fill-current scale-110" : "text-gray-600 dark:text-gray-300"
                  }`}
                />
              </motion.button>
            )}

            {/* Badges */}
            <motion.div className="absolute left-3 top-3 flex flex-col gap-2" variants={badgeVariants}>
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white capitalize shadow-md px-3 py-1 text-xs font-semibold">
                {t(status_item)}
              </Badge>
            </motion.div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-4 gap-2">
            {/* Title */}
            <motion.h3
              className="mb-0 line-clamp-2 text-sm lg:text-base font-semibold capitalize leading-tight text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {(!isRTL ? translations[0]?.name: translations[1]?.name) || name}
            </motion.h3> 

            {/* Price */}
            <motion.div className="mb-1" variants={priceVariants}>
              <div className="flex items-baseline gap-2">
                <motion.span className="text-xl lg:text-2xl font-bold line-clamp-1 text-primary">
                  {Number(price).toLocaleString('en-US')}
                </motion.span>
                <motion.span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("LE") || "LE"}
                </motion.span>
              </div>
            </motion.div>

            {/* Date and Location */}
            <div className="flex flex-col gap-1.5">
              <motion.div className="flex items-center gap-1.5" variants={priceVariants}>
                <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <motion.span className="text-xs line-clamp-1 text-gray-500 dark:text-gray-400">
                  {new Date(date_created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </motion.span>
              </motion.div>
              
              {(() => {
                const isValidLocation = (val) => {
                  if (!val) return false;
                  if (typeof val !== 'string') return false;
                  const lower = val.trim().toLowerCase();
                  return (
                    lower !== 'unknown' && 
                    lower !== 'street not specified' && 
                    lower !== 'not specified' && 
                    !lower.includes('object')
                  );
                };

                const rawCity = (!isRTL ? translations?.[0]?.city : translations?.[1]?.city) || city;
                const rawStreet = (!isRTL ? translations?.[0]?.street : translations?.[1]?.street) || street;
                
                const displayCity = isValidLocation(rawCity) ? rawCity : null;
                const displayStreet = isValidLocation(rawStreet) ? rawStreet : null;
                
                const locationString = [displayCity, displayStreet].filter(Boolean).join(', ');

                if (!locationString) return null;

                return (
                  <motion.div className="flex items-center gap-1.5" variants={priceVariants}>
                    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <motion.span className="text-xs line-clamp-1 text-gray-500 dark:text-gray-400">
                      {locationString}
                    </motion.span>
                  </motion.div>
                );
              })()}
            </div>
         
           
           
            {/* Swap button */}
            <motion.div
              className="mt-auto pt-2"
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
                  className="w-full bg-primary text-white font-semibold hover:bg-primary/90 hover:shadow-lg transition-all duration-300 rounded-xl h-10"
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
                        className="flex items-center gap-2"
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
                        className="flex items-center gap-2"
                      >
                        <Check className="h-5 w-5" />
                        {t("requested")}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="swap"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Repeat className="h-5 w-5" />
                        {t("swap")}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Green hover overlay at bottom of card */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none rounded-b-2xl"
              />
            )}
          </AnimatePresence>
        </div>
      </Link>
    </motion.div>
    
{/* alert to complet your profile to make swap */}
    
  <Dialog open={showSwapDialog}>
    <DialogContent>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <DialogHeader>
          <DialogTitle>{t("completeYourProfile") || "Complete your profile"}</DialogTitle>
          <DialogDescription>
            {t("DescFaildSwapKYC") || "Required information for swap. Please complete your profile."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <DialogClose asChild>
            <Button
              variant="secondary"
              className="mx-2"
              onClick={() => {router.push('/profile/settings/editProfile') ; setShowSwapDialog(true) }}
            >
              {t("Complete") || "Complete"}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button className="mx-2" variant="destructive" onClick={() => setShowSwapDialog(false)}>
              {t("Cancel") || "Cancel"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </motion.div>
    </DialogContent>
  </Dialog>
 
    </>
   
  )
}
