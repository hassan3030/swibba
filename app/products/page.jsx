"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getProducts } from "@/callAPI/products"
import { getAllCategories } from "@/callAPI/static"
import { getCookie } from "@/callAPI/utiles"
import { useRouter } from "next/navigation"
import { ItemCardProfile } from "@/components/products/item-card-profile"
import { useLanguage } from "@/lib/language-provider"
import { useTranslations } from "@/lib/use-translations"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { SearchBar } from "@/components/products/productsPage/SearchBar"
import { CategoryFilter } from "@/components/products/productsPage/CategoryFilter"
import { FilterButton } from "@/components/products/productsPage/FilterButton"
import { FilterSidebar } from "@/components/products/productsPage/FilterSidebar"
import { useFilters } from "@/components/products/productsPage/useFilters"
import { useStaticData } from "@/components/products/productsPage/useProductsData"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
}

export default function ProductsPage() {
  const [categorizedProducts, setCategorizedProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [showSwitchHeart, setShowSwitchHeart] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showFilterSidebar, setShowFilterSidebar] = useState(false)
  const router = useRouter()
  const { isRTL } = useLanguage()
  const { t } = useTranslations()

  // Load static data for filters
  const { allCategoriesData, allSubCategoriesData, allBrandsData, allModelsData } = useStaticData()

  // Advanced filters
  const {
    filters,
    displayedItems,
    hasActiveFilters,
    updateFilter,
    toggleArrayFilter,
    toggleAllCategories,
    clearAllFilters,
    getActiveFiltersCount,
  } = useFilters(allProducts, selectedFilter, searchTerm, "all", isRTL)

  // UI states for multi-select
  const [allowedCategoriesOpen, setAllowedCategoriesOpen] = useState(false)
  const [subCategoriesOpen, setSubCategoriesOpen] = useState(false)
  const [brandsOpen, setBrandsOpen] = useState(false)
  const [modelsOpen, setModelsOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    
    async function fetchData() {
      try {
        setIsLoading(true)
        
        // Fetch all categories and products in parallel
        const [categoriesData, productsData] = await Promise.all([
          getAllCategories(),
          getProducts()
        ])
        
        if (categoriesData.success && productsData.success) {
          setAllCategories(categoriesData.data)
          setAllProducts(productsData.data)
          groupProductsByCategory(productsData.data, categoriesData.data, "all", "")
        }

        const token = await getCookie()
        if (token) setShowSwitchHeart(true)
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching products:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
    
    return () => controller.abort()
  }, [])

  // Filter and group products whenever search or filter changes
  useEffect(() => {
    if (displayedItems.length > 0 && allCategories.length > 0) {
      groupProductsByCategory(displayedItems, allCategories)
    } else if (allProducts.length > 0 && allCategories.length > 0) {
      // Fallback to all products if displayedItems is empty
      groupProductsByCategory(allProducts, allCategories)
    }
  }, [displayedItems, allCategories, allProducts])

  const groupProductsByCategory = (products, categories) => {
    // Group products by category
    const categoryMap = new Map()
    
    categories.forEach(category => {
      categoryMap.set(category.name, {
        category: category,
        products: []
      })
    })
    
    // Assign products to their categories
    products.forEach(product => {
      const categoryName = product.category
      if (categoryMap.has(categoryName)) {
        categoryMap.get(categoryName).products.push(product)
      }
    })
    
    // Convert to array and filter out empty categories
    const categorized = Array.from(categoryMap.values())
      .filter(item => item.products.length > 0)
      .sort((a, b) => b.products.length - a.products.length) // Sort by product count
    
    setCategorizedProducts(categorized)
  }

  const handleViewAll = (categoryName) => {
    router.push(`/categories/${categoryName}`)
  }

  const handleSearch = () => {
    // Search is already reactive through useFilters
  }

  const handleCategoryChange = (value) => {
    setSelectedFilter(value)
  }

  const handleUpdateFilter = (filterPath, value) => {
    updateFilter(filterPath, value)
  }

  const handleToggleArrayFilter = (filterPath, value) => {
    toggleArrayFilter(filterPath, value)
  }

  const handleToggleAllCategories = (filterPath) => {
    toggleAllCategories(filterPath)
  }

  const handleClearAllFilters = () => {
    clearAllFilters()
    setSelectedFilter("all")
    setSearchTerm("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-4 bg-background dark:bg-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-primary/90">{t("Loading products...")}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      className="min-h-screen bg-background dark:bg-gray-950" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
        {/* Page Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative  overflow-hidden  bg-gradient-to-b from-primary/10 via-primary/5 to-transparent  p-8 sm:p-12"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />
          
          <div className={`max-w-7xl mx-auto flex flex-col ${isRTL ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8`}>
            {/* Icon Section */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
              className="flex-shrink-0"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
                <div className="relative bg-gradient-to-br from-primary to-primary/70 p-6 rounded-2xl shadow-lg">
                  <svg
                    className="w-16 h-16 "
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Text Content */}
            <div className={`flex-1 space-y-4 `}>
              <motion.h1 
                className="text-3xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent"
                initial={{ x: isRTL ? 50 : -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {isRTL ? "استكشف وبادل المنتجات" : "Explore & Swap Products"}
              </motion.h1>
              <motion.p 
                className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl"
                initial={{ x: isRTL ? 50 : -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {isRTL 
                  ? "اكتشف مجموعة متنوعة من المنتجات وابحث عن ما يناسبك وابدأ عمليات التبادل مع مستخدمين آخرين بسهولة وأمان." 
                  : "Discover a diverse collection of products, find what suits you, and start swapping with other users easily and securely."}
              </motion.p>
            </div>
          </div>
        </motion.div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      

        {/* Search and Filter Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm space-y-4"
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            <SearchBar 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              onSearch={handleSearch} 
            />
            
            <div className="flex flex-col gap-2 sm:flex-row w-full lg:w-1/2">
              <FilterButton 
                onClick={() => setShowFilterSidebar(true)} 
                activeFiltersCount={getActiveFiltersCount()} 
              />
              
              <CategoryFilter 
                category={selectedFilter} 
                onCategoryChange={handleCategoryChange} 
              />
            </div>
          </div>

          {/* Action hint - subtle */}
          {getActiveFiltersCount() > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`flex items-center gap-2 text-xs text-muted-foreground ${isRTL ? 'justify-end' : 'justify-start'}`}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearAllFilters}
                className="text-destructive hover:text-destructive/80 underline underline-offset-2 transition-colors"
              >
                {t("Clear all filters")}
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Categorized Products */}
        <div className="space-y-12">
        {categorizedProducts.map((item, idx) => {
          const categoryName = item.category.translations?.[0]?.name || item.category.name
          const productsToShow = item.products.slice(0, 8)
          const hasMore = item.products.length > 8
          
          return (
            <motion.div
              key={item.category.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="space-y-6 bg-card/30  border border-border/30 rounded-3xl p-6 backdrop-blur-sm shadow-sm transition-shadow duration-300"
            >
              {/* Modern Category Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/30">
                <div className="space-y-2">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                    className="flex items-center gap-3"
                  >
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {categoryName}
                    </h2>
                  </motion.div>
                </div>
                
                {hasMore && (
                  <motion.button
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                    whileHover={{ scale: 1.05, x: isRTL ? -5 : 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewAll(item.category.name)}
                    className="group flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-full transition-all duration-300 font-medium text-primary"
                  >
                    {t("View All")}
                    {isRTL ? (
                      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    )}
                  </motion.button>
                )}
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <AnimatePresence mode="wait">
                  {productsToShow.map((product, productIdx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: productIdx * 0.05 }}
                    >
                      <ItemCardProfile
                        {...product}
                        showbtn={true}
                        showSwitchHeart={showSwitchHeart}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
        </div>
        
        {categorizedProducts.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-xl text-muted-foreground">{t("No products available")}</p>
          </motion.div>
        )}
      </div>

      {/* Advanced Filter Sidebar */}
      <FilterSidebar
        showFilterSidebar={showFilterSidebar}
        setShowFilterSidebar={setShowFilterSidebar}
        filters={filters}
        updateFilter={handleUpdateFilter}
        toggleArrayFilter={handleToggleArrayFilter}
        toggleAllCategories={handleToggleAllCategories}
        clearAllFilters={handleClearAllFilters}
        getActiveFiltersCount={getActiveFiltersCount}
        allCategoriesData={allCategoriesData}
        allSubCategoriesData={allSubCategoriesData}
        allBrandsData={allBrandsData}
        allModelsData={allModelsData}
        subCategoriesOpen={subCategoriesOpen}
        setSubCategoriesOpen={setSubCategoriesOpen}
        brandsOpen={brandsOpen}
        setBrandsOpen={setBrandsOpen}
        modelsOpen={modelsOpen}
        setModelsOpen={setModelsOpen}
        allowedCategoriesOpen={allowedCategoriesOpen}
        setAllowedCategoriesOpen={setAllowedCategoriesOpen}
      />
    </motion.div>
  )
}
