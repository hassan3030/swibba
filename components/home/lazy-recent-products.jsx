
 "use client"
 import { useState, useEffect } from "react"
 import { motion, useAnimation } from "framer-motion"
 import { useInView } from "react-intersection-observer"
 import { getProducts } from "@/callAPI/products"
 import { SwibbaProductCardSkeleton } from "@/components/loading/swibba-product-card-skeleton"
 import { SwibbaProductCard } from "@/components/products/swibba-product-card"
 import { ProductCarousel } from "@/components/products/product-carousel"
 
// Lazy-loaded Recent Products Component
const LazyRecentProducts = ({ showSwitchHeart, t }) => {
    const [items, setItems] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)
    const [error, setError] = useState(null)
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 })
  
    useEffect(() => {
      if (inView && !hasLoaded) {
        setIsLoading(true)
        setError(null)
        const loadProducts = async () => {
          try {
            const prods = await getProducts({}, {"sort": "-date_created" , "limit": 15})
            setItems(prods.data)
            setHasLoaded(true)
          } catch (error) {
            setError(error)
            // console.error("Error loading products:", error)
          } finally {
            setIsLoading(false)
          }
        }
        loadProducts()
      }
    }, [inView, hasLoaded])
  
    return (
      <motion.section
        ref={ref}
        className="container relative z-30 mt-8 md:mt-12 px-4 md:px-6 lg:px-8"
        id="items"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-[1600px] mx-auto">
          <ProductCarousel 
            title={t("recentProducts")} 
            viewAllHref="/products" 
            viewAllLabel={t("viewAll")}
          > 
            {isLoading || !hasLoaded
              ? Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                  >
                    <SwibbaProductCardSkeleton />
                  </motion.div>
                ))
              : Array.isArray(items) && items.length > 0
                ? items.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: index * 0.08, 
                        duration: 0.5,
                        ease: "easeOut"
                      }}
                    >
                      <SwibbaProductCard {...product} showSwitchHeart={showSwitchHeart} />
                    </motion.div>
                  ))
                : !error && Array.from({ length: 8 }).map((_, i) => (
                    <motion.div key={`empty-${i}`}>
                      <SwibbaProductCardSkeleton />
                    </motion.div>
                  ))}
          </ProductCarousel>
          
          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="mb-4 text-6xl">😔</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("errorLoadingProducts") || "Error Loading Products"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("tryAgainLater") || "Please try again later"}
              </p>
            </motion.div>
          )}
          
          {/* Empty State */}
          {!isLoading && !error && hasLoaded && (!items || items.length === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="mb-4 text-6xl">📦</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("noProductsYet") || "No Products Yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("checkBackSoon") || "Check back soon for new items"}
              </p>
            </motion.div>
          )}
        </div>
      </motion.section>
    )
  }
  export default LazyRecentProducts