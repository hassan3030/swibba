"use client"

import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { getAllBrands } from "@/callAPI/static.js"
import BrandCardSkeleton from "@/components/loading/brand-card-skeleton.jsx"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import Image from "next/image"
import { mediaURL } from "@/callAPI/utiles"

const BrandCard = ({ brand, language }) => {
  // Memoize image source computation for better performance
  const imgSrc = useMemo(() => {
    const icon = brand?.brand_icon;
    if (!icon) return '/default-brand-icon.png';
    if (typeof icon === 'string') return icon.startsWith('http') ? icon : `${mediaURL}${icon}`;
    if (icon?.id) return `${mediaURL}${icon.id}`;
    if (icon?.filename_download) return icon.filename_download.startsWith('http') ? icon.filename_download : `${mediaURL}${icon.filename_download}`;
    return '/default-brand-icon.png';
  }, [brand?.brand_icon]);

  // Get translated name based on language
  const brandName = useMemo(() => {
    if (!brand.translations || brand.translations.length === 0) return brand.name;
    
    // Helper function to safely get language code
    const getLanguageCode = (t) => {
      if (!t.languages_code) return null
      // If it's an object with a code property
      if (typeof t.languages_code === 'object' && t.languages_code.code) {
        return t.languages_code.code
      }
      // If it's a string
      if (typeof t.languages_code === 'string') {
        return t.languages_code
      }
      return null
    }
    
    // Try exact match first (e.g., "ar" === "ar")
    let translation = brand.translations.find(t => {
      const code = getLanguageCode(t)
      return code === language
    })
    
    // If not found and language is "ar", try variations like "ar-SA"
    if (!translation && language === "ar") {
      translation = brand.translations.find(t => {
        const code = getLanguageCode(t)
        return code && code.startsWith('ar')
      })
    }
    
    // If not found and language is "en", try variations like "en-US"
    if (!translation && language === "en") {
      translation = brand.translations.find(t => {
        const code = getLanguageCode(t)
        return code && code.startsWith('en')
      })
    }
    
    return translation?.name || brand.name;
  }, [brand.name, brand.translations, language]);

  const [hasError, setHasError] = useState(false);

  return (
    <Link 
      href={`/brands/${brand.name}`} 
      className="group block h-full"
    >
      <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50">
        {/* Animated gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/10 group-hover:to-primary/5 transition-all duration-500 pointer-events-none" />
        
        {/* Content container */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full p-5">
          {/* Image container with subtle backdrop */}
          <div className="relative w-full aspect-square max-w-[120px] mb-4 group-hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 flex items-center justify-center h-full shadow-inner">
              <div className="relative w-full h-full">
                <Image
                  src={hasError ? '/default-brand-icon.png' : imgSrc}
                  alt={brandName}
                  fill
                  className="object-contain drop-shadow-sm"
                  sizes="120px"
                  onError={() => setHasError(true)}
                />
              </div>
            </div>
          </div>
          
          {/* Brand name with modern typography */}
          <div className="w-full text-center">
            <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {brandName}
            </h3>
            {/* Animated underline */}
            <div className="mt-2 h-0.5 w-0 group-hover:w-12 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent transition-all duration-300" />
          </div>
        </div>
        
        {/* Subtle shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>
    </Link>
  );
};

const BrandsPage = () => {
  const { t } = useTranslations();
  const { language } = useLanguage();
  const [brands, setBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const ITEMS_PER_PAGE = 20;

  // Fetch brands with optimized fields
  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { success, data, error: apiError } = await getAllBrands(true);
        if (success) {
          // Remove duplicates based on name
          const uniqueBrands = [];
          const seenNames = new Set();
          for (const brand of data) {
            if (brand.name && !seenNames.has(brand.name)) {
              seenNames.add(brand.name);
              uniqueBrands.push(brand);
            }
          }
          setBrands(uniqueBrands);
        } else {
          setError(apiError || 'Failed to fetch brands');
        }
      } catch (err) {
        setError('Unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter and paginate brands
  const { filteredBrands, totalPages, paginatedBrands } = useMemo(() => {
    let filtered = brands;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = brands.filter((brand) => {
        const name = brand.name?.toLowerCase() || '';
        const translatedNames = brand.translations?.map(t => t.name?.toLowerCase() || '') || [];
        return name.includes(query) || translatedNames.some(tn => tn.includes(query));
      });
    }
    
    // Calculate pagination
    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    return {
      filteredBrands: filtered,
      totalPages: total,
      paginatedBrands: paginated
    };
  }, [brands, searchQuery, currentPage]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-5">
            {Array.from({ length: 16 }).map((_, index) => (
              <BrandCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Modern Header: Logo/Back on left, Title in center/right, Search on right */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              {t('ourBrands')}
            </h1>
          </div>
          
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <input
              type="text"
              placeholder={t('filterBrands') || 'Search brands...'}
              className="w-full pl-10 px-4 py-2.5 border border-primary/30 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
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
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">{t('noBrandsFound') || 'No brands found'}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('tryAdjustingFilter') || 'Try adjusting your search'}</p>
          </div>
        ) : (
          <>
            {/* Brands Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-5 mb-8">
              {paginatedBrands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} language={language} />
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
                  <span className="hidden sm:inline text-sm">{language === 'ar' ? (t('next') || 'التالي') : (t('prev') || 'Prev')}</span>
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
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
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
                      );
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
                    <span className="hidden sm:inline text-sm">{t('next') || 'Next'}</span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={language === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                  </svg>
                  {language === 'ar' && (
                    <span className="hidden sm:inline text-sm">{t('prev') || 'السابق'}</span>
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
  );
};

export default BrandsPage;
