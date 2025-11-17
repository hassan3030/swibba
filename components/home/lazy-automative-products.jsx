"use client"
import { useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { getProducts } from "@/callAPI/products"
import { SwibbaProductCardSkeleton } from "@/components/loading/swibba-product-card-skeleton"
import { SwibbaProductCard } from "@/components/products/swibba-product-card"
import { ProductCarousel } from "@/components/products/product-carousel"
// Lazy-loaded Automative Products Component
const LazyAutomativeProducts = ({ showSwitchHeart, t }) => {
    const [items, setItems] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  
    useEffect(() => {
      if (inView && !hasLoaded) {
        setIsLoading(true)
        const loadProducts = async () => {
          try {
            const prods = await getProducts({"category":"automotive"}, {"sort": "-date_created" , "limit": 15})
            setItems(prods.data)
            setHasLoaded(true)
          } catch (error) {
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
        className="container relative z-10 mt-6"
        id="items"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div>
          <ProductCarousel title={t("automotive")} viewAllHref="/products" viewAllLabel={t("viewAll")}> 
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
              : Array.isArray(items) && items.length > 0
                ? items.map((product, index) => (
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

  export default LazyAutomativeProducts