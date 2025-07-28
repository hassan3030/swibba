"use client"

import { useEffect, useState } from "react"
import { motion, useAnimation, useScroll, useTransform } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Users, ShieldCheck, Package, Sparkles, TrendingUp, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeelProductCard } from "@/components/deel-product-card"
import { CategoryCard } from "@/components/category-card"
import { ProductCarousel } from "@/components/product-carousel"
import { DeelProductCardSkeleton } from "@/components/DeelProductCardSkeleton"
import  FloatingActionButton  from "@/components/floating-action-button"
import { HeroSlider } from "@/components/hero-slider"
import { useLanguage } from "@/lib/language-provider"
import { useTranslations } from "@/lib/use-translations"
import { categories } from "@/lib/data"
import { useRouter } from "next/navigation"
import { getProducts, getProductTopPrice , getProductByCategory } from "@/callAPI/products"
import {getAllUsers} from "@/callAPI/users"
import { getCookie } from "@/callAPI/utiles"
import HeroSection from "@/components/hero-section"
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

// Featured Collection Card component
const FeaturedCollectionCard = ({ title, imageUrl , rating, accent,  url }) => {
  const { t } = useTranslations()
  const [itemCount , setItemCount] = useState(0)
const countCat = async()=>{
 const prodsCatCount = await getProductByCategory(title)
 setItemCount(prodsCatCount.count)
}
useEffect(()=>{
 countCat()
},[])

  return (
   <Link href={url}>
    <motion.div
      className="relative overflow-hidden rounded-xl shadow-lg group"
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ 
          background: `linear-gradient(135deg, ${accent}40 0%, transparent 100%)`,
          zIndex: 5 
        }}
      />
      
      <div className="relative aspect-[4/5] overflow-hidden">
        <img 
          src={imageUrl || "/placeholder.svg?height=400&width=300"} 
          alt={t(title)||title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <div className="flex items-center gap-2 mb-2">
          <div className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium text-white">
            {itemCount} {t('items')||"Items"}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium text-white">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {rating}
          </div>
        </div>
        <h3 className="text-xl font-bold text-white">{t(title)||title}</h3>
      </div>
    </motion.div>
   </Link>
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
  
  // Featured collections data
  const featuredCollections = [
    { 
      title: "realestate", 
      imageUrl:  "/categories/realestate.jpg",
      url:  "categories/realestate",
      // itemCount: 24, 
      rating: 4.8,
      accent: "#FF6B6B" ,
    },
    { 
      title: "books", 
      imageUrl: "/categories/book.jpg",
      url: "categories/books",
      // itemCount: 42, 
      rating: 4.9,
      accent: "#4ECDC4" 
    },
    { 
      title: "automotive", 
      imageUrl: "/categories/automotive.jpg",
      url: "categories/automotive",
      // itemCount: 18, 
      rating: 4.7,
      accent: "#FFD166" 
    },
    { 
      title: "electronics", 
      imageUrl:  "/categories/electronics.jpg",
      url:  "categories/electronics",
      // itemCount: 15, 
      rating: 4.9,
      accent: "#6A0572" 
    }
  ]

  const getWishList = async () => {
    const token = await getCookie()
    if (token) {
      setShowSwitchHeart(true)
    }
  }

  const router = useRouter()

  const getData = async () => {
    const prods = await getProducts()
    const users = await getAllUsers()
    const topPriceProds = await getProductTopPrice()
    setItems(prods.data)
    setTopPrice(topPriceProds.data)
    setItemsCount(prods.count)
    setUsersCount( users.count || 0)
    

    console.log("i am in product home ", prods)
    console.log("i am in product topPrice ", topPriceProds)
    console.log("i am in itemsCount", itemsCount)
    console.log("i am in usersCount", usersCount)

    // return prodsData
  }

  useEffect(() => {
    setIsLoading(true)
    setIsLoadingCat(true)

    try {
      getData().then(() => {
        setIsLoading(false)
      })
      setIsLoadingCat(false)
      getWishList()
    } catch (error) {
      console.error("Error fetching data:", error)
      setIsLoading(false)
      setIsLoadingCat(false)
    }
  }, [])

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <>
    {showSwitchHeart?(<FloatingActionButton/>):''}

      <main className="min-h-screen dark:bg-[#121212] relative overflow-hidden">
        <FloatingParticles />

        {/* Hero Section */}
        <HeroSection/>
        {/* <motion.section 
          className="container py-6 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ y: y1 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <HeroSlider />
          </motion.div>
        </motion.section> */}

        {/* Enhanced Stats Section */}
        <motion.section
          className="container py-16 relative z-10"
          variants={statsContainerVariants}
          initial="hidden"
          animate="visible"
          ref={ref}
        >
          <motion.div
            className="text-center mb-12"
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
              style={{
                background: "linear-gradient(90deg, #333 25%, #49c5b6 50%, #333 75%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
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
                  className="relative z-10 p-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Users className="h-8 w-8 md:h-12 md:w-12 text-white" />
                </motion.div>
              </motion.div>
              <AnimatedCounter
                value={Number(usersCount)}
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
              />
              <motion.div
                className="text-sm md:text-base text-muted-foreground mt-3 font-medium"
                variants={statsItemVariants}
              >
                {t('ActiveSwapers')|| 'Active Swapers'}
               
              </motion.div>
              <motion.div
                className="w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2"
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
                  className="relative z-10 p-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <ShieldCheck className="h-8 w-8 md:h-12 md:w-12 text-white" />
                </motion.div>
              </motion.div>
              <AnimatedCounter
               shape={false}
                value={99.9}
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent"
              />
              <motion.div
                className="text-sm md:text-base text-muted-foreground mt-3 font-medium"
                variants={statsItemVariants}
              >
                {t('SafeSwaps')||'Safe Swaps'}
      
              </motion.div>
              <motion.div
                className="w-12 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full mt-2"
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
                  className="relative z-10 p-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Package className="h-8 w-8 md:h-12 md:w-12 text-white" />
                </motion.div>
              </motion.div>
              <AnimatedCounter
                value={ Number(itemsCount)}
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent"
              />
              <motion.div
                className="text-sm md:text-base text-muted-foreground mt-3 font-medium"
                variants={statsItemVariants}
              >
               {t('ItemsSwaps')||'Items Swaps'}
              </motion.div>
              <motion.div
                className="w-12 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mt-2"
                initial={{ width: 0 }}
                animate={{ width: 48 }}
                transition={{ delay: 1.4, duration: 0.8 }}
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Enhanced Categories Section */}
        <motion.section className="container py-16 relative z-10" style={{ y: y2 }}>
          <motion.div className="mb-12 text-center" variants={titleVariants} initial="hidden" animate="visible">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
              variants={floatingVariants}
              animate="animate"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">{t('PopularCategories')||'Popular Categories'}</span>
            </motion.div>
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{
                background: "linear-gradient(135deg, #49c5b6 0%, #3db6a7 50%, #2da89a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {t('BrowseCategories')||'Browse Categories'}
            </motion.h2>
            <motion.p
              className="text-muted-foreground max-w-2xl mx-auto text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
             {t('Discoveramazingitemsacrossvariouscategoriesandfindexactlywhatyourelookingfor') || "Discover amazing items across various categories and find exactly what you're looking for"}
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {isLoadingCat
              ? Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <DeelProductCardSkeleton />
                  </motion.div>
                ))
              : categories.slice(0, 6).map((category, index) => (
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

        {/* Enhanced Middle Banner */}
        <motion.section
          className="container py-16 relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] border border-[#333] relative shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=1200')] opacity-10 bg-cover bg-center"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10"
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </div>

            <div className="container relative flex min-h-[200px] flex-col items-center justify-center py-12 text-center md:min-h-[250px] z-10">
              <motion.div
                className="absolute top-4 left-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Star className="h-6 w-6 text-primary/30" />
              </motion.div>
              <motion.div
                className="absolute top-8 right-8"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Sparkles className="h-8 w-8 text-primary/20" />
              </motion.div>

              <motion.h3
                className="text-3xl md:text-4xl font-bold text-white mb-8"
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #49c5b6 50%, #ffffff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {t('ReadytoTradeYourItems') || 'Ready to Trade Your Items?'}

              </motion.h3>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 font-bold px-10 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    router.push("/products")
                  }}
                >
                  <motion.span
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                      backgroundSize: "200% 100%",
                    }}
                    className="inline-block"
                  >
                    {t("swapNow") || "Swap Now"}
                  </motion.span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        {/* NEW: Featured Collections Section */}
        <motion.section 
          className="container py-16 relative z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div className="mb-12 text-center" variants={titleVariants} initial="hidden" animate="visible">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
              variants={floatingVariants}
              animate="animate"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{t('CuratedForYou')||"Curated For You"}</span>
            </motion.div>
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{
                background: "linear-gradient(135deg, #6A0572 0%, #AB83A1 50%, #49c5b6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {t('FeaturedCollections')|| 'Featured Collections'}

            </motion.h2>
            <motion.p
              className="text-muted-foreground max-w-2xl mx-auto text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >  {t('Discoverourhandpickedcollectionsofexceptionalitemscuratedbyourexpertteam')|| 'Discover our handpicked collections of exceptional items curated by our expert team'}
             
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {featuredCollections.map((collection, index) => (
              <motion.div
                key={collection.title}
                variants={collectionCardVariants}
                custom={index}
              >
                <FeaturedCollectionCard {...collection} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="flex justify-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
           <Link href='categories'>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-medium rounded-full px-8"
            >
              {t('ViewAllCollections')||'View All Collections'}
            </Button>
           </Link>
          </motion.div>
        </motion.section>

        {/* Enhanced Products Section */}
        <motion.section
          className="container py-16 relative z-10"
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
                      <DeelProductCardSkeleton />
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
                        <DeelProductCard {...product} showSwitchHeart={showSwitchHeart} />
                      </motion.div>
                    ))
                  : Array.from({ length: 6 }).map((_, i) => (
                      <motion.div key={i}>
                        <DeelProductCardSkeleton />
                      </motion.div>
                    ))}
            </ProductCarousel>
          </motion.div>
        </motion.section>

        {/* Enhanced Top Deals Section */}
        <motion.section
          className="container py-16 relative z-10"
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
                      <DeelProductCardSkeleton />
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
                        <DeelProductCard {...product} showSwitchHeart={showSwitchHeart} />
                      </motion.div>
                    ))
                  : Array.from({ length: 6 }).map((_, i) => (
                      <motion.div key={i}>
                        <DeelProductCardSkeleton />
                      </motion.div>
                    ))}
            </ProductCarousel>
          </motion.div>
        </motion.section>
      </main>
    </>
  )
}
