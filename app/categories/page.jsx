"use client"
import Link from "next/link"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { CategoryCard } from "@/components/products/category-card"
import { categories as fallbackCategories } from "@/lib/data"
import { getAllCategories } from "@/callAPI/static"
import { useState, useEffect, useMemo } from "react"
import { mediaURL } from "@/callAPI/utiles"
import { CategoryCardSkeleton } from "@/components/loading/category-card-skeleton"




const CategoriesPage = () => {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const [categories, setCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await getAllCategories(null, true)
        
        if (response.success) {
          const transformedCategories = response.data.map(category => ({
            name: category.name,
            imageSrc: category.main_image?.id ? `${mediaURL}${category.main_image.id}` : '',
            translations: category.translations || [],
          }))
          setCategories(transformedCategories)
        } else {
          setCategories(fallbackCategories)
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError(err)
        setCategories(fallbackCategories)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter and paginate categories
  const { filteredCategories, totalPages, paginatedCategories } = useMemo(() => {
    let filtered = categories
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = categories.filter((category) => {
        const name = category.name?.toLowerCase() || ''
        const translatedNames = category.translations?.map(t => t.name?.toLowerCase() || '') || []
        return name.includes(query) || translatedNames.some(tn => tn.includes(query))
      })
    }
    
    // Calculate pagination
    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    
    return {
      filteredCategories: filtered,
      totalPages: total,
      paginatedCategories: paginated
    }
  }, [categories, searchQuery, currentPage])

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/20 rounded-full animate-pulse" />
              <div className="h-10 w-32 bg-primary/20 rounded-lg animate-pulse" />
            </div>
            <div className="h-12 w-full sm:w-64 bg-primary/20 rounded-xl animate-pulse" />
          </div>
          
          {/* Divider Skeleton */}
          <div className="mb-8">
            <div className="h-px bg-primary/20 animate-pulse" />
          </div>
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 15 }).map((_, index) => (
              <CategoryCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Modern Header: Icon + Title on left, Search on right */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              {t('categories') || 'Categories'}
            </h1>
          </div>
          
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <input
              type="text"
              placeholder={t('searchCategories') || 'Search categories...'}
              className="w-full pl-10 pr-4 py-2.5 border border-primary/30 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary/60 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {error ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-red-600 dark:text-red-400">{t('error') || 'Error'}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('errorLoadingCategories') || 'Error loading categories'}</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">{t('noCategoriesFound') || 'No categories found'}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('tryAdjustingSearch') || 'Try adjusting your search'}</p>
          </div>
        ) : (
          <>
            {/* Categories Grid - 5 columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-8">
              {paginatedCategories.map((category) => (
                <CategoryCard key={category.name} {...category} showCategoryLevels={false} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {/* First/Last Page - Hidden on mobile */}
                <button
                  onClick={() => setCurrentPage(language === 'ar' ? totalPages : 1)}
                  disabled={language === 'ar' ? currentPage === totalPages : currentPage === 1}
                  className="hidden sm:flex px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-primary/20 hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label={language === 'ar' ? 'الصفحة الأخيرة' : 'First page'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={language === 'ar' ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
                  </svg>
                </button>
                
                {/* Previous/Next Page */}
                <button
                  onClick={() => setCurrentPage(prev => language === 'ar' ? Math.min(totalPages, prev + 1) : Math.max(1, prev - 1))}
                  disabled={language === 'ar' ? currentPage === totalPages : currentPage === 1}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-primary/20 hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label={language === 'ar' ? 'الصفحة التالية' : 'Previous page'}
                >
                  {language !== 'ar' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  )}
                  <span className="hidden sm:inline text-sm">{language === 'ar' ? (t("next") || "التالي") : (t("prev") || "Prev")}</span>
                  {language === 'ar' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  )}
                </button>

                {/* Page Numbers - Hidden on mobile, show current page instead */}
                <div className="flex items-center gap-2">
                  {/* Mobile: Show only current page */}
                  <div className="sm:hidden px-4 py-2 rounded-lg bg-primary text-white border border-primary text-sm font-medium">
                    {currentPage} / {totalPages}
                  </div>
                  
                  {/* Desktop: Show page numbers */}
                  <div className="hidden sm:flex gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                            currentPage === pageNum
                              ? 'bg-primary text-white border-primary font-medium'
                              : 'bg-white dark:bg-gray-800 border-primary/20 hover:border-primary/40'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Next/Previous Page */}
                <button
                  onClick={() => setCurrentPage(prev => language === 'ar' ? Math.max(1, prev - 1) : Math.min(totalPages, prev + 1))}
                  disabled={language === 'ar' ? currentPage === 1 : currentPage === totalPages}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-primary/20 hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label={language === 'ar' ? 'الصفحة السابقة' : 'Next page'}
                >
                  {language !== 'ar' && (
                    <span className="hidden sm:inline text-sm">{t("next") || "Next"}</span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={language === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                  </svg>
                  {language === 'ar' && (
                    <span className="hidden sm:inline text-sm">{t("prev") || "السابق"}</span>
                  )}
                </button>
                
                {/* Last/First Page - Hidden on mobile */}
                <button
                  onClick={() => setCurrentPage(language === 'ar' ? 1 : totalPages)}
                  disabled={language === 'ar' ? currentPage === 1 : currentPage === totalPages}
                  className="hidden sm:flex px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-primary/20 hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label={language === 'ar' ? 'الصفحة الأولى' : 'Last page'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={language === 'ar' ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CategoriesPage
