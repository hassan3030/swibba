"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { categories as fallbackCategories } from "@/lib/data" // Fallback categories
import { CategoryCard } from "@/components/products/category-card"
import { CategoryCardSkeleton } from "@/components/loading/category-card-skeleton"
import { useInView } from "react-intersection-observer"
import { mediaURL } from "@/callAPI/utiles"
import Link from "next/link"




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


const LazyCategoriesSection = ({ t, categories = [], categoriesNames = [] }) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasLoaded, setHasLoaded] = useState(false)
    const [ref, inView] = useInView({ 
      triggerOnce: true, 
      threshold: 0.1,
      rootMargin: '50px' // Start loading slightly before component is visible
    })
    
    // Memoize display categories to prevent unnecessary recalculations
    const displayCategories = useMemo(() => {
      if (categories.length > 0) {
        return categories.map(category => ({
          name: category.name,
          imageSrc: `${mediaURL}${category.main_image?.id}`,
          translations: category.translations || [],
          cat_levels: category.cat_levels || null,
        }))
      }
      
      return fallbackCategories.map(category => ({
        ...category,
        translations: [], // Add empty translations array for fallback categories
      }))
    }, [categories])
  
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
      <motion.section ref={ref} className="relative py-20 overflow-hidden z-10">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16 max-w-3xl mx-auto" 
            variants={titleVariants} 
            initial="hidden" 
            animate={inView ? "visible" : "hidden"}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 text-primary mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
            <Link href="/categories" className="inline-flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase">{t('PopularCategories') || 'Popular Categories'}</span>
            </Link>
            </motion.div>
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text "
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {t('BrowseCategories') || 'Browse Categories'}
            </motion.h2>
            <motion.p
              className="text-lg text-muted-foreground  mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {t('Discoveramazingitemsacrossvariouscategoriesandfindexactlywhatyourelookingfor') || "Discover amazing items across various categories and find exactly what you're looking for"}
            </motion.p>
          </motion.div>
  
          {/* Mobile Layout: 2-1-2 pattern for 5 categories */}
          <div className="block md:hidden">
            <motion.div
              className="grid gap-5"
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              {/* First row: 2 cards */}
              <div className="grid grid-cols-2 gap-5">
                {isLoading || !hasLoaded
                  ? Array.from({ length: 2 }).map((_, i) => (
                      <motion.div
                        key={`mobile-skeleton-row1-${i}`}
                        variants={itemVariants}
                      >
                        <CategoryCardSkeleton />
                      </motion.div>
                    ))
                  : displayCategories.slice(0, 2).map((category, index) => (
                      <motion.div
                        key={`mobile-category-row1-${category.name}`}
                        variants={itemVariants}
                        custom={index}
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
                      key="mobile-skeleton-row2"
                      variants={itemVariants}
                    >
                      <CategoryCardSkeleton />
                    </motion.div>
                  ) : displayCategories.length > 2 ? (
                    <motion.div
                      key={`mobile-category-row2-${displayCategories[2].name}`}
                      variants={itemVariants}
                      custom={2}
                    >
                        <CategoryCard {...displayCategories[2]} showCategoryLevels={false} />
                    </motion.div>
                  ) : null}
                </div>
              </div>
    
              {/* Third row: 2 cards */}
              <div className="grid grid-cols-2 gap-5">
                {isLoading || !hasLoaded
                  ? Array.from({ length: 2 }).map((_, i) => (
                      <motion.div
                        key={`mobile-skeleton-row3-${i}`}
                        variants={itemVariants}
                      >
                        <CategoryCardSkeleton />
                      </motion.div>
                    ))
                  : displayCategories.slice(3, 5).map((category, index) => (
                      <motion.div
                        key={`mobile-category-row3-${category.name}`}
                        variants={itemVariants}
                        custom={index + 3}
                      >
                        <CategoryCard {...category} showCategoryLevels={false} />
                      </motion.div>
                    ))}
              </div>
            </motion.div>
          </div>
  
            {/* Desktop Layout: Grid */}
          <motion.div
            className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-7"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {isLoading || !hasLoaded
              ? Array.from({ length: 10 }).map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    variants={itemVariants}
                  >
                    <CategoryCardSkeleton />
                  </motion.div>
                ))
              : displayCategories.slice(0, 10).map((category, index) => (
                  <motion.div
                    key={`category-${category.name}`}
                    variants={itemVariants}
                    custom={index}
                  >
                    <CategoryCard {...category} showCategoryLevels={false} />
                  </motion.div>
                ))}
          </motion.div>
        </div>
      </motion.section>
    )
  }

  export default LazyCategoriesSection