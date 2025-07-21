"use client"
import Link from "next/link"
import { ItemsList } from "@/components/items-list"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Verified, ArrowLeftRight, Package, Clock, Settings, ArrowLeft, BellDot } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "@/lib/use-translations"
import { getUserById, getUserByProductId } from "@/callAPI/users"
import { getProductByUserId, getProductById } from "@/callAPI/products"
import { getOfferById, getOfferItemsByOfferId, getOffersNotifications, getReview } from "@/callAPI/swap"
import { decodedToken, getCookie } from "@/callAPI/utiles"
import Notifications from "@/app/notifications/page"
import Cart from "@/app/cart/page"

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

  const [full_name, setFullName] = useState(`${user?.first_name} ${user?.last_name}` || "")

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
    const userPruducts = await getProductByUserId()
    setmyUnavailableItems(userPruducts.data.filter((u) => u.status_swap === "unavailable"))
    setmyAvailableItems(userPruducts.data.filter((u) => u.status_swap === "available"))
    return userPruducts.data
  }

  const getNotificationsLength = async () => {
    const notifications = await getOffersNotifications(id)
    console.log("notifications", notifications.data)
    setNotificationsLength(Array.isArray(notifications.count) ? notifications.count : 0)
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
    getUserProducts().then((data) => {
      setProducts(data)
    })
  }, [])

  // Update avatar path and full name when user2 changes
  useEffect(() => {
    if (user) {
      handleGetBreviousRating(user.id)
      setAvatarPath(`http://localhost:8055/assets/${user.avatar}`)
      setFullName(`${user.first_name} ${user.last_name}`)
    }
  }, [user])
  // -------------------------------------
  return (
    <motion.div className="container py-10" variants={containerVariants} initial="hidden" animate="visible">
      {/* Go Back Link */}
      <motion.div className="inline mb-3" variants={itemVariants}>
        <motion.div >
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
        </motion.div>
        <motion.h1
          className="mx-2 text-3xl font-bold inline bg-gradient-to-r from-[#49c5b6] to-[#3db6a7] bg-clip-text text-transparent"
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
            <Card className="h-full shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <motion.div variants={avatarVariants} whileHover="hover" className="relative">
                  <Avatar className="h-16 w-16 ring-4 ring-[#49c5b6]/20 shadow-lg">
                    <AvatarImage src={avatarPath || "/placeholder.svg"} alt={full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-[#49c5b6] to-[#3db6a7] text-white font-bold">
                      {full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <motion.div className="absolute -top-1 -right-1" variants={badgeVariants} whileHover="hover">
                    {user?.verified && (
                      <Verified className="h-5 w-5 text-[#49c5b6] bg-white rounded-full p-1 shadow-md" />
                    )}
                  </motion.div>
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <CardTitle className="capitalize text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {full_name}
                      </CardTitle>
                    </motion.div>
                  </div>
                  <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {/* Additional description can go here */}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <motion.div
                    className="flex items-center gap-2 text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    variants={statsVariants}
                    whileHover="hover"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                    >
                      <MapPin className="h-4 w-4 text-[#49c5b6]" />
                    </motion.div>
                    <span className="font-medium">
                      {`${user?.country}, ${user?.city}, ${user?.street}` || "No location set"}
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
                      {rate ? `${rate} / 5.0 ${t("Rating") || "Rating"}` : t("noRate") || "No ratings yet"}
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
                      {!user?.completedSwaps
                        ? "No completed swaps"
                        : `${user?.completedSwaps == 0 ? t("no") : user?.completedSwaps} ${t("completedSwaps") || "Completed swaps"}`}{" "}
                    </span>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full bg-gradient-to-r from-[#49c5b6] to-[#3db6a7] text-white border-0 hover:from-[#3db6a7] hover:to-[#2ea89a] shadow-lg hover:shadow-xl transition-all duration-300"
                      asChild
                    >
                      <Link href={`profile/settings/editProfile`}>{t("editProfile") || "Edit Profile"}</Link>
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
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-lg">
                {[
                  { value: "items", icon: Package, label: t("yourProducts"), count: myAvailableItems.length },
                  {
                    value: "unavailableItems",
                    icon: Star,
                    label: t("itemsInOffers") || "Items In Offers",
                    count: myUnavailableItems.length,
                  },
                  { value: "offers", icon: Clock, label: t("offers") || "Offers", count: userOffers.length },
                  {
                    value: "notifications",
                    icon: BellDot,
                    label: t("notifications") || "Notifications",
                    count: notificationsLength,
                  },
                ].map((tab, index) => (
                  <motion.div
                    key={tab.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <TabsTrigger
                      value={tab.value}
                      className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md transition-all duration-300"
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <motion.span
                        className="ml-1 rounded-full bg-[#49c5b6] text-white px-2 py-0.5 text-xs font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                      >
                        {tab.count}
                      </motion.span>
                    </TabsTrigger>
                  </motion.div>
                ))}
              </TabsList>
            </motion.div>

            <AnimatePresence mode="wait">
              <TabsContent value="items" className="mt-6" key={crypto.randomUUID()}>
                <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" key="items">
                  <div className="flex items-center justify-between mb-4">
                    <motion.h2
                      className="text-xl font-bold bg-gradient-to-r from-[#49c5b6] to-[#3db6a7] bg-clip-text text-transparent"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {t("myItems") || "My Items"}
                    </motion.h2>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button asChild size="sm" className="bg-[#49c5b6] hover:bg-[#3db6a7] shadow-lg">
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

              <TabsContent value="offers" className="mt-6" key={crypto.randomUUID()}>
                <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" key="offers">
                  <motion.h2
                    className="mb-4 text-xl font-bold bg-gradient-to-r from-[#49c5b6] to-[#3db6a7] bg-clip-text text-transparent"
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
                    <Cart />
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-6" key={crypto.randomUUID()}>
                <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" key="notifications">
                  <motion.h2
                    className="mb-4 text-xl font-bold bg-gradient-to-r from-[#49c5b6] to-[#3db6a7] bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {t("myNotifications") || "My Notifications"}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Notifications />
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="unavailableItems" className="mt-6" key={crypto.randomUUID()}>
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  key="unavailableItems"
                >
                  <motion.h2
                    className="mb-4 text-xl font-bold bg-gradient-to-r from-[#49c5b6] to-[#3db6a7] bg-clip-text text-transparent"
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
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
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
                            <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center bg-gray-50 dark:bg-gray-800/50">
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
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  )
}
