"use client"
import { useCallback } from "react"
import { motion } from "framer-motion"
import { getProducts } from "@/callAPI/products"
import { ProductCarousel } from "@/components/products/product-carousel"
import { ProductList } from "@/components/products/product-list"
import { useProductsLoader } from "@/hooks/use-products-loader"

/**
 * Top Deals Section Component
 * Displays highest priced products as featured deals
 * Follows best practices: DRY, separation of concerns, custom hooks
 */
const LazyTopDeals = ({ showSwitchHeart, t }) => {
  const fetchTopDeals = useCallback(
    () => getProducts({}, { limit: 10, sort: "-price" }),
    []
  )

  const { ref, products, isLoading, hasLoaded } = useProductsLoader(
    fetchTopDeals,
    { threshold: 0.1, margin: "-100px" }
  )

  return (
    <motion.section
      ref={ref}
      className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-30"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
    >
      <ProductCarousel
        title={t("topDeals")}
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

export default LazyTopDeals