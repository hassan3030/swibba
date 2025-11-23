"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Heart, Share2 } from "lucide-react"

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export function ProductHeader({ 
  product, 
  isRTL, 
  t, 
  switchHeart, 
  onWishlistClick,
  onShareClick 
}) {
  return (
    <motion.div 
      variants={fadeInUp}
      className="mb-4 sm:mb-6 lg:mb-8"
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium flex-1 min-w-0 overflow-hidden scrollbar-none">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4 whitespace-nowrap">
            {t("home") || "Home"}
          </Link>
          {isRTL ? (
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/50 shrink-0" />
          ) : (
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/50 shrink-0" />
          )}
          <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4 whitespace-nowrap">
            {t("products") || "Products"}
          </Link>
          {isRTL ? (
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/50 shrink-0" />
          ) : (
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/50 shrink-0" />
          )}
          <Link href={`/categories/${product.category}`} className="text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4 capitalize whitespace-nowrap">
            {isRTL ? (product.translations[1]?.category || product.category) : (product.translations[0]?.category || product.category)}
          </Link>
          {product.brand && product.brand !== 'no_brand' && product.brand !== 'none' && product.brand !== '' && (
            <>
              {isRTL ? (
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/50 shrink-0" />
              ) : (
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/50 shrink-0" />
              )}
              <Link href={`/brands/${product.brand}`} className="text-foreground font-medium hover:text-primary transition-colors hover:underline underline-offset-4 capitalize whitespace-nowrap truncate max-w-[100px] sm:max-w-[200px]">
                {isRTL ? (product.translations[1]?.brand || product.brand) : (product.translations[0]?.brand || product.brand)}
              </Link>
            </>
          )}
        </nav>

        {/* Wishlist and Share Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Wishlist Icon */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onWishlistClick}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-background border border-border hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-all shadow-sm"
            aria-label="Add to wishlist"
          >
            <Heart className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 ${
              switchHeart ? "text-green-500 fill-current" : "text-muted-foreground"
            }`} />
          </motion.button>
          
          {/* Share Icon */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onShareClick}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-background border border-border hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-all shadow-sm"
            aria-label="Share product"
          >
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-primary transition-colors" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
