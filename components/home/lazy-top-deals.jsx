"use client"
import { useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { getProducts } from "@/callAPI/products"
import { SwibbaProductCardSkeleton } from "@/components/loading/swibba-product-card-skeleton"
import { SwibbaProductCard } from "@/components/products/swibba-product-card"
import { ProductCarousel } from "@/components/products/product-carousel"

// Lazy-loaded Top Deals Component
const LazyTopDeals = ({ showSwitchHeart, t }) => {
  const [topPrice, setTopPrice] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  useEffect(() => {
    if (inView && !hasLoaded) {
      setIsLoading(true)
      const loadTopDeals = async () => {
        try {
          const topPriceProds = await getProducts({}, {"limit": 10, "sort": "-price"})
          setTopPrice(topPriceProds.data)
          setHasLoaded(true)
        } catch (error) {
          // console.error("Error loading top deals:", error)
        } finally {
          setIsLoading(false)
        }
      }
      loadTopDeals()
    }
  }, [inView, hasLoaded])

  return (
    <motion.section
      ref={ref}
      className="container relative z-10"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
    >
      <div>
        <ProductCarousel title={t("topDeals")} viewAllHref="/products" viewAllLabel={t("viewAll")}>
          {isLoading || !hasLoaded
            ? Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <SwibbaProductCardSkeleton />
                </motion.div>
              ))
            : Array.isArray(topPrice) && topPrice.length > 0
              ? topPrice.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
                  >
                    <SwibbaProductCard {...product} showSwitchHeart={showSwitchHeart} />
                  </motion.div>
                ))
              : Array.from({ length: 6 }).map((_, i) => (
                  <motion.div key={i}>
                    <SwibbaProductCardSkeleton />
                  </motion.div>
                ))}
        </ProductCarousel>
      </div>
    </motion.section>
  )
}

export default LazyTopDeals