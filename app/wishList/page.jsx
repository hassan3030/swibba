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
        // filter items by quantity > 0
        // const filteredItems = items.filter((item) => item.quantity > 0)
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
    return <LoadingSpinner branded fullPage />
  }

  return (
    <motion.div
      className="min-h-screen bg-background dark:bg-gray-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <motion.header
          className="flex items-center justify-between mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              variants={heartVariants}
              animate="beat"
            >
              <Heart className="h-6 w-6 text-destructive fill-current" />
            </motion.div>
            <motion.h1
              className="text-2xl md:text-3xl font-bold"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t("MyWishlist") || "My Wishlist"}
            </motion.h1>
          </div>
          <motion.div
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          >
            <span className="text-base font-bold text-primary-foreground">{wishlistItems.length}</span>
          </motion.div>
        </motion.header>

        {/* Divider */}
        <div className="mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {wishlistItems.length === 0 ? (
          <motion.div 
            className="text-center py-20 bg-card dark:bg-gray-900 rounded-xl border border-border" 
            variants={emptyStateVariants} 
            initial="hidden" 
            animate="visible"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6"
            >
              <Heart className="h-12 w-12 text-destructive" />
            </motion.div>
            <h3 className="text-2xl font-semibold mb-3">{t("Yourwishlistisempty") || "Your wishlist is empty"}</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {t("Startbrowsingandsaveitemsyouliketoswapfor") || " Start browsing and save items you'd like to swap for"}
            </p>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button asChild size="lg" className="rounded-full">
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
      </div>
    </motion.div>
  )
}

export default Wishlist
