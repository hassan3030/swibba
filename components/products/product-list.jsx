import { motion } from "framer-motion"
import { SwibbaProductCardSkeleton } from "@/components/loading/swibba-product-card-skeleton"
import { SwibbaProductCard } from "@/components/products/swibba-product-card"

/**
 * Shared product list renderer with consistent animations
 * Handles loading, error, and empty states
 */

const SKELETON_COUNT = 8
const ANIMATION_STAGGER = 0.08

export function ProductList({ products, isLoading, hasLoaded, error, showSwitchHeart, t }) {
  // Loading state
  if (isLoading || !hasLoaded) {
    return (
      <>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <motion.div
            key={`skeleton-${i}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * ANIMATION_STAGGER, duration: 0.4 }}
          >
            <SwibbaProductCardSkeleton />
          </motion.div>
        ))}
      </>
    )
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="mb-4 text-6xl">😔</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {t?.("errorLoadingProducts") || "Error Loading Products"}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t?.("tryAgainLater") || "Please try again later"}
        </p>
      </motion.div>
    )
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="mb-4 text-6xl">📦</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {t?.("noProductsYet") || "No Products Yet"}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {t?.("checkBackSoon") || "Check back soon for new items"}
        </p>
      </motion.div>
    )
  }

  // Products list
  return (
    <>
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: index * ANIMATION_STAGGER,
            duration: 0.5,
            ease: "easeOut",
          }}
        >
          <SwibbaProductCard {...product} showSwitchHeart={showSwitchHeart} />
        </motion.div>
      ))}
    </>
  )
}
