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
  Info,
  Languages,
  Search,
  RefreshCw,
} from "lucide-react"
import { checkUserHasProducts, editeProfile, getKYC, getUserById, resetPassword, updatePhoneVerification } from "@/callAPI/users"
import { useRouter } from "next/navigation"
import { decodedToken, getCookie, getTarget, removeTarget } from "@/callAPI/utiles"
import { LanguageToggle } from "@/components/language-toggle"
import { useTranslations } from "@/lib/use-translations"
import { useTheme } from "@/lib/theme-provider"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"
import { countriesList } from "@/lib/data"
import { countriesListWithFlags, validatePhoneNumber } from "@/lib/countries-data"
import PhoneVerificationPopup from "@/components/profile/phone-verification-popup"
import LocationMap from "@/components/general/location-map"
import FlagIcon from "@/components/general/flag-icon"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { sendMessage } from "@/callAPI/aiChat"
import { useLanguage } from "@/lib/language-provider"
import { useRTL } from "@/hooks/use-rtl"
import PaymentPage from "@/app/payment/page"
import { mediaURL } from "@/callAPI/utiles";
import { ThemeToggle } from "@/components/theme-toggle"

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
  const { classes, getDirectionClass, getDirectionValue } = useRTL()
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

  const handleAiTranslate = async () => {
    setIsAiProcessing(true);
    try {
      // Determine source and target languages based on current language
      const sourceLang = isRTL ? "ar-SA" : "en-US";
      const targetLang = isRTL ? "en-US" : "ar-SA";
      const sourceLangName = isRTL ? "Arabic" : "English";
      const targetLangName = isRTL ? "English" : "Arabic";
      
      const { description, city, street } = editedTranslations[sourceLang];

      console.log("Translation attempt:", { sourceLang, targetLang, description, city, street });

      // Always attempt translation, even if some fields are empty
      // This ensures we get translations for any available content
      if (!description && !city && !street) {
        console.log("No content to translate, skipping AI call");
        setIsAiProcessing(false);
        return;
      }

      const aiInput = `Please translate the following ${sourceLangName} text to ${targetLangName}:
- Description: ${description || ""}
- Street: ${street || ""}
- City: ${city || ""}

Please provide accurate, natural translations that maintain the original meaning and context. For location names, use the actual city and street names provided by the user, not generic terms.

Please return ONLY a JSON response in this format:
{
"description_${targetLangName.toLowerCase()}": "...",
"city_${targetLangName.toLowerCase()}": "...",
"street_${targetLangName.toLowerCase()}": "..."
}`;

      const aiSystemPrompt = "You are an expert translator and localization specialist. You provide high-quality translations between Arabic and English. For location translations, use the actual city and street names provided by the user, not generic terms like 'Current Location'. IMPORTANT: Respond ONLY with valid JSON - no markdown, no code blocks, no extra text, just the JSON object.";

      // Use enhanced AI function with automatic retry (3 attempts, starting with 1 second delay)
      const aiResponse = await sendMessage(aiInput, aiSystemPrompt, 3, 1000);
      
      // Check if AI request was successful
      if (!aiResponse.success) {
        throw new Error(aiResponse.error || t("AIrequestfailedafterallretryattempts") || "AI request failed after all retry attempts");
      }
      
      let jsonString = aiResponse.text;
      
      // Extract JSON from markdown code blocks if present
      const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
      
      // Clean up any remaining markdown or extra characters
      jsonString = jsonString.trim();
      
      const jsonObject = JSON.parse(jsonString);
      
      // Update translations based on target language
      const descriptionKey = `description_${targetLangName.toLowerCase()}`;
      const cityKey = `city_${targetLangName.toLowerCase()}`;
      const streetKey = `street_${targetLangName.toLowerCase()}`;

      const newTranslations = {
        description: jsonObject[descriptionKey] || prev[targetLang].description,
        city: jsonObject[cityKey] || prev[targetLang].city,
        street: jsonObject[streetKey] || prev[targetLang].street,
      };

      console.log("Translation result:", { targetLang, newTranslations });

      setEditedTranslations(prev => ({
        ...prev,
        [targetLang]: newTranslations
      }));

      // Show success message with attempt info
      // if (aiResponse.attempt > 1) {
      //   console.log(`Translation successful after ${aiResponse.attempt} attempts`);
      //   toast({
      //     title: t("success") || "Success",
      //     description: `${t("AItranslationsuccessfulafter") || "AI translation successful after"} ${aiResponse.attempt} ${t("attempts") || "attempts"}!`,
      //     variant: "default",
      //   });
      // } else {
      //   console.log("Translation successful on first attempt");
      //   toast({
      //     title: t("success") || "Success",
      //     description: t("TranslationCompleted") || "Translation completed successfully!",
      //     variant: "default",
      //   });
      // }

    } catch (error) {
      console.error("Error getting AI translation:", error);
      
      // Fallback: Copy current language content to other language if AI fails
      const sourceLang = isRTL ? "ar-SA" : "en-US";
      const targetLang = isRTL ? "en-US" : "ar-SA";
      
      console.log("AI translation failed, using fallback copy");
      setEditedTranslations(prev => ({
        ...prev,
        [targetLang]: {
          description: prev[sourceLang].description || "",
          city: prev[sourceLang].city || "",
          street: prev[sourceLang].street || "",
        }
      }));
      
      let errorMessage = t("FailedtogetAItranslationUsingFallback") ||
        "AI translation failed, using fallback. Content will be saved in both languages.";
      
      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        errorMessage = "AI response format error. Using fallback translation.";
      } else if (error.message.includes("retry attempts")) {
        errorMessage = "AI service unavailable. Using fallback translation.";
      }
      
      toast({
        title: t("warning") || "Warning",
        description: t(errorMessage) || errorMessage,
        variant: "default",
      });
    } finally {
      setIsAiProcessing(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Always perform automatic translation first
      console.log("Starting automatic translation...");
      await handleAiTranslate();
      console.log("Translation completed successfully");
      
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

      // Check if there are any changes to save (including translations)
      const hasTranslationChanges = editedTranslations["en-US"].description || 
                                   editedTranslations["ar-SA"].description ||
                                   editedTranslations["en-US"].city || 
                                   editedTranslations["ar-SA"].city ||
                                   editedTranslations["en-US"].street || 
                                   editedTranslations["ar-SA"].street;

      if (!isDataChanged && !avatar && !completed_data && !hasTranslationChanges) {
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
            description: editedTranslations["en-US"].description || "",
            city: editedTranslations["en-US"].city || "",
            street: editedTranslations["en-US"].street || "",
        },
        {
            languages_code: "ar-SA",
            description: editedTranslations["ar-SA"].description || "",
            city: editedTranslations["ar-SA"].city || "",
            street: editedTranslations["ar-SA"].street || "",
        }
      ];

      console.log("Sending translations to server:", finalTranslations);
      const handleEditeProfile =  await editeProfile(userCollectionData, user.id, avatar, finalTranslations);
      console.log("Profile saved successfully with translations");
      // Check if there's a target to redirect to swap page
      const targetSwapId = await getTarget();
      const decoded = await decodedToken()
      const makeCheckUserHasProducts = await checkUserHasProducts(decoded.id)

      if(handleEditeProfile.success){
        toast({
          title: t("successfully") || "Success",
          description: t("savedSuccessfullyWithTranslation") || "Settings saved successfully with automatic translation!",
        });
        
        if (makeCheckUserHasProducts.count>1) {
            if(targetSwapId){
              router.push(`/swap/${targetSwapId}`)
              await removeTarget()
            }else{
              router.refresh()
            }
        }else{
          router.push(`/profile/settings/editItem/new`)
        }
        
      }else{
        toast({
          title: t("error") || "ERROR ",
          description: error.message || "Failed to update profile",
          variant: "destructive",
        })
      }
      
     
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
      className="container py-8 relative overflow-hidden "
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Decorative background elements */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none`}>
        <motion.div className={`absolute top-20 ${getDirectionClass('right-10', 'left-10')} text-primary/5`} variants={floatingVariants} animate="float">
          <Settings className="h-32 w-32" />
        </motion.div>
        <motion.div
          className={`absolute bottom-20 ${getDirectionClass('left-10', 'right-10')} text-secondary/5`}
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 2 }}
        >
          <Sparkles className="h-24 w-24" />
        </motion.div>
      </div>

     

      <Tabs defaultValue="profile" className="w-full relative z-10">
      <div className={`grid grid-cols-1 gap-8 md:grid-cols-4 rtl:grid-flow-col-dense `}  >
      
          {/* Sidebar */}
           <motion.div className={`md:col-span-1 `} variants={itemVariants}>
          <motion.h1
          className={`mx-2 text-2xl font-bold inline text-primary/90 mb-2 ${isRTL?'force-rtl':''}`}
          initial={{ opacity: 0, x: getDirectionValue(-20, 20) }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {t("accountSettings") || "Account Settings"}
        </motion.h1>
            <motion.div variants={cardVariants} whileHover="hover" className="sticky top-8">
              <TabsList className="flex h-auto w-full flex-col items-start rtl:items-end justify-start shadow-lg border border-border/50 p-2 rounded-xl bg-background">
                {[
                  { value: "profile", icon: User, label: t("profile") || "Profile" },
                  { value: "preferences", icon: Globe, label: t("preferences") || "Preferences" },
                  { value: "security", icon: Shield, label: t("security") || "Security" }
                 
                  // { value: "payment", icon: CreditCard, label: t("payment") || "Payment" },
                ].map((tab, index) => (
                  <motion.div
                    key={tab.value}
                     initial={{ opacity: 0, x: getDirectionValue(-20, 20) }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full hover:bg-primary/20 rounded-md mt-1"
                   >
                    <TabsTrigger
                      value={tab.value}
                      className="w-full justify-start rtl:justify-end text-left rtl:text-right data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 rounded-lg border border-transparent data-[state=active]:border-primary/30"
                    >
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4 }}
                      >
                        <tab.icon className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
                      </motion.div>
                       <span className="px-1">
                      {tab.label}
                      </span>
                    </TabsTrigger>
                  </motion.div>
                ))}


<span
 initial={{ opacity: 0, x: getDirectionValue(-20, 20) }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.4 + 4 * 0.1 }}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 className="w-full  rounded-md mt-1"
onClick={()=>{ handleKYC() }}
>

                   
                    
                   
                    <TabsTrigger
                      value={'add'}
                      className="w-full justify-start rtl:justify-end text-left rtl:text-right data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                    >
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4 }}
                        
                      >
                      </motion.div>
                        <CirclePlus className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
                        <span className="px-1">
                      {t("addItem") || "Add Item"}
                        </span>
                    </TabsTrigger>
                  
</span>


              </TabsList>
            </motion.div>
          </motion.div>

          {/* Main Content */}
           <motion.div className={`md:col-span-3 ${isRTL ? 'md:col-start-1' : ''}`} variants={itemVariants}>
              <TabsContent value="profile">
                <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <motion.div variants={cardVariants} whileHover="hover">
                    <Card className="shadow-xl border border-border/50 bg-gradient-to-br from-card to-background overflow-hidden">
                      <CardHeader className={`bg-gradient-to-r from-primary/10 to-secondary/10  ${isRTL?'force-rtl':''}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
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
                                <div className="flex items-center justify-center h-full w-full bg-background border border-border/50">
                                  <Image
                                    src="/placeholder-user.jpg"
                                    alt={t("NoAvatar") || "No Avatar"}
                                    width={96}
                                    height={96}
                                    className="h-full w-full object-cover absolute inset-0"
                                  />
                                  <span className="absolute inset-0 flex items-center justify-center text-foreground/70 font-semibold">
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
                             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rtl:grid-flow-col-dense">
                              
                              
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="first_name"
                                  className={`text-sm font-medium text-foreground ${isRTL?'force-rtl':''}`}
                                >
                                  {t("firstName") || "First Name"}
                                </Label>
                            



                                <motion.div whileFocus="focus">
                                
                                  <Input
                                    id="first_name"
                                    name="first_name"
                                    value={first_name}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent text-left rtl:text-right"
                                    dir={isRTL ? 'rtl' : 'ltr'}
                                  />
                                </motion.div>
                              </motion.div>

                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="last_name"
                                  className={`text-sm font-medium text-foreground ${isRTL?'force-rtl':''}`}

                                 
                                >
                                  {t("LastName") || "Last Name"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="last_name"
                                    name="last_name"
                                    value={last_name}
                                    onChange={(e) => setLasttName(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent text-left rtl:text-right"
                                    dir={isRTL ? 'rtl' : 'ltr'}
                                  />
                                </motion.div>
                              </motion.div>
                            </div>

                            {/* Location Fields */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rtl:grid-flow-col-dense">
                              {/* Country field - Searchable Select (single) */}
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="country"
                                  className={`text-sm font-medium text-foreground ${isRTL?'force-rtl':''}`}

                                >
                                  {t("Country") || "Country"}
                                </Label>
                                <motion.div whileFocus="focus" >
                                  <Select
                                    value={country}
                                    onValueChange={setCountry}
                                  >
                                    <SelectTrigger className="hover:bg-primary/20">
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
                                      <div className="flex items-center gap-2 px-3 py-2 sticky top-0 bg-background border-b">
                                        <Search className="h-4 w-4 opacity-50" />
                                        <input 
                                          className="flex h-8 w-full rounded-md bg-background px-3 py-1 text-sm outline-none placeholder:text-muted-foreground"
                                          placeholder={t("Search country...")}
                                          onChange={(e) => {
                                            const searchField = e.target;
                                            const value = searchField.value.toLowerCase();
                                            const items = searchField.closest('.select-content')?.querySelectorAll('.select-item') || [];
                                            
                                            items.forEach(item => {
                                              const countryName = item.textContent.toLowerCase();
                                              const translatedName = t(item.getAttribute('data-value'))?.toLowerCase() || '';
                                              const shouldShow = countryName.includes(value) || translatedName.includes(value);
                                              item.style.display = shouldShow ? '' : 'none';
                                            });
                                          }}
                                          dir={isRTL ? 'rtl' : 'ltr'}
                                        />
                                      </div>
                                      <div className="overflow-y-auto max-h-[calc(10rem-40px)]">
                                        {countriesListWithFlags.map((c) => (
                                          <SelectItem key={c.name} value={c.name} className="text-right hover:!bg-primary/20 select-item" data-value={c.name}>
                                            <div className="flex items-center gap-2">
                                              <FlagIcon flag={c.flag} countryCode={c.name} className="text-lg" />
                                              <span>{t(c.name) || c.name}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </div>
                                    </SelectContent>
                                  </Select>
                                </motion.div>
                              </motion.div>

                              {/* City field */}
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label htmlFor="city"   className={`text-sm font-medium text-foreground ${isRTL?'force-rtl':''}`}
                                >
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
                                     className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent text-left rtl:text-right"
                                     dir={currentLangCode === 'ar-SA' ? 'rtl' : 'ltr'}
                                  />
                                </motion.div>
                              </motion.div>

                              {/* Street field */}
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="street"
                                  className={`text-sm font-medium text-foreground ${isRTL?'force-rtl':''}`}

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
                                     className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent text-left rtl:text-right"
                                     dir={currentLangCode === 'ar-SA' ? 'rtl' : 'ltr'}
                                  />
                                </motion.div>
                              </motion.div>

                              {/* Postal Code field */}
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="post_code"
                                  className={`text-sm font-medium text-foreground ${isRTL?'force-rtl':''}`}

                                >
                                  {t("Postalcode") || "Postal Code"}
                                </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="post_code"
                                    name="post_code"
                                    value={post_code}
                                    onChange={(e) => setPostCode(e.target.value)}
                                     className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent text-left rtl:text-right"
                                     dir={isRTL ? 'rtl' : 'ltr'}
                                  />
                                </motion.div>
                              </motion.div>
                            </div>

                            {/* Location Services */}
                            <motion.div variants={inputVariants}>
                              <motion.div variants={cardVariants} whileHover="hover">
                                <Card className="bg-background  ">
                                  <CardHeader>
                                     <CardTitle className="flex items-center gap-2 text-lg rtl:flex-row-reverse">
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
                                               <Loader2 className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
                                            </motion.div>
                                            {t("GettingLocation") || "Getting Location..."}
                                          </>
                                        ) : (
                                          <>
                                             <MapPin className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
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
                                               <CardTitle className="flex items-center gap-2 text-base rtl:flex-row-reverse">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                {t("SelectedPosition") || "Selected Position"}
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                              <motion.p
                                                className="text-sm"
                                                initial={{ opacity: 0, x: getDirectionValue(-10, 10) }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 }}
                                              >
                                                <strong>{t("Name") || "Name"}:</strong> {selectedPosition.name}
                                              </motion.p>
                                              <motion.p
                                                className="text-sm"
                                                initial={{ opacity: 0, x: getDirectionValue(-10, 10) }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                              >
                                                <strong>{t("Latitude") || "Latitude"}:</strong>{" "}
                                                {selectedPosition.lat.toFixed(6)}
                                              </motion.p>
                                              <motion.p
                                                className="text-sm"
                                                initial={{ opacity: 0, x: getDirectionValue(-10, 10) }}
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
                             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rtl:grid-flow-col-dense">
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label htmlFor="email"
                                
                                className={`text-sm font-medium text-foreground ${isRTL?'force-rtl':''}`}
                                >
                                  {t("email") || "Email"}
                                </Label>
                                <Input
                                  disabled
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={email || ""}
                                  className="bg-background border border-border/50 cursor-not-allowed"
                                />
                              </motion.div>

                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="phone_number"

                                   className={`text-sm font-medium text-foreground flex items-center gap-2 rtl:flex-row-reverse ${isRTL?'force-rtl':''}`}
                                >
                                  {t("phoneNumber") || "Phone Number"}
                                  {verified === 'true' && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                       className="flex items-center gap-1 text-secondary2 rtl:flex-row-reverse"
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
                                      className={`transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent ${phoneValidationError ? 'border-destructive focus:border-destructive' : ''}`}
                                      placeholder={t("enterPhoneNumber") || "Enter phone number"}
                                    />
                                    {phoneValidationError && (
                                      <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                         className="flex items-center gap-2 rtl:flex-row-reverse text-destructive text-sm mt-1"
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
                                      className={`${verified === 'true' ? 'bg-secondary2/10 text-secondary2 border-secondary2/30 hover:bg-secondary2/20' : ''}`}
                                    >
                                      {verified === 'true' ? (
                                        <>
                                           <Shield className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                                          {t("reverify") || "Re-verify"}
                                        </>
                                      ) : (
                                        <>
                                           <Phone className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                                          {t("verify") || "Verify"}
                                        </>
                                      )}
                                    </Button>
                                  </motion.div>
                                </div>
                              </motion.div>
                            </div>

                            {/* Avatar Upload and Gender */}
                             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rtl:grid-flow-col-dense">
                              <motion.div className="space-y-2" variants={inputVariants}>
                                <Label
                                  htmlFor="avatar"
                                className={`text-sm font-medium text-foreground ${isRTL?'force-rtl':''}`}

                                  
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
                                className={`text-sm font-medium text-foreground ${isRTL?'force-rtl':''}`}

                               
                                >
                                  {t("Gender") || "Gender"}
                                </Label>
                                <Select value={gender} onValueChange={(value) => setGender(value)}>
                                  <SelectTrigger className="transition-all  hover:bg-primary/20 duration-300 focus:ring-2  focus:ring-ring focus:border-transparent">
                                    <SelectValue placeholder={t("SelectGender") || "Select Gender"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male" className="hover:!bg-primary/20">{t("Male") || "Male"}</SelectItem>
                                    <SelectItem value="female" className="hover:!bg-primary/20">{t("Female") || "Female"}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </motion.div>
                            </div>

                            {/* Description */}
                            <motion.div className="space-y-2" variants={inputVariants}>
                              <Label
                                htmlFor="description"
                                className={`text-sm font-medium text-foreground ${isRTL?'force-rtl':''}`}

                               
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
                                   className={`transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent resize-none text-left ${isRTL?'force-rtl':''}`}
                                   dir={currentLangCode === 'ar-SA' ? 'rtl' : 'ltr'}
                                   placeholder={currentLangCode === 'ar-SA' 
                                     ? "أخبر الآخرين عن نفسك..." 
                                     : "Tell others about yourself..."
                                   }
                                />
                              </motion.div>
                            </motion.div>

                          </motion.div>
                        </form>
                      </CardContent>
                      <CardFooter className="flex justify-end rtl:justify-start bg-background border-t border-border/50">
                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                          <Button
                            onClick={(e)=>{handleSubmit(e)}}
                            disabled={isLoading || isAiProcessing}
                            className="bg-primary mt-1 hover:bg-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            {isLoading || isAiProcessing ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin h-4 w-4" />
                                {isAiProcessing 
                                  ? (t("saving") || "Saving...")
                                  : (t("saving") || "Saving...")
                                }
                              </span>
                            ) : (
                               <span className="flex items-center gap-2 rtl:flex-row-reverse">
                                 {/* <Languages className="h-4 w-4" /> */}
                                 {t("save") || "Save"}
                               </span>
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
                    <Card className="shadow-xl border border-border/50 bg-gradient-to-br from-card to-background">
                      <CardHeader className={`bg-gradient-to-r from-primary/10 to-secondary/10 ${isRTL?'force-rtl':''}`}>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
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
                            className="flex items-center justify-between p-4 rounded-lg bg-background border border-border/50 hover:border-primary/30 transition-colors"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div>
                              <h3 className={`font-medium text-lg ${isRTL?'force-rtl':''}`}>{t("DarkMode") || "Dark Mode"}</h3>
                              <p className="text-sm text-foreground/70">
                                {t("Customizeyourexperience") || "Toggle between light and dark themes"}
                              </p>
                            </div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              {/* <Switch
                                checked={theme === "dark"}
                                onClick={() => toggleTheme()}
                                onCheckedChange={(checked) => handleSwitchChange("darkMode", checked)}
                              /> */}
                              <ThemeToggle/>
                            </motion.div>
                          </motion.div>



 <motion.div
                            className="flex items-center justify-between p-4 rounded-lg bg-background border border-border/50 hover:border-primary/30 transition-colors"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div>
                              <h3 className={`font-medium text-lg ${isRTL?'force-rtl':''}`}>{t("changeLanguage") || "Change Language"}</h3>
                              <p className="text-sm text-foreground/70">
                                {t("changeLanguageDescription") || "Change the language of the platform."}
                              </p>
                            </div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              {/* <Switch
                                checked={theme === "dark"}
                                onClick={() => toggleTheme()}
                                onCheckedChange={(checked) => handleSwitchChange("darkMode", checked)}
                              /> */}
                              <LanguageToggle />
                            </motion.div>
                          </motion.div>
                          {/* <motion.div variants={itemVariants}>
                            <LanguageToggle />
                          </motion.div> */}
                        </motion.div>
                      </CardContent>
                       <CardFooter className="flex justify-end rtl:justify-start bg-background border-t border-border/50">
                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                          <Button
                            onClick={(e)=>{handleSubmit(e)}}
                            className="shadow-lg hover:shadow-xl transition-all duration-300 mt-4"
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
                     <Card className="shadow-xl border border-border/50 bg-gradient-to-br from-card to-background">
                       <CardHeader className={`bg-gradient-to-r from-destructive/10 to-destructive/5 ${isRTL?'force-rtl':''}`}>
                         <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2 rtl:flex-row-reverse">
                           <motion.div
                             animate={{ rotate: [0, -5, 5, 0] }}
                             transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                           >
                             <Lock className="h-6 w-6 text-destructive" />
                           </motion.div>
                           {t("security") || "Security"}
                         </CardTitle>
                         <CardDescription className={`text-base ${isRTL?'force-rtl':''}`}>
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
                          <motion.div className={`space-y-4 ${isRTL?'force-rtl':''}`} variants={itemVariants}>
                             <h3 className="font-medium text-lg">{t("ChangePassword") || "Change Password"}</h3>
                             <div className="space-y-4">
                               <motion.div className="space-y-2" variants={inputVariants}>

                                 <Label htmlFor="current-email" className={`text-sm font-medium ${isRTL?'force-rtl':''}`}>
                                   {t("CurrentEmail") || "Current Email"}
                                 </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="current-email"
                                    type="email"
                                    value={currentEmail}
                                    onChange={(e) => setCurrentEmail(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-destructive focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>

                               <motion.div className="space-y-2" variants={inputVariants}>
                                 <Label htmlFor="new-password" className={`text-sm font-medium ${isRTL?'force-rtl':''}`}>
                                   {t("NewPassword") || "New Password"}
                                 </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-destructive focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>

                               <motion.div className="space-y-2" variants={inputVariants}>
                                 <Label htmlFor="confirm-password" className={`text-sm font-medium ${isRTL?'force-rtl':''}`}>
                                   {t("ConfirmPassword") || "Confirm New Password"}
                                 </Label>
                                <motion.div whileFocus="focus">
                                  <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-destructive focus:border-transparent"
                                  />
                                </motion.div>
                              </motion.div>

                              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                                <Button
                                  onClick={updatePassword}
                                  className="bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 text-destructive-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  {t("UpdatePassword") || "Update Password"}
                                </Button>
                              </motion.div>
                            </div>
                          </motion.div>

                          <motion.div
                            className={`space-y-4 pt-8 border-t border-border ${isRTL?'force-rtl':''}`}
                            variants={itemVariants}
                          >
                             <h3 className="font-medium text-lg text-destructive">
                               {t("DeleteAccount") || "Delete Account"}
                             </h3>
                             <p className="text-sm text-foreground/70">
                               {t("Permanentlydeleteyouraccoun") || "Permanently delete your account and all your data."}
                             </p>
                            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                              <Button
                                variant="destructive"
                                className="bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive shadow-lg hover:shadow-xl transition-all duration-300"
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

              <TabsContent value="payment" key='payment'>
                <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" key="payment">
                  <motion.div variants={cardVariants} whileHover="hover">
                     <Card className="shadow-xl border border-border/50 bg-gradient-to-br from-card to-background">
                       <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                         <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2 rtl:flex-row-reverse">
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