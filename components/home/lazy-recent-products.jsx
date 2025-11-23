
 "use client"
import { useCallback } from "react"
import { motion } from "framer-motion"
import { getProducts } from "@/callAPI/products"
import { ProductCarousel } from "@/components/products/product-carousel"
import { ProductList } from "@/components/products/product-list"
import { useProductsLoader } from "@/hooks/use-products-loader"

/**
 * Recent Products Section Component
 * Displays most recently added products with lazy loading
 * Follows best practices: DRY, separation of concerns, custom hooks
 */
const LazyRecentProducts = ({ showSwitchHeart, t }) => {
  // Memoized fetch function to prevent recreating on each render
  const fetchRecentProducts = useCallback(
    () => getProducts({}, { sort: "-date_created", limit: 15 }),
    []
  )

  const { ref, products, isLoading, hasLoaded, error } = useProductsLoader(
    fetchRecentProducts,
    { threshold: 0.05, margin: "-50px" }
  )

  return (
    <motion.section
      ref={ref}
      className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-30 mt-8 md:mt-12"
      id="recent-products"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <ProductCarousel
        title={t("recentProducts")}
        viewAllHref="/products"
        viewAllLabel={t("viewAll")}
      >
        <ProductList
          products={products}
          isLoading={isLoading}
          hasLoaded={hasLoaded}
          error={error}
          showSwitchHeart={showSwitchHeart}
          t={t}
        />
      </ProductCarousel>
    </motion.section>
  )
}

export default LazyRecentProducts