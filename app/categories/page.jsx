"use client"
import { motion } from "framer-motion"
import { ChevronRight, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/lib/use-translations"
import { CategoryCard } from "@/components/products/category-card"
import { categories as fallbackCategories } from "@/lib/data"
import { getAllCategories } from "@/callAPI/static"
import { useState, useEffect } from "react"
import LoadingSpinner from "@/components/loading/loading-spinner"
import { mediaURL } from "@/callAPI/utiles"
import { Button } from "@/components/ui/button"



const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

const headerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
}

const CategoriesPage = () => {
  const { t } = useTranslations()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [displayCount, setDisplayCount] = useState(50) // Show 50 items per page
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        // Use optimized API call - only fetch name, image, and translations
        const response = await getAllCategories(null, true)
        
        if (response.success) {
          // Transform API data to match expected format
          const transformedCategories = response.data.map(category => ({
            name: category.name,
            imageSrc: category.main_image?.id ? `${mediaURL}${category.main_image.id}` : '',
            translations: category.translations || [],
            catLevels: null, // Not needed for optimized view
          }))
          setCategories(transformedCategories)
          setTotalCount(response.total || transformedCategories.length)
        } else {
          // Use fallback categories if API fails
          setCategories(fallbackCategories)
          setTotalCount(fallbackCategories.length)
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Error fetching categories:", error)
          setError(error)
          // Use fallback categories on error
          setCategories(fallbackCategories)
          setTotalCount(fallbackCategories.length)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
    
    return () => controller.abort()
  }, [])

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="bg-background dark:bg-gray-950 min-h-screen"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
      {/* Categories */}
      <section className="container py-8">
        <motion.div
          className="mb-4 flex items-center justify-between"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-xl font-bold text-primary/90"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t("categories")}
          </motion.h2>
          <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <Link href="/" className="flex items-center gap-1 text-sm font-medium text-primary hover:scale-105 no-underline">
              {t("back") || "Go Back"}
              <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.slice(0, displayCount).map((category, index) => (
            <motion.div
              key={category.name}
              variants={itemVariants}
              whileHover={{
                y: -8,
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 10 },
              }}
              whileTap={{ scale: 0.95 }}
            >
              <CategoryCard {...category} showCategoryLevels={true} />
            </motion.div>
          ))}
        </motion.div>

        {/* Load More Button */}
        {categories.length > displayCount && (
          <motion.div
            className="flex justify-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={() => setDisplayCount(prev => prev + 50)}
              variant="outline"
              className="flex items-center gap-2 hover:scale-105 transition-transform"
            >
              {t("loadMore") || "Load More"} ({categories.length - displayCount} {t("remaining") || "remaining"})
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
        )}
      </section>
    </motion.div>
  )
}

export default CategoriesPage
