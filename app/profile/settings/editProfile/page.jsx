"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronLeft,
  User,
  Globe,
  Shield,
  CirclePlus,
  Navigation,
  Loader2,
  MapPin,
  Settings,
  Camera,
  Lock,
  Sparkles,
} from "lucide-react"
import { editeProfile, getUserById, resetPassword } from "@/callAPI/users"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { decodedToken, getCookie } from "@/callAPI/utiles"
import { LanguageToggle } from "@/components/language-toggle"
import { useTranslations } from "@/lib/use-translations"
import { useTheme } from "@/lib/theme-provider"
import { useToast } from "@/components/ui/use-toast"
import { ItemListingForm } from "@/components/item-listing-form"
import { z } from "zod"

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
    y: -5,
    transition: { duration: 0.2 },
  },
}

const headerVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
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

const inputVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  focus: {
    scale: 1.02,
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

const floatingVariants = {
  float: {
    y: [-10, 10, -10],
    rotate: [0, 5, -5, 0],
    transition: {
      repeat: Number.POSITIVE_INFINITY,
      duration: 4,
      ease: "easeInOut",
    },
  },
}

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
  },
}

export default function ProfileSettingsPage() {
  // -----------------------------------------
  const { toast } = useToast()

  const [currentEmail, setCurrentEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const updatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: t("error") || "Error",
        description: t("faileChangePassword") || "Please fill in all password fields",
        variant: "destructive",
      })
    } else if (newPassword !== confirmPassword) {
      toast({
        title: t("error") || "Error",
        description: t("notMach") || "New passwords do not match.",
        variant: "destructive",
      })
    } else if (newPassword === confirmPassword) {
      try {
        const Password = await resetPassword(newPassword, currentEmail)
        if (Password) {
          toast({
            title: t("successfully") || "Success",
            description: t("successChangePassword") || "Your password has been updated successfully.",
            variant: "success",
          })
          setCurrentEmail("")
          setNewPassword("")
          setConfirmPassword("")
        }
      } catch (error) {
        toast({
          title: t("error") || "Error",
          description: t("faildChangePassword") || "Error updating password..",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: t("error") || "Error",
        description: t("faildChangePassword") || "Something went wrong when updating password..",
        variant: "destructive",
      })
    }
  }

  const { theme, toggleTheme } = useTheme()

  const { t } = useTranslations()
  const params = useParams()

  const router = useRouter()
  const [user, setUser] = useState({})

  const [avatar, setAvatar] = useState(null)
  const [avatarPath, setAvatarPath] = useState("")
  const [first_name, setFirstName] = useState("")
  const [last_name, setLasttName] = useState("")
  const [gender, setGender] = useState("")
  const [phone_number, setPhone] = useState("")
  const [description, setDescription] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [street, setStreet] = useState("")
  const [post_code, setPostCode] = useState("")
  const [geo_location, set_geo_location] = useState({})
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(null)
  const [selectedPosition, setSelectedPosition] = useState(null)
  const mapInstanceRef = useRef(null)

  const getUser = async () => {
    const token = await getCookie()
    if (token) {
      const { id } = await decodedToken(token)
      const userData = await getUserById(id)
      setUser(userData.data)
    }
  }

  const profileSchema = z.object({
    phone_number: z
      .string()
      .min(8, t("PhoneIsShort") || "Phone number is too short")
      .max(20, t("PhoneIsLong") || "Phone number is too long")
      .regex(/^\+?\d{8,20}$/, t("invalidNumber") || "Invalid phone number"),
  })

  const result = profileSchema.safeParse({ phone_number })

  const userCollectionData = {}
  if (first_name) userCollectionData.first_name = first_name
  if (last_name) userCollectionData.last_name = last_name
  if (description) userCollectionData.description = description
  if (avatar) userCollectionData.avatar = avatar
  if (city) userCollectionData.city = city
  if (country) userCollectionData.country = country
  if (street) userCollectionData.street = street
  if (post_code) userCollectionData.post_code = post_code
  if (gender) userCollectionData.gender = gender
  if (phone_number) userCollectionData.phone_number = phone_number
  if (geo_location) userCollectionData.geo_location = geo_location

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  useEffect(() => {
    getUser()
  }, [])

  useEffect(() => {
    setAvatarPath(`http://localhost:8055/assets/${user.avatar}`)
    setFirstName(user.first_name || "")
    setLasttName(user.last_name || "")
    setGender(user?.gender || "")
    setPhone(user.phone_number || "")
    setDescription(user.description || "")
    setCountry(user?.country || "")
    setCity(user?.city || "")
    setStreet(user?.street || "")
    setPostCode(user?.post_code || "")
    set_geo_location(user?.geo_location || {})
  }, [user])

  const [formData, setFormData] = useState({
    first_name,
    last_name,
    phone_number,
    description,
    city,
    country,
    street,
    post_code,
    gender,
    geo_location,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userCollectionData || Object.keys(userCollectionData).length === 0) {
      toast({
        title: "Warning",
        description: t("noChangeSaved") || "No changes to save",
        variant: "destructive",
      })
    } else {
      if (!result.success) {
        toast({
          title: "Warning",
          description: t("phoneNumberNotValidate") || "Phone number not valid",
          variant: "destructive",
        })
      } else {
        await editeProfile(userCollectionData, user.id, avatar)
        router.refresh()

        toast({
          title: t("successfully") || "Success",
          description: t("savedSuccessfully") || "Settings saved successfully!",
        })
      }
    }
  }

  const getCurrentPosition = () => {
    setIsGettingLocation(true)

    if (!navigator.geolocation) {
      toast({
        title: t("error") || "Error",
        description: t("geolocationNotSupported") || "Geolocation is not supported by this browser",
        variant: "destructive",
      })
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          name: "Current Location",
        }
        setCurrentPosition(pos)
        setSelectedPosition(pos)

        set_geo_location({
          lat: pos.lat,
          lng: pos.lng,
          accuracy: pos.accuracy,
          name: pos.name,
        })

        setIsGettingLocation(false)

        toast({
          title: t("CurrentLocationFound") || "Current location found",
          description: `Lat: ${pos.lat.toFixed(6)}, Lng: ${pos.lng.toFixed(6)}`,
        })
      },
      (error) => {
        let message = t("Unabletoretrieveyourlocation") || "Unable to retrieve your location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = t("Locationaccessdeniedbyuser") || "Location access denied by user"
            break
          case error.POSITION_UNAVAILABLE:
            message = t("Locationinformationisunavailable") || "Location information is unavailable"
            break
          case error.TIMEOUT:
            message = t("Locationrequesttimedout") || "Location request timed out"
            break
        }
        toast({
          title: t("LocationError") || "Location Error",
          description: message,
          variant: "destructive",
        })
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  return (
    <motion.div
      className="container py-8 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-20 right-10 text-[#49c5b6]/5" variants={floatingVariants} animate="float">
          <Settings className="h-32 w-32" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-10 text-[#3db6a7]/5"
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 2 }}
        >
          <Sparkles className="h-24 w-24" />
        </motion.div>
      </div>

      {/* Header Section */}
      <motion.div className="inline mb-6 relative z-10" variants={headerVariants}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
          <Button
            className="mb-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <Link href="/profile" className="flex items-center">
              <motion.div animate={{ x: [-2, 0, -2] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}>
                <ChevronLeft className="mr-1 h-4 w-4" />
              </motion.div>
            </Link>
          </Button>
        </motion.div>
        <motion.h1
          className="mx-2 text-3xl font-bold inline bg-gradient-to-r from-[#49c5b6] to-[#3db6a7] bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {t("accountSettings") || "Account Settings"}
        </motion.h1>
      </motion.div>

      <Tabs defaultValue="profile" className="w-full relative z-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Sidebar */}
          <motion.div className="md:col-span-1" variants={itemVariants}>
            <motion.div variants={cardVariants} whileHover="hover" className="sticky top-8">
              <TabsList className="flex h-auto w-full flex-col items-start justify-start bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg border-0 p-2 rounded-xl">
                {[
                  { value: "profile", icon: User, label: t("profile") || "Profile" },
                  { value: "preferences", icon: Globe, label: t("preferences") || "Preferences" },
                  { value: "security", icon: Shield, label: t("security") || "Security" },
                  { value: "add", icon: CirclePlus, label: t("addItem") || "Add Item" },
                ].map((tab, index) => (
                  <motion.div
                    key={tab.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <TabsTrigger
                      value={tab.value}
                      className="w-full justify-start text-left data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#49c5b6] data-[state=active]:to-[#3db6a7] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                    >
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4 }}
                      >
                        <tab.icon className="mr-2 h-4 w-4" />
                      </motion.div>
                      {tab.label}
                    </TabsTrigger>
                  </motion.div>
                ))}
              </TabsList>
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <motion.div className="md:col-span-3" variants={itemVariants}>
            <AnimatePresence mode="wait">
              <TabsContent value="profile" key='profile'>
                <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" key="profile">
                  <motion.div variants={cardVariants} whileHover="hover">
                    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-[#49c5b6]/10 to-[#3db6a7]/10">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            {t("profileInformation") || "Profile Information"}
                          </CardTitle>
                          <CardDescription className="text-base">
                            {t("UpdateProfileInformation") ||
                              "Update your profile information and how others see you on the platform."}
                          </CardDescription>
                        </motion.div>
                      </CardHeader>
                      <CardContent className="p-8">
                        <form onSubmit={handleSubmit}>
                          {/* Avatar Section */}
                          <motion.div
                            className="mb-8 flex flex-col items-center space-y-4"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <motion.div
                              className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-[#49c5b6]/20 shadow-xl"
                              variants={avatarVariants}
                              whileHover="hover"
                            >
                              <Image
                                src={avatarPath || "/placeholder.svg"}
                                alt={user?.first_name || "Unknown"}
                                width={96}
                                height={96}
                                className="h-full w-full object-cover"
                              />
                              <motion.div
                                className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                                whileHover={{ opacity: 1 }}
                              >
                                <Camera className="h-6 w-6 text-white" />
                              </motion.div>
                            </motion.div>
                          </motion.div>

                          <motion.div
                            className="space-y-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            {/* Name Fields */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="first_name"
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                  {t("firstName") || "First Name"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="first_name"
                                    name="first_name"
                                    value={first_name}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-[#49c5b6] focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>

                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="last_name"
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                  {t("LastName") || "Last Name"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="last_name"
                                    name="last_name"
                                    value={last_name}
                                    onChange={(e) => setLasttName(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-[#49c5b6] focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>
                            </div>

                            {/* Location Fields */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="country"
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                  {t("Country") || "Country"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="country"
                                    name="country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-[#49c5b6] focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>

                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label htmlFor="city" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {t("City") || "City"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="city"
                                    name="city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-[#49c5b6] focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>

                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="street"
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                  {t("Street") || "Street"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="street"
                                    name="street"
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-[#49c5b6] focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>

                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="post_code"
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                  {t("PstalCode") || "Postal Code"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="post_code"
                                    name="post_code"
                                    value={post_code}
                                    onChange={(e) => setPostCode(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-[#49c5b6] focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>
                            </div>

                            {/* Location Services */}
                            <motion.div variants={inputVariants}>
                              <motion.div variants={cardVariants} whileHover="hover">
                                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                      <motion.div
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 8, ease: "linear" }}
                                      >
                                        <Navigation className="h-5 w-5 text-blue-600" />
                                      </motion.div>
                                      {t("CurrentPosition") || "Current Position"}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                                      <Button
                                        type="button"
                                        onClick={getCurrentPosition}
                                        disabled={isGettingLocation}
                                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg"
                                      >
                                        {isGettingLocation ? (
                                          <>
                                            <motion.div
                                              animate={{ rotate: 360 }}
                                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                                            >
                                              <Loader2 className="mr-2 h-4 w-4" />
                                            </motion.div>
                                            {t("GettingLocation") || "Getting Location..."}
                                          </>
                                        ) : (
                                          <>
                                            <MapPin className="mr-2 h-4 w-4" />
                                            {t("GetCurrentLocation") || "Get Current Location"}
                                          </>
                                        )}
                                      </Button>
                                    </motion.div>

                                    <AnimatePresence>
                                      {selectedPosition && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: "auto" }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.3 }}
                                        >
                                          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                            <CardHeader>
                                              <CardTitle className="flex items-center gap-2 text-base">
                                                <MapPin className="h-4 w-4 text-green-600" />
                                                {t("SelectedPosition") || "Selected Position"}
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                              <motion.p
                                                className="text-sm"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 }}
                                              >
                                                <strong>{t("Name") || "Name"}:</strong> {selectedPosition.name}
                                              </motion.p>
                                              <motion.p
                                                className="text-sm"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                              >
                                                <strong>{t("Latitude") || "Latitude"}:</strong>{" "}
                                                {selectedPosition.lat.toFixed(6)}
                                              </motion.p>
                                              <motion.p
                                                className="text-sm"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                              >
                                                <strong>{t("Longitude") || "Longitude"}:</strong>{" "}
                                                {selectedPosition.lng.toFixed(6)}
                                              </motion.p>
                                            </CardContent>
                                          </Card>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            </motion.div>

                            {/* Contact and Personal Info */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {t("email") || "Email"}
                                </Label>
                                <Input
                                  disabled
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={user.email || ""}
                                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                />
                              </motion.div>

                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="phone_number"
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                  {t("phoneNumber") || "Phone Number"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="phone_number"
                                    name="phone_number"
                                    value={phone_number}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-[#49c5b6] focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>
                            </div>

                            {/* Avatar Upload and Gender */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="avatar"
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                  {t("Avatar") || "Avatar"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="avatar"
                                    name="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setAvatar(e.target.files[0])}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-[#49c5b6] focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>

                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="gender"
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                  {t("Gender") || "Gender"}
                                </Label>
                                <Select value={gender} onValueChange={(value) => setGender(value)}>
                                  <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-[#49c5b6] focus:border-transparent">
                                    <SelectValue placeholder={t("SelectGender") || "Select Gender"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">{t("Male") || "Male"}</SelectItem>
                                    <SelectItem value="female">{t("Female") || "Female"}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </motion.div>
                            </div>

                            {/* Description */}
                            <motion.div className="space-y-2" variants={inputVariants}>
                              <Label
                                htmlFor="description"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                {t("descriptionProfile") || "Description"}
                              </Label>
                              <motion.div whileFocus="focus">
                                <Textarea
                                  id="description"
                                  name="description"
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                  rows={4}
                                  className="transition-all duration-300 focus:ring-2 focus:ring-[#49c5b6] focus:border-transparent resize-none"
                                  placeholder="Tell others about yourself..."
                                />
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        </form>
                      </CardContent>
                      <CardFooter className="flex justify-end bg-gray-50 dark:bg-gray-800/50">
                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                          <Button
                            onClick={handleSubmit}
                            className="bg-gradient-to-r from-[#49c5b6] to-[#3db6a7] hover:from-[#3db6a7] hover:to-[#2ea89a] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            {t("SaveChanges") || "Save Changes"}
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="preferences" key='preferences'>
                <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" key="preferences">
                  <motion.div variants={cardVariants} whileHover="hover">
                    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                          {t("preferences") || "Preferences"}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {t("Customizeyourexperience") || "Customize your experience on the platform."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-8">
                        <motion.div
                          className="space-y-8"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div
                            className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div>
                              <h3 className="font-medium text-lg">{t("DarkMode") || "Dark Mode"}</h3>
                              <p className="text-sm text-muted-foreground">
                                {t("Customizeyourexperience") || "Toggle between light and dark themes"}
                              </p>
                            </div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Switch
                                checked={theme === "dark"}
                                onClick={() => toggleTheme()}
                                onCheckedChange={(checked) => handleSwitchChange("darkMode", checked)}
                              />
                            </motion.div>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <LanguageToggle />
                          </motion.div>
                        </motion.div>
                      </CardContent>
                      <CardFooter className="flex justify-end bg-gray-50 dark:bg-gray-800/50">
                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                          <Button
                            onClick={handleSubmit}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            {t("SaveChanges") || "Save Changes"}
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="security"  key='security'>
                <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" key="security">
                  <motion.div variants={cardVariants} whileHover="hover">
                    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                      <CardHeader className="bg-gradient-to-r from-red-500/10 to-orange-500/10">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: [0, -5, 5, 0] }}
                            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                          >
                            <Lock className="h-6 w-6 text-red-500" />
                          </motion.div>
                          {t("security") || "Security"}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {t("Manageyouraccountsecurityprivacy") ||
                            "Manage your account security and privacy settings."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-8">
                        <motion.div
                          className="space-y-8"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div className="space-y-4" variants={itemVariants}>
                            <h3 className="font-medium text-lg">{t("ChangePassword") || "Change Password"}</h3>
                            <div className="space-y-4">
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label htmlFor="current-email" className="text-sm font-medium">
                                  {t("CurrentEmail") || "Current Email"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="current-email"
                                    type="email"
                                    value={currentEmail}
                                    onChange={(e) => setCurrentEmail(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>

                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label htmlFor="new-password" className="text-sm font-medium">
                                  {t("NewPassword") || "New Password"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>

                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label htmlFor="confirm-password" className="text-sm font-medium">
                                  {t("ConfirmPassword") || "Confirm New Password"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>

                              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                                <Button
                                  onClick={updatePassword}
                                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  {t("UpdatePassword") || "Update Password"}
                                </Button>
                              </motion.div>
                            </div>
                          </motion.div>

                          <motion.div
                            className="space-y-4 pt-8 border-t border-gray-200 dark:border-gray-700"
                            variants={itemVariants}
                          >
                            <h3 className="font-medium text-lg text-red-600 dark:text-red-400">
                              {t("DeleteAccount") || "Delete Account"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {t("Permanentlydeleteyouraccoun") || "Permanently delete your account and all your data."}
                            </p>
                            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                              <Button
                                variant="destructive"
                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                {t("DeleteAccount") || "Delete Account"}
                              </Button>
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="add"  key='add'>
                <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" key="add">
                  <motion.div variants={cardVariants} whileHover="hover">
                    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                      <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: [0, 90, 0] }}
                            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                          >
                            <CirclePlus className="h-6 w-6 text-green-500" />
                          </motion.div>
                          {t("addItem") || "Add Item"}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {t("Addyouritemstoswap") || "Add your items to swap"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-8">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <ItemListingForm />
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </motion.div>
        </div>
      </Tabs>
    </motion.div>
  )
}
