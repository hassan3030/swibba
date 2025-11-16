"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ArrowLeftRight, User, Info, AlertCircle, Plus, Minus, Verified, Search, Filter, X, ChevronDown, ArrowUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image" 
import { getAvailableAndUnavailableProducts, getProductByUserId, getProductsOwnerById } from "@/callAPI/products"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { decodedToken, getCookie, validateAuth , removeTarget } from "@/callAPI/utiles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "@/lib/use-translations"
import { getUserById, getUserByProductId , getKYC } from "@/callAPI/users"
import { addOffer, getOfferById } from "@/callAPI/swap" 
import { useParams, useRouter } from "next/navigation"
import { useRTL } from "@/hooks/use-rtl"
import { getMediaType } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getHintByName, getAllCategories, getAllSubCategories, getAllBrands, getAllModels } from "@/callAPI/static";
import { categoriesName } from "@/lib/data";
import ItemCard from "@/components/swap/item-card"
import { mediaURL } from "@/callAPI/utiles";
import { TbShoppingCartUp } from "react-icons/tb";
import { PiSwapBold } from "react-icons/pi";

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

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
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
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

const itemVariants = {
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

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
}

const swapSummaryVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
}

export default function SwapPage() {
  const params = useParams()
  const router = useRouter()
  const id_item_to = params.id_item_to
  const [myItems, setMyItems] = useState([])
  const [otherItems, setOtherItems] = useState([])
  const [selectedMyItems, setSelectedMyItems] = useState([])
  const [selectedOtherItems, setSelectedOtherItems] = useState([])
  const [itemQuantities, setItemQuantities] = useState({}) // Track quantities for each item
  const [itemTotalPrices, setItemTotalPrices] = useState({}) // Track total prices for each item
  const [swapHistory, setSwapHistory] = useState([])
  const [usersOffer, setUsersOffer] = useState([])
  const [allowedCategories, setAllowedCategories] = useState([])
  const [showHint, setShowHint] = useState(false)
  const [disabledOffer, setDisabledOffer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [otherUserId, setOtherUserId] = useState(null)
  const [otherUserData, setOtherUserData] = useState(null)
  const { toast } = useToast()
  const { t } = useTranslations()
  const [myEmail, setMyEmail] = useState("")
  const [otherEmail, setOtherEmail] = useState("")
  const [userData, setUserData] = useState(null)
  const [hintSwapRules, setHintSwapRules] = useState([]);
  const [showSwapHint, setShowSwapHint] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [showFilters, setShowFilters] = useState(false)
  const [filtersSub, setFiltersSub] = useState({ level1List: [], level2List: [] })
  const [catLevelsOpen, setCatLevelsOpen] = useState(false)
  const [catLevelsTree, setCatLevelsTree] = useState([])
  // Chained filters data
  const [allCategories, setAllCategories] = useState([])
  const [allSubCategories, setAllSubCategories] = useState([])
  const [allBrands, setAllBrands] = useState([])
  const [allModels, setAllModels] = useState([])
  // Chained filters selection
  const [chainCategoryId, setChainCategoryId] = useState("")
  const [chainSubCategoryId, setChainSubCategoryId] = useState("")
  const [chainBrandId, setChainBrandId] = useState("")
  const [chainModelId, setChainModelId] = useState("")
  // Chained filters popover open states
  const [openCat, setOpenCat] = useState(false)
  const [openSubCat, setOpenSubCat] = useState(false)
  const [openBrand, setOpenBrand] = useState(false)
  const [openModel, setOpenModel] = useState(false)
  
  // Scroll functionality
  const makeSwapRef = useRef(null)
  
  const scrollToMakeSwap = () => {
    makeSwapRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }
  
  const getHintSwapRulesData = async (name) => {
    try {
      const response = await getHintByName(name);
      setHintSwapRules(response.data);
      // console.log(response.data);
    } catch (error) {
      // console.log(error);
    }
  }
  useEffect(() => {
    getHintSwapRulesData("swap rules");
  }, []);
  // RTL utilities
  const { isRTL, classes, getDirectionClass } = useRTL()

  const getMyDataUser = async()=>{ 
    try {
      const { userId } = await validateAuth()
      const user = await getUserById(userId)
      setUserData(user.data)
      setMyEmail(user.data?.email)
    } catch (error) {
      // console.error("Error getting user data:", error)
    }
  }

  useEffect(() => {
    getMyDataUser()
  }, [])

  // Load chained filter datasets
  useEffect(() => {
    const load = async () => {
      try {
        const [cats, subs, brands, models] = await Promise.all([
          getAllCategories(),
          getAllSubCategories(),
          getAllBrands(),
          getAllModels()
        ])
        if (cats?.success) setAllCategories(cats.data || [])
        if (subs?.success) setAllSubCategories(subs.data || [])
        if (brands?.success) setAllBrands(brands.data || [])
        if (models?.success) setAllModels(models.data || [])
      } catch (e) {
        // silent
      }
    }
    load()
  }, [])

  // Fetch my items
  const getMyItems = useCallback(async () => {
    try {
      const { token, userId } = await validateAuth()
      if (token) {
        setCurrentUserId(userId)
        // console.log("Current user ID:", userId)
        const myProductsData = await getProductByUserId()
        // console.log("My products data:", myProductsData)
        if (myProductsData.success && myProductsData.data) {
          setMyItems(myProductsData.data)
        } else {
          // console.error("Failed to fetch my items:", myProductsData.error)
          setMyItems([])
        }
    } else {
      router.push(`/auth/login`)
      }
    } catch (error) {
      // console.error("Error fetching my items:", error)
      setMyItems([])
    }
  }, [router])

  // Fetch other user's items
  const getOtherItems = useCallback(async () => {
    try {
    const otherUser = await getUserByProductId(id_item_to)
    // console.log("otherUser ", otherUser)
    // console.log("id_item_to ", id_item_to)
      
      if (otherUser.success && otherUser.data) {
        setOtherEmail(otherUser.data?.email)
        setOtherUserId(otherUser.data?.id)
        setOtherUserData(otherUser.data)
        // console.log("Other user ID:", otherUser.data?.id)
        
    const otherProductsData = await getProductsOwnerById(id_item_to)
    // console.log("otherProductsData ", otherProductsData)
        
        if (otherProductsData.success && otherProductsData.data) {
    setOtherItems(otherProductsData.data)
        } else {
          // console.error("Failed to fetch other user's items:", otherProductsData.error)
          setOtherItems([])
        }
      } else {
        // console.error("Failed to get other user info:", otherUser.error)
        setOtherItems([])
      }
    } catch (error) {
      // console.error("Error fetching other user's items:", error)
      setOtherItems([])
    }
  }, [id_item_to])

  // Fetch swap history
  const getSwapHistory = useCallback(async () => {
    try {
      const { token, userId } = await validateAuth()
      if (token) {
        const offers = await getOfferById(userId)
        const users = await Promise.all(offers.data.map((swap) => getUserById(swap.to_user_id)))
        setUsersOffer(users)
        setSwapHistory(offers.data)
      }
    } catch (error) {
      // console.error("Error fetching swap history:", error)
    }
  }, [])

  // Allowed categories logic
  useEffect(() => {
    if (selectedMyItems.length > 0) {
      const selectedCategories = selectedMyItems
        .map((itemId) => {
          const item = myItems.find((p) => p.id === itemId)
          return item?.allowed_categories
        })
        .filter(Boolean)
        .flat()
      setAllowedCategories([...new Set(selectedCategories)])
      setShowHint(true)
    } else {
      setAllowedCategories([])
      setShowHint(false)
      setSelectedOtherItems([])
    }
  }, [selectedMyItems, myItems])

  // // Show hint as toast when it appears
  // useEffect(() => {
  //   if (showHint && hintSwapRules && hintSwapRules.length > 0) {
  //     const currentTranslation = isRTL 
  //       ? hintSwapRules[0]?.translations?.find(t => t.languages_code === 'ar-SA')
  //       : hintSwapRules[0]?.translations?.find(t => t.languages_code === 'en-US');
  //     const title = currentTranslation?.title || (t("SwapHints") || "Swap Hints")
  //     const steps = (currentTranslation?.hints_steps || []).slice(0, 3).join(" • ")
  //     toast({
  //       title,
  //       description: steps || (t("FollowTheRulesForBetterMatches") || "Follow the rules for better matches."),
  //     })
  //   }
  // }, [showHint, hintSwapRules, isRTL])

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await Promise.all([getMyItems(), getOtherItems(), getSwapHistory()])
      setIsLoading(false)
    }
    fetchData()
  }, [getMyItems, getOtherItems, getSwapHistory])

  // Reset target on unmount
  useEffect(() => {
    return () => {
      removeTarget()
    }
  }, [])

  // Remove target when trying to swap with yourself
  useEffect(() => {
    if (currentUserId && otherUserId && currentUserId === otherUserId) {
      removeTarget()
    }
  }, [currentUserId, otherUserId])

  // Quantity change handler
  const handleQuantityChange = useCallback((itemId, quantity, totalPrice) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: quantity
    }))
    setItemTotalPrices(prev => ({
      ...prev,
      [itemId]: totalPrice
    }))
  }, [])


  const handleKYC= async()=>{
    const decoded = await decodedToken()
    const kyc = await getKYC(decoded.id) 
    if (kyc.data === false) {
      toast({
        title: t("completeYourProfile"),
        description: t("DescFaildSwapKYC") || "Required information for swap. Please complete your information.",
        variant: "default",
      })
      router.push(`/profile/settings/editProfile`)

    }
    else {
        router.push(`/profile/settings/editItem/new`)
      }
  }


  // Selection handlers
  const handleMyItemSelect = (itemId) => {
    setSelectedMyItems((prev) => {
      const newSelection = prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      if (prev.includes(itemId)) {
        setSelectedOtherItems([])
        // Remove quantity tracking when deselected
        setItemQuantities(prevQty => {
          const newQty = { ...prevQty }
          delete newQty[itemId]
          return newQty
        })
        setItemTotalPrices(prevPrice => {
          const newPrice = { ...prevPrice }
          delete newPrice[itemId]
          return newPrice
        })
      } else {
        // Initialize quantity when selected
        const item = myItems.find(p => p.id === itemId)
        if (item) {
          setItemQuantities(prev => ({ ...prev, [itemId]: 1 }))
          setItemTotalPrices(prev => ({ ...prev, [itemId]: Number.parseFloat(item.price || 0) }))
        }
      }
      return newSelection
    })
  }

  const handleOtherItemSelect = (itemId) => {
    if (selectedMyItems.length === 0) return
    const item = otherItems.find((p) => p.id === itemId)
    const isAllowedCategory =
      Array.isArray(item?.allowed_categories) && item.allowed_categories.some((cat) => allowedCategories.includes(cat))
    if (isAllowedCategory || allowedCategories.length === 0) {
      setSelectedOtherItems((prev) => {
        const newSelection = prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
        if (prev.includes(itemId)) {
          // Remove quantity tracking when deselected
          setItemQuantities(prevQty => {
            const newQty = { ...prevQty }
            delete newQty[itemId]
            return newQty
          })
          setItemTotalPrices(prevPrice => {
            const newPrice = { ...prevPrice }
            delete newPrice[itemId]
            return newPrice
          })
        } else {
          // Initialize quantity when selected
          if (item) {
            setItemQuantities(prev => ({ ...prev, [itemId]: 1 }))
            setItemTotalPrices(prev => ({ ...prev, [itemId]: Number.parseFloat(item.price || 0) }))
          }
        }
        return newSelection
      })
    }
  }

  // Value calculation with quantity-based pricing
  const getTotalValue = (items, products) => {
    return items.reduce((total, itemId) => {
      const stored = itemTotalPrices[itemId]
      if (stored !== undefined) {
        const num = Number.parseFloat(stored)
        return total + (Number.isNaN(num) ? 0 : num)
      }
      // Fallback to original price if no quantity set
      const item = products.find((p) => p.id === itemId)
      const base = Number.parseFloat(item?.price || 0)
      return total + (Number.isNaN(base) ? 0 : base)
    }, 0)
  }

  const isOtherItemSelectable = (item) => {
    if (selectedMyItems.length === 0) return false
    return (
      (Array.isArray(item.allowed_categories) &&
        item.allowed_categories.some((cat) => allowedCategories.includes(cat))) ||
      allowedCategories.length === 0
    )
  }

  // Filter out unavailable or out-of-stock items from UI (status_item="unavailable" or quantity === 0)
  const normalizeQty = (p) => Number(p?.quantity ?? p?.qty ?? p?.available_quantity ?? p?.quantity_available ?? 1)
  const isVisible = (p) => {
    const status = String(p?.status_item ?? p?.status_swap ?? "").toLowerCase()
    return status !== "unavailable" && normalizeQty(p) > 0
  }
  const visibleMyItems = myItems.filter(isVisible)
  
  // Enhanced filtering logic for other items
  const filterOtherItems = (items) => {
    return items.filter(item => {
      // Basic visibility filter
      if (!isVisible(item)) return false
      
      // Search term filter (name or description)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const nameMatch = item.name?.toLowerCase().includes(searchLower)
        const descMatch = item.description?.toLowerCase().includes(searchLower)
        if (!nameMatch && !descMatch) return false
      }
      
      // Category filter
      if (selectedCategory && selectedCategory !== "all") {
        if (item.category !== selectedCategory) return false
      }
      // Chained category filter
      if (chainCategoryId) {
        const catObj = allCategories.find(c => {
          const id = typeof c.id === 'object' ? c.id?.id : c.id
          return String(id) === String(chainCategoryId)
        })
        const catName = catObj?.name
        if (catName && item.category !== catName) return false
      }
      // Chained subcategory filter
      if (chainSubCategoryId) {
        const itemSub = typeof item.sub_category === 'object' ? item.sub_category?.id : item.sub_category
        if (String(itemSub) !== String(chainSubCategoryId)) return false
      }
      // Chained brand filter
      if (chainBrandId) {
        const itemBrand = typeof item.brand === 'object' ? item.brand?.id : item.brand
        if (String(itemBrand) !== String(chainBrandId)) return false
      }
      // Chained model filter
      if (chainModelId) {
        const itemModel = typeof item.model === 'object' ? item.model?.id : item.model
        if (String(itemModel) !== String(chainModelId)) return false
      }
      
      // Price range filter
      if (priceRange.min || priceRange.max) {
        const itemPrice = parseFloat(item.price) || 0
        const minPrice = parseFloat(priceRange.min) || 0
        const maxPrice = parseFloat(priceRange.max) || Infinity
        
        if (itemPrice < minPrice || itemPrice > maxPrice) return false
      }
      // Subcategory Level 1 selections
      if ((filtersSub.level1List || []).length > 0) {
        const listLC = filtersSub.level1List.map(x => String(x).toLowerCase())
        const l1 = item?.sub_cat?.level_1
        const names = [l1?.name, l1?.name_en, l1?.name_ar, item?.level_1, item?.sub_category]
          .filter(Boolean).map(x => String(x).toLowerCase())
        if (!names.some(n => listLC.includes(n))) return false
      }
      // Subcategory Level 2 selections
      if ((filtersSub.level2List || []).length > 0) {
        const listLC = filtersSub.level2List.map(x => String(x).toLowerCase())
        const l2 = item?.sub_cat?.level_2
        const names = [l2?.name, l2?.name_en, l2?.name_ar]
          .filter(Boolean).map(x => String(x).toLowerCase())
        if (!names.some(n => listLC.includes(n))) return false
      }
      
      return true
    })
  }
  
  const visibleOtherItems = filterOtherItems(otherItems || [])
  
  // Get unique categories from other items
  const getUniqueCategories = () => {
    const categories = (otherItems || [])
      .filter(isVisible)
      .map(item => item.category)
      .filter(Boolean)
    return [...new Set(categories)]
  }
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setPriceRange({ min: "", max: "" })
  }
  
  // Check if any filters are active
  const hasActiveFilters = searchTerm || (selectedCategory && selectedCategory !== "all") || priceRange.min || priceRange.max
  
  const mySelectedValue = getTotalValue(selectedMyItems, myItems)
  const otherSelectedValue = getTotalValue(selectedOtherItems, otherItems)
  const priceDifference = mySelectedValue - otherSelectedValue
  const canCreateSwap = selectedMyItems.length > 0 && selectedOtherItems.length > 0
  // Add offer handler
  const handleAddOffer = async () => {
    setDisabledOffer(true)
    try {
      const to_user = await getUserByProductId(id_item_to)

      // Prepare items with quantities
      const myItemsWithQuantities = selectedMyItems.map(itemId => ({
        itemId,
        quantity: itemQuantities[itemId] || 1,
        totalPrice: itemTotalPrices[itemId] || 0
      }))
      
      const otherItemsWithQuantities = selectedOtherItems.map(itemId => ({
        itemId,
        quantity: itemQuantities[itemId] || 1,
        totalPrice: itemTotalPrices[itemId] || 0
      }))
      
      const addOfferState = await addOffer(
        to_user.data.id, 
        priceDifference, 
        myItemsWithQuantities, 
        otherItemsWithQuantities, 
        myEmail, 
        otherEmail
      )
      if(addOfferState){
        toast({
          title: t("successfully") || "Success",
          description: t("Successfullycreatedofferchecktheoffers")||`Successfully created offer check the offers`,
        })
        setSelectedMyItems([])
        setSelectedOtherItems([])
        setItemQuantities({})
        setItemTotalPrices({})
        setDisabledOffer(false)
        setShowSwapHint(true)
        // router.refresh()
      }else{
        toast({
          title: t("faildSwap") || "Failed Swap",
          description: t("InvalidswapornotloggedPleasetryagain")||"Invalid swap or not logged in. Please try again.",
          variant: "destructive",
        })
        setDisabledOffer(false)
      }
     
    } catch (error) {
      toast({
        title: t("faildSwap") || "Failed Swap",
        description: t("InvalidswapornotloggedPleasetryagain")||"Invalid swap or not logged in. Please try again.",
        variant: "destructive",
      })
      setDisabledOffer(false)
      window.location.reload()
    }
  }

  // Price difference display
  const handlePriceDifference = async (userId, cash) => {
    try {
      const { userId: currentUserId } = await validateAuth()
      if (userId === currentUserId) {
        if (cash > 0) return `You pay: ${Math.abs(Math.ceil(cash))} LE`
        if (cash < 0) return `You get: ${Math.abs(Math.ceil(cash))} LE`
        return `The price is equal`
      } else {
        if (cash < 0) return `You pay: ${Math.abs(Math.ceil(cash))} LE`
        if (cash > 0) return `You get: ${Math.abs(Math.ceil(cash))} LE`
        return `The price is equal`
      }
    } catch (error) {
      //  console.error("Error in handlePriceDifference:", error)
      return "Error calculating price difference"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
          <p className="text-foreground/70">{t("LoadingSwapPage") || "Loading swap page..."}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {!currentUserId || !otherUserId ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md mx-auto p-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-foreground/70">{t("LoadingUserData") || "Loading user data..."}</p>
          </motion.div>
        </div>
      ) : currentUserId === otherUserId ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md mx-auto p-8"
          >
            <div className="text-8xl mb-6">🚫</div>
            <h1 className="text-3xl font-bold mb-4 text-foreground text-center">{t("CannotSwapWithYourself") || "Cannot Swap With Yourself"}</h1>
            <p className="text-foreground/70 mb-6 text-lg">{t("YouCannotSwapItemsWithYourOwnAccount") || "You cannot swap items with your own account"}</p>
            <Link href="/products">
              <Button className="bg-primary/20 hover:from-secondary hover:to-primary text-white px-8 py-4 text-lg">
                {t("BrowseOtherProducts") || "Browse Other Products"}
              </Button>
            </Link>
          </motion.div>
        </div>
      ) : (
        <>
          <div className="container mx-auto px-4 py-4">
            {/* Header Section */}
            <motion.div
              className="mb-2 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-2">
                <ArrowLeftRight className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-2 bg-background text-transparent text-center">
                {t("CreateaSwap") || "Create a Swap"}
              </h1>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                {t("Selectitemsfromyourollectionfirstthenchoosematchingitemsfromotherusers") || "Select items from your collection first, then choose matching items from other users"}
              </p>
            </motion.div>

            <Tabs defaultValue="swap" className="w-full">
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="w-full pb-1 rounded-xl shadow-lg border border-border/50 mb-8">
                  <TabsList className="grid w-full grid-cols-2 bg-transparent rounded-md gap-1 mb-2 ">
                    {[
                      { value: "swap", label: t("Swap") || "Swap" },
                      { value: "history", label: t("swapHistory") || "Swap History" },
                    ].map((tab, index) => (
                      <motion.div
                        key={tab.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="w-full mb-2  "
                      >
                        <TabsTrigger
                          value={tab.value}
                          className="flex   items-center justify-center gap-2 px-3 py-2.5 data-[state=active]:bg-background dark:data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:border-primary/30 transition-all duration-300 w-full bg-transparent hover:bg-background/50 border border-transparent data-[state=active]:border rounded-lg"
                        >
                          <span className="text-sm font-medium truncate">
                            {tab.label}
                          </span>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300 md:hidden" />
                        </TabsTrigger>
                      </motion.div>
                    ))}
                  </TabsList>
                </div>
              </motion.div>

              <TabsContent value="swap">
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  {/* Selection Rules Info */}
                  <motion.div variants={cardVariants}>
                    <Card className="mb-8 shadow-lg border border-border/50">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                            className="flex-shrink-0"
                          >
                            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center border border-accent/20">
                              <Info className="h-6 w-6 text-accent" />
                            </div>
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-accent mb-3 text-start capitalize">{isRTL ? hintSwapRules[0]?.translations?.[0]?.title : hintSwapRules[0]?.translations?.[1]?.title}</h3>
                            <motion.ul
                              className="space-y-2 text-sm text-foreground/80"
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              {(() => {
                                // Get the correct translation based on isRTL
                                const currentTranslation = isRTL 
                                  ? hintSwapRules[0]?.translations?.find(t => t.languages_code === 'ar-SA')
                                  : hintSwapRules[0]?.translations?.find(t => t.languages_code === 'en-US');
                                
                                // Map over the hints_steps array
                                return currentTranslation?.hints_steps?.map((step, index) => (
                                  <motion.li key={index} variants={itemVariants} className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                                    {step}
                                  </motion.li>
                                ));
                              })()}
                            </motion.ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                
                  <motion.div
                    className="grid lg:grid-cols-2 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* My Products */}
                    <motion.div variants={cardVariants}>
                      {visibleMyItems.length !== 0 ? (
                        <div>
                          <motion.div
                            className="flex flex-row rtl:flex-row-reverse items-center gap-4 mb-6"
                            style={{ alignItems: 'center' }}
                            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h2 className="text-2xl font-bold text-foreground text-start">{t("YourProducts") || "Your Products"}</h2>
                              <p className="text-foreground/70">{t("Select items to swap") || "Select items to swap"}</p>
                            </div>
                            <motion.div
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                            >
                              <Badge variant="secondary" className="text-sm px-3 py-1">
                                {selectedMyItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} {t("selected") || "selected"}
                              </Badge>
                            </motion.div>
                          </motion.div>

                          <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                            <AnimatePresence>
                              {visibleMyItems.map((product, index) => (
                                <motion.div
                                  key={product.id}
                                  variants={cardVariants}
                                  layout
                                  layoutId={`my-item-${product.id}`}
                                  custom={index}
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                  <Card
                                    className={`transition-all duration-300 ${
                                      selectedMyItems.includes(product.id)
                                        ? "ring-2 ring-primary shadow-xl bg-primary/5 border-primary/20"
                                        : "hover:shadow-lg hover:bg-card/50"
                                    }`}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex flex-row rtl:flex-row-reverse items-start gap-4">
                                        <div className="flex items-center flex-shrink-0">
                                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                            <Checkbox
                                              checked={selectedMyItems.includes(product.id)}
                                              onCheckedChange={() => handleMyItemSelect(product.id)}
                                            />
                                          </motion.div>
                                        </div>
                                        <ItemCard 
                                          {...product} 
                                          onQuantityChange={handleQuantityChange}
                                          selectedQuantity={itemQuantities[product.id] || 1}
                                          hasOtherItemsSelected={selectedOtherItems.length > 0}
                                        />
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                      ) : (
                        <motion.div
                          className="rounded-lg border-2 border-dashed border-border p-12 text-center hover:border-primary/30 transition-colors duration-300"
                          variants={cardVariants}
                          whileHover={{ scale: 1.02 }}
                        >
                          <User className="h-16 w-16 text-foreground/70 mx-auto mb-4" />
                          <p className="text-foreground/70 text-lg mb-4">{t("NoProductsFound") || "You haven't any Items yet."}</p>
                          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                            <Button
                              onClick={() => {handleKYC()}}
                              className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white px-6 py-3"
                            >
                              {t("AddNewItem") || "Add New Item"}
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Other Users' Products */}
                    <motion.div variants={cardVariants}>
                      {/* OUTER FILTERS: Render above all cards, outside Card components */}
                      <div className="mb-6">
                          <motion.div 
                            className="bg-card/30 rounded-lg p-4 space-y-4"
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-foreground/70" />
                                <span className="font-medium">{t("Filters") || "Filters"}</span>
                                {hasActiveFilters && (
                                  <Badge variant="secondary" className="text-xs">
                                    {visibleOtherItems.length} {t("results") || "results"}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {hasActiveFilters && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-xs"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    {t("Clear") || "Clear"}
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowFilters(!showFilters)}
                                  className="text-xs"
                                >
                                  {showFilters ? t("Hide") || "Hide" : t("Show") || "Show"} {t("Filters") || "Filters"}
                                </Button>
                              </div>
                            </div>


                            {showFilters && (
                              <motion.div 
                                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                {/* Search Input */}
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground/70">
                                    {t("Search") || "Search"}
                                  </label>
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/70" />
                                    <Input
                                      placeholder={t("Search by name or description") || "Search by name or description"}
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      className="pl-10"
                                    />
                                  </div>
                                </div>
                              {/* Chained Filters: Category → Sub Category → Brand → Model */}
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground/70">
                                  {t("category") || "Category"}
                                  </label>
                                  <Popover open={openCat} onOpenChange={setOpenCat}>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className="w-full justify-between">
                                        {(() => {
                                          const cat = (allCategories.length > 0 ? allCategories : categoriesName.map(n => ({ id: n, name: n })))
                                            .find(c => String((typeof c.id === 'object' ? c.id?.id : c.id)) === String(chainCategoryId))
                                          const name = cat ? (isRTL ? (cat?.translations?.[1]?.name || cat?.name) : (cat?.translations?.[0]?.name || cat?.name)) : (t("SelectCategory") || "Select Category")
                                          return name
                                        })()}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[320px] p-0">
                                      <Command>
                                        <CommandInput placeholder={t("searchCategory") || "Search category ..."} />
                                        <CommandList className="max-h-64 overflow-y-auto">
                                          <CommandEmpty>{t("NoResults") || "No results found."}</CommandEmpty>
                                          <CommandGroup>
                                            {(allCategories.length > 0 ? allCategories : categoriesName.map(n => ({ id: n, name: n }))).map(cat => {
                                              const id = typeof cat.id === 'object' ? cat.id?.id : cat.id
                                              const name = isRTL ? (cat?.translations?.[1]?.name || cat?.name) : (cat?.translations?.[0]?.name || cat?.name)
                                              return (
                                                <CommandItem
                                                  key={id}
                                                  onSelect={() => {
                                                    setChainCategoryId(String(id))
                                                    setChainSubCategoryId("")
                                                    setChainBrandId("")
                                                    setChainModelId("")
                                                    setOpenCat(false)
                                                  }}
                                                >
                                                  {name}
                                                </CommandItem>
                                              )
                                            })}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground/70">
                                  {t("subCategories") || "Sub Categories"}
                                  </label>
                                  <Popover open={openSubCat} onOpenChange={setOpenSubCat}>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className="w-full justify-between" disabled={!chainCategoryId}>
                                        {(() => {
                                          const sc = allSubCategories.find(s => String((typeof s.id === 'object' ? s.id?.id : s.id)) === String(chainSubCategoryId))
                                          const name = sc ? (isRTL ? (sc?.translations?.[1]?.name || sc?.name) : (sc?.translations?.[0]?.name || sc?.name)) : (t("SelectSubCategory") || "Select Sub Category")
                                          return name
                                        })()}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[320px] p-0">
                                      <Command>
                                        <CommandInput placeholder={t("searchSubCategories") || "Search sub categories ..."} />
                                        <CommandList className="max-h-64 overflow-y-auto">
                                          <CommandEmpty>{t("NoResults") || "No results found."}</CommandEmpty>
                                          <CommandGroup>
                                            {allSubCategories
                                              .filter(sc => {
                                                const parent = typeof sc.parent_category === 'object' ? sc.parent_category?.id : sc.parent_category
                                                return chainCategoryId ? String(parent) === String(chainCategoryId) : true
                                              })
                                              .map(sc => {
                                                const id = typeof sc.id === 'object' ? sc.id?.id : sc.id
                                                const name = isRTL ? (sc?.translations?.[1]?.name || sc?.name) : (sc?.translations?.[0]?.name || sc?.name)
                                                return (
                                                  <CommandItem
                                                    key={id}
                                                    onSelect={() => {
                                                      setChainSubCategoryId(String(id))
                                                      setChainBrandId("")
                                                      setChainModelId("")
                                                      setOpenSubCat(false)
                                                    }}
                                                  >
                                                    {name}
                                                  </CommandItem>
                                                )
                                              })}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground/70">
                                  {t("brands") || "Brands"}
                                  </label>
                                  <Popover open={openBrand} onOpenChange={setOpenBrand}>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className="w-full justify-between" disabled={!chainSubCategoryId}>
                                        {(() => {
                                          const b = allBrands.find(s => String((typeof s.id === 'object' ? s.id?.id : s.id)) === String(chainBrandId))
                                          const name = b ? (isRTL ? (b?.translations?.[1]?.name || b?.name) : (b?.translations?.[0]?.name || b?.name)) : (t("SelectBrand") || "Select Brand")
                                          return name
                                        })()}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[320px] p-0">
                                      <Command>
                                        <CommandInput placeholder={t("searchBrands") || "Search brands ..."} />
                                        <CommandList className="max-h-64 overflow-y-auto">
                                          <CommandEmpty>{t("NoResults") || "No results found."}</CommandEmpty>
                                          <CommandGroup>
                                            {allBrands
                                              .filter(b => {
                                                const pc = typeof b.parent_category === 'object' ? b.parent_category?.id : b.parent_category
                                                const sc = typeof b.sub_category === 'object' ? b.sub_category?.id : b.sub_category
                                                return (chainCategoryId ? String(pc) === String(chainCategoryId) : true)
                                                  && (chainSubCategoryId ? String(sc) === String(chainSubCategoryId) : true)
                                              })
                                              .map(b => {
                                                const id = typeof b.id === 'object' ? b.id?.id : b.id
                                                const name = isRTL ? (b?.translations?.[1]?.name || b?.name) : (b?.translations?.[0]?.name || b?.name)
                                                return (
                                                  <CommandItem
                                                    key={id}
                                                    onSelect={() => {
                                                      setChainBrandId(String(id))
                                                      setChainModelId("")
                                                      setOpenBrand(false)
                                                    }}
                                                  >
                                                    {name}
                                                  </CommandItem>
                                                )
                                              })}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground/70">
                                  {t("models") || "Models"}
                                  </label>
                                  <Popover open={openModel} onOpenChange={setOpenModel}>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className="w-full justify-between" disabled={!chainBrandId}>
                                        {(() => {
                                          const m = allModels.find(s => String((typeof s.id === 'object' ? s.id?.id : s.id)) === String(chainModelId))
                                          const name = m ? (isRTL ? (m?.translations?.[1]?.name || m?.name) : (m?.translations?.[0]?.name || m?.name)) : (t("SelectModel") || "Select Model")
                                          return name
                                        })()}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[320px] p-0">
                                      <Command>
                                        <CommandInput placeholder={t("searchModels") || "Search models ..."} />
                                        <CommandList className="max-h-64 overflow-y-auto">
                                          <CommandEmpty>{t("NoResults") || "No results found."}</CommandEmpty>
                                          <CommandGroup>
                                            {allModels
                                              .filter(m => {
                                                const pb = typeof m.parent_brand === 'object' ? m.parent_brand?.id : m.parent_brand
                                                const sc = typeof m.sub_category === 'object' ? m.sub_category?.id : m.sub_category
                                                return (chainBrandId ? String(pb) === String(chainBrandId) : true)
                                                  && (chainSubCategoryId ? String(sc) === String(chainSubCategoryId) : true)
                                              })
                                              .map(m => {
                                                const id = typeof m.id === 'object' ? m.id?.id : m.id
                                                const name = isRTL ? (m?.translations?.[1]?.name || m?.name) : (m?.translations?.[0]?.name || m?.name)
                                                return (
                                                  <CommandItem
                                                    key={id}
                                                    onSelect={() => {
                                                      setChainModelId(String(id))
                                                      setOpenModel(false)
                                                    }}
                                                  >
                                                    {name}
                                                  </CommandItem>
                                                )
                                              })}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                {/* Price Range */}
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground/70">
                                    {t("Price Range") || "Price Range"}
                                  </label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      min={1}
                                      placeholder={t("Min") || "Min"}
                                      value={priceRange.min}
                                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                      className="text-sm"
                                    />
                                    <Input
                                      type="number"
                                      min={1}
                                      placeholder={t("Max") || "Max"}
                                      value={priceRange.max}
                                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                      className="text-sm"
                                    />
                                  </div>
                                </div>

                              
                              </motion.div>

                            
                          )}
 {(((filtersSub.mainList || []).length) > 0 || ((filtersSub.level1List || []).length) > 0 || ((filtersSub.level2List || []).length) > 0) && (
                                  <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-scroll">
                                    {(filtersSub.mainList || []).map((key) => (
                                      <Badge key={`main-${key}`} variant="secondary" className="text-xs">
                                        {key}
                                        <button className="ml-1" onClick={() => setFiltersSub(prev => ({...prev, mainList: (prev.mainList||[]).filter(x=>x!==key)}))}>
                                          <X className="h-3 w-3" />
                                        </button>
                                      </Badge>
                                    ))}
                                    {(filtersSub.level1List || []).map((key) => (
                                      <Badge key={`l1-${key}`} variant="secondary" className="text-xs">
                                        {key}
                                        <button className="ml-1" onClick={() => setFiltersSub(prev => ({...prev, level1List: (prev.level1List||[]).filter(x=>x!==key)}))}>
                                          <X className="h-3 w-3" />
                                        </button>
                                      </Badge>
                                    ))}
                                    {(filtersSub.level2List || []).map((key) => (
                                      <Badge key={`l2-${key}`} variant="secondary" className="text-xs">
                                        {key}
                                        <button className="ml-1" onClick={() => setFiltersSub(prev => ({...prev, level2List: (prev.level2List||[]).filter(x=>x!==key)}))}>
                                          <X className="h-3 w-3" />
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                          
                        </motion.div>

                      
                      </div>

                      {/* End OUTER FILTERS */}
                      {visibleOtherItems.length !== 0 ? (
                        <div>
                          <motion.div
                            className="flex flex-row rtl:flex-row-reverse items-center gap-4 mb-6"
                            style={{ alignItems: 'center' }}
                            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-accent" />
                            </div>
                            <div className="flex-1">
                              <h2 className="text-2xl font-bold text-foreground text-start">{t("AvailableProducts") || "Available Products"}</h2>
                              <p className="text-foreground/70">{t("Choose items to receive") || "Choose items to receive"}</p>
                            </div>
                            <motion.div
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                            >
                              <Badge variant="secondary" className="text-sm px-3 py-1">
                                {selectedOtherItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} {t("selected") || "selected"}
                              </Badge>
                            </motion.div>
                          </motion.div>

                          <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                            <AnimatePresence>
                              {visibleOtherItems.map((product, index) => {
                                const isSelectable = isOtherItemSelectable(product)
                                const isSelected = selectedOtherItems.includes(product.id)

                                return (
                                  <motion.div
                                    key={product.id}
                                    variants={cardVariants}
                                    layout
                                    layoutId={`other-item-${product.id}`}
                                    custom={index}
                                    whileHover={isSelectable ? { scale: 1.02, y: -2 } : {}}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                  >
                                    <Card
                                      className={`transition-all duration-300 ${
                                        isSelected
                                          ? "ring-2 ring-accent shadow-xl bg-accent/5 border-accent/20"
                                          : isSelectable
                                            ? "hover:shadow-lg hover:bg-card/50"
                                            : "opacity-50 cursor-not-allowed bg-card/30"
                                      }`}
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex flex-row rtl:flex-row-reverse items-start gap-4">
                                          <div className="flex items-center flex-shrink-0">
                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                              <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => isSelectable && handleOtherItemSelect(product.id)}
                                                disabled={!isSelectable}
                                              />
                                            </motion.div>
                                          </div>
                                          <ItemCard 
                                            {...product} 
                                            onQuantityChange={handleQuantityChange}
                                            selectedQuantity={itemQuantities[product.id] || 1}
                                            hasOtherItemsSelected={selectedOtherItems.length > 0}
                                          />
                                          {!isSelectable && (
                                            <div className="flex-shrink-0">
                                              <AlertCircle className="h-5 w-5 text-destructive" />
                                            </div>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                )
                              })}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                      ) : (
                        <motion.div
                          className="rounded-lg border-2 border-dashed border-border p-12 text-center hover:border-accent/30 transition-colors duration-300"
                          variants={cardVariants}
                          whileHover={{ scale: 1.02 }}
                        >
                          <User className="h-16 w-16 text-foreground/70 mx-auto mb-4" />
                          <p className="text-foreground/70 text-lg mb-4">{t("NoOtherProductsFound") || "He hasn't made any Items yet."}</p>
                          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                            <Button 
                              onClick={() => router.push("/products")}
                              className="bg-gradient-to-r from-accent to-secondary hover:from-secondary hover:to-accent text-white px-6 py-3"
                            >
                              {t("StartSwapping") || "Start Swapping"}
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>


 
 


                  </motion.div>
                  
                </motion.div>
                 {/* Swap Summary */}
                <AnimatePresence >
                    {canCreateSwap && (
                      <motion.div
                        ref={makeSwapRef}
                        variants={swapSummaryVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="mb-4 mt-6"
                      >
                        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 hover:shadow-xl transition-all duration-300">
                          <CardContent className="p-8">
                            <motion.div
                              className="flex flex-row rtl:flex-row-reverse items-center justify-between gap-6 mb-6"
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <motion.div className="text-center flex-1" variants={itemVariants} whileHover={{ scale: 1.05 }}>
                                <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Avatar className="h-full w-full border">
                                <AvatarImage
                                  src={
                                    userData?.avatar
                                      ? `${mediaURL}${userData.avatar}`
                                      : "/placeholder.svg"
                                  }
                                  alt={userData?.first_name || t("User") || "User"}
                                  className="object-cover"
                                />
                                <AvatarFallback>
                                  {userData?.first_name?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                                 
                                {(userData?.verified === "true" || userData?.verified === true) && (
                                    <div className={`absolute -top-1 z-10 ${isRTL ? '-left-1' : '-right-1'}`}>
                                      <Verified className="h-4 w-4 text-primary bg-background rounded-full p-0.5 border border-background" />
                                    </div>
                                  )}
                                </div>
                                <motion.div
                                  className="text-3xl font-bold text-primary mb-1"
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                                >
                                  {selectedMyItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                                </motion.div>
                                <div className="text-sm text-foreground/70 mb-2">{t("yourItems") || "Your Items"}</div>
                                <div className="text-xl font-semibold text-secondary2">{Number(mySelectedValue).toLocaleString()} {t("LE")}</div>
                              </motion.div>

                              <motion.div
                                className="flex items-center justify-center flex-shrink-0"
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                              >
                                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                                  <ArrowLeftRight className={`h-8 w-8 text-white ${isRTL ? 'rotate-180' : ''}`} />
                                </div>
                              </motion.div>

                              <motion.div className="text-center flex-1" variants={itemVariants} whileHover={{ scale: 1.05 }}>
                                <div className="relative w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Avatar className="h-full w-full border">
                                  <AvatarImage
                                  src={
                                    otherUserData?.avatar
                                      ? `${mediaURL}${otherUserData.avatar}`
                                      : "/placeholder.svg"
                                  }
                                  alt={otherUserData?.first_name || t("User") || "User"}
                                  className="object-cover"
                                />
                                <AvatarFallback>
                                  {otherUserData?.first_name?.[0] || "U"}
                                </AvatarFallback> 
                              </Avatar>
                              
                                  {(otherUserData?.verified === "true" || otherUserData?.verified === true) && (
                                    <div className={`absolute -top-1 z-10 ${isRTL ? '-left-1' : '-right-1'}`}>
                                      <Verified className="h-4 w-4 text-accent bg-background rounded-full p-0.5 border border-background" />
                                    </div>
                                  )}
                                </div>
                                <motion.div
                                  className="text-3xl font-bold text-accent mb-1"
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                                >
                                  {selectedOtherItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                                </motion.div>
                                <div className="text-sm text-foreground/70 mb-2">{t("Theiritems") || "Their Items"}</div>
                                <div className="text-xl font-semibold text-secondary2">{Number(otherSelectedValue).toLocaleString()} {t("LE")}</div>
                              </motion.div>
                            </motion.div>

                            {/* Price Difference */}
                            <motion.div
                              className="text-center mb-6"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <motion.div
                                className={`text-2xl font-bold p-4 rounded-lg ${
                                  priceDifference > 0
                                    ? "bg-secondary2/10 text-secondary2 border border-secondary2/20"
                                    : priceDifference < 0
                                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                                      : "bg-card text-foreground/70 border border-border"
                                }`}
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                              >
                              <div className="text-sm text-foreground/70 mb-2">{t("PriceDifference") || "Price Difference"}</div>

                                {priceDifference > 0 ? "+" : ""}
                                {priceDifference!=0 && Number(priceDifference).toLocaleString()} 
                                {priceDifference!=0 && t("le")}
                                {priceDifference > 0 && <span className={`text-sm ${getDirectionClass("ml-2", "mr-2")}`}>({t("Yougain") || "You gain"})</span>}
                                {priceDifference < 0 && <span className={`text-sm ${getDirectionClass("ml-2", "mr-2")}`}>({t("Youpayextra") || "You pay extra"})</span>}
                                {priceDifference === 0 && <span className={`text-sm ${getDirectionClass("ml-2", "mr-2")}`}>({t("Equalvalue") || "Equal value"})</span>}
                              </motion.div>
                            </motion.div>

                            <motion.div
                              className="text-center"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6 }}
                            >
                              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                                <Button 
                                  size="lg" 
                                  className="px-12 py-6 text-lg bg-primary hover:from-secondary hover:bg-primary/80 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
                                  onClick={handleAddOffer} 
                                  disabled={disabledOffer}
                                >
                                  {disabledOffer ? (
                                    <>
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                        className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full ${getDirectionClass("mr-3", "ml-3")}`}
                                      />
                                      {t("CreatingSwap") || "Creating Swap..."}
                                    </>
                                  ) : (
                                    <>
                                      <ArrowLeftRight className={`h-5 w-5 ${getDirectionClass("mr-3", "ml-3")}`} />
                                      {t("swapMaker") || "Make Swap"}
                                    </>
                                  )}
                                </Button>
                              </motion.div>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
              </TabsContent>

              <TabsContent value="history">
                <motion.div className="space-y-6 " variants={containerVariants} initial="hidden" animate="visible">
                  <motion.div variants={cardVariants}>
                    <Card className="shadow-lg border border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl text-start">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <ArrowLeftRight className="h-5 w-5 text-primary" />
                          </div>
                          {t("swapHistory") || "Swap History"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {swapHistory.length > 0 ? (
                          <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                            <AnimatePresence>
                              {swapHistory.map((swap, index) => (
                                <motion.div
                                  key={swap.id}
                                  variants={cardVariants}
                                  layout
                                  layoutId={`history-${swap.id}`}
                                  custom={index}
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  className="border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-300 bg-card/50"
                                >
                                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                      <p className="text-sm text-foreground/70 mb-1">
                                        {new Date(swap?.date_created).toISOString().split("T")[0]}
                                      </p>
                                    
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        <motion.span
                                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            swap.status_offer === "completed"
                                              ? "bg-secondary2/10 text-secondary2 border border-secondary2/20"
                                              : swap.status_offer === "pending"
                                                ? "bg-accent/10 text-accent border border-accent/20"
                                                : "bg-destructive/10 text-destructive border border-destructive/20"
                                          }`}
                                          whileHover={{ scale: 1.05 }}
                                        >
                                          {swap.status_offer}
                                        </motion.span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-2 md:items-end">
                                      <div className="flex flex-col">
                                        <span className="text-sm text-foreground/70">
                                          {handlePriceDifference(swap.from_user_id, swap.cash_adjustment)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </motion.div>
                        ) : (
                          <motion.div
                            className="rounded-lg border-2 border-dashed border-border p-12 text-center bg-background"
                            variants={cardVariants}
                            whileHover={{ scale: 1.02 }}
                          >
                            <ArrowLeftRight className="h-16 w-16 text-primary/80 mx-auto mb-4" />
                            <p className="text-foreground/70 text-lg mb-4">{t("NoSwapHistory") || "No swap history found"}</p>
                            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                              <Button className="bg-primary hover:bg-primary/80 text-primary-foreground px-6 py-3 shadow-lg">
                                {t("StartSwapping") || "Start Swapping"}
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Floating Scroll Button */}
          <AnimatePresence>
            {canCreateSwap && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-8 right-8 z-50"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button
                    onClick={scrollToMakeSwap}
                    size="lg"
                    className="rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground h-14 w-14 p-0"
                    aria-label={t("Scroll to Make Swap") || "Scroll to Make Swap"}
                  >
                    <ChevronDown className="h-6 w-6" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Full Screen Hint Popup */}
          <AnimatePresence>
            {showSwapHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed mt-4 inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex items-center justify-center"
                onClick={() =>{ setShowSwapHint(false) , router.refresh()} }
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="relative w-full h-full flex flex-col items-center justify-center p-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-10"
                    onClick={() =>{ setShowSwapHint(false) , router.refresh()} }

                  >
                    <X className="h-6 w-6" />
                  </Button>

                  {/* Main Content */}
                  <div className="flex flex-col items-center justify-center space-y-8 max-w-2xl mx-auto text-center">
                    {/* Icon */}
                    <motion.div 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4"
                    >
                      <PiSwapBold className="h-12 w-12 text-primary" />
                    </motion.div>

                    {/* Message */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-4"
                    >
                      <h2 className="text-4xl font-bold text-foreground">
                        {t("checkSwaps") || "Check Swaps"}
                      </h2>
                      <p className="text-xl text-foreground/70">
                        {t("checkSendOffersMessage") || "Your swap offer has been created successfully! Check your sent offers in the header."}
                      </p>
                    </motion.div>

                    {/* Arrow pointing to header */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="absolute top-20 flex flex-col items-center"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <ArrowUp className="h-12 w-12 text-primary" />
                      </motion.div>
                      <p className="text-sm text-foreground/60 mt-3">
                        {/* {t("offersSend") || "Offers Send"} */}
                      </p>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex gap-4 mt-8"
                    >
                      <Button
                        onClick={() => {
                          setShowSwapHint(false)
                          router.push("/offers")
                        }}
                        className="bg-primary hover:bg-primary/80 text-white px-8 py-6 text-lg"
                      >
                        {t("ViewSwaps") || "View Send Swaps"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {setShowSwapHint(false), router.refresh() }}
                        className="px-8 py-6 text-lg"
                      >
                        {t("close") || "Close"}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  )
}


