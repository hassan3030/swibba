"use client"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeftRight, Package, Users, Info, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { getAvailableAndUnavailableProducts, getImageProducts } from "@/callAPI/products"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { decodedToken, getCookie } from "@/callAPI/utiles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "@/lib/use-translations"
import { getUserById, getUserByProductId } from "@/callAPI/users"
import { addOffer, getOfferById } from "@/callAPI/swap"
import { useParams, useRouter } from "next/navigation"

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

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
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
  const [swapHistory, setSwapHistory] = useState([])
  const [usersOffer, setUsersOffer] = useState([])
  const [allowedCategories, setAllowedCategories] = useState([])
  const [showHint, setShowHint] = useState(false)
  const [message, setMessage] = useState("")
  const [name, setName] = useState("")
  const [disabledOffer, setDisabledOffer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()
  const { t } = useTranslations()

  // Fetch my items
  const getMyItems = useCallback(async () => {
    const token = await getCookie()
    if (token) {
      const { id } = await decodedToken()
      const myProductsData = await getAvailableAndUnavailableProducts(id)
      setMyItems(myProductsData.data)
    } else {
      router.push(`/auth/login`)
    }
  }, [router])

  // Fetch other user's items
  const getOtherItems = useCallback(async () => {
    const otherUser = await getUserByProductId(id_item_to)
    console.log("otherUser " , otherUser)
    console.log("id_item_to " , id_item_to)
    const otherProductsData = await getAvailableAndUnavailableProducts(otherUser.data.id)
     console.log("otherProductsData " , otherProductsData)
    setOtherItems(otherProductsData.data)
  }, [])

  // Fetch swap history
  const getSwapHistory = useCallback(async () => {
    const token = await getCookie()
    if (token) {
      const { id } = await decodedToken(token)
      const offers = await getOfferById(id)
      const users = await Promise.all(offers.data.map((swap) => getUserById(swap.to_user_id)))
      setUsersOffer(users)
      setSwapHistory(offers.data)
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

  // Selection handlers
  const handleMyItemSelect = (itemId) => {
    setSelectedMyItems((prev) => {
      const newSelection = prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      if (prev.includes(itemId)) setSelectedOtherItems([])
      return newSelection
    })
  }

  const handleOtherItemSelect = (itemId) => {
    if (selectedMyItems.length === 0) return
    const item = otherItems.find((p) => p.id === itemId)
    const isAllowedCategory =
      Array.isArray(item?.allowed_categories) && item.allowed_categories.some((cat) => allowedCategories.includes(cat))
    if (isAllowedCategory || allowedCategories.length === 0) {
      setSelectedOtherItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
    }
  }

  // Value calculation
  const getTotalValue = (items, products) => {
    return items.reduce((total, itemId) => {
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
      await addOffer(to_user.data.id, priceDifference, selectedMyItems, selectedOtherItems, message, name)
      toast({
        title: t("successfully") || "Success",
        description: "Successfully created offer",
      })
      setMessage("")
      setSelectedMyItems([])
      setSelectedOtherItems([])
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
  const handlePriceDifference = (userId, cash) => {
    const { id } = decodedToken()
    if (userId === id) {
      if (cash > 0) return `You pay: ${Math.abs(Math.ceil(cash))} LE`
      if (cash < 0) return `You get: ${Math.abs(Math.ceil(cash))} LE`
      return `The price is equal`
    } else {
      if (cash < 0) return `You pay: ${Math.abs(Math.ceil(cash))} LE`
      if (cash > 0) return `You get: ${Math.abs(Math.ceil(cash))} LE`
      return `The price is equal`
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
          <p className="text-muted-foreground">Loading swap page...</p>
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
    >
      {/* Header */}
      <motion.header
        className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-0"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/" className="text-2xl font-bold text-primary">
                  SwapSpace
                </Link>
              </motion.div>
              <Badge variant="outline" className="hidden sm:inline-flex">
                Swap
              </Badge>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold mb-4">Create a Swap</h1>
          <p className="text-muted-foreground">
            Select items from your collection first, then choose matching items from other users
          </p>
        </motion.div>

        <Tabs defaultValue="swap">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <TabsList className="mb-8">
              <TabsTrigger value="swap">Swap</TabsTrigger>
              <TabsTrigger value="history">{t("swapHistory")}</TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="swap">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {/* Category Hint */}
              <AnimatePresence>
                {showHint && allowedCategories.length > 0 && (
                  <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="mb-6">
                    <Card className="border-blue-200 bg-blue-50 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          >
                            <Info className="h-5 w-5 text-blue-600" />
                          </motion.div>
                          <div>
                            <p className="text-sm font-medium text-blue-800">Available categories for swapping:</p>
                            <motion.div
                              className="flex flex-wrap gap-2 mt-2"
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              {allowedCategories.map((category, index) => (
                                <motion.div
                                  key={category}
                                  variants={itemVariants}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    {category}
                                  </Badge>
                                </motion.div>
                              ))}
                            </motion.div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selection Rules Info */}
              <motion.div variants={cardVariants}>
                <Card className="mb-6 border-yellow-200 bg-yellow-50 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-2">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                      </motion.div>
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Swap Rules:</p>
                        <motion.ul
                          className="space-y-1 text-xs"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          {[
                            "First select your items to see available categories",
                            "You can only select items from matching categories",
                            "Unchecking your items will clear other selections",
                          ].map((rule, index) => (
                            <motion.li key={index} variants={itemVariants}>
                              • {rule}
                            </motion.li>
                          ))}
                        </motion.ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                    <Card className="border-primary/20 bg-primary/5 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <motion.div
                          className="flex items-center justify-between mb-4"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div className="text-center" variants={itemVariants} whileHover={{ scale: 1.05 }}>
                            <motion.div
                              className="text-2xl font-bold text-primary"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                            >
                              {selectedMyItems.length}
                            </motion.div>
                            <div className="text-sm text-muted-foreground">Your Items</div>
                            <div className="text-lg font-semibold">{mySelectedValue}LE</div>
                          </motion.div>

                          <motion.div
                            className="flex items-center"
                            animate={{ x: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          >
                            <ArrowLeftRight className="h-8 w-8 text-primary" />
                          </motion.div>

                          <motion.div className="text-center" variants={itemVariants} whileHover={{ scale: 1.05 }}>
                            <motion.div
                              className="text-2xl font-bold text-primary"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                            >
                              {selectedOtherItems.length}
                            </motion.div>
                            <div className="text-sm text-muted-foreground">Their Items</div>
                            <div className="text-lg font-semibold">{otherSelectedValue}LE</div>
                          </motion.div>
                        </motion.div>

                        {/* Price Difference */}
                        <motion.div
                          className="text-center mb-4"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="text-sm text-muted-foreground mb-1">Price Difference</div>
                          <motion.div
                            className={`text-lg font-bold ${
                              priceDifference > 0
                                ? "text-green-600"
                                : priceDifference < 0
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          >
                            {priceDifference > 0 ? "+" : ""}
                            {priceDifference}LE
                            {priceDifference > 0 && <span className="text-sm ml-1">(You gain)</span>}
                            {priceDifference < 0 && <span className="text-sm ml-1">(You pay extra)</span>}
                            {priceDifference === 0 && <span className="text-sm ml-1">(Equal value)</span>}
                          </motion.div>
                        </motion.div>

                        {/* Swap name */}
                        <motion.div
                          className="flex space-x-3 my-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <Input
                            placeholder="Take name for deal is optionally"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1"
                          />
                        </motion.div>

                        {/* Chat Section */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Card className="mb-6 hover:shadow-md transition-shadow">
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <MessageCircle className="h-5 w-5 mr-2" />
                                Chat with Swap Partners
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Type your message for the swap partners"
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>

                        <motion.div
                          className="text-center"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                            <Button size="lg" className="px-8" onClick={handleAddOffer} disabled={disabledOffer}>
                              {disabledOffer ? (
                                <>
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                  />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                                  Swap
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
                        className="flex items-center mb-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Package className="h-6 w-6 mr-3 text-primary" />
                        <h2 className="text-2xl font-bold">Your Products</h2>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        >
                          <Badge variant="secondary" className="ml-3">
                            {selectedMyItems.length} selected
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
                                className={`transition-all duration-200 ${
                                  selectedMyItems.includes(product.id)
                                    ? "ring-2 ring-primary shadow-lg"
                                    : "hover:shadow-md"
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
                                    <ItemCard {...product} />
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
                      className="rounded-lg border border-dashed p-8 text-center"
                      variants={cardVariants}
                      whileHover={{ scale: 1.02 }}
                    >
                      <p className="text-muted-foreground">You haven't any Items yet.</p>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          onClick={() => router.push("/profile/settings/editItem/new")}
                          className="mt-4 bg-primary-orange text-white hover:bg-deep-orange"
                        >
                          Add New Item
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
                        className="flex items-center mb-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Users className="h-6 w-6 mr-3 text-primary" />
                        <h2 className="text-2xl font-bold">Available Products</h2>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                        >
                          <Badge variant="secondary" className="ml-3">
                            {selectedOtherItems.length} selected
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
                                  className={`transition-all duration-200 ${
                                    isSelected
                                      ? "ring-2 ring-primary shadow-lg"
                                      : isSelectable
                                        ? "hover:shadow-md"
                                        : "opacity-50 cursor-not-allowed"
                                  }`}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start space-x-4">
                                      <div className="flex items-center">
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                          <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => handleOtherItemSelect(product.id)}
                                            disabled={!isSelectable}
                                            className="mr-3"
                                          />
                                        </motion.div>
                                      </div>
                                      <ItemCard {...product} />
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
                      className="rounded-lg border border-dashed p-8 text-center"
                      variants={cardVariants}
                      whileHover={{ scale: 1.02 }}
                    >
                      <p className="text-muted-foreground">He hasn't made any Items yet.</p>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          onClick={() => router.push("/products")}
                          className="mt-4 bg-primary-orange text-white hover:bg-deep-orange"
                        >
                          Start Swapping
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="history">
            <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
              <h2 className="text-xl font-semibold">{t("swapHistory")}</h2>
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
                      >
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(swap?.date_created).toISOString().split("T")[0]}
                                </p>
                                <h3 className="font-medium">
                                  Swap with:{" "}
                                  {usersOffer.find((u) => u.id === swap.to_user_id)?.first_name || `Not Name`}
                                </h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <motion.span
                                    className={`rounded-full px-2 py-1 text-xs ${
                                      swap.status_offer === "completed"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                        : swap.status_offer === "pending"
                                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                          : "bg-red-600 text-yellow-800 dark:bg-red-500 dark:text-yellow-100"
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
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  className="rounded-lg border border-dashed p-8 text-center"
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-muted-foreground">You haven't made any swaps yet.</p>
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button className="mt-4 bg-primary-orange text-white hover:bg-deep-orange">Start Swapping</Button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  )
}

// ItemCard component
const ItemCard = ({ id, name, description, price, images, allowed_categories, status_swap, category }) => {
  const [bigImage, setBigImage] = useState("")

  useEffect(() => {
    const getDataImage = async () => {
      if (images) {
        const images2 = await getImageProducts(images)
        setBigImage(images2.data[0]?.directus_files_id || "")
      }
    }
    getDataImage()
  }, [images])

  const getConditionColor = (itemsStatus) => {
    switch (itemsStatus) {
      case "new":
      case "like-new":
      case "excellent":
        return "bg-green-100 text-green-800"
      case "good":
        return "bg-blue-100 text-blue-800"
      case "fair":
        return "bg-yellow-100 text-yellow-800"
      case "old":
        return "bg-red-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <motion.div
      className="flex items-start space-x-4 w-full"
      whileHover={{ x: 5 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400 }}>
        <Image
          src={bigImage ? `https://deel-deal-directus.csiwm3.easypanel.host/assets/${bigImage}` : "/placeholder.svg"}
          alt={name}
          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          width={80}
          height={80}
        />
      </motion.div>
      <div className="flex-1 min-w-0">
        <motion.h3
          className="font-semibold text-lg mb-1"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {name}
        </motion.h3>
        <motion.div
          className="flex flex-wrap gap-2 mb-2"
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
            <Badge variant="secondary">{category}</Badge>
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            whileHover={{ scale: 1.05 }}
          >
            <Badge className={getConditionColor(status_swap)}>{status_swap}</Badge>
          </motion.div>
          <Separator />
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            whileHover={{ scale: 1.05 }}
          >
            <Badge>Allow To:</Badge>
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
                <Badge variant="outline" className="ml-1">
                  {cat}
                </Badge>
              </motion.div>
            ))}
        </motion.div>
        <motion.div
          className="text-xl font-bold text-primary"
          
        >
          {price} LE
        </motion.div>
      </div>
    </motion.div>
  )
}
