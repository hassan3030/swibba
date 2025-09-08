"use client"

import { useEffect, useState } from "react"
import { motion, useAnimation, useScroll, useTransform } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Users, ShieldCheck, Package, Sparkles, TrendingUp, Star } from "lucide-react"
import  FloatingActionButton  from "@/components/floating-action-button"
import { categories } from "@/lib/data"
import { ProductCarousel } from "@/components/product-carousel"
import { SwibbaProductCardSkeleton } from "@/components/swibba-product-card-skeleton"
import { SwibbaProductCard } from "@/components/swibba-product-card"
import { CategoryCard } from "@/components/category-card"
import { useLanguage } from "@/lib/language-provider"
import { useTranslations } from "@/lib/use-translations"
import { getProducts, getProductTopPrice } from "@/callAPI/products"
import {getAllUsers} from "@/callAPI/users"
import { getCookie } from "@/callAPI/utiles"
import HeroSection from "@/components/hero-section"
import LoadingSpinner from "@/components/loading-spinner"
// import Link from "next/link"
// import Image from "next/image"

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

// New collection card animation variants
const collectionCardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.7,
    },
  },
}

// Enhanced Counter animation component
const AnimatedCounter = ({ value, duration = 2, className , shape=true}) => {
  const [count, setCount] = useState(0)
  const controls = useAnimation()
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  useEffect(() => {
    if (inView) {
      let startTime
      const startValue = 0
      const endValue = value

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
        const currentCount = Math.floor(progress * (endValue - startValue) + startValue)

        setCount(currentCount)

        if (progress < 1) {
          window.requestAnimationFrame(step)
        }
      }

      window.requestAnimationFrame(step)
      controls.start("visible")
       window.scrollTo(0, 0);
    }
  }, [inView, value, duration, controls])


  return (
    <>
      <motion.div 
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={statsItemVariants}
      className={className}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.span
        key={count}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {shape?`${count>=1000?`${count/1000}K+`:count>=1000000?`${count/1000000}M+`:count}`:`${value === 99.9 ? `${value}%` : "K+"}`}
        
        {/*  */}
      </motion.span>
    </motion.div>
    </>
  
  )
}

// Floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, -40, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}



export default function Home() {
  const { isRTL } = useLanguage()
  const { t } = useTranslations()
  const [items, setItems] = useState([])
  const [itemsCount , setItemsCount ] = useState(0)
  const [usersCount , setUsersCount] = useState(0)
  const [topPrice, setTopPrice] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCat, setIsLoadingCat] = useState(true)
  const [showSwitchHeart, setShowSwitchHeart] = useState(false)
  const controls = useAnimation()
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  // Scroll-based animations
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  
 
  const getWishList = async () => {
    const token = await getCookie()
    if (token) {
      setShowSwitchHeart(true)
    }
  }



  const getData = async () => {
    const prods = await getProducts()
    const users = await getAllUsers()
    const topPriceProds = await getProductTopPrice()
    setItems(prods.data)
    setTopPrice(topPriceProds.data)
    setItemsCount(prods.count || 0)
    setUsersCount( users.count || 0)
    

    console.log("i am in product home prods ", prods)
    console.log("i am in product topPrice ", topPriceProds)
    console.log("i am in itemsCount", itemsCount)
    console.log("i am in usersCount", usersCount)

    // return prodsData
  }

  useEffect(() => {
    setIsLoading(true)
    setIsLoadingCat(true)

    const fetchData = async () => {
      try {
        await getData()
        await getWishList()
        setIsLoadingCat(false)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
        setIsLoadingCat(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <>
    {isLoading &&  <LoadingSpinner branded  fullPage={true} size="md"  />
  }
    {showSwitchHeart?(<FloatingActionButton/>):''}

      <main className="min-h-screen dark:bg-[#121212] relative overflow-hidden ">
        <FloatingParticles />
        {/* Hero Section */}
        <HeroSection/>
       

        {/* Enhanced Stats Section */}
        <motion.section
          className="container pt-4 relative z-10"
          variants={statsContainerVariants}
          initial="hidden"
          animate="visible"
          ref={ref}
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
              <AnimatedCounter
                value={Number(usersCount)}
                className="text-4xl md:text-6xl font-bold bg-secondary bg-clip-text text-transparent"
              />
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
              <AnimatedCounter
                value={ Number(itemsCount)}
                className="text-4xl md:text-6xl font-bold bg-secondary bg-clip-text text-transparent"
              />
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

        {/* Enhanced Categories Section */}
        <motion.section className="container pt-24  relative z-10 " >
          <motion.div className=" text-center" variants={titleVariants} initial="hidden" animate="visible">
            <motion.div
              className="inline-flex items-center gap-2 px-4  rounded-full bg-primary/10 text-primary mb-2"
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
                {isLoadingCat
                  ? Array.from({ length: 2 }).map((_, i) => (
                      <motion.div
                        key={i}
                        variants={itemVariants}
                        whileHover={{ y: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <SwibbaProductCardSkeleton />
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
                  {isLoadingCat ? (
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ y: -10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <SwibbaProductCardSkeleton />
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
                {isLoadingCat
                  ? Array.from({ length: 2 }).map((_, i) => (
                      <motion.div
                        key={i + 3}
                        variants={itemVariants}
                        whileHover={{ y: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <SwibbaProductCardSkeleton />
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

          {/* Desktop Layout: Enhanced grid for 10 categories */}
          <motion.div
            className="hidden md:grid grid-cols-5 gap-2 lg:grid-cols-10 "
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {isLoadingCat
              ? Array.from({ length: 10 }).map((_, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <SwibbaProductCardSkeleton />
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


        {/* Enhanced Products Section */}
        <motion.section
          className="container  relative z-10 mt-6"
          id="items"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <ProductCarousel title={t("allProducts")} viewAllHref="/products" viewAllLabel={t("viewAll")}> 
              {isLoading
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

        {/* Enhanced Top Deals Section */}
        <motion.section
          className="container  relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <ProductCarousel title={t("topDeals")} viewAllHref="/products" viewAllLabel={t("viewAll")}>
              {isLoading
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
      </main>
    </>
  )
}
