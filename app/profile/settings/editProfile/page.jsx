"use client" 
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Settings, User, Palette, Shield, Plus, Mail, Phone } from "lucide-react"
import { checkUserHasProducts, editeProfile, getKYC, getUserById, resetPassword, updatePhoneVerification } from "@/callAPI/users"
import { useRouter } from "next/navigation"
import { decodedToken, getCookie, getTarget, removeTarget, mediaURL } from "@/callAPI/utiles"
import { useTranslations } from "@/lib/use-translations"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"
import { validatePhoneNumber } from "@/lib/countries-data"
import PhoneVerificationPopup from "@/components/profile/edit-profile/phone-verification-popup"
import { sendMessage } from "@/callAPI/aiChat"
import { useLanguage } from "@/lib/language-provider"
import { useRTL } from "@/hooks/use-rtl"
import { containerVariants, itemVariants } from "@/components/profile/edit-profile/edit-profile-animations"
import ProfileTab from "@/components/profile/edit-profile/profile-tab"
import PreferencesTab from "@/components/profile/edit-profile/preferences-tab"
import SecurityTab from "@/components/profile/edit-profile/security-tab"

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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



  
  const { t } = useTranslations()
  const router = useRouter()
  const [user, setUser] = useState({})
  const [avatar, setAvatar] = useState(null)
  const [avatarPath, setAvatarPath] = useState("")
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [first_name, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [last_name, setLasttName] = useState("")
  const [gender, setGender] = useState("")
  const [phone_number, setPhone] = useState("")
  const [country_code, setCountryCode] = useState("+20")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [street, setStreet] = useState("")
  const [description, setDescription] = useState("")
  const [post_code, setPostCode] = useState("")
  const [geo_location, set_geo_location] = useState({})
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(null)
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [translations, setTranslations] = useState([])
  const [completed_data,set_completed_data] = useState('false')
  const [showPhoneVerification, setShowPhoneVerification] = useState(false)
  const [phoneValidationError, setPhoneValidationError] = useState("")
  const [verifiedPhone, setVerifiedPhone] = useState(false)

  const updatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: t("error"),
        description: t("faileChangePassword"),
        variant: "destructive",
      })
    } else if (newPassword !== confirmPassword) {
      toast({
        title: t("error"),
        description: t("notMach"),
        variant: "destructive",
      })
    } else if (newPassword === confirmPassword) {
      try {
        const Password = await resetPassword(newPassword, currentEmail)
        if (Password) {
          toast({
            title: t("success"),
            description: t("successChangePassword"),
            variant: "success",
          })
          setCurrentEmail("")
          setNewPassword("")
          setConfirmPassword("")
        }
      } catch (error) {
        toast({
          title: t("error"),
          description: t("faildChangePassword"),
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: t("error"),
        description: t("faildChangePassword2"),
        variant: "destructive",
      })
    }
  }

  const getUser = async () => {
    const token = await getCookie()
    if (token) {
      const { id } = await decodedToken(token)
      const userData = await getUserById(id)
      // console.log("userData profile:",userData) 
      setUser(userData.data)
      setVerifiedPhone(userData.data.verified_phone || false)
    }
  }
  const profileSchema = z.object({
    phone_number: z
      .string()
      .min(1, `${t("phoneNumber")} ${t("notSubmittedWithoutFill")}`)
      .min(8, t("PhoneIsShort"))
      .max(20, t("PhoneIsLong"))
      .regex(/^\+?\d{8,20}$/, t("invalidNumber")),
    first_name: z
      .string()
      .min(1, `${t("firstName")} ${t("notSubmittedWithoutFill")}`)
      .max(20, t("firstnameIsLong")),
    last_name: z
      .string()
      .min(1, `${t("lastName")} ${t("notSubmittedWithoutFill")}`)
      .max(20, t("lastnameIsLong")),
    country: z
      .string()
      .min(1, `${t("country")} ${t("notSubmittedWithoutFill")}`),
    city: z
      .string()
      .min(1, `${t("city")} ${t("notSubmittedWithoutFill")}`),
    street: z
      .string()
      .min(1, `${t("street")} ${t("notSubmittedWithoutFill")}`),
    description: z
      .string()
      .min(1, `${t("description")} ${t("notSubmittedWithoutFill")}`)
      .min(4, t("descriptionMustBeAtLeast10"))
      .max(1000, t("descriptionMustBeLessThan1000")),
    gender: z
      .string()
      .min(1, `${t("gender")} ${t("notSubmittedWithoutFill")}`),
    post_code: z
      .string()
      .min(1, `${t("Postalcode")} ${t("notSubmittedWithoutFill")}`),
    avatar: z
      .instanceof(File)
      .nullable()
      .optional()
      .refine(file => !file || file.size <= MAX_AVATAR_SIZE, { 
          message: t("imageTooLarge") || "Max image size is 5MB.",
      })
      .refine(file => !file || ACCEPTED_AVATAR_TYPES.includes(file.type), {
          message: t("unsupportedImageType") || "Only .jpg, .png, and .webp formats are supported.",
      }),
    geo_location: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .refine((data) => data.lat && data.lng, {
        message: `${t("currentPosition")} ${t("notSubmittedWithoutFill")}`,
      }),
  })

  useEffect(() => {
    getUser()
  }, [])

  // Trigger map refresh when switching back to profile tab
  useEffect(() => {
    if (activeTab === 'profile') {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeTab])


  useEffect(() => {
    if (!user || Object.keys(user).length === 0) return;
    
    // Only set avatarPath if user has a valid avatar
    if (user?.avatar && user.avatar !== "null" && user.avatar !== "undefined") {
      setAvatarPath(`${mediaURL}${user.avatar}`)
    } else {
      setAvatarPath("")
    }
    setFirstName(user?.first_name || "")
    setLasttName(user?.last_name || "")
    setGender(user?.gender || "")
    setPhone(user?.phone_number || "")
    setCountryCode(user?.country_code || "+20")
    setCountry(user?.country || "")
    
    setStreet(user?.street || "")
    setCity(user?.city || "")
    setDescription(user?.description || "")



    setPostCode(user?.post_code || "")
    set_geo_location(user?.geo_location || {})
    setEmail(user?.email || "")
    set_completed_data(user?.completed_data || 'false')
    setVerifiedPhone(user?.verified_phone || false)

    // Set selected position if geo_location exists
    if (user?.geo_location && user.geo_location.lat && user.geo_location.lng) {
      setSelectedPosition({
        lat: user.geo_location.lat,
        lng: user.geo_location.lng,
        name: user.geo_location.name || "Selected Location"
      })
    }

    let en = user.translations?.find(t => t.languages_code === 'en-US') || {};
    let ar = user.translations?.find(t => t.languages_code === 'ar-SA') || {};

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



  // Parse phone number to extract country code and phone
  const parsePhoneNumber = (phone) => {
    if (!phone) return { country_code: null, phone_number: null }
    
    // If phone starts with +, extract country code
    if (phone.startsWith('+')) {
      const match = phone.match(/^(\+\d{1,4})(.*)$/)
      if (match) {
        return { country_code: match[1], phone_number: match[2] }
      }
    }
    
    // If phone starts with 0 (Egyptian local format), default to Egypt
    if (phone.startsWith('0')) {
      return { country_code: '+20', phone_number: phone.substring(1) }
    }
    
    // Otherwise, assume it's without country code, default to Egypt
    return { country_code: '+20', phone_number: phone }
  }

  const userCollectionData = {
    first_name: first_name || "",
    last_name: last_name || "",
    description: editedTranslations["en-US"].description || "",
    city: editedTranslations["en-US"].city || "",
    country: country || "",
    street: editedTranslations["en-US"].street || "",
    post_code: post_code || "",
    gender: gender || "",
    // Always include phone fields - verification is optional
    // Users can save unverified phone and verify later
    country_code: country_code || "+20",
    phone_number: phone_number || "",
    geo_location: geo_location || {},
    completed_data: completed_data || "false",
  }
  if (avatar) userCollectionData.avatar = avatar
  
  const [formData, setFormData] = useState({
    first_name,
    last_name,
    phone_number,
    country,
    city,
    street,
    description,
    post_code,
    gender,
    geo_location,
    translations,
    completed_data,
    verifiedPhone,
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


  const handleAiTranslate = async (currentFormData = null) => {
    setIsAiProcessing(true);
    try {
      // Determine source and target languages based on current language
      const sourceLang = isRTL ? "ar-SA" : "en-US";
      const targetLang = isRTL ? "en-US" : "ar-SA";
      const sourceLangName = isRTL ? "Arabic" : "English";
      const targetLangName = isRTL ? "English" : "Arabic";
      
      // Use provided form data or get from state - always use the ACTUAL current form data
      let sourceData;
      if (currentFormData) {
        // Use the provided current form data (most up-to-date)
        sourceData = {
          description: currentFormData.description || "",
          city: currentFormData.city || "",
          street: currentFormData.street || ""
        };
      } else {
        // Fallback to state (shouldn't happen in normal flow)
        sourceData = editedTranslations[sourceLang];
      }
      
      const { description, city, street } = sourceData;
      // console.log("Translation attempt with ACTUAL form data:", { sourceLang, targetLang, description, city, street, sourceData, currentFormData });

      // Always attempt translation, even if some fields are empty
      // This ensures we get translations for any available content
      if (!description && !city && !street) {
        // console.log("No content to translate, skipping AI call");
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
        throw new Error(aiResponse.error || t("aiRequestFailed"));
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

      // console.log("Translation result:", { targetLang, jsonObject, descriptionKey, cityKey, streetKey });

      // Prepare new translations object
      let newTranslations = {
        description: jsonObject[descriptionKey] || "",
        city: jsonObject[cityKey] || "",
        street: jsonObject[streetKey] || "",
      };

      // Update state and return the updated translations object
      let updatedTranslations;
      setEditedTranslations(prev => {
        // If AI didn't return a translation, don't overwrite with empty - keep existing or use source as last resort
        // Use sourceData from closure (the actual current form data)
        if (!newTranslations.description && !jsonObject[descriptionKey]) {
          newTranslations.description = prev[targetLang]?.description || sourceData.description || "";
        }
        if (!newTranslations.city && !jsonObject[cityKey]) {
          newTranslations.city = prev[targetLang]?.city || sourceData.city || "";
        }
        if (!newTranslations.street && !jsonObject[streetKey]) {
          newTranslations.street = prev[targetLang]?.street || sourceData.street || "";
        }

        updatedTranslations = {
          ...prev,
          [targetLang]: newTranslations
        };

        // console.log("Setting new translations:", { targetLang, newTranslations, sourceData, jsonObject, currentFormData, updatedTranslations });

        return updatedTranslations;
      });

      return updatedTranslations;

      // Show success message with attempt info
      // if (aiResponse.attempt > 1) {
      //   console.log(`Translation successful after ${aiResponse.attempt} attempts`);
      //   toast({
      //     title: t("success"),
      //     description: `${t("aiTranslationSuccessful")} ${aiResponse.attempt} ${t("attempts")}!`,
      //     variant: "default",
      //   });
      // } else {
      //   console.log("Translation successful on first attempt");
      //   toast({
      //     title: t("success"),
      //     description: t("translationCompleted"),
      //     variant: "default",
      //   });
      // }

    } catch (error) {
      // console.error("Error getting AI translation:", error);
      
      // Fallback: Copy current language content to other language if AI fails
      const sourceLang = isRTL ? "ar-SA" : "en-US";
      const targetLang = isRTL ? "en-US" : "ar-SA";
      
      // console.log("AI translation failed, using fallback copy");
      
      // Return updated translations even on error (using fallback)
      let fallbackTranslations;
      setEditedTranslations(prev => {
        fallbackTranslations = {
          ...prev,
          [targetLang]: {
            description: prev[sourceLang]?.description || sourceData?.description || "",
            city: prev[sourceLang]?.city || sourceData?.city || "",
            street: prev[sourceLang]?.street || sourceData?.street || "",
          }
        };
        return fallbackTranslations;
      });
      
      let errorMessage = t("aiTranslationFailedFallback");
      
      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        errorMessage = t("aiResponseFormatError");
      } else if (error.message.includes("retry attempts")) {
        errorMessage = t("aiServiceUnavailable");
      }
      
      toast({
        title: t("warning"),
        description: errorMessage,
        variant: "default",
      });
      
      // Return fallback translations
      return fallbackTranslations;
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
        description: t("requiredInfoForSwap"),
        variant: "default",
      })
      router.push(`/profile/settings/editProfile`)

    }
    else {
        router.push(`/profile/settings/editItem/new`)
      }
  }

  // Validate all form data
  const validateFormData = () => {
    const currentFields = editedTranslations[currentLangCode];
    
    // Check if avatar is provided (either new upload or existing user avatar)
    const hasNewAvatar = avatar && avatar instanceof File;
    const hasExistingAvatar = user?.avatar && user.avatar.trim() !== "";
    
    if (!hasNewAvatar && !hasExistingAvatar) {
      return {
        success: false,
        error: {
          errors: [{
            message: `${t("Avatar") || "Avatar"} ${t("notSubmittedWithoutFill") || "is required"}`,
            path: ["avatar"]
          }]
        }
      };
    }
    
    // Phone verification is optional - user can save without verification
    // Verification is only required for using certain features
    
    const formDataToValidate = {
      phone_number,
      first_name,
      last_name,
      country,
      city: currentFields.city || "",
      street: currentFields.street || "",
      description: currentFields.description || "",
      gender,
      post_code,
      avatar: avatar || null, // Pass null if no new avatar (existing will be used)
      geo_location: geo_location && geo_location.lat && geo_location.lng ? geo_location : { lat: 0, lng: 0 },
    };

    // console.log("Validation - formDataToValidate.avatar:", formDataToValidate.avatar);
    // console.log("Validation - hasNewAvatar:", hasNewAvatar, "hasExistingAvatar:", hasExistingAvatar);

    const result = profileSchema.safeParse(formDataToValidate);
    // console.log("Validation - Result:", JSON.stringify(result, null, 2));
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate all required fields with schema validation
      const validationResult = validateFormData();
      
      if (!validationResult.success) {
        // Collect all validation errors
        const allErrors = validationResult.error.errors.map(err => err.message);
        toast({
          title: t("validationError"),
          description: allErrors.length > 0 
            ? allErrors.join(". ") 
            : t("pleaseFillAllRequiredFields"),
          variant: "destructive",
        });
        setIsLoading(false);
        return; // Exit early - no translation or save if validation fails
      }

      // Always perform translation on every submit using ACTUAL current form data
      // console.log("Starting automatic translation with current form data...");
      
      // Get the ACTUAL current form data from the current language being edited
      const currentFields = editedTranslations[currentLangCode];
      const currentFormDataForTranslation = {
        description: currentFields.description || "",
        city: currentFields.city || "",
        street: currentFields.street || ""
      };
      
      // console.log("Current form data for translation:", currentFormDataForTranslation, "currentLangCode:", currentLangCode);
      
      // Perform translation with actual current form data and get updated translations
      const updatedTranslations = await handleAiTranslate(currentFormDataForTranslation);
      // console.log("Translation completed successfully, updated translations:", updatedTranslations);
      
      // Use the returned updated translations (guaranteed to be latest)
      const updatedDescription = updatedTranslations['en-US']?.description || updatedTranslations['ar-SA']?.description || description;
      const updatedCity = updatedTranslations['en-US']?.city || updatedTranslations['ar-SA']?.city || city;
      const updatedStreet = updatedTranslations['en-US']?.street || updatedTranslations['ar-SA']?.street || street;

      // Check if all required data is completed
      const hasAvatar = avatar || (user?.avatar && user.avatar.trim() !== "");
      // Phone must be provided (but verification is optional)
      if(first_name && last_name && phone_number && updatedDescription && updatedCity && country && updatedStreet && gender && geo_location && geo_location.lat && geo_location.lng && hasAvatar) {
        set_completed_data('true')
      }
      else {
        set_completed_data('false')
      }

      // Always save all data with translations, not just when there are changes
      // Use the updated translations returned from handleAiTranslate (guaranteed latest)
      const finalTranslations = [
        {
            languages_code: "en-US",
            description: updatedTranslations["en-US"]?.description || editedTranslations["en-US"]?.description || "",
            city: updatedTranslations["en-US"]?.city || editedTranslations["en-US"]?.city || "",
            street: updatedTranslations["en-US"]?.street || editedTranslations["en-US"]?.street || "",
        },
        {
            languages_code: "ar-SA",
            description: updatedTranslations["ar-SA"]?.description || editedTranslations["ar-SA"]?.description || "",
            city: updatedTranslations["ar-SA"]?.city || editedTranslations["ar-SA"]?.city || "",
            street: updatedTranslations["ar-SA"]?.street || editedTranslations["ar-SA"]?.street || "",
        }
      ];

      // console.log("Sending translations to server:", finalTranslations);
      const handleEditeProfile =  await editeProfile(userCollectionData, user.id, avatar, finalTranslations, shouldRemoveAvatar);
      // console.log("Profile saved successfully with translations");
      // Check if there's a target to redirect to swap page
      const targetSwapId = await getTarget();
      const decoded = await decodedToken()
      const makeCheckUserHasProducts = await checkUserHasProducts(decoded.id)

      if(handleEditeProfile.success){
        toast({
          title: t("successfully"),
          description: t("savedSuccessfullyWithTranslation"),
        });
        
        // Reset removal flag after successful save
        setShouldRemoveAvatar(false);
        
        // Refresh user data after successful submit
        await getUser();
        
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
          title: t("errorPrefix"),
          description: error.message || t("failedToUpdateProfile"),
          variant: "destructive",
        })
      }
      
     
    } catch (error) {
      // console.error("Error updating profile:", error)
      toast({
        title: t("errorPrefix"),
        description: error.message || t("failedToUpdateProfile"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneVerified = async () => {
    try {
      // Only update verification status, don't change phone number
      setVerifiedPhone(true)
      
      // Refresh user data to get updated verified_phone from backend
      await getUser()
      
      toast({
        title: t("success"),
        description: t("phoneNumberVerified"),
      })
    } catch (error) {
      // console.error('Error updating phone verification:', error)
      toast({
        title: t("error"),
        description: t("phoneVerifiedFailedUpdate"),
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
      title: t("locationSelected"),
      description: `${t("selectedLocation")}: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
    })
  }

  const handlePhoneChange = (newPhone) => {
    // Phone should only contain digits now (no + or country code)
    setPhone(newPhone)
    
    // Reset verification status if phone changes
    if (verifiedPhone && newPhone !== phone_number) {
      setVerifiedPhone(false)
    }
    
    // Validate phone number with current country code
    if (newPhone) {
      const validation = validatePhoneNumber(country_code || "+20", newPhone)
      setPhoneValidationError(validation.isValid ? "" : t("invalidNumber"))
    } else {
      setPhoneValidationError("")
    }
  }

  const handleCountryCodeChange = (newCountryCode) => {
    setCountryCode(newCountryCode)
    
    // Reset verification status if country code changes
    if (verifiedPhone) {
      setVerifiedPhone(false)
    }
    
    // Re-validate phone number with new country code
    if (phone_number) {
      const validation = validatePhoneNumber(newCountryCode, phone_number)
      setPhoneValidationError(validation.isValid ? "" : t("invalidNumber"))
    }
  }

  const getCurrentPosition = () => {
    setIsGettingLocation(true)

    if (!navigator.geolocation) {
      toast({
        title: t("error"),
        description: t("geolocationNotSupported"),
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
          // console.error("Reverse geocoding failed", error)
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
          title: t("currentLocationFound"),
          description: `${t("latitude")}: ${pos.lat.toFixed(6)}, ${t("longitude")}: ${pos.lng.toFixed(6)}`,
        })
      },
      (error) => {
        let message = t("unableToRetrieveLocation")
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = t("locationAccessDenied")
            break
          case error.POSITION_UNAVAILABLE:
            message = t("locationInfoUnavailable")
            break
          case error.TIMEOUT:
            message = t("locationRequestTimeout")
            break
        }
        toast({
          title: t("locationError"),
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
      className="min-h-screen bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold text-foreground ${isRTL ? 'force-rtl' : ''}`}>
                {t("accountSettings") || "Account Settings"}
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-card/80 via-card to-card/80 backdrop-blur-sm rounded-xl p-2 border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
              {/* Desktop & Tablet View */}
              <div className="hidden sm:flex items-center gap-2">
                <TabsList className={`inline-flex h-12 items-center bg-transparent p-0 gap-2 flex-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                  <TabsTrigger
                    value="profile"
                    className="relative h-11 rounded-lg px-6 font-semibold text-muted-foreground shadow-none transition-all duration-300 hover:text-foreground hover:bg-background/60 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_4px_12px_rgba(0,0,0,0.15)] data-[state=active]:scale-[1.02]"
                  >
                    <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse force-rtl' : ''}`}>
                      <User className="h-4 w-4" />
                      <span className={isRTL ? 'force-rtl' : ''}>{t("profile") || "Profile"}</span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="preferences"
                    className="relative h-11 rounded-lg px-6 font-semibold text-muted-foreground shadow-none transition-all duration-300 hover:text-foreground hover:bg-background/60 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_4px_12px_rgba(0,0,0,0.15)] data-[state=active]:scale-[1.02]"
                  >
                    <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse force-rtl' : ''}`}>
                      <Palette className="h-4 w-4" />
                      <span className={isRTL ? 'force-rtl' : ''}>{t("preferences") || "Preferences"}</span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="relative h-11 rounded-lg px-6 font-semibold text-muted-foreground shadow-none transition-all duration-300 hover:text-foreground hover:bg-background/60 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_4px_12px_rgba(0,0,0,0.15)] data-[state=active]:scale-[1.02]"
                  >
                    <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse force-rtl' : ''}`}>
                      <Shield className="h-4 w-4" />
                      <span className={isRTL ? 'force-rtl' : ''}>{t("security") || "Security"}</span>
                    </span>
                  </TabsTrigger>
                </TabsList>
                <Button
                  onClick={handleKYC}
                  size="sm"
                  className="h-11 px-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse force-rtl' : ''}`}>
                    <Plus className="h-4 w-4" />
                    <span className={isRTL ? 'force-rtl' : ''}>{t("addItem") || "Add Item"}</span>
                  </span>
                </Button>
              </div>

              {/* Mobile View */}
              <div className="flex flex-col gap-2 sm:hidden">
                <div className={`overflow-x-auto scrollbar-hide -mx-2 px-2 ${isRTL ? 'direction-rtl' : ''}`}>
                  <TabsList className={`inline-flex h-12 items-center bg-transparent p-0 gap-2 min-w-full w-max ${isRTL ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                    <TabsTrigger
                      value="profile"
                      className="relative h-11 rounded-lg px-4 font-semibold text-muted-foreground shadow-none transition-all duration-300 hover:text-foreground hover:bg-background/60 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_4px_12px_rgba(0,0,0,0.15)] whitespace-nowrap"
                    >
                      <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse force-rtl' : ''}`}>
                        <User className="h-4 w-4" />
                        <span className={isRTL ? 'force-rtl' : ''}>{t("profile") || "Profile"}</span>
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="preferences"
                      className="relative h-11 rounded-lg px-4 font-semibold text-muted-foreground shadow-none transition-all duration-300 hover:text-foreground hover:bg-background/60 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_4px_12px_rgba(0,0,0,0.15)] whitespace-nowrap"
                    >
                      <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse force-rtl' : ''}`}>
                        <Palette className="h-4 w-4" />
                        <span className={isRTL ? 'force-rtl' : ''}>{t("preferences") || "Preferences"}</span>
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="security"
                      className="relative h-11 rounded-lg px-4 font-semibold text-muted-foreground shadow-none transition-all duration-300 hover:text-foreground hover:bg-background/60 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_4px_12px_rgba(0,0,0,0.15)] whitespace-nowrap"
                    >
                      <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse force-rtl' : ''}`}>
                        <Shield className="h-4 w-4" />
                        <span className={isRTL ? 'force-rtl' : ''}>{t("security") || "Security"}</span>
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                <Button
                  onClick={handleKYC}
                  size="sm"
                  className="w-full h-11 px-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse force-rtl' : ''}`}>
                    <Plus className="h-4 w-4" />
                    <span className={isRTL ? 'force-rtl' : ''}>{t("addItem") || "Add Item"}</span>
                  </span>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Tab Contents */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <TabsContent value="profile" className="mt-0">
              <ProfileTab
                user={user}
                avatarPath={avatarPath}
                first_name={first_name}
                setFirstName={setFirstName}
                last_name={last_name}
                setLasttName={setLasttName}
                country={country}
                setCountry={setCountry}
                editedTranslations={editedTranslations}
                setEditedTranslations={setEditedTranslations}
                currentLangCode={currentLangCode}
                post_code={post_code}
                setPostCode={setPostCode}
                email={email}
                phone_number={phone_number}
                country_code={country_code}
                handlePhoneChange={handlePhoneChange}
                onCountryCodeChange={handleCountryCodeChange}
                phoneValidationError={phoneValidationError}
                verified={verifiedPhone}
                setShowPhoneVerification={setShowPhoneVerification}
                avatar={avatar}
                setAvatar={setAvatar}
                shouldRemoveAvatar={shouldRemoveAvatar}
                setShouldRemoveAvatar={setShouldRemoveAvatar}
                gender={gender}
                setGender={setGender}
                isGettingLocation={isGettingLocation}
                getCurrentPosition={getCurrentPosition}
                selectedPosition={selectedPosition}
                geo_location={geo_location}
                handleLocationSelect={handleLocationSelect}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                isAiProcessing={isAiProcessing}
                activeTab={activeTab}
                t={t}
                isRTL={isRTL}
                getDirectionClass={getDirectionClass}
                getDirectionValue={getDirectionValue}
              />
            </TabsContent>

            <TabsContent value="preferences" className="mt-0">
              <PreferencesTab t={t} isRTL={isRTL} />
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <SecurityTab
                currentEmail={currentEmail}
                setCurrentEmail={setCurrentEmail}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                updatePassword={updatePassword}
                t={t}
                isRTL={isRTL}
              />
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>

      {/* Phone Verification Popup */}
      <PhoneVerificationPopup
        open={showPhoneVerification}
        onOpenChange={setShowPhoneVerification}
        currentPhone={phone_number}
        onVerified={handlePhoneVerified}
        isVerified={verifiedPhone}
        userCountryCode={user?.country_code || "+20"}
      />
    </motion.div>
  )
}