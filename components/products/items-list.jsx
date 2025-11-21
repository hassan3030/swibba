"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Loader2, Filter, X, Calendar, MapPin, Banknote , Package, ShoppingBag, Navigation, ChevronDown } from "lucide-react"
import { ItemCardProfile } from "@/components/products/item-card-profile"
import { ItemsListSkeleton } from "@/components/loading/items-list-skeleton"
import { categoriesName, itemsStatus, countriesList } from "@/lib/data"
import { getProductsEnhanced } from "@/callAPI/products"
import { useTranslations } from "@/lib/use-translations"
import { getAllCategories , getAllSubCategories , getAllBrands , getAllModels } from "@/callAPI/static"
import { useLanguage } from "@/lib/language-provider"
import { useToast } from "@/hooks/use-toast"

// Animation variants
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
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      duration: 0.6,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: {
      duration: 0.3,
    },
  },
}

const filterVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20,
    },
  },
}

const paginationVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

const pageTransitionVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

const sidebarVariants = {
  hidden: {
    x: "-100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.3,
    },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export function ItemsList({
  items,
  showFilters = true,
  showCategoriesFilter = true,
  showbtn = true,
  showSwitchHeart = true,
  defaultCategory = "all",
  LinkItemOffer=false,
  totalCount = null,
  skipFetch = false, // New prop to skip fetching if data already provided
}) {
  // const [products, setProducts] = useState([])
  const [allItems, setAllItems] = useState(items || []) // Store all items
  const [displayedItems, setDisplayedItems] = useState([]) // Filtered items
  const [isLoading, setIsLoading] = useState(!items || items.length === 0) // Load if no items provided
  const [isPaginationLoading, setIsPaginationLoading] = useState(false) // Loading state for pagination changes
  const [productsCount, setProductsCount] = useState(0)
  const [allItemsFetched, setAllItemsFetched] = useState(false) // Track if all items are already loaded
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState(defaultCategory)
  const [page, setPage] = useState(1)
  const [slideDirection, setSlideDirection] = useState(0)
  const [showFilterSidebar, setShowFilterSidebar] = useState(false)
  const { isRTL, toggleLanguage } = useLanguage()
  const { toast } = useToast()
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  
  // Static data states
  const [allCategoriesData, setAllCategoriesData] = useState([])
  const [allSubCategoriesData, setAllSubCategoriesData] = useState([])
  const [allBrandsData, setAllBrandsData] = useState([])
  const [allModelsData, setAllModelsData] = useState([])
  
  // Advanced filter states
  const [filters, setFilters] = useState({
    name: "",
    category: "all", // Single category filter
    subCategories: [], // Multi-select subcategories
    brands: [], // Multi-select brands
    models: [], // Multi-select models
    allowedCategories: [],
    location: {
      country: "all",
      city: "",
      useCurrentLocation: false,
      latitude: null,
      longitude: null,
      radius: 10, // km
    },
    dateRange: {
      from: "",
      to: "",
    },
    status: "all", // item status
    priceRange: {
      min: "",
      max: "",
    },
  })
  
  // UI states for multi-select
  const [allowedCategoriesOpen, setAllowedCategoriesOpen] = useState(false)
  const [subCategoriesOpen, setSubCategoriesOpen] = useState(false)
  const [brandsOpen, setBrandsOpen] = useState(false)
  const [modelsOpen, setModelsOpen] = useState(false)
  const router = useRouter()
  const { t } = useTranslations()
  const itemsPerPage = 12

  // Load all items on component mount
  useEffect(() => {
    const controller = new AbortController()
    
    const loadAllItems = async () => {
      // If items are provided as props and skipFetch is true, use them directly
      if (items && items.length > 0) {
        setAllItems(items)
        setAllItemsFetched(true)
        setIsLoading(false)
        return
      }
      
      // Skip fetching if explicitly told to and no items provided
      if (skipFetch) {
        setAllItemsFetched(true)
        setIsLoading(false)
        return
      }
      
      // Otherwise, fetch all items from API
      setIsLoading(true)
      try {
        // Fetch all products without limit parameter
        const response = await getProductsEnhanced({})
        if (response.success) {
          setAllItems(response.data || [])
          setProductsCount(response.data?.length || 0)
          setAllItemsFetched(true)
        } else {
          setAllItems([])
          setProductsCount(0)
          setAllItemsFetched(true)
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Error loading items:", error)
        }
        setAllItems([])
        setProductsCount(0)
        setAllItemsFetched(true)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadAllItems()
    
    return () => controller.abort()
  }, [items, skipFetch])

  // Load static data (categories, subcategories, brands, models)
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [catsRes, subCatsRes, brandsRes, modelsRes] = await Promise.all([
          getAllCategories(),
          getAllSubCategories(),
          getAllBrands(),
          getAllModels()
        ])
        
        if (catsRes?.success) setAllCategoriesData(catsRes.data || [])
        if (subCatsRes?.success) setAllSubCategoriesData(subCatsRes.data || [])
        if (brandsRes?.success) setAllBrandsData(brandsRes.data || [])
        if (modelsRes?.success) setAllModelsData(modelsRes.data || [])
      } catch (error) {
        // console.error("Error loading static data:", error)
      }
    }
    
    loadStaticData()
  }, [])

  // Sync defaultCategory with category state
  useEffect(() => {
    setCategory(defaultCategory)
    setFilters(prev => ({ ...prev, category: defaultCategory }))
  }, [defaultCategory])

  // Memoized function to check if any filters are applied
  const hasActiveFilters = useMemo(() => {
    return (
      category !== "all" ||
      filters.category !== "all" ||
      searchTerm !== "" ||
      filters.name !== "" ||
      filters.subCategories.length > 0 ||
      filters.brands.length > 0 ||
      filters.models.length > 0 ||
      filters.allowedCategories.length > 0 ||
      (filters.location.country && filters.location.country !== "all") ||
      filters.location.city !== "" ||
      filters.location.useCurrentLocation ||
      filters.dateRange.from !== "" ||
      filters.dateRange.to !== "" ||
      filters.status !== "all" ||
      filters.priceRange.min !== "" ||
      filters.priceRange.max !== ""
    )
  }, [category, searchTerm, filters])
  
  // Local filtering and pagination - filter allItems locally
  useEffect(() => {
    let filteredItems = [...allItems]
    
    // Apply search filter with RTL support
    if (searchTerm) {
      filteredItems = filteredItems.filter(item => {
        const itemName = !isRTL ? item.translations?.[0]?.name : item.translations?.[1]?.name || item.name
        const itemDescription = !isRTL ? item.translations?.[0]?.description : item.translations?.[1]?.description || item.description
        return itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               itemDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }
    
    // Apply name filter with RTL support
    if (filters.name) {
      filteredItems = filteredItems.filter(item => {
        const itemName = !isRTL ? item.translations?.[0]?.name : item.translations?.[1]?.name || item.name
        return itemName?.toLowerCase().includes(filters.name.toLowerCase())
      })
    }
    
    // Apply category filter (from main filter dropdown)
    const activeCategory = category !== "all" ? category : filters.category
    if (activeCategory !== "all") {
      filteredItems = filteredItems.filter(item => 
        item.category?.toLowerCase() === activeCategory.toLowerCase()
      )
    }
    
    // Apply subCategories filter
    if (filters.subCategories.length > 0) {
      filteredItems = filteredItems.filter(item => {
        if (!item.sub_category) return false
        const itemSubCatId = typeof item.sub_category === 'object' ? item.sub_category?.id : item.sub_category
        return filters.subCategories.some(subCatId => {
          const filterSubCatId = typeof subCatId === 'object' ? subCatId?.id : subCatId
          return String(itemSubCatId) === String(filterSubCatId)
        })
      })
    }
    
    // Apply brands filter
    if (filters.brands.length > 0) {
      filteredItems = filteredItems.filter(item => {
        if (!item.brand) return false
        const itemBrandId = typeof item.brand === 'object' ? item.brand?.id : item.brand
        return filters.brands.some(brandId => {
          const filterBrandId = typeof brandId === 'object' ? brandId?.id : brandId
          return String(itemBrandId) === String(filterBrandId)
        })
      })
    }
    
    // Apply models filter
    if (filters.models.length > 0) {
      filteredItems = filteredItems.filter(item => {
        if (!item.model) return false
        const itemModelId = typeof item.model === 'object' ? item.model?.id : item.model
        return filters.models.some(modelId => {
          const filterModelId = typeof modelId === 'object' ? modelId?.id : modelId
          return String(itemModelId) === String(filterModelId)
        })
      })
    }
    
    // Apply status filter
    if (filters.status !== "all") {
      filteredItems = filteredItems.filter(item => item.status_item === filters.status)
    }
    
    // Apply price range filters
    if (filters.priceRange.min) {
      filteredItems = filteredItems.filter(item => 
        parseFloat(item.price) >= parseFloat(filters.priceRange.min)
      )
    }
    if (filters.priceRange.max) {
      filteredItems = filteredItems.filter(item => 
        parseFloat(item.price) <= parseFloat(filters.priceRange.max)
      )
    }
    
    // Apply location filters
    if (filters.location.country && filters.location.country !== "all") {
      filteredItems = filteredItems.filter(item => 
        item.country?.toLowerCase().includes(filters.location.country.toLowerCase())
      )
    }
    if (filters.location.city) {
      filteredItems = filteredItems.filter(item => 
        item.city?.toLowerCase().includes(filters.location.city.toLowerCase())
      )
    }
    
    // Apply geolocation filter
    if (filters.location.useCurrentLocation && filters.location.latitude && filters.location.longitude) {
      filteredItems = filteredItems.filter(item => {
        if (!item.latitude || !item.longitude) return false
        const distance = calculateDistance(
          filters.location.latitude, filters.location.longitude,
          parseFloat(item.latitude), parseFloat(item.longitude)
        )
        return distance <= (parseFloat(filters.location.radius) || 10)
      })
    }
    
    // Apply allowed categories filter
    if (filters.allowedCategories.length > 0) {
      filteredItems = filteredItems.filter(item => {
        if (!item.allowed_categories) return false
        return filters.allowedCategories.some(cat => 
          item.allowed_categories.includes(cat)
        )
      })
    }
    
    // Apply date range filters
    if (filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from)
      filteredItems = filteredItems.filter(item => {
        const itemDate = new Date(item.date_created)
        return itemDate >= fromDate
      })
    }
    if (filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to)
      filteredItems = filteredItems.filter(item => {
        const itemDate = new Date(item.date_created)
        return itemDate <= toDate
      })
    }
    
    // Update filtered items and count
    setDisplayedItems(filteredItems)
    setProductsCount(filteredItems.length)
    
    // Reset to page 1 if current page is beyond available pages
    const maxPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))
    if (page > maxPages) {
      setPage(1)
    }
  }, [allItems, category, searchTerm, filters, isRTL, page, itemsPerPage])

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Pagination logic - local pagination only
  const totalPages = Math.max(1, Math.ceil(productsCount / itemsPerPage))
  
  // Apply local pagination to displayedItems
  const paginatedItems = (() => {
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return Array.isArray(displayedItems) ? displayedItems.slice(startIndex, endIndex) : []
  })()

  const handleSearch = () => {
    setPage(1)
    // Filtering is handled by useEffect dependency
  }
  
  const handleCategoryChange = (value) => {
    setCategory(value)
    setPage(1)
    // Filtering is handled by useEffect dependency
  }
  
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    
    // Show skeleton only on first pagination if all items aren't fetched yet
    if (!allItemsFetched && page === 1) {
      setIsPaginationLoading(true)
      // Simulate loading delay for better UX
      const timer = setTimeout(() => {
        setIsPaginationLoading(false)
      }, 300)
      // Cleanup handled by component lifecycle
    }
    
    setSlideDirection(newPage > page ? 1 : -1)
    setPage(newPage)
  }

  // Advanced filter handlers
  const updateFilter = (filterPath, value) => {
    setPage(1) // Reset to first page when filter changes
    setFilters(prev => {
      const newFilters = { ...prev }
      const keys = filterPath.split('.')
      let current = newFilters
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newFilters
    })
  }

  const toggleArrayFilter = (filterPath, value) => {
    setPage(1) // Reset to first page when filter changes
    setFilters(prev => {
      const newFilters = { ...prev }
      let currentArray = newFilters[filterPath] || []
      
      // If "all" is currently selected, clear it when selecting individual items
      if (currentArray.includes("all")) {
        currentArray = []
      }
      
      if (currentArray.includes(value)) {
        newFilters[filterPath] = currentArray.filter(item => item !== value)
      } else {
        newFilters[filterPath] = [...currentArray, value]
      }
      
      return newFilters
    })
  }

  const toggleAllCategories = (filterPath) => {
    setPage(1) // Reset to first page when filter changes
    setFilters(prev => {
      const newFilters = { ...prev }
      const currentArray = newFilters[filterPath] || []
      
      // If "all" is already selected, deselect it (clear array)
      if (currentArray.includes("all")) {
        newFilters[filterPath] = [] 
      } else {
        // Otherwise, select "all" (clear individual selections and add "all")
        newFilters[filterPath] = ["all"]
      }
      
      return newFilters
    })
  }

  const clearAllFilters = () => {
    setPage(1) // Reset to first page
    setFilters({
      name: "",
      category: "all",
      subCategories: [],
      brands: [],
      models: [],
      allowedCategories: [],
      location: {
        country: "all",
        city: "",
        useCurrentLocation: false,
        latitude: null,
        longitude: null,
        radius: 10,
      },
      dateRange: {
        from: "",
        to: "",
      },
      status: "all",
      priceRange: {
        min: "",
        max: "",
      },
    })
    setCategory("all")
    setSearchTerm("")
  }

  // Geolocation functionality
  const getCurrentLocation = () => {
    setIsGettingLocation(true)

    if (!window.isSecureContext) {
      toast({
        title: t("geolocationErrorTitle") || "Geolocation Error",
        description: t("geolocationInsecure") || "Geolocation is only available on secure (HTTPS) connections.",
        variant: "destructive",
      })
      updateFilter("location.useCurrentLocation", false)
      setIsGettingLocation(false)
      return
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateFilter("location.latitude", position.coords.latitude)
          updateFilter("location.longitude", position.coords.longitude)
          updateFilter("location.useCurrentLocation", true)
          toast({
            title: t("locationSuccessTitle") || "Location Found",
            description: t("locationSuccessDesc") || "Your current location has been applied to the filters.",
            variant: "success",
          })
          setIsGettingLocation(false)
        },
        (error) => {
          let title = t("locationError") || "Could not get your location."
          let description = ""

          switch (error.code) {
            case error.PERMISSION_DENIED:
              description = t("locationPermissionDenied") || "You have denied permission to access your location. Please enable it in your browser settings."
              break
            case error.POSITION_UNAVAILABLE:
              description = t("locationPositionUnavailable") || "Your location information is currently unavailable."
              break
            case error.TIMEOUT:
              description = t("locationTimeout") || "The request to get your location timed out."
              break
            default:
              description = t("locationUnknownError") || "An unknown error occurred while trying to get your location."
              break
          }
          
          toast({ title, description, variant: "destructive" })
          updateFilter("location.useCurrentLocation", false)
          setIsGettingLocation(false)
        }
      )
    } else {
      toast({
        title: t("geolocationErrorTitle") || "Geolocation Error",
        description: t("geolocationNotSupported") || "Geolocation is not supported by this browser.",
        variant: "destructive",
      })
      updateFilter("location.useCurrentLocation", false)
      setIsGettingLocation(false)
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.name) count++
    if (filters.category !== "all") count++
    if (filters.subCategories.length > 0) count++
    if (filters.brands.length > 0) count++
    if (filters.models.length > 0) count++
    if (filters.allowedCategories.length > 0) count++
    if (filters.location.country && filters.location.country !== "all") count++
    if (filters.location.city) count++
    if (filters.location.useCurrentLocation) count++
    if (filters.dateRange.from || filters.dateRange.to) count++
    if (filters.status !== "all") count++
    if (filters.priceRange.min || filters.priceRange.max) count++
    return count
  }

  return (
    <motion.div className="space-y-6 mt-5" initial="hidden" animate="visible" variants={containerVariants}>
      {showFilters && (


        <motion.div className="flex flex-col gap-4 sm:flex-row" variants={filterVariants}>
          <motion.div
            className="relative flex-1"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Input
              placeholder={t("searchItems") || "Search items..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="border pr-10 transition-all duration-300 focus:ring-2 hover:border-primary/90  focus:ring-primary/20 focus:border-primary/20 min-w-52"
            />
          </motion.div>
          

           <div className="flex flex-col gap-2 sm:flex-row w-full lg:w-1/2">
           {/* Advanced Filter Button */}
           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-1/2">
             <Button
               variant="outline"
               onClick={() => setShowFilterSidebar(true)}
               className="relative flex items-center gap-2 transition-all duration-300 hover:border-primary/50 w-full"
             >
               <Filter className="h-4 w-4" />
               {/* {t("advancedFilters") || "Advanced Filters"} */}
               {getActiveFiltersCount() > 0 && (
                 <motion.span
                   className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ type: "spring", stiffness: 500, damping: 15 }}
                 >
                   {getActiveFiltersCount()}
                 </motion.span>
               )}
             </Button>
           </motion.div>
           {showCategoriesFilter && (
             <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="w-full sm:w-1/2">
               <Select value={category} onValueChange={handleCategoryChange}>
                 <SelectTrigger className="w-full transition-all duration-300 focus:ring-2 focus:ring-primary/20 ">
                   <SelectValue placeholder={t("showAllCategories") || "Show All Categories"} />
                 </SelectTrigger>
                <SelectContent className="max-h-40  ">
                  <SelectItem key="all" value="all" className="capitalize hover:!bg-primary/40">
                    {t("allCategories") || "All Categories"}
                  </SelectItem>
                  {categoriesName.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize hover:!bg-primary/40">
                      {t(cat) || cat}
                    </SelectItem>
                  ))}
                 </SelectContent>
               </Select>
             </motion.div>
           )}

           </div>

        </motion.div>
      )}

      <AnimatePresence mode="wait"  >
        {isLoading || isPaginationLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="loading"
          >
            <ItemsListSkeleton count={itemsPerPage} />
          </motion.div>
        ) : paginatedItems.length === 0 ? (
          <motion.div
            className="flex h-40 flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            key="empty"
          >
            <motion.p
              className="text-lg font-medium"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t("noItemsFound") || "No items found"}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button onClick={() => router.push("/")}>{t("goBack") || "Go Back"}</Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="content">
            <AnimatePresence mode="wait" custom={slideDirection}>
              <motion.div
                key={page}
                custom={slideDirection}
                variants={pageTransitionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 400, damping: 35, mass: 0.8 },
                  opacity: { duration: 0.15 },
                }}
                className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6 w-full"
              >
                {paginatedItems.map((item, index) => (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <ItemCardProfile {...item} showbtn={showbtn} showSwitchHeart={showSwitchHeart} LinkItemOffer={LinkItemOffer} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

           
            <motion.div variants={paginationVariants} initial="hidden" animate="visible">
              <SimplePagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filter Sidebar */}
      <AnimatePresence>
        {showFilterSidebar && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed -top-6 inset-0 bg-black/50 backdrop-blur-sm z-[10000000] "
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowFilterSidebar(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              className={`fixed  -top-6 h-screen w-80 bg-background  border-border shadow-lg z-[10000001] overflow-y-auto ${isRTL?'border-l right-0':'border-r left-0'} `}
              // className="fixed left-0 -top-6 h-screen w-80 bg-background border-r border-border shadow-lg z-50 overflow-y-auto"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Sidebar Header */}
              <motion.div 
                className="flex items-center justify-between p-4 border-b border-border"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  {t("advancedFilters") || "Advanced Filters"}
                </h3>
                <motion.button
                  onClick={() => setShowFilterSidebar(false)}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </motion.div>

              {/* Filter Content */}
              <motion.div 
                className="p-4 space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Name Filter */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    {t("itemName") || "Item Name"}
                  </label>
                  <Input
                    placeholder={t("searchByName") || "Search by name..."}
                    value={filters.name}
                    onChange={(e) => updateFilter("name", e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                </motion.div>

                {/* Categories Filter
                 <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    {t("categories") || "Categories"}
                  </label>
                  <Popover open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={categoriesOpen}
                        className="w-full justify-between"
                      >
                        {filters.categories.length > 0
                          ? `${filters.categories.length} selected`
                          : t("selectCategories") || "Select categories..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder={t("searchCategories") || "Search categories..."} />
                        <CommandEmpty>{t("noCategoriesFound") || "No categories found."}</CommandEmpty>
                        <CommandList className="max-h-40">
                          <CommandGroup>
                            {categoriesName.map((cat) => (
                              <CommandItem
                                key={cat}
                                onSelect={() => toggleArrayFilter("categories", cat)}
                                className="cursor-pointer"
                              >
                                <div className="flex items-center space-x-2 w-full">
                                  <input
                                    type="checkbox"
                                    checked={filters.categories.includes(cat)}
                                    onChange={() => toggleArrayFilter("categories", cat)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <span className="capitalize">{t(cat) || cat}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {filters.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {filters.categories.map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {t(cat) || cat}
                          <button
                            onClick={() => toggleArrayFilter("categories", cat)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div> */}

                {/* Category Filter */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    {t("category") || "Category"}
                  </label>
                  <Select 
                    value={filters.category} 
                    onValueChange={(value) => updateFilter("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectCategory") || "Select Category"} />
                    </SelectTrigger>
                    <SelectContent className="z-[10000020]">
                      <SelectItem value="all" className="hover:!bg-primary/40">{t("allCategories") || "All Categories"}</SelectItem>
                      {categoriesName.map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize hover:!bg-primary/40">
                          {t(cat) || cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* SubCategories Filter */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  

                  <label className="text-sm font-medium flex items-center gap-2">
                  <Package className="inline h-4 w-4 text-primary" />

                    {t("subCategories") || "Sub Categories"}
                  </label>
                  <Popover open={subCategoriesOpen} onOpenChange={setSubCategoriesOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={subCategoriesOpen}
                        className="w-full justify-between"
                      >
                        {filters.subCategories.length > 0
                          ? `${filters.subCategories.length} selected`
                          : t("selectSubCategories") || "Select sub categories..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 z-[10000020]" align="start">
                      <Command className="max-h-[400px]">
                        <CommandInput placeholder={t("searchSubCategories") || "Search sub categories..."} />
                        <CommandEmpty>{t("noSubCategoriesFound") || "No sub categories found."}</CommandEmpty>
                        <CommandList className="max-h-[350px] overflow-y-auto">
                          <CommandGroup>
                            {allSubCategoriesData.map((subCat) => {
                              const subCatId = typeof subCat.id === 'object' ? subCat.id?.id : subCat.id
                              const subCatName = !isRTL 
                                ? (subCat.translations?.[0]?.name || subCat.name || "")
                                : (subCat.translations?.[1]?.name || subCat.name || "")
                              const isSelected = filters.subCategories.some(id => {
                                const filterId = typeof id === 'object' ? id?.id : id
                                return String(subCatId) === String(filterId)
                              })
                              return (
                                <CommandItem
                                  key={subCatId}
                                  onSelect={() => toggleArrayFilter("subCategories", subCatId)}
                                  className="cursor-pointer hover:!bg-primary/40"
                                >
                                  <div className="flex items-center space-x-2 w-full">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleArrayFilter("subCategories", subCatId)}
                                      className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span>{subCatName}</span>
                                  </div>
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {filters.subCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {filters.subCategories.map((subCatId) => {
                        const subCat = allSubCategoriesData.find(sc => {
                          const scId = typeof sc.id === 'object' ? sc.id?.id : sc.id
                          return String(scId) === String(subCatId)
                        })
                        const label = subCat 
                          ? (!isRTL ? (subCat.translations?.[0]?.name || subCat.name) : (subCat.translations?.[1]?.name || subCat.name))
                          : subCatId
                        return (
                          <Badge key={subCatId} variant="secondary" className="text-xs">
                            {label}
                            <button
                              onClick={() => toggleArrayFilter("subCategories", subCatId)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </motion.div>

                {/* Brands Filter */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.47 }}
                >
                 <label className="text-sm font-medium flex items-center gap-2">
                    {t("brands") || "Brands"}
                  </label>
                  <Popover open={brandsOpen} onOpenChange={setBrandsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={brandsOpen}
                        className="w-full justify-between"
                      >
                        {filters.brands.length > 0
                          ? `${filters.brands.length} selected`
                          : t("selectBrands") || "Select brands..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 z-[10000020]" align="start">
                      <Command className="max-h-[400px]">
                        <CommandInput placeholder={t("searchBrands") || "Search brands..."} />
                        <CommandEmpty>{t("noBrandsFound") || "No brands found."}</CommandEmpty>
                        <CommandList className="max-h-[350px] overflow-y-auto">
                          <CommandGroup>
                            {allBrandsData.map((brand) => {
                              const brandId = typeof brand.id === 'object' ? brand.id?.id : brand.id
                              const brandName = !isRTL 
                                ? (brand.translations?.[0]?.name || brand.name || "")
                                : (brand.translations?.[1]?.name || brand.name || "")
                              const isSelected = filters.brands.some(id => {
                                const filterId = typeof id === 'object' ? id?.id : id
                                return String(brandId) === String(filterId)
                              })
                              return (
                                <CommandItem
                                  key={brandId}
                                  onSelect={() => toggleArrayFilter("brands", brandId)}
                                  className="cursor-pointer hover:!bg-primary/40"
                                >
                                  <div className="flex items-center space-x-2 w-full">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleArrayFilter("brands", brandId)}
                                      className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span>{brandName}</span>
                                  </div>
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {filters.brands.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {filters.brands.map((brandId) => {
                        const brand = allBrandsData.find(b => {
                          const bId = typeof b.id === 'object' ? b.id?.id : b.id
                          return String(bId) === String(brandId)
                        })
                        const label = brand 
                          ? (!isRTL ? (brand.translations?.[0]?.name || brand.name) : (brand.translations?.[1]?.name || brand.name))
                          : brandId
                        return (
                          <Badge key={brandId} variant="secondary" className="text-xs">
                            {label}
                            <button
                              onClick={() => toggleArrayFilter("brands", brandId)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </motion.div>

                {/* Models Filter */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.49 }}
                >
                  <label className="text-sm font-medium">
                    {t("models") || "Models"}
                  </label>
                  <Popover open={modelsOpen} onOpenChange={setModelsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={modelsOpen}
                        className="w-full justify-between"
                      >
                        {filters.models.length > 0
                          ? `${filters.models.length} selected`
                          : t("selectModels") || "Select models..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 z-[10000020]" align="start">
                      <Command className="max-h-[400px]">
                        <CommandInput placeholder={t("searchModels") || "Search models..."} />
                        <CommandEmpty>{t("noModelsFound") || "No models found."}</CommandEmpty>
                        <CommandList className="max-h-[350px] overflow-y-auto">
                          <CommandGroup>
                            {allModelsData.map((model) => {
                              const modelId = typeof model.id === 'object' ? model.id?.id : model.id
                              const modelName = !isRTL 
                                ? (model.translations?.[0]?.name || model.name || "")
                                : (model.translations?.[1]?.name || model.name || "")
                              const isSelected = filters.models.some(id => {
                                const filterId = typeof id === 'object' ? id?.id : id
                                return String(modelId) === String(filterId)
                              })
                              return (
                                <CommandItem
                                  key={modelId}
                                  onSelect={() => toggleArrayFilter("models", modelId)}
                                  className="cursor-pointer hover:!bg-primary/40"
                                >
                                  <div className="flex items-center space-x-2 w-full">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleArrayFilter("models", modelId)}
                                      className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span>{modelName}</span>
                                  </div>
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {filters.models.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {filters.models.map((modelId) => {
                        const model = allModelsData.find(m => {
                          const mId = typeof m.id === 'object' ? m.id?.id : m.id
                          return String(mId) === String(modelId)
                        })
                        const label = model 
                          ? (!isRTL ? (model.translations?.[0]?.name || model.name) : (model.translations?.[1]?.name || model.name))
                          : modelId
                        return (
                          <Badge key={modelId} variant="secondary" className="text-xs">
                            {label}
                            <button
                              onClick={() => toggleArrayFilter("models", modelId)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </motion.div>

                {/* Allowed Categories Filter */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.51 }}
                >
                  <label className="text-sm font-medium">
                    {t("allowedCategories") || "Allowed Categories for Exchange"}
                  </label>
                  <Popover open={allowedCategoriesOpen} onOpenChange={setAllowedCategoriesOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={allowedCategoriesOpen}
                        className="w-full justify-between "
                      >
                        {filters.allowedCategories.includes("all")
                          ? t("allCategories") || "All Categories"
                          : filters.allowedCategories.length > 0
                          ? `${filters.allowedCategories.length} selected`
                          : t("selectAllowedCategories") || "Select allowed categories..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 z-[10000020]" align="start">
                      <Command className="max-h-[400px]">
                        <CommandInput placeholder={t("searchCategories") || "Search categories..."} />
                        <CommandEmpty>{t("noCategoriesFound") || "No categories found."}</CommandEmpty>
                        <CommandList className="max-h-[350px] overflow-y-auto">
                          <CommandGroup>
                            {/* All Categories Option */}
                            <CommandItem
                              key="all-categories"
                              onSelect={() => toggleAllCategories("allowedCategories")}
                              className="cursor-pointer border-b border-gray-200 mb-1"
                            >
                              <div className="flex items-center space-x-2 w-full">
                                <input
                                  type="checkbox"
                                  checked={filters.allowedCategories.includes("all")}
                                  onChange={() => toggleAllCategories("allowedCategories")}
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="font-semibold hover:!bg-primary/40">{t("allCategories") || "All Categories"}</span>
                              </div>
                            </CommandItem>
                            {categoriesName.map((cat) => (
                              <CommandItem
                                key={cat}
                                onSelect={() => toggleArrayFilter("allowedCategories", cat)}
                                className="cursor-pointer hover:!bg-primary/40"
                              >
                                <div className="flex items-center space-x-2 w-full">
                                  <input
                                    type="checkbox"
                                    checked={filters.allowedCategories.includes(cat)}
                                    onChange={() => toggleArrayFilter("allowedCategories", cat)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <span className="capitalize">{t(cat) || cat}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {filters.allowedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {filters.allowedCategories.includes("all") ? (
                        <Badge key="all" variant="secondary" className="text-xs font-semibold">
                          {t("allCategories") || "All Categories"}
                          <button
                            onClick={() => toggleAllCategories("allowedCategories")}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : (
                        filters.allowedCategories.map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {t(cat) || cat}
                            <button
                              onClick={() => toggleArrayFilter("allowedCategories", cat)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Location Filter */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.52 }}
                >
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {t("location") || "Location"}
                  </label>
                  
                  {/* Geolocation Toggle */}
                  {/* <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useCurrentLocation"
                      checked={filters.location.useCurrentLocation}
                      disabled={isGettingLocation}
                      onChange={(e) => {
                        if (e.target.checked) {
                          getCurrentLocation()
                        } else {
                          updateFilter("location.useCurrentLocation", false)
                          updateFilter("location.latitude", null)
                          updateFilter("location.longitude", null)
                        }
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="useCurrentLocation" className="text-sm flex items-center gap-1 cursor-pointer">
                      {isGettingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Navigation className="h-4 w-4" />
                      )}
                      {t("useCurrentLocation") || "Use my current location"}
                    </label>
                  </div> */}

                  {filters.location.useCurrentLocation && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {filters.location.latitude && filters.location.longitude 
                          ? `${t("currentLocation") || "Current location"}: ${filters.location.latitude.toFixed(4)}, ${filters.location.longitude.toFixed(4)}`
                          : t("gettingLocation") || "Getting your location..."}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">{t("searchRadius") || "Search Radius (km)"}</label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={filters.location.radius}
                          onChange={(e) => updateFilter("location.radius", parseInt(e.target.value) || 10)}
                          placeholder="10"
                        />
                      </div>
                    </div>
                  )}

                  {!filters.location.useCurrentLocation && (
                    <div className="space-y-2">
                      <Select 
                        value={filters.location.country} 
                        onValueChange={(value) => updateFilter("location.country", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectCountry") || "Select Country"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto z-[10000020]">
                          <SelectItem value="all" className="hover:!bg-primary/40">{t("allCountries") || "All Countries"}</SelectItem>
                          {countriesList.map((country) => (
                            <SelectItem key={country} value={country} className="hover:!bg-primary/40">
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder={t("city") || "City"}
                        value={filters.location.city}
                        onChange={(e) => updateFilter("location.city", e.target.value)}
                      />
                    </div>
                  )}
                </motion.div>

                {/* Date Range Filter */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.53 }}
                >
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {t("dateRange") || "Date Range"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      placeholder={t("from") || "From"}
                      value={filters.dateRange.from}
                      onChange={(e) => updateFilter("dateRange.from", e.target.value)}
                    />
                    <Input
                      type="date"
                      placeholder={t("to") || "To"}
                      value={filters.dateRange.to}
                      onChange={(e) => updateFilter("dateRange.to", e.target.value)}
                    />
                  </div>
                </motion.div>

                {/* Item Status Filter */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.54 }}
                >
                  <label className="text-sm font-medium">
                    {t("itemStatus") || "Item Condition"}
                  </label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => updateFilter("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectStatus") || "Select Status"} />
                    </SelectTrigger>
                    <SelectContent className="z-[10000020]">
                      <SelectItem value="all" className="hover:!bg-primary/20">{t("allStatuses") || "All Conditions"}</SelectItem>
                      {itemsStatus.map((status) => (
                        <SelectItem key={status} value={status} className="capitalize hover:!bg-primary/40">
                          {t(status) || status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                

                {/* Price Range Filter */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Banknote  className="h-4 w-4 text-primary" />
                    {t("priceRange") || "Price Range"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder={t("minPrice") || "Min Price"}
                      value={filters.priceRange.min}
                      onChange={(e) => updateFilter("priceRange.min", e.target.value)}
                      min="0"
                    />
                    <Input
                      type="number"
                      placeholder={t("maxPrice") || "Max Price"}
                      value={filters.priceRange.max}
                      onChange={(e) => updateFilter("priceRange.max", e.target.value)}
                      min="0"
                    />
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                  className="flex gap-2 pt-4 border-t border-border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.56 }}
                >
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="flex-1"
                  >
                    {t("clearAll") || "Clear All"}
                  </Button>
                  <Button
                    onClick={() => setShowFilterSidebar(false)}
                    className="flex-1"
                  >
                    {t("applyFilters") || "Apply Filters"}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// SimplePagination component - simplified without animations
function SimplePagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useTranslations()

  // if (totalPages <= 1) return null

  return (
    <div className="flex justify-center mt-8 gap-2 py-4">
      <button
        className="px-4 py-2 rounded-lg border dark:text-white bg-card hover:bg-muted disabled:opacity-50 transition-colors shadow-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {t("prev") || "Prev"}
      </button>

      {[...Array(totalPages)].map((_, idx) => (
        <button
          key={idx + 1}
          className={`px-4 py-2 border rounded-lg transition-colors shadow-sm ${
            currentPage === idx + 1 ? "bg-primary text-primary-foreground shadow-md font-semibold" : "bg-card dark:text-white hover:bg-muted"
          }`}
          onClick={() => onPageChange(idx + 1)}
        >
          {idx + 1}
        </button>
      ))}

      <button
        className="px-4 py-2 rounded-lg border bg-card dark:text-white hover:bg-muted disabled:opacity-50 transition-colors shadow-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {t("next") || "Next"}
      </button>
    </div>
  )
}