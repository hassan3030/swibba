"use client"
import Link from "next/link"
import { ItemsList } from "@/components/items-list"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Verified, ArrowLeftRight, Package, Settings, ArrowLeft, BadgeX,  } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "@/lib/use-translations"
import { getUserById, getUserByProductId } from "@/callAPI/users"
import { getProductByUserId, getProductById } from "@/callAPI/products"
import { getOfferById, getOfferItemsByOfferId, getOffersNotifications, getReview } from "@/callAPI/swap"
import { decodedToken, getCookie, validateAuth } from "@/callAPI/utiles"
import RecivedItems from "@/app/recived-items/page"
import SendItems from "@/app/send-items/page"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BiCartDownload } from "react-icons/bi";
import { TbShoppingCartUp } from "react-icons/tb";
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
}

const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
}

const avatarVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
      delay: 0.3,
    },
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: { duration: 0.2 },
  },
}

const statsVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
}

const badgeVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
  hover: {
    scale: 1.1,
    rotate: [0, -5, 5, 0],
    transition: { duration: 0.3 },
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

export default function ProfilePage() {
  // from data.js
  const [activeTab, setActiveTab] = useState("items")

  // Format date to a more readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // -------------------------------------
  const { t } = useTranslations()
  const params = useParams()
  const router = useRouter()
  const id = params.id
  const [user, setUser] = useState([])
  const [rate, setRate] = useState(0)
  const [products, setProducts] = useState([])
  const [avatarPath, setAvatarPath] = useState("")
  const [full_name, setFullName] = useState("")
  const [userOffers, setUserOffers] = useState([])
  const [notificationsLength, setNotificationsLength] = useState(0)
  const [myAvailableItems, setmyAvailableItems] = useState([])
  const [myUnavailableItems, setmyUnavailableItems] = useState([])
  const [userSwaps, setUserSwaps] = useState([])
  const [swapItems, setSwapItems] = useState([])
  const [showSwitchHeart, setShowSwitchHeart] = useState(false)
  
  const getUser = async () => {
    const token = await getCookie()
    if (token) {
      const { id } = await decodedToken(token)
      if (!id) {
        return (
          <div className="container py-10">
            <p>Please sign in to view your profile.</p>
          </div>
        )
      }
      const userData = await getUserById(id)
      setUser(userData.data)
    }
  }

  function getCalculateAverageRating(reviews) {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0
    let sum = 0
    for (const value of reviews) {
      sum += value
    }
    console.log("sum", sum)
    return Math.round((sum / reviews.length) * 10) / 10
  }

  const handleGetBreviousRating = async (id) => {
    const response = await getReview(id)
    console.log("response", response.data)

    if (!response.data) {
      setRate(0)
    } else {
      const rates = response.data.map(({ rating }) => rating)
      console.log("rates", rates)
      const calculateAverageRating = getCalculateAverageRating(rates)
      console.log("calculateAverageRating", calculateAverageRating)

      setRate(calculateAverageRating)
      console.log("rate", rate)
    }
  }

  const getUserProducts = async () => {
    const userPruducts = await getProductByUserId("all")
    const userPruductsAvailable = await getProductByUserId("available")
    const userPruductsUnavailable = await getProductByUserId("unavailable")
    
    // Check if the API call was successful and data exists
    if (!userPruducts || !userPruducts.success || !userPruducts.data) {
      console.error("Failed to fetch user products:", userPruducts?.error || "Unknown error")
      setmyUnavailableItems([])
      setmyAvailableItems([])
      return []
    }

    // Ensure data is an array before filtering
    const productsData = Array.isArray(userPruducts.data) ? userPruducts.data : []
    
    setmyUnavailableItems(userPruductsUnavailable.data)
    setmyAvailableItems(userPruductsAvailable.data)
    return productsData
  }

  const getNotificationsLength = async () => {
    try {
      const { userId } = await validateAuth()
      const notifications = await getOffersNotifications(userId)
      console.log("notifications", notifications.count)
      setNotificationsLength(notifications.count)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setNotificationsLength(0)
    }
  }

  //get offers

  const getOffers = async () => {
    const token = await getCookie()
    if (token) {
      const offerItems = []
      const items = []
      const usersSwaper = []
      const { id } = await decodedToken(token)
      // get offers
      const offers = await getOfferById(id)

      // get offers items based offors id
      for (const offer of offers.data) {
        const offerItem = await getOfferItemsByOfferId(offer.id)
        offerItems.push(...offerItem.data)
      }

      // get items itself based offors items id
      for (const item of offerItems) {
        const product = await getProductById(item.item_id)
        items.push({ ...product.data })
      }

      // get user swaps based on user id and offers id
      for (const item of items) {
        const user = await getUserByProductId(item.id)
        usersSwaper.push({ ...user.data })
      }

      const uniqueUsers = usersSwaper.filter((obj, index, self) => index === self.findIndex((t) => t.id === obj.id))
      setUserOffers(offers.data)
      setUserSwaps(uniqueUsers)
      setSwapItems(items)

      console.log("setNotifications", offers) // Check what is returned
      console.log("offerItems", offerItems) // Check what is returned
      console.log("items", items) // Check what is returned
      console.log("usersSwaper", usersSwaper) // Check what is returned
    }
  }

  useEffect(() => {
    getNotificationsLength()
    getUser()
    getOffers()
    setFullName(`${user?.first_name || ""} ${user?.last_name || ""}`.trim())
    getUserProducts().then((data) => {
      setProducts(data)
    })
  }, [])

  // Update avatar path and full name when user2 changes
  useEffect(() => {
    if (user) {
      handleGetBreviousRating(user.id)
      setAvatarPath(`https://deel-deal-directus.csiwm3.easypanel.host/assets/${user.avatar}`)
      const firstName = String(user?.first_name || "")
      const lastName = String(user?.last_name || "")
      
      setFullName(`${firstName.length <= 11 ? firstName : firstName.slice(0, 10)} ${lastName.length <= 11 ? lastName : lastName.slice(0, 10)}`.trim())
    }
  }, [user])
  // -------------------------------------
  return (
    <motion.div className="container py-10" variants={containerVariants} initial="hidden" animate="visible">
      {/* Go Back Link */}
      <motion.div className="inline mb-3" variants={itemVariants}>
        {/* <motion.div >
          <Button
            className="mb-2 shadow-lg hover:shadow-xl transition-all duration-300"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <motion.div animate={{ x: [-2, 0, -2] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
            </motion.div>
          </Button>
        </motion.div> */}
        <motion.h1
          className="mx-2 text-3xl font-bold inline bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {t("myProfile") || "My Profile"}
        </motion.h1>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3 mt-4">
        {/* Profile Card */}
        <motion.div variants={itemVariants}>
          <motion.div variants={cardVariants} whileHover="hover" className="h-full">
            <Card className="h-full shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-muted">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <motion.div variants={avatarVariants} whileHover="hover" className="relative">
                  <Avatar className="h-16 w-16 ring-4 ring-primary/20 shadow-lg">
                    <AvatarImage src={avatarPath || "/placeholder.svg"} alt={full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                      {full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <motion.div className="absolute -top-1 -right-1" variants={badgeVariants} whileHover="hover">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            {user?.verified == "true" || user?.verified == true ? (
                              <Verified className="h-5 w-5 text-primary bg-background rounded-full p-1 shadow-md" />
                            ) : (
                              <BadgeX className="h-5 w-5 text-red-500 bg-background rounded-full p-1 shadow-md" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-primary text-primary-foreground">
                          <p className="text-sm">
                            {user?.verified == "true" || user?.verified == true ? (t("verified") || "Verified Account") : (t("notVerified") || "Not Verified")}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider> 
                  </motion.div>
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <CardTitle className="capitalize text-lg font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        {full_name || t("account") || "Account"}
                      </CardTitle>
                    </motion.div>
                  </div>
                  <CardDescription className="mt-1 text-sm text-muted-foreground">
                    {/* Additional description can go here */}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <motion.div
                    className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50"
                    variants={statsVariants}
                    whileHover="hover"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                    >
                      <MapPin className="h-4 w-4 text-primary" />
                    </motion.div>
                    <span className="font-medium">
                      {user?.country || user?.city || user?.street ? 
                        `${user?.country || ""} ${user?.city || ""} ${user?.street || ""}`.trim() :
                        (t("noAddress") || "No address provided")
                      }
                    </span>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-2 text-sm p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20"
                    variants={statsVariants}
                    whileHover="hover"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4, ease: "linear" }}
                    >
                      <Star className="h-4 w-4 text-yellow-500" />
                    </motion.div>
                    <span className="font-medium">
                      {rate ? `${rate} / 5.0 ${t("Rating") || "Rating"}` : (t("noRate") || "No ratings yet")}
                    </span>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-2 text-sm p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                    variants={statsVariants}
                    whileHover="hover"
                  >
                    <motion.div
                      animate={{ x: [-2, 2, -2] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    >
                      <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                    </motion.div>
                    <span className="font-medium">
                      {!user?.completedSwaps || user?.completedSwaps === 0
                        ? (t("noCompletedSwaps") || "No completed swaps")
                        : `${user?.completedSwaps || 0} ${t("completedSwaps") || "Completed swaps"}`}
                    </span>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0 hover:from-secondary hover:to-accent shadow-lg hover:shadow-xl transition-all duration-300"
                      asChild
                    >
                      <Link href={`profile/settings/editProfile`}>{t("editProfile") || "Edit Profile"}</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full mt-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0 hover:from-secondary hover:to-accent shadow-lg hover:shadow-xl transition-all duration-300"
                      asChild
                    >
                      <Link href={`/payment`}>{t("payment") || "Payment"}</Link>
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        {/* ----------------------------------------------------------- */}

        <motion.div className="md:col-span-2" variants={itemVariants}>
          <Tabs defaultValue="items" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="w-full bg-gradient-to-r p-2 from-muted to-muted/80 rounded-xl shadow-lg">
                <TabsList className="grid w-full grid-cols-4 bg-transparent  rounded-xl overflow-hidden ">
                  {[
                    { value: "items", icon: Package, label: t("yourProducts"), count: myAvailableItems.length },
                    {
                      value: "unavailableItems",
                      icon: Star,
                      label: t("itemsInOffers") || "Items In Offers",
                      count: myUnavailableItems.length,
                    }, 
                    { value: "offers", icon: TbShoppingCartUp, label: t("sendoffers") || "Send Offers", count: userOffers.length },
                    {
                      value: "recivedOffers",
                      icon: BiCartDownload,
                      label: t("recivedOffers") || "Recived Offers",
                      count: notificationsLength,
                    },
                  ].map((tab, index) => (
                    <TooltipProvider key={tab.value} >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="w-full"
                          >
                            <TabsTrigger
                              value={tab.value}
                              className="flex items-center justify-center gap-2 sm:gap-2 px-1 sm:px-2 md:px-3 py-2 data-[state=active]:bg-background dark:data-[state=active]:bg-card data-[state=active]:shadow-md transition-all duration-300 w-full min-w-0 relative group bg-muted/50 hover:bg-muted/80"
                            >
                              <tab.icon className="h-4 w-4 flex-shrink-0" />
                              <span className="hidden md:inline text-xs lg:text-sm font-medium truncate">
                                {tab.label}
                              </span>
                              <motion.span
                                className="ml-auto rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-xs font-bold flex-shrink-0 min-w-[20px] text-center"
                                initial={{ scale: 0 }}
                                variants={badgeVariants}
                                whileHover="hover"
                                animate={tab.count > 0 ? "pulse" : "visible"}
                                transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                              >
                                {tab.count}
                              </motion.span>
                              {/* Mobile indicator for active state */}
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300 md:hidden" />
                            </TabsTrigger>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-primary text-primary-foreground lg:hidden text-xs z-50">
                          <div className="flex flex-col gap-1">
                            <p className="font-medium">{tab.label}</p>
                            <p className="text-primary-foreground">{tab.count} items</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </TabsList>
              </div>
            </motion.div>

              <TabsContent value="items" className="mt-6">
                <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <div className="flex items-center justify-between mb-4">
                    <motion.h2
                      className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {t("myItems") || "My Items"}
                    </motion.h2>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button asChild size="sm" className="bg-primary hover:bg-secondary shadow-lg">
                        <Link href="/profile/items">
                          <Settings className="mr-2 h-4 w-4" />
                          {t("manageItems") || "Manage Items"}
                        </Link>
                      </Button>
                    </motion.div>
                  </div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <ItemsList
                      items={myAvailableItems}
                      showFilters={false}
                      showbtn={false}
                      showSwitchHeart={showSwitchHeart}
                    />
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="offers" className="mt-6">
                <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <motion.h2
                    className="mb-4 text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {t("myOffers") || "My Offers"}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <SendItems />
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="recivedOffers" className="mt-6">
                <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <motion.h2
                    className="mb-4 text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {t("myRecivedOffers") || "My Recived Offers"}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <RecivedItems />
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="unavailableItems" className="mt-6">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.h2
                    className="mb-4 text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {t("itemsInOffers") || "Items On Offers"}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted">
                      <CardContent className="p-6">
                        {myUnavailableItems.length > 0 ? (
                          <ItemsList items={myUnavailableItems} showFilters={false} showSwitchHeart={false} />
                        ) : (
                          <motion.div
                            className="mt-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center bg-muted/50">
                              <motion.p
                                className="text-center text-sm text-muted-foreground"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                              >
                                {t("youHaveNotItem") || "Your have not items to get more visibility and offers."}
                              </motion.p>
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  )
}
