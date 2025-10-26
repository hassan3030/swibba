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
  CreditCard,
  Phone,
} from "lucide-react"
import { editeProfile, getUserById, resetPassword, updatePhoneVerification } from "@/callAPI/users"
import { useRouter } from "next/navigation"
import { decodedToken, getCookie } from "@/callAPI/utiles"
import { LanguageToggle } from "@/components/language-toggle"
import { useTranslations } from "@/lib/use-translations"
import { useTheme } from "@/lib/theme-provider"
import { useToast } from "@/components/ui/use-toast"
import { ItemAdd } from "@/components/prods-modification/item-add"
import { z } from "zod"
import { countriesList } from "@/lib/data"
import { countriesListWithFlags, validatePhoneNumber } from "@/lib/countries-data"
import PhoneVerificationPopup from "@/components/profile/phone-verification-popup"
import LocationMap from "@/components/general/location-map"
import FlagIcon from "@/components/general/flag-icon"

import { sendMessage } from "@/callAPI/aiChat"
import { useLanguage } from "@/lib/language-provider"
import PaymentPage from "@/app/payment/page"
import { mediaURL } from "@/callAPI/utiles";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const { isRTL, toggleLanguage } = useLanguage()
  const [editedTranslations, setEditedTranslations] = useState({
    "en-US": { description: "", city: "", street: "" },
    "ar-SA": { description: "", city: "", street: "" }
    });


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
  const router = useRouter()
  const [user, setUser] = useState({})
  const [avatar, setAvatar] = useState(null)
  const [avatarPath, setAvatarPath] = useState("")
  const [first_name, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [last_name, setLasttName] = useState("")
  const [gender, setGender] = useState("")
  const [phone_number, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const [post_code, setPostCode] = useState("")
  const [geo_location, set_geo_location] = useState({})
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(null)
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [translations, setTranslations] = useState([])
  const [completed_data,set_completed_data] = useState('false')
  const [verified,setVerified] = useState('false')
  const [showPhoneVerification, setShowPhoneVerification] = useState(false)
  const [phoneValidationError, setPhoneValidationError] = useState("")

  const getUser = async () => {
    const token = await getCookie()
    if (token) {
      const { id } = await decodedToken(token)
      const userData = await getUserById(id)
      setUser(userData.data)  
      setVerified(userData.data.verified)
    }
  }

  const profileSchema = z.object({
    phone_number: z
      .string()
      .min(8, t("PhoneIsShort") || "Phone number is too short")
      .max(20, t("PhoneIsLong") || "Phone number is too long")
      .regex(/^\+?\d{8,20}$/, t("invalidNumber") || "Invalid phone number"),
      first_name: z
      .string()
      .min(1, t("firstname") || "First name is required")
      .max(20, t("firstnameIsLong") || "First name is too long"),
      last_name: z
      .string()
      .min(1, t("lastname") || "Last name is required")
      .max(20, t("lastnameIsLong") || "Last name is too long"),
  })

  const result = profileSchema.safeParse({ phone_number ,first_name,last_name})

  useEffect(() => {
    getUser()
  }, [])


  useEffect(() => {
    setAvatarPath(`${mediaURL}${user?.avatar}` || "/placeholder-user.jpg")
    setFirstName(user?.first_name || "")
    setLasttName(user?.last_name || "")
    setGender(user?.gender || "")
    setPhone(user?.phone_number || "")
    setCountry(user?.country || "")
    setPostCode(user?.post_code || "")
    set_geo_location(user?.geo_location || {})
    setEmail(user?.email || "")
    set_completed_data(user?.completed_data || 'false')
    setVerified(user?.verified || 'false')

    const en = user.translations?.find(t => t.languages_code === 'en-US') || {};
    const ar = user.translations?.find(t => t.languages_code === 'ar-SA') || {};

    setEditedTranslations({
        "en-US": {
            description: en.description || user.description || "",
            city: en.city || user.city || "",
            street: en.street || user.street || ""
        },
        "ar-SA": {
            description: ar.description || user.description || "",
            city: ar.city || user.city || "",
            street: ar.street || user.street || ""
        }
    });
  }, [user])



  const userCollectionData = {}
  if (first_name) userCollectionData.first_name = first_name
  if (last_name) userCollectionData.last_name = last_name
  if (editedTranslations["en-US"].description) userCollectionData.description = editedTranslations["en-US"].description
  if (avatar) userCollectionData.avatar = avatar
  if (editedTranslations["en-US"].city) userCollectionData.city = editedTranslations["en-US"].city
  if (country) userCollectionData.country = country
  if (editedTranslations["en-US"].street) userCollectionData.street = editedTranslations["en-US"].street
  if (post_code) userCollectionData.post_code = post_code
  if (gender) userCollectionData.gender = gender
  if (phone_number) userCollectionData.phone_number = phone_number
  if (geo_location) userCollectionData.geo_location = geo_location
  if (completed_data) userCollectionData.completed_data = completed_data
  
  const [formData, setFormData] = useState({
    first_name,
    last_name,
    phone_number,
    country,
    post_code,
    gender,
    geo_location,
    translations,
    completed_data,
    verified,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const isDataChanged = Object.keys(userCollectionData).some(
    key => userCollectionData[key] !== user[key]
  );

  const currentLangCode = isRTL ? 'ar-SA' : 'en-US';

  const handleAiTranslateToArabic = async () => {
    setIsAiProcessing(true);
    try {
      const { description, city, street } = editedTranslations["en-US"];

      if (!description && !city && !street) {
        toast({
          title: t("nothingToTranslate") || "Nothing to translate",
          description: t("enterTextInEnglishFields") || "Please enter some text in the English fields first.",
          variant: "destructive",
        });
        return;
      }

      const aiInput = `Please translate the following English text to Arabic:
- Description: ${description}
- Street: ${street}
- City: ${city}
please return ONLY a JSON response in this format:
{
"description_arabic": "...",
"city_arabic": "...",
"street_arabic": "..."
}`;

      const aiSystemPrompt = "You are an expert translator. Respond ONLY with valid JSON.";

      const aiResponse = await sendMessage(aiInput, aiSystemPrompt);
      let jsonString = aiResponse.text;
      
      const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
      
      jsonString = jsonString.trim();
      const jsonObject = JSON.parse(jsonString);

      setEditedTranslations(prev => ({
        ...prev,
        "ar-SA": {
          description: jsonObject.description_arabic || prev["ar-SA"].description,
          city: jsonObject.city_arabic || prev["ar-SA"].city,
          street: jsonObject.street_arabic || prev["ar-SA"].street,
        }
      }));


    } catch (error) {
      console.error("Error getting AI translation:", error);
      toast({
        title: t("error") || "Error",
        description: t("failedToGetAiTranslation") || "Failed to get AI translation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAiProcessing(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await handleAiTranslateToArabic()
    const { first_name, last_name, phone_number, country, post_code, gender, geo_location } = formData;
    const description = editedTranslations['en-US'].description;
    const city = editedTranslations['en-US'].city;
    const street = editedTranslations['en-US'].street;

    if(first_name || last_name || phone_number || description || city || country || street || post_code || gender || geo_location) {
      set_completed_data('true')
    }
    else {
      set_completed_data('false')
    }
    try {

      if (!isDataChanged && !avatar && !completed_data) {
        toast({
          title: t("noChangeSaved") || "No changes to save",
          description: t("Youhavenotupdatedanyfield") || "You have not updated any field.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!userCollectionData || Object.keys(userCollectionData).length === 0) {
        toast({
          title: "Warning",
          description: t("noChangeSaved") || "No changes to save",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!result.success) {
        toast({
          title: "Warning",
          description: t(result.error.errors[0].message) || "Phone number not valid",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const finalTranslations = [
        {
            languages_code: "en-US",
            description: editedTranslations["en-US"].description,
            city: editedTranslations["en-US"].city,
            street: editedTranslations["en-US"].street,
        },
        {
            languages_code: "ar-SA",
            description: editedTranslations["ar-SA"].description,
            city: editedTranslations["ar-SA"].city,
            street: editedTranslations["ar-SA"].street,
        }
      ];
     
      await editeProfile(userCollectionData, user.id, avatar, finalTranslations);
      router.refresh();
      toast({
        title: t("successfully") || "Success",
        description: t("savedSuccessfully") || "Settings saved successfully!",
      });
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: t("error") || "ERROR ",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneVerified = async (verifiedPhoneNumber) => {
    try {
      // Update the phone number in the form
      setPhone(verifiedPhoneNumber)
      setVerified('true')
      
      // Update the verification status in the database
      const token = await getCookie()
      if (token) {
        const decoded = await decodedToken(token)
        if (decoded?.id) {
          const updateResult = await updatePhoneVerification(decoded.id, verifiedPhoneNumber, true)
          if (!updateResult.success) {
            console.error('Failed to update phone verification status:', updateResult.error)
          }
        }
      }
      
      toast({
        title: t("success") || "Success",
        description: t("phoneNumberVerified") || "Phone number has been verified successfully!",
      })
    } catch (error) {
      console.error('Error updating phone verification:', error)
      toast({
        title: t("error") || "Error",
        description: t("failedToUpdateVerification") || "Phone verified but failed to update status",
        variant: "destructive",
      })
    }
  }

  const handleLocationSelect = (location) => {
    set_geo_location({
      lat: location.lat,
      lng: location.lng,
      accuracy: 0,
      name: location.name || "Selected Location",
    })
    setSelectedPosition(location)
    
    toast({
      title: t("locationSelected") || "Location Selected",
      description: `${t("selectedLocation") || "Selected location"}: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
    })
  }

  const handlePhoneChange = (newPhone) => {
    setPhone(newPhone)
    
    // Reset verification status if phone changes
    if (verified === 'true' && newPhone !== phone_number) {
      setVerified('false')
    }
    
    // Validate phone number if it looks like it has a country code
    if (newPhone && newPhone.startsWith('+')) {
      const match = newPhone.match(/^(\+\d{1,4})(.*)$/)
      if (match) {
        const [, countryCode, phoneOnly] = match
        const validation = validatePhoneNumber(countryCode, phoneOnly)
        setPhoneValidationError(validation.isValid ? "" : validation.error)
      }
    } else {
      setPhoneValidationError("")
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
      async (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`)
          const data = await response.json()
          pos.name = data.display_name || "Current Location"
        } catch (error) {
          console.error("Reverse geocoding failed", error)
          pos.name = "Current Location"
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
          description: `${t("Latitude")}: ${pos.lat.toFixed(6)}, ${t("Longitude")}: ${pos.lng.toFixed(6)}`,
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
        <motion.div className="absolute top-20 right-10 text-primary/5" variants={floatingVariants} animate="float">
          <Settings className="h-32 w-32" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-10 text-secondary/5"
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 2 }}
        >
          <Sparkles className="h-24 w-24" />
        </motion.div>
      </div>

      {/* Header Section */}
      {/* <motion.div className="inline mb-6 relative z-10" variants={headerVariants}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
          <Button
            className="mb-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-background/80 backdrop-blur-sm"
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
          className="mx-2 text-3xl font-bold inline bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {t("accountSettings") || "Account Settings"}
        </motion.h1>
      </motion.div> */}

      <Tabs defaultValue="profile" className="w-full relative z-10">
      
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Sidebar */}
          <motion.div className="md:col-span-1" variants={itemVariants}>
          <motion.h1
          className="mx-2 text-3xl font-bold inline bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {t("accountSettings") || "Account Settings"}
        </motion.h1>
            <motion.div variants={cardVariants} whileHover="hover" className="sticky top-8">
              <TabsList className="flex h-auto w-full flex-col items-start justify-start bg-gradient-to-br from-card to-muted shadow-lg border-0 p-2 rounded-xl">
                {[
                  { value: "profile", icon: User, label: t("profile") || "Profile" },
                  { value: "preferences", icon: Globe, label: t("preferences") || "Preferences" },
                  { value: "security", icon: Shield, label: t("security") || "Security" },
                  { value: "add", icon: CirclePlus, label: t("addItem") || "Add Item" },
                  { value: "payment", icon: CreditCard, label: t("payment") || "Payment" },
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
                      className="w-full justify-start text-left data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
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
              <TabsContent value="profile">
                <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <motion.div variants={cardVariants} whileHover="hover">
                    <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
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
                              className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-primary/20 shadow-xl"
                              variants={avatarVariants}
                              whileHover="hover"
                            >
                              {avatarPath && user?.avatar ? (
                                <Image
                                  src={avatarPath}
                                  alt={`${(String(user?.first_name).length <= 11 ? (String(user?.first_name)) : (String(user?.first_name).slice(0, 10)) )|| t("account")}`}
                                  width={96}
                                  height={96}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full w-full bg-muted">
                                  <Image
                                    src="/placeholder-user.jpg"
                                    alt={t("NoAvatar") || "No Avatar"}
                                    width={96}
                                    height={96}
                                    className="h-full w-full object-cover absolute inset-0"
                                  />
                                  <span className="absolute inset-0 flex items-center justify-center text-muted-foreground font-semibold">
                                  {`${(String(user?.first_name).length <= 11 ? (String(user?.first_name)) : (String(user?.first_name).slice(0, 10)) )|| t("NoAvatar") }` || "No Avatar"}
                                  </span>
                                </div>
                              )}
                              <motion.div
                                className="absolute inset-0 bg-foreground/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                                whileHover={{ opacity: 1 }}
                              >
                                <Camera className="h-6 w-6 text-background" />
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
                                  className="text-sm font-medium text-foreground"
                                >
                                  {t("firstName") || "First Name"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="first_name"
                                    name="first_name"
                                    value={first_name}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>

                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="last_name"
                                  className="text-sm font-medium text-foreground"
                                >
                                  {t("LastName") || "Last Name"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="last_name"
                                    name="last_name"
                                    value={last_name}
                                    onChange={(e) => setLasttName(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>
                            </div>

                            {/* Location Fields */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {/* Country field - Searchable Select (single) */}
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="country"
                                  className="text-sm font-medium text-foreground"
                                >
                                  {t("Country") || "Country"}
                                </Label>
                                <motion.div whileFocus="focus" >
                                  <Select
                                    value={country}
                                    onValueChange={setCountry}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={t("SelectCountry") || "Select country"}>
                                        {country && (
                                          <div className="flex items-center gap-2">
                                            <FlagIcon 
                                              flag={countriesListWithFlags.find(c => c.name === country)?.flag}
                                              countryCode={country}
                                              className="text-lg"
                                            />
                                            <span>{t(country) || country}</span>
                                          </div>
                                        )}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="h-40">
                                      {countriesListWithFlags.map((c) => (
                                        <SelectItem key={c.name} value={c.name} className="text-right">
                                          <div className="flex items-center gap-2">
                                            <FlagIcon flag={c.flag} countryCode={c.name} className="text-lg" />
                                            <span>{t(c.name) || c.name}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </motion.div>
                              </motion.div>

                              {/* City field */}
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label htmlFor="city" className="text-sm font-medium text-foreground">
                                  {t("City") || "City"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="city"
                                    name="city"
                                    value={editedTranslations[currentLangCode].city}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setEditedTranslations(prev => ({
                                            ...prev,
                                            [currentLangCode]: { ...prev[currentLangCode], city: value }
                                        }));
                                    }}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>

                              {/* Street field */}
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="street"
                                  className="text-sm font-medium text-foreground"
                                >
                                  {t("Street") || "Street"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="street"
                                    name="street"
                                    value={editedTranslations[currentLangCode].street}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setEditedTranslations(prev => ({
                                            ...prev,
                                            [currentLangCode]: { ...prev[currentLangCode], street: value }
                                        }));
                                    }}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>

                              {/* Postal Code field */}
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="post_code"
                                  className="text-sm font-medium text-foreground"
                                >
                                  {t("Postalcode") || "Postal Code"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="post_code"
                                    name="post_code"
                                    value={post_code}
                                    onChange={(e) => setPostCode(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>
                            </div>

                            {/* Location Services */}
                            <motion.div variants={inputVariants}>
                              <motion.div variants={cardVariants} whileHover="hover">
                                <Card className="bg-background  ">
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                      <motion.div
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 8, ease: "linear" }}
                                      >
                                        <Navigation className="h-5 w-5 text-primary" />
                                      </motion.div>
                                      {t("CurrentPosition") || "Current Position"}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <motion.div  whileHover="hover" whileTap="tap">
                                      <Button
                                        type="button"
                                        onClick={getCurrentPosition}
                                        disabled={isGettingLocation}
                                        className="w-full bg-secondary text-background shadow-lg"
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

                                    {/* Interactive Map */}
                                    <motion.div
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.4 }}
                                    >
                                      <LocationMap
                                        latitude={selectedPosition?.lat || geo_location?.lat || 30.0444}
                                        longitude={selectedPosition?.lng || geo_location?.lng || 31.2357}
                                        onLocationSelect={handleLocationSelect}
                                        height="250px"
                                        className="shadow-lg"
                                      />
                                    </motion.div>

                                    <AnimatePresence>
                                      {selectedPosition && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: "auto" }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.3 }}
                                        >
                                          <Card className="bg-background/50 backdrop-blur-sm">
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
                                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                  {t("email") || "Email"}
                                </Label>
                                <Input
                                  disabled
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={email || ""}
                                  className="bg-muted cursor-not-allowed"
                                />
                              </motion.div>

                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="phone_number"
                                  className="text-sm font-medium text-foreground flex items-center gap-2"
                                >
                                  {t("phoneNumber") || "Phone Number"}
                                  {verified === 'true' && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="flex items-center gap-1 text-green-600"
                                    >
                                      <Shield className="h-4 w-4" />
                                      <span className="text-xs">{t("verified") || "Verified"}</span>
                                    </motion.div>
                                  )}
                                </Label>
                                <div className="flex gap-2">
                                  <motion.div whileFocus="focus" className="flex-1">
                                    <Input
                                      id="phone_number"
                                      name="phone_number"
                                      value={phone_number}
                                      type="tel"
                                      onChange={(e) => handlePhoneChange(e.target.value)}
                                      className={`transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent ${phoneValidationError ? 'border-red-500 focus:border-red-500' : ''}`}
                                      placeholder={t("enterPhoneNumber") || "Enter phone number"}
                                    />
                                    {phoneValidationError && (
                                      <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 text-red-600 text-sm mt-1"
                                      >
                                        <Shield className="h-3 w-3" />
                                        <span>{phoneValidationError}</span>
                                      </motion.div>
                                    )}
                                  </motion.div>
                                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                                    <Button
                                      type="button"
                                      variant={verified === 'true' ? "secondary" : "outline"}
                                      size="sm"
                                      onClick={() => setShowPhoneVerification(true)}
                                      className={`${verified === 'true' ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' : ''}`}
                                    >
                                      {verified === 'true' ? (
                                        <>
                                          <Shield className="h-4 w-4 mr-1" />
                                          {t("reverify") || "Re-verify"}
                                        </>
                                      ) : (
                                        <>
                                          <Phone className="h-4 w-4 mr-1" />
                                          {t("verify") || "Verify"}
                                        </>
                                      )}
                                    </Button>
                                  </motion.div>
                                </div>
                              </motion.div>
                            </div>

                            {/* Avatar Upload and Gender */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="avatar"
                                  className="text-sm font-medium text-foreground"
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
                                    className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>

                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="gender"
                                  className="text-sm font-medium text-foreground"
                                >
                                  {t("Gender") || "Gender"}
                                </Label>
                                <Select value={gender} onValueChange={(value) => setGender(value)}>
                                  <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent">
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
                                className="text-sm font-medium text-foreground"
                              >
                                {t("descriptionProfile") || "Description"}
                              </Label>
                              <motion.div whileFocus="focus">
                                <Textarea
                                  id="description"
                                  name="description"
                                  value={editedTranslations[currentLangCode].description}
                                  onChange={(e) => {
                                      const { value } = e.target;
                                      setEditedTranslations(prev => ({
                                          ...prev,
                                          [currentLangCode]: { ...prev[currentLangCode], description: value }
                                      }));
                                  }}
                                  rows={4}
                                  className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                                  placeholder="Tell others about yourself..."
                                />
                              </motion.div>
                            </motion.div>

                            {/* AI Translate Button */}
                            {/* <motion.div className="flex justify-start" variants={inputVariants}>
                              <Button
                                type="button"
                                onClick={handleAiTranslateToArabic}
                                disabled={isAiProcessing}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-background shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                {isAiProcessing ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("translating") || "Translating..."}
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {t("translateToArabicAi") || "Translate to Arabic with AI"}
                                  </>
                                )}
                              </Button>
                            </motion.div> */}
                          </motion.div>
                        </form>
                      </CardContent>
                      <CardFooter className="flex justify-end bg-muted/50">
                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                          <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-accent text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            {isLoading ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin h-4 w-4" />
                                {t("saving") || "Saving..."}
                              </span>
                            ) : (
                              t("save") || "Save"
                            )}
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
                    <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted">
                      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
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
                            className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-muted to-muted/80"
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
                      <CardFooter className="flex justify-end bg-muted/50">
                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                          <Button
                            onClick={handleSubmit}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-background shadow-lg hover:shadow-xl transition-all duration-300"
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
                    <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted">
                      <CardHeader className="bg-gradient-to-r from-red-500/10 to-orange-500/10">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent flex items-center gap-2">
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
                                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-background shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  {t("UpdatePassword") || "Update Password"}
                                </Button>
                              </motion.div>
                            </div>
                          </motion.div>

                          <motion.div
                            className="space-y-4 pt-8 border-t border-border"
                            variants={itemVariants}
                          >
                            <h3 className="font-medium text-lg text-destructive">
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

              <TabsContent value="add">
                <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <motion.div variants={cardVariants} whileHover="hover">
                    <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted">
                      <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent flex items-center gap-2">
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
                      <CardContent className="p-0 w-full">
                        <motion.div
                        >
                          <ItemAdd className="w-full p-0"/>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>
              <TabsContent value="payment" key='payment'>
                <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" key="payment">
                  <motion.div variants={cardVariants} whileHover="hover">
                    <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted">
                      <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent flex items-center gap-2">
                          {t("payment") || "Payment"}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {t("Manageyourpaymentmethods") || "Manage your payment methods"}
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
                            <div className="space-y-4">
                              <PaymentPage showHeader={false} />
                            </div>
                          </motion.div>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>
          </motion.div>
        </div>
      </Tabs>

      {/* Phone Verification Popup */}
      <PhoneVerificationPopup
        open={showPhoneVerification}
        onOpenChange={setShowPhoneVerification}
        currentPhone={phone_number}
        onVerified={handlePhoneVerified}
        isVerified={verified === 'true'}
      />
    </motion.div>
  )
}