"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ItemsListSkeleton } from "@/components/loading/items-list-skeleton"
import { useLanguage } from "@/lib/language-provider"
import { useRouter } from "next/navigation"
import { SearchBar } from "./SearchBar"
import { CategoryFilter } from "./CategoryFilter"
import { FilterButton } from "./FilterButton"
import { ProductsGrid } from "./ProductsGrid"
import { SimplePagination } from "./SimplePagination"
import { EmptyState } from "./EmptyState"
import { FilterSidebar } from "./FilterSidebar"
import { useProductsData, useStaticData } from "./useProductsData"
import { useFilters } from "./useFilters"
import { containerVariants, filterVariants, paginationVariants } from "./animations"
import { X } from "lucide-react"

const ITEMS_PER_PAGE = 12

export function ProductsList({
  items,
  showFilters = true,
  showCategoriesFilter = true,
  showbtn = true,
  showSwitchHeart = true,
  defaultCategory = "all",
  LinkItemOffer = false,
  totalCount = null,
  skipFetch = false,
}) {
  // Language
  const { isRTL } = useLanguage()
  const router = useRouter()
  
  // Data loading
  const { allItems, isLoading, allItemsFetched, productsCount, setProductsCount } = useProductsData(items, skipFetch)
  const { allCategoriesData, allSubCategoriesData, allBrandsData, allModelsData } = useStaticData()
  
  // State
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState(defaultCategory)
  const [page, setPage] = useState(1)
  const [slideDirection, setSlideDirection] = useState(0)
  const [showFilterSidebar, setShowFilterSidebar] = useState(false)
  const [isPaginationLoading, setIsPaginationLoading] = useState(false)
  
  // UI states for multi-select
  const [allowedCategoriesOpen, setAllowedCategoriesOpen] = useState(false)
  const [subCategoriesOpen, setSubCategoriesOpen] = useState(false)
  const [brandsOpen, setBrandsOpen] = useState(false)
  const [modelsOpen, setModelsOpen] = useState(false)
  
  // Filtering
  const {
    filters,
    displayedItems,
    productsCount: filteredCount,
    hasActiveFilters,
    updateFilter,
    toggleArrayFilter,
    toggleAllCategories,
    clearAllFilters,
    getActiveFiltersCount,
  } = useFilters(allItems, category, searchTerm, defaultCategory, isRTL)

  // Update productsCount from filtered results
  useEffect(() => {
    setProductsCount(filteredCount)
  }, [filteredCount, setProductsCount])

  // Sync defaultCategory with category state
  useEffect(() => {
    setCategory(defaultCategory)
  }, [defaultCategory])

  // Reset to page 1 if current page is beyond available pages
  useEffect(() => {
    const maxPages = Math.max(1, Math.ceil(filteredCount / ITEMS_PER_PAGE))
    if (page > maxPages) {
      setPage(1)
    }
  }, [filteredCount, page])

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredCount / ITEMS_PER_PAGE))
  const paginatedItems = (() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return Array.isArray(displayedItems) ? displayedItems.slice(startIndex, endIndex) : []
  })()

  // Handlers
  const handleSearch = () => {
    setPage(1)
  }
  
  const handleCategoryChange = (value) => {
    setCategory(value)
    setPage(1)
  }
  
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    
    if (!allItemsFetched && page === 1) {
      setIsPaginationLoading(true)
      setTimeout(() => {
        setIsPaginationLoading(false)
      }, 300)
    }
    
    setSlideDirection(newPage > page ? 1 : -1)
    setPage(newPage)
  }

  const handleUpdateFilter = (filterPath, value) => {
    setPage(1)
    updateFilter(filterPath, value)
  }

  const handleToggleArrayFilter = (filterPath, value) => {
    setPage(1)
    toggleArrayFilter(filterPath, value)
  }

  const handleToggleAllCategories = (filterPath) => {
    setPage(1)
    toggleAllCategories(filterPath)
  }

  const handleClearAllFilters = () => {
    router.push("/products")
  }

  return (
    <motion.div 
      className="space-y-8" 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
    >
      {showFilters && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm space-y-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchBar 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              onSearch={handleSearch} 
            />
            
            <div className="flex gap-2 w-full lg:w-auto">
              <FilterButton 
                onClick={() => setShowFilterSidebar(true)} 
                activeFiltersCount={getActiveFiltersCount()} 
              />
              
              {showCategoriesFilter && (
                <CategoryFilter 
                  category={category} 
                  onCategoryChange={handleCategoryChange} 
                />
              )}

              {getActiveFiltersCount() > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearAllFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 rounded-lg transition-all duration-200 text-destructive font-medium whitespace-nowrap"
                >
                  <X className="w-4 h-4" />
                  {isRTL ? "مسح الفلاتر" : "Clear"}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {isLoading || isPaginationLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="loading"
          >
            <ItemsListSkeleton count={ITEMS_PER_PAGE} />
          </motion.div>
        ) : paginatedItems.length === 0 ? (
          <EmptyState key="empty" />
        ) : (
          <motion.div key="content">
            <ProductsGrid
              items={paginatedItems}
              page={page}
              slideDirection={slideDirection}
              showbtn={showbtn}
              showSwitchHeart={showSwitchHeart}
              LinkItemOffer={LinkItemOffer}
            />
            
            <motion.div variants={paginationVariants} initial="hidden" animate="visible">
              <SimplePagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
