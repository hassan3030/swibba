"use client"

import { useState, useEffect } from "react"
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
import { getProductsEnhanced, getProducts } from "@/callAPI/products"
import { useTranslations } from "@/lib/use-translations"
import { getAllCategories } from "@/callAPI/static"
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
  useApiPagination = false,
}) {
  const [displayedItems, setDisplayedItems] = useState(items || [])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState(defaultCategory)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(totalCount !== null ? totalCount : (items?.length || 0))
  const [showFilterSidebar, setShowFilterSidebar] = useState(false)
  const { isRTL, toggleLanguage } = useLanguage()
  const { toast } = useToast()
  const [isGettingLocation, setIsGettingLocation] = useState(false)  // Advanced filter states
  const [filters, setFilters] = useState({
    name: "",
    categories: [],
    allowedCategories: [],
    subLevels: {
      level1: "",
      level2: "",
    },
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
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [allowedCategoriesOpen, setAllowedCategoriesOpen] = useState(false)
  const [subLevel2Open, setSubLevel2Open] = useState(false)
  const [subLevel2Options, setSubLevel2Options] = useState([])
  const [catLevelsOpen, setCatLevelsOpen] = useState(false)
  const [catLevelsTree, setCatLevelsTree] = useState([])
  const router = useRouter()
  const { t } = useTranslations()
  const itemsPerPage = 10

  // Sync defaultCategory with category state
  useEffect(() => {
    setCategory(defaultCategory)
  }, [defaultCategory])

  // Initialize totalItems when items are passed as props or totalCount is provided
  useEffect(() => {
    if (totalCount !== null) {
      setTotalItems(totalCount)
    } else if (items && items.length > 0) {
      setTotalItems(items.length)
    }
  }, [items, totalCount])

  // Load sub-level options from categories
  useEffect(() => {
    const load = async () => {
      const res = await getAllCategories()
      if (res?.success) {
        const all = []
        const tree = []
        ;(res.data || []).forEach(cat => {
          const catNameEn = cat?.translations?.[0]?.name || cat?.name || ""
          const catNameAr = cat?.translations?.[1]?.name || cat?.name || ""
          const l1 = cat?.cat_levels?.level_1 || []
          const l1Nodes = l1.map(l => {
            const l1_en = l?.name_en || ""
            const l1_ar = l?.name_ar || ""
            const l2 = l?.level_2 || []
            const l2Nodes = l2.map(s => {
              const label_en = s?.name_en || ""
              const label_ar = s?.name_ar || ""
              const key = label_en || label_ar
              if (key) all.push({ key, label_en, label_ar })
              return { key, label_en, label_ar }
            })
            return { key: l1_en || l1_ar, label_en: l1_en, label_ar: l1_ar, level_2: l2Nodes }
          })
          tree.push({
            cat_key: catNameEn || catNameAr,
            cat_en: catNameEn,
            cat_ar: catNameAr,
            level_1: l1Nodes,
          })
        })
        // de-duplicate by key
        const dedup = []
        const seen = new Set()
        all.forEach(o => { if (!seen.has(o.key)) { seen.add(o.key); dedup.push(o) } })
        setSubLevel2Options(dedup)
        setCatLevelsTree(tree)
      }
    }
    load()
  }, [])
  
  const fetchFilteredItems = async () => {
    setIsLoading(true)
    try {
      // Build API filter parameters
      const apiFilters = {
        page: page,
        limit: itemsPerPage,
      }
      // Subcategory filters (API-side if supported)
      if (filters.subLevels.level1) {
        apiFilters.sub_level1 = filters.subLevels.level1
      }
      if (filters.subLevels.level2) {
        apiFilters.sub_level2 = filters.subLevels.level2
      }

      // Basic filters
      if (category !== "all") {
        apiFilters.category = category
        // console.log('Category filter applied:', category)
      }

      // Search filter - prioritize searchTerm over filters.name
      if (searchTerm) {
        apiFilters.search = searchTerm
        // console.log('Search filter applied:', searchTerm)
      } else if (filters.name) {
        apiFilters.search = filters.name
        // console.log('Name filter applied:', filters.name)
      }

      if (filters.categories.length > 0) {
        apiFilters.categories = filters.categories
        // console.log('Categories filter applied:', filters.categories)
      }

      if (filters.allowedCategories.length > 0) {
        apiFilters.allowed_categories = filters.allowedCategories
        // console.log('Allowed categories filter applied:', filters.allowedCategories)
      }

      if (filters.location.country && filters.location.country !== "all") {
        apiFilters.country = filters.location.country
        // console.log('Country filter applied:', filters.location.country)
      }

      if (filters.location.city) {
        apiFilters.city = filters.location.city
        // console.log('City filter applied:', filters.location.city)
      }

      if (filters.location.useCurrentLocation && filters.location.latitude && filters.location.longitude) {
        apiFilters.latitude = filters.location.latitude
        apiFilters.longitude = filters.location.longitude
        apiFilters.radius = filters.location.radius
        // console.log('Radius filter applied:', filters.location.radius)
      }

      if (filters.status !== "all") {
        apiFilters.status_item = filters.status
        // console.log('Status filter applied:', filters.status)
      }

      if (filters.priceRange.min) {
        apiFilters.min_price = filters.priceRange.min
        // console.log('Min price filter applied:', filters.priceRange.min)
      }

      if (filters.priceRange.max) {
        apiFilters.max_price = filters.priceRange.max
        // console.log('Max price filter applied:', filters.priceRange.max)
      }

      if (filters.dateRange.from) {
        apiFilters.date_from = filters.dateRange.from
        // console.log('Date from filter applied:', filters.dateRange.from)
      }

      if (filters.dateRange.to) {
        apiFilters.date_to = filters.dateRange.to
        //    console.log('Date to filter applied:', filters.dateRange.to)
      }

      // Use getProducts when useApiPagination is true, otherwise use getProductsEnhanced
      const response = useApiPagination 
        ? await getProducts({}, apiFilters) 
        : await getProductsEnhanced(apiFilters)
      // console.log('Filter response:', { 
      //   success: response.success, 
      //   dataLength: response.data?.length, 
      //   total: response.total || response.count,
      //   appliedFilters: apiFilters 
      // })
      
      if (response.success) {
        setDisplayedItems(response.data || [])
        // Use totalCount prop if provided and response doesn't have total, otherwise use response total
        const calculatedTotal = totalCount !== null && (!response.total || response.total === response.count) 
          ? totalCount 
          : (response.total || response.count || 0)
        setTotalItems(calculatedTotal)
      } else {
        // console.error('Failed to fetch items:', response.error)
        setDisplayedItems([])
        setTotalItems(0)
      }
    } catch (error) {
      // console.error('Error fetching filtered items:', error)
      setDisplayedItems([])
      setTotalItems(0)
    } finally {
      setIsLoading(false)
    }
  }

  // API-based filtering and pagination - when no items are passed, or useApiPagination is true, or totalCount is provided
  useEffect(() => {
    if (!items || items.length === 0 || useApiPagination || totalCount !== null) {
      fetchFilteredItems()
    } else {
      // Use passed items directly and apply local filtering
      let filteredItems = [...items]
      
      // Apply local search filter with RTL support
      if (searchTerm) {
        filteredItems = filteredItems.filter(item => {
          const itemName = !isRTL ? item.translations?.[0]?.name : item.translations?.[1]?.name || item.name
          const itemDescription = !isRTL ? item.translations?.[0]?.description : item.translations?.[1]?.description || item.description
          
          return itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 itemDescription?.toLowerCase().includes(searchTerm.toLowerCase())
        })
      }
      
      // Apply local name filter with RTL support
      if (filters.name) {
        filteredItems = filteredItems.filter(item => {
          const itemName = !isRTL ? item.translations?.[0]?.name : item.translations?.[1]?.name || item.name
          return itemName?.toLowerCase().includes(filters.name.toLowerCase())
        })
      }
      
      // Apply local category filter
      if (category !== "all") {
        filteredItems = filteredItems.filter(item => item.category === category)
      }
      
      // Apply local subcategory filters
      if (filters.subLevels.level1) {
        const q = filters.subLevels.level1.toLowerCase()
        filteredItems = filteredItems.filter(item => {
          const l1 = item?.sub_cat?.level_1
          const names = [
            l1?.name,
            l1?.name_en,
            l1?.name_ar,
            item?.level_1,
            item?.sub_category, // legacy
          ]
          return names.some(v => typeof v === 'string' && v.toLowerCase().includes(q))
        })
      }
      if (filters.subLevels.level2) {
        const q = filters.subLevels.level2.toLowerCase()
        filteredItems = filteredItems.filter(item => {
          const l2 = item?.sub_cat?.level_2
          const names = [l2?.name, l2?.name_en, l2?.name_ar]
          return names.some(v => typeof v === 'string' && v.toLowerCase().includes(q))
        })
      }
      if (filters.subLevels.level2List && filters.subLevels.level2List.length > 0) {
        const listLC = filters.subLevels.level2List.map(x => x.toLowerCase())
        filteredItems = filteredItems.filter(item => {
          const l2 = item?.sub_cat?.level_2
          const names = [l2?.name, l2?.name_en, l2?.name_ar].filter(Boolean).map(x => x.toLowerCase())
          return names.some(n => listLC.includes(n))
        })
      }
      if (filters.subLevels.level1List && filters.subLevels.level1List.length > 0) {
        const listLC = filters.subLevels.level1List.map(x => x.toLowerCase())
        filteredItems = filteredItems.filter(item => {
          const l1 = item?.sub_cat?.level_1
          const names = [l1?.name, l1?.name_en, l1?.name_ar, item?.level_1, item?.sub_category]
            .filter(Boolean).map(x => x.toLowerCase())
          return names.some(n => listLC.includes(n))
        })
      }

      // Apply local categories filter
      if (filters.categories.length > 0) {
        filteredItems = filteredItems.filter(item => 
          filters.categories.includes(item.category)
        )
      }
      
      // Apply local status filter
      if (filters.status !== "all") {
        filteredItems = filteredItems.filter(item => item.status_item === filters.status)
      }
      
      // Apply local price range filters
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
      
      // Apply local location filters
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
      
      // Apply local allowed categories filter
      if (filters.allowedCategories.length > 0) {
        filteredItems = filteredItems.filter(item => {
          if (!item.allowed_categories) return false
          return filters.allowedCategories.some(cat => 
            item.allowed_categories.includes(cat)
          )
        })
      }
      
      // Apply local date range filters
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
      
      setDisplayedItems(filteredItems)
      setTotalItems(filteredItems.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, searchTerm, filters, page, items, useApiPagination, totalCount])

 

  // Pagination logic - handle both API and local pagination
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  
  // If items are passed as props, handle local pagination
  const paginatedItems = (() => {
    if (!items || items.length === 0 || useApiPagination || totalCount !== null) {
      // API mode - use all displayedItems (API already handles pagination)
      return Array.isArray(displayedItems) ? displayedItems : []
    } else {
      // Local mode - apply pagination to displayedItems
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return Array.isArray(displayedItems) ? displayedItems.slice(startIndex, endIndex) : []
    }
  })()


  // const totalPages = Math.max(1, Math.ceil(displayedItems.length / itemsPerPage))
  // const paginatedItems =  displayedItems.slice((page - 1) * itemsPerPage, page * itemsPerPage)

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
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
    // Pagination is handled by useEffect dependency
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
      
      // If "all" is currently selected, clear it when selecting individual categories
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
      categories: [],
      allowedCategories: [],
      subLevels: {
        level1: "",
        level2: "",
        level1List: [],
        level2List: [],
      },
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
    if (filters.categories.length > 0) count++
    if (filters.subLevels.level2List) count++
    if (filters.subLevels.level1List) count++
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
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="loading"
          >
            <ItemsListSkeleton count={itemsPerPage > 12 ? 12 : itemsPerPage} />
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
            <motion.div
              className="flex flex-row gap-4 justify-center flex-wrap max-w-screen"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {paginatedItems.map((item, index) => (
                  <motion.div
                   key={item.id || index}
                    variants={itemVariants}
                    custom={index}
                    layout
                    whileHover={{
                      y: -8,
                      transition: { type: "spring", stiffness: 300, damping: 30 },
                    }}
                  >
                    <ItemCardProfile {...item} showbtn={showbtn} showSwitchHeart={showSwitchHeart} LinkItemOffer={LinkItemOffer} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

           
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
              className="fixed -top-6 inset-0 bg-black/50 backdrop-blur-sm z-50 "
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowFilterSidebar(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              className={`fixed  -top-6 h-screen w-80 bg-background  border-border shadow-lg z-50 overflow-y-auto ${isRTL?'border-l right-0':'border-r left-0'} `}
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

              
                {/* Main categories with Level 1 and Level 2 as checkboxes */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.47 }}
                >
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    {t("categories") || "Categories"}
                  </label>
                  <Popover open={catLevelsOpen} onOpenChange={setCatLevelsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={catLevelsOpen}
                        className="w-full justify-between"
                      >
                        {((filters.subLevels.level1List || []).length + (filters.subLevels.level2List || []).length) > 0
                          ? `${(filters.subLevels.level1List || []).length + (filters.subLevels.level2List || []).length} selected`
                          : t("searchCategory") || "Search category ..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        {
                          catLevelsTree?(  <CommandList className="max-h-72">
                            {catLevelsTree.map((cat) => (
                              <CommandGroup key={cat.cat_key} heading={(isRTL ? (cat.cat_ar || cat.cat_en) : (cat.cat_en || cat.cat_ar))}>
                                {cat.level_1.map((l1) => {
                                  const l1Label = isRTL ? (l1.label_ar || l1.label_en) : (l1.label_en || l1.label_ar)
                                  const l1Checked = (filters.subLevels.level1List || []).includes(l1.key)
                                  return (
                                    <div key={`l1-${cat.cat_key}-${l1.key}`} className="px-2 py-1">
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={l1Checked}
                                          onChange={() => {
                                            const current = filters.subLevels.level1List || []
                                            const next = l1Checked ? current.filter(x => x !== l1.key) : [...current, l1.key]
                                            updateFilter("subLevels.level1List", next)
                                          }}
                                          className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="capitalize">{l1Label}</span>
                                      </div>
                                      {(l1.level_2 || []).map((l2) => {
                                        const l2Label = isRTL ? (l2.label_ar || l2.label_en) : (l2.label_en || l2.label_ar)
                                        const l2Checked = (filters.subLevels.level2List || []).includes(l2.key)
                                        return (
                                          <div key={`l2-${cat.cat_key}-${l1.key}-${l2.key}`} className="pl-6 py-1 flex items-center space-x-2">
                                            <input
                                              type="checkbox"
                                              checked={l2Checked}
                                              onChange={() => {
                                                const current = filters.subLevels.level2List || []
                                                const next = l2Checked ? current.filter(x => x !== l2.key) : [...current, l2.key]
                                                updateFilter("subLevels.level2List", next)
                                              }}
                                              className="rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="capitalize">{l2Label}</span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )
                                })}
                              </CommandGroup>
                            ))}
                          </CommandList>):(<CommandInput placeholder={t("searchCategory") || "Search category ..."} />)
                        }
                        
                        
                      
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {((filters.subLevels.level1List || []).length > 0 || (filters.subLevels.level2List || []).length > 0) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(filters.subLevels.level1List || []).map((key) => {
                        const l1 = catLevelsTree.flatMap(c => c.level_1).find(x => x.key === key)
                        const label = isRTL ? (l1?.label_ar || l1?.label_en || key) : (l1?.label_en || l1?.label_ar || key)
                        return (
                          <Badge key={`l1-${key}`} variant="secondary" className="text-xs">
                            {label}
                            <button onClick={() => updateFilter("subLevels.level1List", (filters.subLevels.level1List || []).filter(x => x !== key))} className="ml-1 hover:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      })}
                      {(filters.subLevels.level2List || []).map((key) => {
                        const l2 = subLevel2Options.find(o => o.key === key)
                        const label = isRTL ? (l2?.label_ar || l2?.label_en || key) : (l2?.label_en || l2?.label_ar || key)
                        return (
                          <Badge key={`l2-${key}`} variant="secondary" className="text-xs">
                            {label}
                            <button onClick={() => updateFilter("subLevels.level2List", (filters.subLevels.level2List || []).filter(x => x !== key))} className="ml-1 hover:text-destructive">
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
                  transition={{ delay: 0.5 }}
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
                    <PopoverContent className="w-full p-0 ">
                      <Command>
                        <CommandInput placeholder={t("searchCategories") || "Search categories..."} />
                        <CommandEmpty>{t("noCategoriesFound") || "No categories found."}</CommandEmpty>
                        <CommandList className="max-h-40">
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
                  transition={{ delay: 0.6 }}
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
                        <SelectContent className="max-h-40">
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
                  transition={{ delay: 0.7 }}
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
                  transition={{ delay: 0.8 }}
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
                    <SelectContent>
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
                  transition={{ delay: 1.0 }}
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
                  transition={{ delay: 1.1 }}
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

// SimplePagination component with animations
function SimplePagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useTranslations()

  // if (totalPages <= 1) return null

  return (
    <motion.div
      className="flex justify-center mt-6 gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <motion.button
        className="px-3 py-1 rounded border dark:text-black bg-white hover:bg-gray-100 disabled:opacity-50 transition-all duration-200"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {t("prev") || "Prev"}
      </motion.button>

      {[...Array(totalPages)].map((_, idx) => (
        <motion.button
          key={idx + 1}
          className={`px-3 dark:text-black py-1 border rounded transition-all duration-200 ${
            currentPage === idx + 1 ? "bg-primary text-white shadow-lg" : "bg-white hover:bg-gray-100"
          }`}
          onClick={() => onPageChange(idx + 1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
        >
          {idx + 1}
        </motion.button>
      ))}

      <motion.button
        className="px-3 py-1 dark:text-black rounded border bg-white hover:bg-gray-100 disabled:opacity-50 transition-all duration-200"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {t("next") || "Next"}
      </motion.button>
    </motion.div>
  )
}