"use client"
import { useCallback } from "react"
import { motion } from "framer-motion"
import { getProducts } from "@/callAPI/products"
import { ProductCarousel } from "@/components/products/product-carousel"
import { ProductList } from "@/components/products/product-list"
import { useProductsLoader } from "@/hooks/use-products-loader"

/**
 * Automotive Products Section Component
 * Displays automotive category products
 * Follows best practices: DRY, separation of concerns, custom hooks
 */
const LazyAutomativeProducts = ({ showSwitchHeart, t }) => {
  const fetchAutomotive = useCallback(
    () => getProducts({ category: "automotive" }, { sort: "-date_created", limit: 15 }),
    []
  )

  const { ref, products, isLoading, hasLoaded } = useProductsLoader(
    fetchAutomotive,
    { threshold: 0.1, margin: "-100px" }
  )

  // Don't render if no products and loading is complete
  if (hasLoaded && (!products || products.length === 0)) {
    return null
  }

  return (
    <motion.section
      ref={ref}
      className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-30 mt-6"
      id="automotive"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <ProductCarousel
        title={t("automotive")}
        viewAllHref="/products"
        viewAllLabel={t("viewAll")}
      >
        <ProductList
          products={products}
          isLoading={isLoading}
          hasLoaded={hasLoaded}
          showSwitchHeart={showSwitchHeart}
          t={t}
        />
      </ProductCarousel>
    </motion.section>
  )
}

export default LazyAutomativeProducts