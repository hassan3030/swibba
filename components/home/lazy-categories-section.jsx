"use client"
import { useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { TrendingUp } from "lucide-react"
import { categories as fallbackCategories } from "@/lib/data" // Fallback categories
import { CategoryCard } from "@/components/products/category-card"
import { CategoryCardSkeleton } from "@/components/loading/category-card-skeleton"
import { useInView } from "react-intersection-observer"




// Enhanced Animation variants 
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  }
  
  
  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8,
      },
    },
  }
  
  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

// Lazy-loaded Categories Section Component
const LazyCategoriesSection = ({ t, categories = [], categoriesNames = [] }) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasLoaded, setHasLoaded] = useState(false)
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
    
    // Use API categories or fallback to static categories
    const displayCategories = categories.length > 0 ? categories.map(category => ({
      name: category.name,
      imageSrc: `https://deel-deal-directus.csiwm3.easypanel.host/assets/${category.main_image?.id}`,
      translations: category.translations || [],
      cat_levels: category.cat_levels || null,
    })) : fallbackCategories.map(category => ({
      ...category,
      translations: [] // Add empty translations array for fallback categories
    }))
  
    useEffect(() => {
      if (inView && !hasLoaded) {
        // Simulate loading time for categories (they're static data)
        const timer = setTimeout(() => {
          setIsLoading(false)
          setHasLoaded(true)
        }, 500)
        return () => clearTimeout(timer)
      }
    }, [inView, hasLoaded])
  
    return (
      <motion.section ref={ref} className="container pt-24 relative z-10">
        <motion.div className="text-center" variants={titleVariants} initial="hidden" animate="visible">
          <motion.div
            className="inline-flex items-center gap-2 px-4 rounded-full bg-primary/10 text-primary mb-2"
            variants={floatingVariants}
            animate="animate"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">{t('PopularCategories')||'Popular Categories'}</span>
          </motion.div>
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6 text-primary"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {t('BrowseCategories')||'Browse Categories'}
          </motion.h2>
          <motion.p
            className="text max-w-2xl mx-auto text-lg pb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {t('Discoveramazingitemsacrossvariouscategoriesandfindexactlywhatyourelookingfor') || "Discover amazing items across various categories and find exactly what you're looking for"}
          </motion.p>
        </motion.div>
  
        {/* Mobile Layout: 2-1-2 pattern for 5 categories */}
        <div className="block md:hidden">
          <motion.div
            className="grid gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* First row: 2 cards */}
            <div className="grid grid-cols-2 gap-2">
              {isLoading || !hasLoaded
                ? Array.from({ length: 2 }).map((_, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      whileHover={{ y: -10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <CategoryCardSkeleton />
                    </motion.div>
                  ))
                : displayCategories.slice(0, 2).map((category, index) => (
                    <motion.div
                      key={category.name}
                      variants={itemVariants}
                      custom={index}
                      whileHover={{
                        y: -15,
                        scale: 1.05,
                        rotateY: 5,
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <CategoryCard {...category} showCategoryLevels={false} />
                    </motion.div>
                  ))}
            </div>
  
            {/* Second row: 1 centered card */}
            <div className="flex justify-center">
              <div className="w-1/2">
                {isLoading || !hasLoaded ? (
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <CategoryCardSkeleton />
                  </motion.div>
                ) : displayCategories.length > 2 ? (
                  <motion.div
                    key={displayCategories[2].name}
                    variants={itemVariants}
                    custom={2}
                    whileHover={{
                      y: -15,
                      scale: 1.05,
                      rotateY: 5,
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                      <CategoryCard {...displayCategories[2]} showCategoryLevels={false} />
                  </motion.div>
                ) : null}
              </div>
            </div>
  
            {/* Third row: 2 cards */}
            <div className="grid grid-cols-2 gap-2">
              {isLoading || !hasLoaded
                ? Array.from({ length: 2 }).map((_, i) => (
                    <motion.div
                      key={i + 3}
                      variants={itemVariants}
                      whileHover={{ y: -10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <CategoryCardSkeleton />
                    </motion.div>
                  ))
                : displayCategories.slice(3, 5).map((category, index) => (
                    <motion.div
                      key={category.name}
                      variants={itemVariants}
                      custom={index + 3}
                      whileHover={{
                        y: -15,
                        scale: 1.05,
                        rotateY: 5,
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <CategoryCard {...category} showCategoryLevels={false} />
                    </motion.div>
                  ))}
            </div>
          </motion.div>
        </div>
  
        {/* Desktop Layout: Grid */}
        <motion.div
          className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading || !hasLoaded
            ? Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <CategoryCardSkeleton />
                </motion.div>
              ))
            : displayCategories.slice(0, 10).map((category, index) => (
                <motion.div
                  key={category.name}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{
                    y: -15,
                    scale: 1.05,
                    rotateY: 5,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <CategoryCard {...category} showCategoryLevels={false} />
                </motion.div>
              ))}
        </motion.div>
      </motion.section>
    )
  }

  export default LazyCategoriesSection