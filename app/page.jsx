"use client"

import { useEffect, useState } from "react"
import { motion, useAnimation, useScroll, useTransform } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Users, ShieldCheck, Package, Sparkles, TrendingUp } from "lucide-react"
import  FloatingActionButton  from "@/components/floating-action-button"
import { categories } from "@/lib/data"

import { ProductCarousel } from "@/components/product-carousel"
import { SwibbaProductCardSkeleton } from "@/components/swibba-product-card-skeleton"
import { SwibbaProductCard } from "@/components/swibba-product-card"
import { CategoryCard } from "@/components/category-card"
import { CategoryCardSkeleton } from "@/components/category-card-skeleton"
import { useLanguage } from "@/lib/language-provider"
import { useTranslations } from "@/lib/use-translations"
import { getProducts } from "@/callAPI/products"
import {getAllUsers} from "@/callAPI/users"
import { getCookie } from "@/callAPI/utiles"
import HeroSection from "@/components/hero-section"
import LoadingSpinner from "@/components/loading-spinner"
import { AnimatedCounter } from "@/components/animated-counter"

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

const statsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.4,
    },
  },
}

const statsItemVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 12,
      duration: 0.8,
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

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

const shimmerVariants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    },
  },
}

// Lazy-loaded Stats Section Component
const LazyStatsSection = ({ t }) => {
  const [itemsCount, setItemsCount] = useState(0)
  const [usersCount, setUsersCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const controls = useAnimation()

  useEffect(() => {
    if (inView && !hasLoaded) {
      setIsLoading(true)
      const loadStats = async () => {
        try {
          const products = await getProducts()
          const users = await getAllUsers()
          setItemsCount(products.count || 0)
          setUsersCount(users.count || 0)
          setHasLoaded(true)
          controls.start("visible")
        } catch (error) {
        } finally {
          setIsLoading(false)
        }
      }
      loadStats()
    }
  }, [inView, hasLoaded, controls])

  return (
    <motion.section
      ref={ref}
      className="container pt-4 relative z-10"
      variants={statsContainerVariants}
      initial="hidden"
      animate={controls}
    >
      <motion.div
        className="text-center mb-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4"
          variants={pulseVariants}
          animate="animate"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">{t('TrustedPlatform') || 'Trusted Platform'}</span>
        </motion.div>
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-center mb-2"
          variants={shimmerVariants}
          animate="animate"
        >
          {t('JoinThousandsofHappySwapers') || 'Join Thousands of Happy Swapers'}
        </motion.h2>
      </motion.div>

      <div className="grid grid-cols-3 gap-6 md:gap-12">
        <motion.div
          className="flex flex-col items-center justify-center text-center group"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <motion.div className="flex items-center justify-center mb-6 relative" variants={statsItemVariants}>
            <motion.div
              className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div  
              className="relative z-10 p-4 rounded-full bg-primary shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Users className="h-8 w-8 md:h-12 md:w-12 text-white" />
            </motion.div>
          </motion.div>
          {isLoading || !hasLoaded ? (
            <div className="text-4xl md:text-6xl font-bold bg-secondary bg-clip-text text-transparent">
              ---
            </div>
          ) : (
            <AnimatedCounter
              value={Number(usersCount)}
              className="text-4xl md:text-6xl font-bold bg-secondary bg-clip-text text-transparent"
            />
          )}
          <motion.div
            className="text-sm md:text-base text-muted-foreground mt-3 font-medium"
            variants={statsItemVariants}
          >
            {t('ActiveSwapers')|| 'Swapers'}
          </motion.div>
          <motion.div
            className="w-12 h-1 bg-secondary rounded-full mt-2"
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ delay: 1, duration: 0.8 }}
          />
        </motion.div>

        <motion.div
          className="flex flex-col items-center justify-center text-center group"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <motion.div className="flex items-center justify-center mb-6 relative" variants={statsItemVariants}>
            <motion.div
              className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
            <motion.div
              className="relative z-10 p-4 rounded-full bg-primary shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <ShieldCheck className="h-8 w-8 md:h-12 md:w-12 text-white" />
            </motion.div>
          </motion.div>
          <AnimatedCounter
            shape={false}
            value={99.9}
            className="text-4xl md:text-6xl font-bold bg-secondary bg-clip-text text-transparent"
          />
          <motion.div
            className="text-sm md:text-base text-muted-foreground mt-3 font-medium"
            variants={statsItemVariants}
          >
            {t('SafeSwaps')||'Safe Swaps'}
          </motion.div>
          <motion.div
            className="w-12 h-1 bg-secondary rounded-full mt-2"
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          />
        </motion.div>

        <motion.div
          className="flex flex-col items-center justify-center text-center group"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <motion.div className="flex items-center justify-center mb-6 relative" variants={statsItemVariants}>
            <motion.div
              className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            <motion.div
              className="relative z-10 p-4 rounded-full bg-primary shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Package className="h-8 w-8 md:h-12 md:w-12 text-white" />
            </motion.div>
          </motion.div>
          {isLoading || !hasLoaded ? (
            <div className="text-4xl md:text-6xl font-bold bg-secondary bg-clip-text text-transparent">
              ---
            </div>
          ) : (
            <AnimatedCounter
              value={Number(itemsCount)}
              className="text-4xl md:text-6xl font-bold bg-secondary bg-clip-text text-transparent"
            />
          )}
          <motion.div
            className="text-sm md:text-base text-muted-foreground mt-3 font-medium"
            variants={statsItemVariants}
          >
            {t('ItemsSwaps')||'Items Swaps'}
          </motion.div>
          <motion.div
            className="w-12 h-1 bg-secondary rounded-full mt-2"
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          />
        </motion.div>
      </div>
    </motion.section>
  )
}

// Lazy-loaded Categories Section Component
const LazyCategoriesSection = ({ t }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

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
              : categories.slice(0, 2).map((category, index) => (
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
                    <CategoryCard {...category} />
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
              ) : categories.length > 2 ? (
                <motion.div
                  key={categories[2].name}
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
                  <CategoryCard {...categories[2]} />
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
              : categories.slice(3, 5).map((category, index) => (
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
                    <CategoryCard {...category} />
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
          : categories.slice(0, 10).map((category, index) => (
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
                <CategoryCard {...category} />
              </motion.div>
            ))}
      </motion.div>
    </motion.section>
  )
}

// Lazy-loaded Recent Products Component
const LazyRecentProducts = ({ showSwitchHeart, t }) => {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  useEffect(() => {
    if (inView && !hasLoaded) {
      setIsLoading(true)
      const loadProducts = async () => {
        try {
          const prods = await getProducts({}, {"sort": "-date_created" , "limit": 15})
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
      <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
        <ProductCarousel title={t("recentProducts")} viewAllHref="/products" viewAllLabel={t("viewAll")}> 
          {isLoading || !hasLoaded
            ? Array.from({ length: 6 }).map((_, i) => (
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
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -10 }}
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
      </motion.div>
    </motion.section>
  )
}

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
      <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
        <ProductCarousel title={t("topDeals")} viewAllHref="/products" viewAllLabel={t("viewAll")}>
          {isLoading || !hasLoaded
            ? Array.from({ length: 6 }).map((_, i) => (
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
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -10 }}
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
      </motion.div>
    </motion.section>
  )
}

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
      <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
        <ProductCarousel title={t("automotive")} viewAllHref="/products" viewAllLabel={t("viewAll")}> 
          {isLoading || !hasLoaded
            ? Array.from({ length: 6 }).map((_, i) => (
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
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -10 }}
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
      </motion.div>
    </motion.section>
  )
}

// Lazy-loaded Electronics Products Component
const LazyElectronicsProducts = ({ showSwitchHeart, t }) => {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  useEffect(() => {
    if (inView && !hasLoaded) {
      setIsLoading(true)
      const loadProducts = async () => {
        try {
          const prods = await getProducts({"category":"electronics"} , {"sort": "-date_created" , "limit": 15})
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
      <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
        <ProductCarousel title={t("electronics")} viewAllHref="/products" viewAllLabel={t("viewAll")}> 
          {isLoading || !hasLoaded
            ? Array.from({ length: 6 }).map((_, i) => (
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
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -10 }}
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
      </motion.div>
    </motion.section>
  )
}


export default function Home() {
  const { t } = useTranslations()
  const [showSwitchHeart, setShowSwitchHeart] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const getWishList = async () => {
    const token = await getCookie()
    if (token) {
      setShowSwitchHeart(true)
    }
  }

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await getWishList()
      } catch (error) {
        // console.error("Error initializing app:", error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    initializeApp()
  }, [])

  return (
    <>
      {isInitialLoading && <LoadingSpinner branded fullPage={true} size="md" />}
      {showSwitchHeart && <FloatingActionButton/>}

      <main className="min-h-screen dark:bg-[#121212] relative overflow-hidden">
        {/* Hero Section */}
        <HeroSection/>

        {/* Lazy-loaded Stats Section */}
        <LazyStatsSection t={t} />

        {/* Lazy-loaded Categories Section */}
        <LazyCategoriesSection t={t} />

        {/* Lazy-loaded Products Section */}
        <LazyRecentProducts showSwitchHeart={showSwitchHeart} t={t} />

        {/* Lazy-loaded Top Deals Section */}
        <LazyTopDeals showSwitchHeart={showSwitchHeart} t={t} />

        {/* Lazy-loaded Lazy Automative Products Section */}
        <LazyAutomativeProducts showSwitchHeart={showSwitchHeart} t={t} />

        {/* Lazy-loaded Lazy Electronics Products Section */}
        <LazyElectronicsProducts showSwitchHeart={showSwitchHeart} t={t} />

      </main>
    </>
  )
}