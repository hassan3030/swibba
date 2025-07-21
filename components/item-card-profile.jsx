"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Repeat } from "lucide-react"
import { useRouter } from "next/navigation"
import { getImageProducts } from "@/callAPI/products"
import { getWishList, deleteWishList, addWishList } from "@/callAPI/swap"
import { decodedToken, getCookie } from "@/callAPI/utiles"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"

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
  category,
  showbtn,
  showSwitchHeart = true,
}) {
  const { t } = useTranslations()
  const { toast } = useToast()
  const router = useRouter()

  const [bigImage, setBigImage] = useState("")
  const [switchHeart, setSwitchHeart] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const getDataImage = async () => {
    try {
      const image = await getImageProducts(images)
      setBigImage(image.data[0].directus_files_id)
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading image:", error)
      setIsLoading(false)
    }
  }

  const makeSwap = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const token = await getCookie()

    if (token) {
      router.push(`/swap/${id}`)
    } else {
      toast({
        title: t("faildSwap") || "Failed Swap",
        description: t("DescFaildSwapLogin"),
        variant: "destructive",
      })
      router.push(`/auth/login`)
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
      console.error("Error getting wish item:", error)
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
      console.error("Error updating wishlist:", error)
    }
  }

  useEffect(() => {
    getDataImage()
  }, [])

  useEffect(() => {
    handleGetWishItem()
  }, [switchHeart])

  return (
    <Link href={`/products/${id}`}>
      <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
          <div className="relative">
            <div className="relative aspect-square overflow-hidden">
              <AnimatePresence>
                {isLoading ? (
                  <motion.div
                    className="absolute inset-0 bg-gray-200 animate-pulse"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                ) : (
                  <motion.div
                  //  variants={imageVariants} 
                   whileHover="hover">
                    <Image
                      src={`http://localhost:8055/assets/${bigImage}` || "/placeholder.svg"}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-300"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Heart button */}
              {showSwitchHeart && (
                <motion.button
                  type="button"
                  className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
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
              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 capitalize">{t(category)}</Badge>
            </motion.div>
          </div>

          <CardContent className="p-4">
            <motion.div
              className="mb-2 flex items-start justify-between gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="line-clamp-1 font-semibold group-hover:text-primary capitalize">{name}</h3>
            </motion.div>

            <motion.div
              className="flex items-center whitespace-nowrap text-sm font-semibold text-green-500 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="px-1">{t("aIExpectedPrice")}: </span>
              <span className="px-1"> LE</span>
              <span className="px-1"> {value_estimate}</span>
            </motion.div>

            <motion.p
              className="mb-3 line-clamp-1 text-sm text-muted-foreground first-letter:capitalize"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {description}
            </motion.p>

            <motion.div
              className="flex items-center whitespace-nowrap text-sm font-semibold text-green-500"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {t("price")}: {price}LE
            </motion.div>
          </CardContent>

          {/* Swap button */}
          {status_swap == "available" && showbtn && (
            <motion.div
              className="p-4 pt-0"
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
