"use client"

import { useEffect, useState } from "react"
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
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  hover: {
    y: -5,
    scale: 1.02,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    transition: {
      duration: 0.2,
      ease: "easeInOut",
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
      const WishItem = await getWishList(user.id)
      if (WishItem.data && user.id) {
        const isItem = WishItem.data.find((i) => i.item_id == id) ? true : false
        setSwitchHeart(isItem)
      }
    } catch (error) {
      // console.error("Error getting wish item:", error)
    }
  }
  const handleAddWishItem = async () => {
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
  }
   
  // useEffect(() => {
  //   getDataImage()
  // }, [])

  useEffect(() => {
    handleGetWishItem()
    // console.log("i am in the item card profile images", images)
    // console.log("i am in the item card profile images", images[0]?.directus_files_id)
  }, [switchHeart])

  return (
    <Link href={linkToItemOffer}>
      <motion.div  initial="hidden" animate="visible" whileHover="hover">
        <Card className="overflow-hidden w-[150px] transition-all duration-200 hover:shadow-md ">
          <div className="relative">
            <div className="relative aspect-square overflow-hidden">
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
                            placeholder="blur"
                            blurDataURL="/placeholder.svg?height=300&width=300"
                            priority
                            // onLoad={() => setImageLoaded(true)}
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
                  className="absolute top-2 right-2 z-10 bg-transparent backdrop-blur-sm rounded-full p-2 hover:scale-105 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleAddWishItem()
                  }}
                  variants={heartVariants}
                  animate={switchHeart ? "animate" : "initial"}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${
                      switchHeart ? "text-red-500 fill-current" : "text-muted-foreground"
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
              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 capitalize">{t(status_item)}</Badge>
            </motion.div>
          </div>

          <CardContent className="p-2">
            <motion.div
              className="mb-1 flex items-start justify-between gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="line-clamp-1 overflow-ellipsis font-semibold group-hover:text-primary capitalize">{!isRTL ? (translations[0]?.name): (translations[1]?.name|| name) }</h3>
            </motion.div>

           

            <motion.p
              className="mb-1 line-clamp-1 overflow-ellipsis text-sm text-muted-foreground first-letter:capitalize"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              { (!isRTL ? translations[0]?.description: translations[1]?.description) || description}
            </motion.p>

            <motion.div
              className="flex items-center max-w-[150px] line-clamp-1 overflow-hidden whitespace-nowrap text-sm font-semibold text-secondary2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {t("price")}:{Number(price).toLocaleString('en-US')} {t("le")}
            </motion.div>

            <motion.div
              className="flex items-center whitespace-nowrap text-sm font-semibold text-secondary2/90 mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span>{t("aIExpectedPrice")}:</span>
              <span className=" overflow-ellipsis">{Number(value_estimate).toLocaleString('en-US')} LE</span>
            </motion.div>
          </CardContent>

          {/* Swap button */}
          {status_swap == "available" && showbtn && (
            <motion.div
              className="p-2 pt-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  className="w-full bg-primary-yellow text-gray-800 hover:bg-primary-orange hover:text-white transition-colors"
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
