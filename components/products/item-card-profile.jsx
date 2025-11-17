"use client"

import { useEffect, useState, useCallback, memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Repeat, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { getMediaType } from "@/lib/utils"
import { getWishList, deleteWishList, addWishList } from "@/callAPI/swap"
import { decodedToken, getCookie, removeTarget, setTarget } from "@/callAPI/utiles"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { checkUserHasProducts, getKYC } from "@/callAPI/users"
import { mediaURL } from "@/callAPI/utiles";
  

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  hover: {
    y: -8,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

const imageVariants = {
  hover: {
    scale: 1.1,
    transition: {
      duration:0.9,
      ease: "easeInOut",
    },
  },
}

const heartVariants = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.2, 1] },
  transition: { duration: 0.3 },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
}

export function ItemCardProfile({
  id,
  name,
  price,
  value_estimate,
  description,
  images,
  status_item,
  status_swap,
  showbtn,
  translations,
  showSwitchHeart = true,
  LinkItemOffer,
}) {
  const { t } = useTranslations()
  const { toast } = useToast()
  const router = useRouter()
  const { isRTL, toggleLanguage } = useLanguage()

  // const [bigImage, setBigImage] = useState("")
  const [switchHeart, setSwitchHeart] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  let linkToItemOffer = LinkItemOffer ? `/products/in_offer/${id}` : `/products/out_offer/${id}`  // Advanced filter states

  // const getDataImage = async () => {
  //   try {
  //     const image = await getImageProducts(images)
  //     setBigImage(image.data[0].directus_files_id)
  //     setIsLoading(false)
  //   } catch (error) {
  //     // console.error("Error loading image:", error)
  //     setIsLoading(false)
  //   }
  // }

  // const makeSwap = async (e) => {
  //   e.preventDefault()
  //   e.stopPropagation()
  //   const token = await getCookie()
  //   const decoded = await decodedToken(token)
  //   if (token) {
  //     const kyc = await getKYC(decoded.id) /// ------------- take id user
  //     if (kyc.data === false) {
  //       toast({
  //         title: t("faildSwap") || "Failed Swap",
  //           description: t("DescFaildSwapKYC") || "Required information for swap. Please complete your information.",
  //           variant: "destructive",
  //       })
  //     }
  //     else {
  //       router.push(`/swap/${id}`)
  //     }
  //   }
  //   else {
  //      await setTarget(id)
  //     toast({
  //       title: t("faildSwap") || "Failed Swap",
  //       description: t("DescFaildSwapLogin") || "Invalid swap without login. Please try to login.",
  //       variant: "destructive",
  //     })
  //     router.push(`/auth/login`)
  //   }
  // }

  const makeSwap = useCallback(async (e) => {
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
   
  }, [id, t, toast, router])


 const handleGetWishItem = useCallback(async () => {
    try {
      const user = await decodedToken()
      const WishItem = await getWishList(user.id)
      if (WishItem.data && user.id) {
        const isItem = WishItem.data.find((i) => i.item_id == id) ? true : false
        setSwitchHeart(isItem)
      }
    } catch (error) {
      // console.error("Error getting wish item:", error)
    }
  }, [id])
  
  const handleAddWishItem = useCallback(async () => {
   try {
      const user = await decodedToken()
      const WishItem = await getWishList(user.id)
      const WishItemId = WishItem.data.filter((i) => i.item_id == id)
      if (WishItem.data && user.id) {
        const isItem = WishItem.data.find((i) => i.item_id == id)
        if (isItem) {
          await deleteWishList(WishItemId[0]?.id)
          setSwitchHeart(false)
          toast({
            title: t("successAddWish") || "Success",
            description: t("deletedWishDesc") || "Removed from wishlist",
          })
        } else {
          await addWishList(id, user.id)
          setSwitchHeart(true)
          toast({
            title: t("successAddWish") || "Success",
            description: t("successAddWishDesc") || "Added to wishlist successfully.",
          })
        }
      }
    } catch (error) {
      // console.error("Error updating wishlist:", error)
    }
  }, [id, t, toast])
   
  // useEffect(() => {
  //   getDataImage()
  // }, [])

  useEffect(() => {
    let isMounted = true
    
    if (isMounted && showSwitchHeart) {
      handleGetWishItem()
    }
    
    return () => {
      isMounted = false
    }
  }, [handleGetWishItem, showSwitchHeart])

  return (
    <Link href={linkToItemOffer}>
      <motion.div 
        variants={cardVariants}
        initial="hidden" 
        animate="visible" 
        whileHover="hover"
      >
        <Card className="group overflow-hidden w-[180px] h-[380px] flex flex-col border border-border/50 bg-card/95 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30">
          <div className="relative flex-shrink-0">
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
              <AnimatePresence>
               
                  <motion.div
       
                   whileHover="hover">
{(() => {
                      const mediaUrl ={
                        id: images[0]?.directus_files_id.id,
                        type: images[0]?.directus_files_id.type,
                        url: `${mediaURL}${images[0]?.directus_files_id.id}`
                      }
                      
                      const mediaType = getMediaType(mediaUrl.type)
                      
                      if (mediaType == 'video') {
                        return (
                          <div className="relative w-full h-full">
                            <video
                              src={mediaUrl.url}
                              className="w-full h-full object-cover transition-transform duration-300"
                              muted
                              loop
                              playsInline
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                              <div className="bg-white/90 rounded-full p-2 group-hover:scale-110 transition-transform">
                                <Play className="h-5 w-5 text-gray-800 fill-current" />
                              </div>
                            </div>
                          </div>
                        )
                      } else if (mediaType === 'audio') {
                        return (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="text-3xl mb-1">🎵</div>
                              <div className="text-xs font-medium">Audio</div>
                            </div>
                          </div>
                        )
                      } else {
                        return (
                          <Image
                            src={mediaUrl.url}
                            alt={!isRTL ? translations[0]?.name: translations[1]?.name || name}
                            fill
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 180px"
                            className="object-cover transition-transform duration-300"
                          />
                        )
                      }
                    })()}
                  </motion.div>
           
              </AnimatePresence>

              {/* Heart button */}
              {showSwitchHeart && (
                <motion.button
                  type="button"
                  className="absolute top-2 right-2 z-10 bg-white/20 backdrop-blur-md rounded-full p-2 hover:bg-white/30 transition-all shadow-lg border border-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleAddWishItem()
                  }}
                  variants={heartVariants}
                  animate={switchHeart ? "animate" : "initial"}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart
                    className={`h-5 w-5 transition-all duration-300 drop-shadow-md ${
                      switchHeart ? "text-red-500 fill-current" : "text-white"
                    }`}
                  />
                </motion.button>
              )}
            </div>

            <motion.div
              className="absolute left-2 top-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground hover:bg-primary shadow-lg border border-primary/20 capitalize">
                {t(status_item)}
              </Badge>
            </motion.div>
          </div>

          <CardContent className="p-3 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
            <motion.div
              className="flex items-start justify-between gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="line-clamp-1 text-base font-bold group-hover:text-primary transition-colors capitalize">{!isRTL ? (translations[0]?.name): (translations[1]?.name|| name) }</h3>
            </motion.div>

           

            <motion.p
              className="line-clamp-2 text-xs text-muted-foreground first-letter:capitalize leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              { (!isRTL ? translations[0]?.description: translations[1]?.description) || description}
            </motion.p>

            <motion.div
              className="flex items-center gap-1 text-sm font-bold text-primary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-xs text-muted-foreground font-normal">{t("price")}:</span>
              <span>{Number(price).toLocaleString('en-US')} {t("le")}</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-1 text-xs text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="font-medium">{t("aIExpectedPrice")}:</span>
              <span className="font-semibold text-secondary2">{Number(value_estimate).toLocaleString('en-US')} LE</span>
            </motion.div>
            </div>
          </CardContent>

          {/* Swap button */}
          {status_swap == "available" && showbtn && (
            <motion.div
              className="p-3 pt-0 flex-shrink-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  className="w-full bg-gradient-to-r from-primary-yellow to-primary-orange text-gray-900 font-semibold hover:from-primary-orange hover:to-primary-yellow shadow-md hover:shadow-lg transition-all"
                  size="sm"
                  onClick={(e) => {
                    makeSwap(e)
                  }}
                >
                  <Repeat className="h-4 w-4 mr-2" />
                  {t("swap")}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </Link>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(ItemCardProfile)
