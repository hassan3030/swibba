"use client"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeftRight, User, Info, AlertCircle, Plus, Minus, Verified } from "lucide-react"
import Link from "next/link"
import Image from "next/image" 
import { getAvailableAndUnavailableProducts, getProductByUserId, getProductsOwnerById } from "@/callAPI/products"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { decodedToken, getCookie, validateAuth } from "@/callAPI/utiles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "@/lib/use-translations"
import { getUserById, getUserByProductId } from "@/callAPI/users"
import { removeTarget } from "@/callAPI/utiles"
import { addOffer, getOfferById } from "@/callAPI/swap"
import { useParams, useRouter } from "next/navigation"
import { useRTL } from "@/hooks/use-rtl"
import { getMediaType } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
          setItemTotalPrices(prev => ({ ...prev, [itemId]: item.price }))
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
            setItemTotalPrices(prev => ({ ...prev, [itemId]: item.price }))
          }
        }
        return newSelection
      })
    }
  }

  // Value calculation with quantity-based pricing
  const getTotalValue = (items, products) => {
    return items.reduce((total, itemId) => {
      const totalPrice = itemTotalPrices[itemId]
      if (totalPrice) {
        return total + totalPrice
      }
      // Fallback to original price if no quantity set
      const item = products.find((p) => p.id === itemId)
      return total + Number.parseInt(item?.price || 0)
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
      
      await addOffer(
        to_user.data.id, 
        priceDifference, 
        myItemsWithQuantities, 
        otherItemsWithQuantities, 
        myEmail, 
        otherEmail
      )
      
      toast({
        title: t("successfully") || "Success",
        description: "Successfully created offer",
      })
      setSelectedMyItems([])
      setSelectedOtherItems([])
      setItemQuantities({})
      setItemTotalPrices({})
      setDisabledOffer(false)
      router.refresh()
      window.location.reload()
    } catch (error) {
      toast({
        title: t("faildSwap") || "Failed Swap",
        description: "Invalid swap or not logged in. Please try again.",
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
          <p className="text-muted-foreground">{t("LoadingSwapPage") || "Loading swap page..."}</p>
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
            <p className="text-muted-foreground">{t("LoadingUserData") || "Loading user data..."}</p>
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
            <h1 className="text-3xl font-bold mb-4 text-foreground">{t("CannotSwapWithYourself") || "Cannot Swap With Yourself"}</h1>
            <p className="text-muted-foreground mb-6 text-lg">{t("YouCannotSwapItemsWithYourOwnAccount") || "You cannot swap items with your own account"}</p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white px-8 py-4 text-lg">
                {t("BrowseOtherProducts") || "Browse Other Products"}
              </Button>
            </Link>
          </motion.div>
        </div>
      ) : (
        <>
          <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
                <ArrowLeftRight className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {t("CreateaSwap") || "Create a Swap"}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("Selectitemsfromyourollectionfirstthenchoosematchingitemsfromotherusers") || "Select items from your collection first, then choose matching items from other users"}
              </p>
            </motion.div>

            <Tabs defaultValue="swap" className="w-full">
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <TabsList className={`mb-8 w-full max-w-md mx-auto ${classes.justifyCenter}`}>
                  <TabsTrigger value="swap" className="flex-1">{t("Swap") || "Swap"}</TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">{t("swapHistory") || "Swap History"}</TabsTrigger>
                </TabsList>
              </motion.div>

              <TabsContent value="swap">
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  {/* Selection Rules Info */}
                  <motion.div variants={cardVariants}>
                    <Card className="mb-8 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className={`flex items-start ${classes.spaceX(4)}`}>
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                            className="flex-shrink-0"
                          >
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                              <Info className="h-6 w-6 text-yellow-600" />
                            </div>
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-yellow-800 mb-3">{t("SwapRules") || "Swap Rules:"}</h3>
                            <motion.ul
                              className="space-y-2 text-sm text-yellow-700"
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              {[
                                t("Firstselectyouritemstoseeavailablecategories") || "First select your items to see available categories",
                                t("Youcanonlyselectitemsfrommatchingcategories") || "You can only select items from matching categories",
                                t("Uncheckingyouritemswillclearotherselections") || "Unchecking your items will clear other selections",
                              ].map((rule, index) => (
                                <motion.li key={index} variants={itemVariants} className="flex items-center">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                                  {t(rule) || rule}
                                </motion.li>
                              ))}
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
                      {myItems.length !== 0 ? (
                        <div>
                          <motion.div
                            className={`flex items-center mb-6 ${classes.justifyStart}`}
                            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-foreground">{t("YourProducts") || "Your Products"}</h2>
                              <p className="text-muted-foreground">{t("Select items to swap") || "Select items to swap"}</p>
                            </div>
                            <motion.div
                            
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                              className="ml-auto"
                            >
                              <Badge variant="secondary" className="text-sm px-3 py-1">
                                {selectedMyItems.length} {t("selected") || "selected"}
                              </Badge>
                            </motion.div>
                          </motion.div>

                          <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                            <AnimatePresence>
                              {myItems.map((product, index) => (
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
                                        : "hover:shadow-lg hover:bg-muted/50"
                                    }`}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-start space-x-4">
                                        <div className="flex items-center">
                                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                            <Checkbox
                                              checked={selectedMyItems.includes(product.id)}
                                              onCheckedChange={() => handleMyItemSelect(product.id)}
                                              className="mr-3"
                                            />
                                          </motion.div>
                                        </div>
                                        <ItemCard 
                                          {...product} 
                                          onQuantityChange={handleQuantityChange}
                                          selectedQuantity={itemQuantities[product.id] || 1}
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
                          className="rounded-lg border-2 border-dashed border-muted p-12 text-center hover:border-primary/30 transition-colors duration-300"
                          variants={cardVariants}
                          whileHover={{ scale: 1.02 }}
                        >
                          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground text-lg mb-4">{t("NoProductsFound") || "You haven't any Items yet."}</p>
                          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                            <Button
                              onClick={() => router.push("/profile/settings/editItem/new")}
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
                      {otherItems?.length !== 0 ? (
                        <div>
                          <motion.div
                            className={`flex items-center mb-6 ${classes.justifyStart}`}
                            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mr-4">
                              <User className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-foreground">{t("AvailableProducts") || "Available Products"}</h2>
                              <p className="text-muted-foreground">{t("Choose items to receive") || "Choose items to receive"}</p>
                            </div>
                            <motion.div
                            
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                              className="ml-auto"
                            >
                              <Badge variant="secondary" className="text-sm px-3 py-1">
                                {selectedOtherItems.length} {t("selected") || "selected"}
                              </Badge>
                            </motion.div>
                          </motion.div>

                          <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                            <AnimatePresence>
                              {otherItems?.map((product, index) => {
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
                                            ? "hover:shadow-lg hover:bg-muted/50"
                                            : "opacity-50 cursor-not-allowed bg-muted/30"
                                      }`}
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex items-start space-x-4">
                                          <div className="flex items-center">
                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                              <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => isSelectable && handleOtherItemSelect(product.id)}
                                                disabled={!isSelectable}
                                                className="mr-3"
                                              />
                                            </motion.div>
                                          </div>
                                          <ItemCard 
                                            {...product} 
                                            onQuantityChange={handleQuantityChange}
                                            selectedQuantity={itemQuantities[product.id] || 1}
                                          />
                                          {!isSelectable && (
                                            <div className="ml-auto">
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
                          className="rounded-lg border-2 border-dashed border-muted p-12 text-center hover:border-accent/30 transition-colors duration-300"
                          variants={cardVariants}
                          whileHover={{ scale: 1.02 }}
                        >
                          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground text-lg mb-4">{t("NoOtherProductsFound") || "He hasn't made any Items yet."}</p>
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


  {/* Swap Summary */}
  <AnimatePresence>
                    {canCreateSwap && (
                      <motion.div
                        variants={swapSummaryVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="mb-8"
                      >
                        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 hover:shadow-xl transition-all duration-300">
                          <CardContent className="p-8">
                            <motion.div
                              className={`flex items-center justify-between mb-6 ${classes.container}`}
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <motion.div className="text-center" variants={itemVariants} whileHover={{ scale: 1.05 }}>
                                <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Avatar className="h-full w-full border">
                                <AvatarImage
                                  src={
                                    otherUserData?.avatar
                                      ? `https://deel-deal-directus.csiwm3.easypanel.host/assets/${userData.avatar}`
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
                                    <div className="absolute -top-1 -right-1 z-10">
                                      <Verified className="h-4 w-4 text-primary bg-background rounded-full p-0.5 border border-background" />
                                    </div>
                                  )}
                                </div>
                                <motion.div
                                  className="text-3xl font-bold text-primary mb-1"
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                                >
                                  {selectedMyItems.length}
                                </motion.div>
                                <div className="text-sm text-muted-foreground mb-2">{t("yourItems") || "Your Items"}</div>
                                <div className="text-xl font-semibold text-secondary2">{Number(mySelectedValue).toLocaleString()} LE</div>
                              </motion.div>

                              <motion.div
                                className="flex items-center"
                               
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                              >
                                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                                  <ArrowLeftRight className="h-8 w-8 text-white" />
                                </div>
                              </motion.div>

                              <motion.div className="text-center" variants={itemVariants} whileHover={{ scale: 1.05 }}>
                                <div className="relative w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Avatar className="h-full w-full border">
                                  <AvatarImage
                                  src={
                                    otherUserData?.avatar
                                      ? `https://deel-deal-directus.csiwm3.easypanel.host/assets/${otherUserData.avatar}`
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
                                    <div className="absolute -top-1 -right-1 z-10">
                                      <Verified className="h-4 w-4 text-accent bg-background rounded-full p-0.5 border border-background" />
                                    </div>
                                  )}
                                </div>
                                <motion.div
                                  className="text-3xl font-bold text-accent mb-1"
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                                >
                                  {selectedOtherItems.length}
                                </motion.div>
                                <div className="text-sm text-muted-foreground mb-2">{t("Theiritems") || "Their Items"}</div>
                                <div className="text-xl font-semibold text-secondary2">{Number(otherSelectedValue).toLocaleString()} LE</div>
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
                                      : "bg-muted text-muted-foreground border border-muted"
                                }`}
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                              >
                              <div className="text-sm text-muted-foreground mb-2">{t("PriceDifference") || "Price Difference"}</div>

                                {priceDifference > 0 ? "+" : ""}
                                {Number(priceDifference).toLocaleString()} LE
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
                                  className="px-12 py-6 text-lg bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300" 
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
                                      {t("Swap") || "Swap"}
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


                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="history">
                <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                  <motion.div variants={cardVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl">
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
                                  className="border rounded-lg p-4 hover:shadow-lg transition-all duration-300"
                                >
                                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                      <p className="text-sm text-muted-foreground mb-1">
                                        {new Date(swap?.date_created).toISOString().split("T")[0]}
                                      </p>
                                    
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        <motion.span
                                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            swap.status_offer === "completed"
                                              ? "bg-secondary2/10 text-secondary2 border border-secondary2/20"
                                              : swap.status_offer === "pending"
                                                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
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
                                        <span className="text-sm text-muted-foreground">
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
                            className="rounded-lg border-2 border-dashed border-muted p-12 text-center"
                            variants={cardVariants}
                            whileHover={{ scale: 1.02 }}
                          >
                            <ArrowLeftRight className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground text-lg mb-4">{t("NoSwapHistory") || "No swap history found"}</p>
                            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                              <Button className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white px-6 py-3">
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
        </>
      )}
    </motion.div>
  )
}

// ItemCard component
const ItemCard = ({ id, name, description, price, images, allowed_categories,translations, status_swap, category, quantity: originalQuantity = 1, onQuantityChange, selectedQuantity = 1 }) => {
  // const [bigImage, setBigImage] = useState("")
  const [currentQuantity, setCurrentQuantity] = useState(selectedQuantity)
  const [totalPrice, setTotalPrice] = useState(price * selectedQuantity)
  const { t } = useTranslations()
  const { isRTL, getDirectionClass } = useRTL()
  const { toast } = useToast()
  
  // Update total price when quantity changes
  useEffect(() => {
    const total = price * currentQuantity
    setTotalPrice(total)
    if (onQuantityChange) {
      onQuantityChange(id, currentQuantity, total)
    }
  }, [currentQuantity, price, id, onQuantityChange])

  // Prevent unnecessary re-renders by memoizing the quantity change
  const handleQuantityChangeInternal = useCallback((newQuantity) => {
    setCurrentQuantity(newQuantity)
  }, [])

  // Quantity handlers
  const increaseQuantity = useCallback(() => {
    if (currentQuantity >= originalQuantity) {
      toast({
        title: t("quantityExceeded") || "Quantity Exceeded",
        description: t("quantityExceededDescription") || "Cannot exceed available quantity",
        variant: "destructive",
      })
    } else {
      handleQuantityChangeInternal(currentQuantity + 1)
    }
  }, [currentQuantity, originalQuantity, handleQuantityChangeInternal, toast, t])

  const decreaseQuantity = useCallback(() => {
    if (currentQuantity <= 1) {
      toast({
        title: t("minimumQuantity") || "Minimum Quantity",
        description: t("minimumQuantityDescription") || "Minimum quantity is 1",
        variant: "destructive",
      })
    } else {
      handleQuantityChangeInternal(currentQuantity - 1)
    }
  }, [currentQuantity, handleQuantityChangeInternal, toast, t])

  const getConditionColor = (itemsStatus) => {
    switch (itemsStatus) {
      case "new":
      case "like-new":
      case "excellent":
        return "bg-secondary2/10 text-secondary2 border border-secondary2/20"
      case "good":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      case "fair":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      case "old":
        return "bg-destructive/10 text-destructive border border-destructive/20"
      default:
        return "bg-muted text-muted-foreground border border-muted"
    }
  }

  return (
    <motion.div
      className="flex items-start space-x-4 w-full"
      whileHover={{ x: isRTL ? -5 : 5 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      {(() => {
        // Check if images exist and have the expected structure
        if (!images || !Array.isArray(images) || images.length === 0 || !images[0]?.directus_files_id) {
          // console.log("No valid image data found:", { images, hasImages: !!images, isArray: Array.isArray(images), length: images?.length, firstImage: images?.[0] })
          return (
            <div className="w-24 h-24 bg-muted rounded-xl flex-shrink-0 shadow-md flex items-center justify-center">
              <span className="text-muted-foreground text-xs">No Image</span>
            </div>
          )
        }
        
        const currentMedia = {
          id: images[0].directus_files_id.id,
          type: images[0].directus_files_id.type,
          url: `https://deel-deal-directus.csiwm3.easypanel.host/assets/${images[0].directus_files_id.id}`
        }
        
        // Get media type from the MIME type
        const mimeType = images[0].directus_files_id.type || images[0].directus_files_id.mime_type || 'image/jpeg'
        const mediaType = getMediaType(mimeType)
        
        // console.log("Image data:", { 
        //   id: currentMedia.id, 
        //   type: currentMedia.type, 
        //   mimeType, 
        //   mediaType, 
        //   url: currentMedia.url,
        //   fullImageData: images[0],
        //   directusFilesId: images[0].directus_files_id
        // })
        
        if (mediaType === 'video') {
          return (
            <video
              src={currentMedia.url}
              className="w-24 h-24 object-cover rounded-xl flex-shrink-0 shadow-md"
              width={96}
              height={96}
            />
          )
        } else if (mediaType === 'audio') {
          return (
            <audio
              src={currentMedia.url}
              className="w-24 h-24 object-cover rounded-xl flex-shrink-0 shadow-md"
              width={96}
              height={96}
            />
          )
        } else if (mediaType === 'image' || !mediaType || mediaType === 'unknown') {
          // Default to image for unknown types or when mediaType is undefined
          return (
            <div className="w-24 h-24 rounded-xl flex-shrink-0 shadow-md overflow-hidden">
              <Image
                src={currentMedia.url}
                alt={name}
                className="w-full h-full object-cover"
                width={96}
                height={96}
                onError={(e) => {
                  // console.error("Image failed to load:", currentMedia.url)
                  // Show a placeholder instead of hiding the image
                  e.target.src = "/placeholder.svg"
                  e.target.alt = "Image not available"
                }}
                onLoad={() => {
                  // console.log("Image loaded successfully:", currentMedia.url)
                }}
              />
            </div>
          )
        } else {
          // Fallback for any other media type
          return (
            <div className="w-24 h-24 bg-muted rounded-xl flex-shrink-0 shadow-md flex items-center justify-center">
              <span className="text-muted-foreground text-xs">Unsupported Media</span>
            </div>
          )
        }
      })()}
      
      <div className="flex-1 min-w-0">
        <motion.h3
          className="font-semibold text-xl mb-2 text-foreground"
          whileHover={{ x: isRTL ? -5 : 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {isRTL ? translations[1]?.name : translations[0]?.name}
        </motion.h3>
        <motion.div
          className="flex flex-wrap gap-2 mb-3"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            whileHover={{ scale: 1.05 }}
          >
            <Badge variant="secondary" className="px-3 py-1">{t(category) || category}</Badge>
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            whileHover={{ scale: 1.05 }}
          >
            <Badge className={`px-3 py-1 ${getConditionColor(status_swap)}`}>{t(status_swap) || status_swap}</Badge>
          </motion.div>
          <Separator className="mx-2" />
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            whileHover={{ scale: 1.05 }}
          >
            <Badge variant="outline" className="px-3 py-1">{t("AllowTo") || "Allow To:"}</Badge>
          </motion.div>
          {allowed_categories &&
            allowed_categories.length > 0 &&
            allowed_categories.map((cat, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 },
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Badge variant="outline" className={`px-3 py-1 ${getDirectionClass("ml-1", "mr-1")}`}>
                  {t(cat) || cat}
                </Badge>
              </motion.div>
            ))}
        </motion.div>
        
        {/* Quantity Controls */}
        <motion.div
          className="flex items-center justify-between mt-3 p-3 bg-muted/30 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{t("quantity") || "Quantity"}</span>
            <span className="text-sm font-medium">{originalQuantity} {t("items") || "items"}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={decreaseQuantity}
                disabled={currentQuantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
            </motion.div>
            
            <motion.span
              className="text-sm font-semibold min-w-[1.5rem] text-center"
              key={currentQuantity}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {currentQuantity}
            </motion.span>
            
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={increaseQuantity}
                disabled={currentQuantity >= originalQuantity}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Price Display */}
        <motion.div
          className="flex items-center justify-between mt-2"
          key={totalPrice}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{t("unitPrice") || "Unit Price"}</span>
            <span className="text-sm font-medium">{Number(price).toLocaleString()} {t("LE")}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs text-muted-foreground">{t("totalPrice") || "Total Price"}</span>
            <span className="text-lg font-bold text-secondary2">{Number(totalPrice).toLocaleString()} {t("LE")}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
