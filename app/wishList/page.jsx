"use client"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, ArrowLeft } from "lucide-react"
import { getWishList, deleteWishList } from "@/callAPI/swap"
import { getProductById } from "@/callAPI/products"
import { decodedToken } from "@/callAPI/utiles"
import { useTranslations } from "@/lib/use-translations"
import LoadingSpinner from '@/components/loading/loading-spinner'
import WishlistCard from "@/components/wishlist/wishlist-card"
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

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
}

const heartVariants = {
  beat: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 1,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

const emptyStateVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslations()

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true)
      try {
        const user = await decodedToken()
        if (!user?.id) return setWishlistItems([])
        const wishList = await getWishList(user.id)

        const items = await Promise.all(
          wishList.data.map(async (wish) => {
            const product = await getProductById(wish.item_id)

            return {
              wishlist_id: wish.id,
              images: product.data.images,
              id: product.data.id,
              name: product.data.name,
              category: product.data.category,
              description: product.data.description,
              status_swap: product.data.status_swap,
              quantity: product.data.quantity,
              price: product.data.price,
              translations: product.data.translations,
              dateAdded: new Date(wish.date_created).toLocaleDateString('en-US'),
            }
          }),
        )
        setWishlistItems(items)
      } catch (err) {
        setWishlistItems([])
      }
      setLoading(false)
    }
    fetchWishlist()
  }, [])

  const removeFromWishlist = async (wishlistId) => {
    await deleteWishList(wishlistId)
    setWishlistItems((prev) => prev.filter((item) => item.wishlist_id !== wishlistId))
  }

  if (loading) {
    return <LoadingSpinner/>
  }

  return (
    <motion.div
      className="container mx-auto py-8 px-4 max-w-6xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.header
        className="flex items-center justify-between mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button variant="outline" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
          <div>
            <motion.h1
              className="text-3xl font-bold"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t("MyWishlist") || "My Wishlist"}
            </motion.h1>
            <motion.p
              className="text-muted-foreground"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {wishlistItems.length} {wishlistItems.length === 1 ? t("item") || "item" : t("items") || "items"}{" "}
              {t("saved") || "saved"}
            </motion.p>
          </div>
        </div>
        <motion.div variants={heartVariants} animate="beat">
          <Heart className="h-8 w-8 text-destructive fill-current" />
        </motion.div>
      </motion.header>

      {wishlistItems.length === 0 ? (
        <motion.div className="text-center py-16" variants={emptyStateVariants} initial="hidden" animate="visible">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-2">{t("Yourwishlistisempty") || "Your wishlist is empty"}</h3>
          <p className="text-muted-foreground mb-6">
            {t("Startbrowsingandsaveitemsyouliketoswapfor") || " Start browsing and save items you'd like to swap for"}
          </p>
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button asChild>
              <Link href="/products">{t("BrowseProducts") || "Browse Products"}</Link>
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.wishlist_id}
                variants={cardVariants}
                layout
                layoutId={`wishlist-${item.wishlist_id}`}
                custom={index}
              >
                <WishlistCard item={item} onRemove={removeFromWishlist} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}

export default Wishlist
