"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod" 
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, Info, Loader2, ImageIcon, DollarSign, Package, Navigation, MapPin, Map, RefreshCw } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { getImageProducts } from "@/callAPI/products"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { categoriesName, itemsStatus, allowedCategories, countriesList } from "@/lib/data"
import { countriesListWithFlags } from "@/lib/countries-data"
import FlagIcon from "@/components/general/flag-icon"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"
import { updateProduct } from "@/callAPI/products"
import { getAllCategories } from "@/callAPI/static"
import { sendMessage } from "@/callAPI/aiChat"
import { useLanguage } from "@/lib/language-provider"
import LocationMap from "@/components/general/location-map"
import {  decodedToken } from "@/callAPI/utiles"
import { getUserById } from "@/callAPI/users"
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

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
}

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

const inputVariants = {
  focus: {
    scale: 1.02,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 4px 12px rgba(73, 197, 182, 0.3)",
  },
  tap: { scale: 0.95 },
}

export function ItemUpdate(props) {
  const {
    id,
    name,
    description,
    category,
    status_item,
    value_estimate,
    allowed_categories,
    status_swap,
    geo_location: initialGeoLocation,
    price,
    city,
    country,
    street,
    images,
    translations,
    quantity,
  } = props
  // console.log("itemData", images[0].directus_files_id)
  // console.log("translations", translations)
  // console.log("props", props)
  const router = useRouter()
  const [imagesFile, setImagesFile] = useState([])
  const [imageUrls, setImageUrls] = useState([])
  const [existingImages, setExistingImages] = useState([]) // {fileId, url}
  const [retainedExistingFileIds, setRetainedExistingFileIds] = useState([])
  const [deletedImageIds, setDeletedImageIds] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMediaDirty, setIsMediaDirty] = useState(false)
  const [aiPriceEstimation, setAiPriceEstimation] = useState(value_estimate || 0)
  const [isEstimating, setIsEstimating] = useState(false)
  const [product, setProduct] = useState(name)
  const [bigImage, setBigImage] = useState("")
  const [step, setStep] = useState(1)
  const { toast } = useToast()
  const { t } = useTranslations()
  const [geoLocation, setGeoLocation] = useState(initialGeoLocation || {})
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(
    initialGeoLocation && Object.keys(initialGeoLocation).length > 0 
      ? initialGeoLocation 
      : null
  )
  const [currentPosition, setCurrentPosition] = useState(null) 
  const [isMapRefreshing, setIsMapRefreshing] = useState(false)
  const [categoriesAPI, setCategoriesAPI] = useState([])
  const [parentCategories, setParentCategories] = useState([])
  const [levelOneOptions, setLevelOneOptions] = useState([])
  const [levelTwoOptions, setLevelTwoOptions] = useState([])
  const [isCatPopoverOpen, setIsCatPopoverOpen] = useState(false)

//AI chat
  const [aiResponse, setAiResponse] = useState(null)
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [aiSystemPrompt, setAiSystemPrompt] = useState("You are an expert product appraiser and translator that analyzes both text descriptions and visual images to provide accurate price estimations. You can identify products, assess their condition from photos, and provide realistic market valuations. You also provide high-quality translations between Arabic and English. For location translations, use the actual city and street names provided by the user, not generic terms like 'Current Location'. IMPORTANT: Respond ONLY with valid JSON - no markdown, no code blocks, no extra text, just the JSON object.")
  const [aiReply, setAiReply] = useState(null)
  const [aiInput, setAiInput] = useState("")
  const [user, setUser] = useState()
  const [originalTranslations, setOriginalTranslations] = useState(null)
  const { isRTL, toggleLanguage } = useLanguage()

  // Auto-refresh map every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsMapRefreshing(true)
      // Simulate map refresh
      setTimeout(() => {
        setIsMapRefreshing(false)
      }, 500)
    }, 2000) // 2 seconds

    return () => clearInterval(interval)
  }, [])

  const getUser = async () => {
    const decoded = await decodedToken()
    if (decoded) {
      const user = await getUserById(decoded.id)
      setUser(user.data)
    }
  }

  useEffect(() => {
    getUser()
  }, [isRTL])

  // Load categories for sublevels
  useEffect(() => {
    const load = async () => {
      const categories = await getAllCategories()
      if (categories?.success) {
        setCategoriesAPI(categories.data)
        setParentCategories((categories.data || []).filter(cat => !cat.parent_category))
        // If category already selected, prefill level_1/2 from its cat_levels
        const selectedCategory = (categories.data || []).find(cat => cat.name === form.getValues("category"))
        if (selectedCategory) {
          const level1 = selectedCategory?.cat_levels?.level_1 || []
          setLevelOneOptions(level1)
          if (!form.getValues("level_1") && level1.length > 0) {
            const firstL1 = level1[0]
            const lbl1 = `${isRTL ? (firstL1?.name_ar || firstL1?.name_en) : (firstL1?.name_en || firstL1?.name_ar)}`
            form.setValue("level_1", lbl1)
            const level2 = firstL1?.level_2 || []
            setLevelTwoOptions(level2)
            if (!form.getValues("level_2") && level2.length > 0) {
              const firstL2 = level2[0]
              const lbl2 = `${isRTL ? (firstL2?.name_ar || firstL2?.name_en) : (firstL2?.name_en || firstL2?.name_ar)}`
              form.setValue("level_2", lbl2)
            }
          }
        }
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCategoryChange = (value) => {
    form.setValue("category", value)
    const selectedCategory = categoriesAPI.find(cat => cat.name === value)
    form.setValue("level_1", "")
    form.setValue("level_2", "")
    setLevelTwoOptions([])
    if (selectedCategory) {
      const level1 = selectedCategory?.cat_levels?.level_1 || []
      setLevelOneOptions(level1)
      if (level1.length > 0) {
        const firstL1 = level1[0]
        const lbl1 = `${isRTL ? (firstL1?.name_ar || firstL1?.name_en) : (firstL1?.name_en || firstL1?.name_ar)}`
        form.setValue("level_1", lbl1)
        const level2 = firstL1?.level_2 || []
        setLevelTwoOptions(level2)
        if (level2.length > 0) {
          const firstL2 = level2[0]
          const lbl2 = `${isRTL ? (firstL2?.name_ar || firstL2?.name_en) : (firstL2?.name_en || firstL2?.name_ar)}`
          form.setValue("level_2", lbl2)
        }
      }
    } else {
      setLevelOneOptions([])
      setLevelTwoOptions([])
    }
  }

  const handleLevelOneChange = (value) => {
    form.setValue("level_1", value)
    const selected = levelOneOptions.find(l => l?.name_en === value || l?.name_ar === value)
    const level2 = selected?.level_2 || []
    setLevelTwoOptions(level2)
    if (level2.length > 0) {
      const firstL2 = level2[0]
      const lbl2 = `${isRTL ? (firstL2?.name_ar || firstL2?.name_en) : (firstL2?.name_en || firstL2?.name_ar)}`
      form.setValue("level_2", lbl2)
    } else {
      form.setValue("level_2", "")
    }
  }


  const MAX_FILE_SIZE = 100 * 1024 * 1024 // 5MB
  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", 
                                "image/jpg",
                                "image/png", 
                                "image/webp" , 
                                "image/*",
                                "video/mp4" , 
                                "video/mov" , 
                                "video/avi" , 
                                "video/mkv" , 
                                "video/webm" , 
                                "video/flv" , 
                                "video/wmv" , 
                                "video/mpeg" , 
                                "video/mpg" , 
                                "video/m4v" ,
                                "video/m4a" ,
                                "video/m4b" , 
                                "video/m4p" , 
                                "video/m4v" , 
                                "video/m4a" , 
                                "video/m4b" , 
                                "video/m4p",
                                "video/*", 
                                "audio/mp3", 
                                "audio/wav", 
                                "audio/ogg", 
                                "audio/m4a", 
                                "audio/m4b", 
                                "audio/m4p",
                                "audio/*",

      ]
  const MAX_IMAGES = 6

  const categories = categoriesName
  const conditions = itemsStatus
  const allowedCat = allowedCategories

  const formSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name must be less than 100 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description must be less than 2000 characters"),
    category: z.string(),
    level_1: z.string().optional(),
    level_2: z.string().optional(),
    status_item: z.string(),
    // value_estimate: z.coerce.number().positive("Value must be greater than 0"),
    allowedCategories: z.array(z.enum(allowedCat)).min(1, "Select at least one category"),
    price: z.coerce.number().positive(t("Pricecannotbenegative") || "Price cannot be negative"),
    country: z.string().min(1, t("SelectCountry") || "Select country"),
    city: z.string().min(1, t("Cityisrequired") || "City is required"),
    street: z.string().min(1, t("Streetisrequired") || "Street is required"),
    quantity: z.coerce.number({
      required_error: t("Quantityisrequired") || "Quantity is required",
      invalid_type_error: t("Quantitymustbeanumber") || "Quantity must be a number"
    }).min(1, t("Quantitymustbegreaterthan0") || "Quantity must be greater than 0").max(100, t("Quantitymustbelessthan100") || "Quantity must be less than 100"),

  })

  // Get images
  useEffect(() => {
    const fetchImages = async () => {
      if (!images || images.length === 0) {
        // console.log("No images prop provided")
        return
      }
      
      // console.log("Images prop:", images)
      
      // Check if images already have directus_files_id (direct structure)
      if (images[0] && images[0].directus_files_id) {
        // console.log("Images have direct structure, processing directly")
        const list = images.map((img) => ({
          fileId: img.directus_files_id.id,
          url: `${mediaURL}${img.directus_files_id.id}`,
          type: img.directus_files_id.type || 'image/jpeg',
        }))
        // console.log("Processed image list (direct):", list)
        setExistingImages(list)
        setImageUrls(list.map(x => x.url))
        setRetainedExistingFileIds(list.map(x => x.fileId))
        if (list.length > 0) {
          setBigImage(list[0].fileId)
        }
        return
      }
      
      try {
        const fetchedImages = await getImageProducts(images)
        //  console.log("Fetched images response:", fetchedImages)
        
        if (fetchedImages.success && fetchedImages.data && fetchedImages.data.length > 0) {
          setBigImage(fetchedImages.data[0].directus_files_id)
          const list = fetchedImages.data.map((img) => ({
            fileId: img.directus_files_id,
            url: `${mediaURL}${img.directus_files_id}`,
            type: img.type || 'image/jpeg',
          }))
          // console.log("Processed image list:", list)
          setExistingImages(list)
          setImageUrls(list.map(x => x.url))
          setRetainedExistingFileIds(list.map(x => x.fileId))
        } else {
          // console.log("No images found in response or fetch failed")
        }
      } catch (err) {
        // console.error("Failed to fetch images", err)
      }
    }
    fetchImages()
  }, [images])

  const getCurrentPosition = async () => {
    setIsGettingLocation(true)

    if (!navigator.geolocation) {
      toast({
        title: "Error",
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
          // console.error("Reverse geocoding failed", error)
          pos.name = "Current Location"
        }

        setCurrentPosition(pos)
        setSelectedPosition(pos)

        setGeoLocation({
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

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
          defaultValues: {
        name: translations ? (!isRTL ? translations[0]?.name : translations[1]?.name) || name : name,
        description: translations ? (!isRTL ? translations[0]?.description : translations[1]?.description) || description : description,
        category: category,
        level_1: "",
        level_2: "",
        status_item: status_item,
        value_estimate: value_estimate || 0,
        allowed_categories: allowed_categories,
        status_swap: status_swap,
        price: price,
        country: country,
        city: translations ? (!isRTL ? translations[0]?.city : translations[1]?.city) || city : city,
        street: translations ? (!isRTL ? translations[0]?.street : translations[1]?.street) || street : street,
        geo_location: initialGeoLocation,
        quantity: quantity,
      },
  })

  const { formState: { isDirty } } = form

  // Helper function to get media type
  const getMediaType = (mimeType) => {
    if (!mimeType) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.startsWith('image/')) return 'image'
    // Fallback: check file extension if mime type is not available
    if (typeof mimeType === 'string' && mimeType.includes('.')) {
      const ext = mimeType.toLowerCase().split('.').pop()
      if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'mpeg', 'mpg', 'm4v'].includes(ext)) return 'video'
      if (['mp3', 'wav', 'ogg', 'm4a', 'm4b', 'm4p'].includes(ext)) return 'audio'
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
    }
    return 'image'
  }
 
  // Store original translations for comparison
  useEffect(() => {
    if (translations && translations.length > 0) {
      setOriginalTranslations(translations)
    }
  }, [translations])

  // language direction
  useEffect(() => {

  }, [isRTL])

  const handleImageUpload = (e) => {
    if (!e.target.files || e.target.files.length === 0) return

    const newFiles = Array.from(e.target.files)

    const validFiles = newFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: t("error") || "ERROR",
          description: `File ${file.name} is too large. Maximum size is 5MB.`,
          variant: "destructive",
        })
        return false
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: t("error") || "ERROR",
          description: `${t("File")} ${file.name} ${t("hasanunsupportedformat")} ${t("PleaseuploadJPEGPNGorWebP")}`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    // Check total media count: existing images + new files
    const totalMediaCount = existingImages.length + imagesFile.length + validFiles.length
    if (totalMediaCount > MAX_IMAGES) {
      toast({
        title: t("error") || "ERROR",
        description: `${t("Youcanonlyselectitemsfrommatchingcategories") || "You can only select items from matching categories"} ${MAX_IMAGES} ${t("images") || "images"}.`,
        variant: "destructive",
      })
      return
    }

    const newImageUrls = validFiles.map((file) => URL.createObjectURL(file))
    setImagesFile((prev) => [...prev, ...validFiles])
    setImageUrls((prev) => [...prev, ...newImageUrls])
    setIsMediaDirty(true)
  }

  const removeImage = (index) => {
    // Check if this is an existing image or a new uploaded file
    const isExistingImage = index < existingImages.length
    
    if (isExistingImage) {
      // This is an existing image, use the existing removal function
      const fileId = existingImages[index].fileId
      removeExistingImageById(fileId)
    } else {
      // This is a new uploaded file
      const newFileIndex = index - existingImages.length
      URL.revokeObjectURL(imageUrls[index])
      setImagesFile((prev) => prev.filter((_, i) => i !== newFileIndex))
      setImageUrls((prev) => prev.filter((_, i) => i !== index))
      setIsMediaDirty(true)
    }
  }

  const removeExistingImageById = async (fileId) => {
    try {
      // Find the image to get its index
      const imageToRemove = existingImages.find(img => img.fileId === fileId);
      const imageIndex = existingImages.findIndex(img => img.fileId === fileId);
      
      // Add to deleted images array immediately for UI feedback
      setDeletedImageIds((prev) => [...prev, fileId]);
      setExistingImages((prev) => prev.filter((img) => img.fileId !== fileId));
      setRetainedExistingFileIds((prev) => prev.filter((id) => id !== fileId));
      
      // Remove the corresponding URL from imageUrls array
      if (imageIndex !== -1) {
        setImageUrls((prev) => prev.filter((_, i) => i !== imageIndex));
      }
      
      setIsMediaDirty(true);
      
      // Try to remove from server (but don't fail the UI if it fails)
      const result = await removeProductImage(id, fileId);
      if (result.success) {
        toast({ title: "Success", description: "Image removed." });
      } else {
        // console.warn("Failed to remove image from server:", result.error);
        // Keep the UI change even if server removal fails
      }
    } catch (error) {
      // console.warn("Error removing image:", error.message);
      // Keep the UI change even if server removal fails
      toast({ title: "Image removed from preview", description: "Will be removed on save." });
    }
  }

  const handleSubmit = async (formValues) => {
    setIsSubmitting(true)
    const files = imagesFile
    
    // Prepare translations in Directus format
    let translationsToSend = []
    
    if (aiResponse && aiResponse.name_translations) {
      // AI provided new translations - send all
      translationsToSend = [
        {
          languages_code: "en-US",
          name: aiResponse.name_translations.en,
          description: aiResponse.description_translations.en,
          city: aiResponse.city_translations.en,
          street: aiResponse.street_translations.en,
        },
        {
          languages_code: "ar-SA",
          name: aiResponse.name_translations.ar,
          description: aiResponse.description_translations.ar,
          city: aiResponse.city_translations.ar,
          street: aiResponse.street_translations.ar,
        },
      ]
    } else if (originalTranslations && originalTranslations.length > 0) {
      // Update translations based on current form values
      const currentName = formValues.name
      const currentDescription = formValues.description
      const currentCity = formValues.city
      const currentStreet = formValues.street
      
      // Create updated translations array - send all translations with current language updated
      translationsToSend = originalTranslations.map(translation => {
        if ((!isRTL && translation.languages_code === "en-US") || 
            (isRTL && translation.languages_code === "ar-SA")) {
          // This is the current language - use form values
          return {
            ...translation,
            name: currentName,
            description: currentDescription,
            city: currentCity,
            street: currentStreet,
          }
        } else {
          // Keep original translation for the other language
          return translation
        }
      })
    } else {
      // No existing translations - create new ones for current language only
      const currentName = formValues.name
      const currentDescription = formValues.description
      const currentCity = formValues.city
      const currentStreet = formValues.street
      
      translationsToSend = [
        {
          languages_code: isRTL ? "ar-SA" : "en-US",
          name: currentName,
          description: currentDescription,
          city: currentCity,
          street: currentStreet,
        }
      ]
    }
    
    // Resolve selected level objects for translations
    const selectedLevel1Label = form.getValues("level_1") || ""
    const selectedLevel2Label = form.getValues("level_2") || ""
    const selectedLevel1Obj = (levelOneOptions || []).find(l => l?.name_en === selectedLevel1Label || l?.name_ar === selectedLevel1Label) || null
    const selectedLevel2Obj = (levelTwoOptions || []).find(l => l?.name_en === selectedLevel2Label || l?.name_ar === selectedLevel2Label) || null

    const payload = {  
      ...formValues, 
      geo_location: geoLocation, 
      value_estimate: aiPriceEstimation,
      translations: translationsToSend.length > 0 ? translationsToSend : undefined,
      retained_image_file_ids: retainedExistingFileIds,
      deleted_image_file_ids: deletedImageIds,
      sub_cat: {
        level_1: {
          name: selectedLevel1Label,
          name_en: selectedLevel1Obj?.name_en || (!isRTL ? selectedLevel1Label : ""),
          name_ar: selectedLevel1Obj?.name_ar || (isRTL ? selectedLevel1Label : ""),
        },
        level_2: {
          name: selectedLevel2Label,
          name_en: selectedLevel2Obj?.name_en || (!isRTL ? selectedLevel2Label : ""),
          name_ar: selectedLevel2Obj?.name_ar || (isRTL ? selectedLevel2Label : ""),
        },
      }
    }
console.log("payload in update page", payload)
    if ((existingImages.length + files.length) === 0) {
      toast({
        title: t("error") || "ERROR",
        description: t("Pleasefillallfieldsandselectatleastoneimage") || "Please fill all fields and select at least one image.",
        variant: "destructive",
      })
      return
    }

    try {
      // console.log("Payload being sent:", payload)
      console.log("Translations being sent:", translationsToSend)
      
      const updateItem = await updateProduct(payload, files, id)
      if (updateItem.success) {
        const hasTranslations = translationsToSend.length > 0
        toast({
          title: t("successfully") || "Successfully",
          description: `Item updated successfully with images${hasTranslations ? ' and translations' : ''}!`, 
        })
        // Redirect to profile items page
        router.push('/profile/items')
      } else {
        throw new Error(updateItem.error || "Failed to update item")
      }
    } catch (err) {
      setIsSubmitting(false) 
      // console.error("Update error:", err)
      toast({
        title: t("error") || "ERROR",
        description: err.message || t("Errorupdatingitem") || "Error updating item.",
        variant: "destructive",
      })
    }finally {
      setIsSubmitting(false)
    }
  }

  const requestAiPriceEstimate = async () => {
    const { name, description, category, status_item, price } = form.getValues()
  
    try {
      // Check if all required fields are filled
      if (!name || !description || !category || !status_item || !price || 
          !geoLocation || Object.keys(geoLocation).length === 0 || 
          !images || images.length === 0) {
        toast({
          title: t("error") || "ERROR ",
          description:
            t("PleasefillnamedesccatcondpricegeoimagesAI") ||
            "Please fill in the item name, description, category, condition, price, location and upload at least one image for AI price estimation.",
          variant: "destructive",
        })
        return
      }
else{
      // Get location context for AI
      const locationContext = geoLocation && geoLocation.lat && geoLocation.lng 
        ? `Coordinates: ${geoLocation.lat.toFixed(6)}, ${geoLocation.lng.toFixed(6)} (${geoLocation.name || 'User Location'})`
        : 'Location: Not specified';
      
      // Build the AI input message directly instead of using state
      const aiInputMessage = `Please analyze the provided images along with the following item details to provide an accurate price estimation:
        Item Details:
        - Name: ${name}
        - Description: ${description}
        - Location: ${locationContext}
        - User Location Details: Country: ${form.getValues('country')}, City: ${form.getValues('city')}, Street: ${form.getValues('street')}
        - Category: ${category}
        - Base Price Reference: ${price} EGP
        - Condition: ${status_item}
        
        Please examine the uploaded images carefully and provide:
        1. Visual condition assessment based on the images
        2. Brand/model identification if visible
        3. Quality and wear analysis from the images
        4. Market value estimation considering visual condition
        
        For location translations, please provide proper location names based on the user's country, city, and street information provided above. Do not use generic terms like "Current Location".
        
        please return ONLY a JSON response in this format:
        {
        "estimated_price": [number in EGP],
        "name_translations": { "en": "...", "ar": "..." },
        "description_translations": { "en": "...", "ar": "..." },
        "city_translations": { "en": "...", "ar": "..." },
        "street_translations": { "en": "...", "ar": "..." }
        }`
      
      // Set the state for display purposes
      setAiInput(aiInputMessage)
      setIsEstimating(true)
      
      // Use enhanced AI function with automatic retry (3 attempts, starting with 1 second delay)
      // Pass the message directly, not from state
      const aiResponse = await sendMessage(aiInputMessage, aiSystemPrompt, 3, 1000)
      
      // Check if AI request was successful
      if (!aiResponse.success) {
        throw new Error(aiResponse.error || t("AIrequestfailedafterallretryattempts") || "AI request failed after all retry attempts")
      }
      
      let jsonString = aiResponse.text
      
      // Extract JSON from markdown code blocks if present
      const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonString = jsonMatch[1]
      }
      
      // Clean up any remaining markdown or extra characters
      jsonString = jsonString.trim()
      
      const jsonObject = JSON.parse(jsonString)
      
      // Validate the parsed response
      if (!jsonObject.estimated_price || jsonObject.estimated_price === 0) {
        throw new Error("AI returned invalid price estimation")
      }
      
      setAiResponse(jsonObject)
      setAiPriceEstimation(jsonObject.estimated_price)
      
      // Compare and optionally apply AI translations to form
      const current = form.getValues()
      const proposed = {
        name: jsonObject?.name_translations?.[!isRTL ? 'en' : 'ar'] ?? current.name,
        description: jsonObject?.description_translations?.[!isRTL ? 'en' : 'ar'] ?? current.description,
        city: jsonObject?.city_translations?.[!isRTL ? 'en' : 'ar'] ?? current.city,
        street: jsonObject?.street_translations?.[!isRTL ? 'en' : 'ar'] ?? current.street,
      }
      const changedFields = []
      ;(['name','description','city','street']).forEach((key) => {
        if (proposed[key] && proposed[key] !== current[key]) {
          form.setValue(key, proposed[key])
          changedFields.push(key)
        }
      })
      if (changedFields.length > 0) {
        toast({ title: t("success") || "Success", description: `${t("UpdatedFields") || "Updated fields"}: ${changedFields.join(', ')}` })
      } else {
        toast({ title: t("Note") || "Note", description: t("NoFieldChangesFromAI") || "AI did not suggest changes to text fields." })
      }
      
      // Show success message with attempt info
      if (aiResponse.attempt > 1) {
        toast({
          title: t("success") || "Success",
          description: `${t("AIpriceestimationsuccessfulafter") || "AI price estimation successful after"} ${aiResponse.attempt} ${t("attempts") || "attempts"}!`,
          variant: "default",
        })
      }
      
      setIsEstimating(false)
    }
    } catch (error) {
      // console.error("Error getting AI price estimate:", error)
      
      let errorMessage = t("FailedtogetAIpriceestimatePleasetryagainorenteryourownestimate") ||
        "Failed to get AI price estimate. Please try again or enter your own estimate."
      
      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        errorMessage = "AI response format error. The AI returned invalid JSON format."
      } else if (error.message.includes("retry attempts")) {
        errorMessage = "AI service is currently unavailable. All retry attempts failed. Please try again later."
      } else if (error.message.includes("invalid price")) {
        errorMessage = "AI returned invalid price estimation. Please enter your own estimate."
      }
      
      toast({
        title: t("error") || "ERROR ",
        description: t(errorMessage) || errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsEstimating(false)
    }
  }

  const onSubmit = async (data) => {
    const totalAfterUpdate = existingImages.length + imagesFile.length
    if (totalAfterUpdate === 0) {
      toast({
        title: t("error") || "ERROR",
        description: t("Pleaseuploaleastimageyouritem") || "Please upload at least one image of your item.",
        variant: "destructive",
      })
      return
    }

    // Prevent saving without AI estimation and show hint toast
    if (aiPriceEstimation === null || aiPriceEstimation <= 0) {
      toast({
        title: t("AIEstimationRequired") || "⚠️ AI Estimation Required",
        description: t("PleaseclickAIestimatetogetpriceestimatebeforeaddingitem") || "Please click 'Get AI Estimate' to get a price estimate before adding your item!",
        duration: 5000,
        variant: "destructive",
      });
      return;
    }

    try {
      await handleSubmit(data)
    } catch (error) {
      console.error("Error updating item:", error)
      toast({
        title: t("error") || "ERROR",
        description: error.message || t("FailedtoupdateitemPleasetryagain") || "Failed to update item. Please try again.",
        variant: "destructive",
      })
    } 
  }

  // Step validation
  const isStep1Valid =
    form.watch("name")?.length >= 3 &&
    form.watch("description")?.length >= 20 &&
    !!form.watch("category") &&
    !!form.watch("status_item") &&
    !!form.watch("price") &&
    !!form.watch("country") &&
    !!form.watch("city") &&
      !!form.watch("street") &&
    !!form.watch("quantity")

  const isStep2Valid = 
    (existingImages.length + imagesFile.length) > 0 &&
    aiPriceEstimation !== null && aiPriceEstimation > 0 &&
    form.watch("allowed_categories")?.length > 0

  // Debug logging
  // console.log("Debug - existingImages.length:", existingImages.length)
  // console.log("Debug - imagesFile.length:", imagesFile.length)
  // console.log("Debug - aiPriceEstimation:", aiPriceEstimation)
  // console.log("Debug - allowed_categories:", form.watch("allowed_categories"))
  // console.log("Debug - isStep2Valid:", isStep2Valid)
  // console.log("Debug - isDirty:", isDirty)
  // console.log("Debug - isMediaDirty:", isMediaDirty)
  // console.log("Debug - aiPriceEstimation === value_estimate:", aiPriceEstimation === value_estimate)
  // console.log("Debug - value_estimate:", value_estimate)







  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-center min-h-screen bg-background py-2 px-2 md:px-2 "
    >
      <div className="w-full">
        <Form {...form} >
          <form   onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 ">
            <div className="grid gap-2  md:grid-cols-1 rounded-2xl shadow-xl bg-card text-card-foreground p-6 md:p-10 border border-border">
              <div className="grid gap-8 md:grid-cols-1">
                {step === 1 && (
                  <motion.div className="space-y-6" variants={sectionVariants}>
                    <div className="grid gap-4">
                      {/* Name field */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Name")}</FormLabel>
                            <FormControl>
                              <motion.div variants={inputVariants} whileFocus="focus">
                                <Input
                                  placeholder={t("NamePlaceholder")}
                                  {...field}
                                  className="transition-all duration-200 bg-background border-input focus:ring-2 focus:ring-ring/20 focus:border-ring"
                                />
                              </motion.div>
                            </FormControl>
                            <FormDescription className="text-muted-foreground"> {t("BeSpecificAboutBrandModelAndKeyFeatures")}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Price field */}
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              {t("price")|| "Price"}
                            </FormLabel>
                            <FormControl>
                              <motion.div variants={inputVariants} whileFocus="focus">
                                <Input
                                  placeholder={t("EnterPrice")}
                                  {...field}
                                  type="number"
                                  className="transition-all duration-200 bg-background border-input focus:ring-2 focus:ring-ring/20 focus:border-ring"
                                  min={1}
                               />
                              </motion.div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Quantity field */}
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("quantity")||"Quantity"}</FormLabel>

                            <FormControl>
                              <motion.div variants={inputVariants} whileFocus="focus">
                                <Input
                                  placeholder={t("quantityofyouritem")||"Quantity of your item"}
                                  {...field}
                                  type="number"
                                  min={1}
                                  max={100}
                                  className="transition-all duration-200 bg-background border-input focus:ring-2 focus:ring-ring/20 focus:border-ring"
                                  onChange={(e) => {
                                    const value = e.target.value
                                    field.onChange(value)
                                    // Trigger validation
                                    form.trigger("quantity")
                                  }}
                                />
                              </motion.div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                        />

                      {/* Country field - searchable list */}
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Country")}</FormLabel>
                            <FormControl>
                              <Select
                                searchable
                                onValueChange={field.onChange}
                                defaultValue={field.value || ""}
                              
                              >
                                <SelectTrigger className="bg-background border-input">
                                  <SelectValue placeholder={t("SelectCountry")}>
                                    {field.value && (
                                      <div className="flex items-center gap-2">
                                        <FlagIcon 
                                          flag={countriesListWithFlags.find(c => c.name === field.value)?.flag}
                                          countryCode={field.value}
                                          className="text-lg"
                                        />
                                        <span>{t(field.value) || field.value}</span>
                                      </div>
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="bg-background border-input h-40">
                                  {countriesListWithFlags.map((country) => (
                                    <SelectItem key={country.name} value={country.name} className="text-right">
                                      <div className="flex items-center gap-2">
                                        <FlagIcon flag={country.flag} countryCode={country.name} className="text-lg" />
                                        <span>{t(country.name) || country.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* City field */}
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("City")}</FormLabel>
                            <FormControl>
                              <motion.div variants={inputVariants} whileFocus="focus">
                                <Input
                                  placeholder={t("CityPlaceholder")}
                                  {...field}
                                  className="transition-all duration-200 bg-background border-input focus:ring-2 focus:ring-ring/20 focus:border-ring"
                                />
                              </motion.div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Street field */}
                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Street")}</FormLabel>
                            <FormControl>
                              <motion.div variants={inputVariants} whileFocus="focus">
                                <Input
                                  placeholder={t("StreetPlaceholder")}
                                  {...field}
                                  className="focus:ring-2 bg-background border-input focus:ring-ring/20 focus:border-ring"
                                />
                              </motion.div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Description */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("description")||"Description"}</FormLabel>
                            <FormControl>
                              <motion.div variants={inputVariants} whileFocus="focus">
                                <Textarea
                                  placeholder={t("DescribeYourItemInDetail")}
                                  className="min-h-[120px] rounded-lg bg-background border-input text-foreground focus:border-ring focus:ring-2 focus:ring-ring transition-all"
                                  {...field}
                                />
                              </motion.div>
                            </FormControl>
                            <FormDescription className="text-muted-foreground">
                              {t("BeSpecificAboutBrandModelAndKeyFeatures")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category and subcategory (like item-add) */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("categories")||"Category and subcategory"}</FormLabel>
                              <Popover open={isCatPopoverOpen} onOpenChange={setIsCatPopoverOpen}>
                                <PopoverTrigger asChild>
                                  <Button type="button" variant="outline" className="w-full justify-between bg-background border-input text-foreground">
                                    {form.getValues("category") && (form.getValues("level_1") || form.getValues("level_2"))
                                      ? `${form.getValues("category")} › ${form.getValues("level_1")}${form.getValues("level_2") ? " › " + form.getValues("level_2") : ""}`
                                      : (t("SelectCategory") || "Select category and subcategory")}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-[340px] bg-background border-input" align="start">
                                  <div className="p-2">
                                    <Select onValueChange={(val)=>{ field.onChange(val); handleCategoryChange(val)}} defaultValue={field.value || ""}>
                                      <FormControl>
                                        <SelectTrigger className="bg-background border-input text-foreground">
                                          <SelectValue placeholder={t("Selectacategory") || "Select a category"} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-background border-input max-h-40">
                                        {parentCategories.map((cat) => (
                                          <SelectItem key={cat.id} value={cat.name}>
                                            {cat.translations?.[!isRTL ? 0 : 1]?.name || cat.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Command className="bg-background max-h-40">
                                    <CommandInput placeholder={t("Search") || "Search"} />

                                    {

                                    
                                     levelOneOptions?(  <CommandList>
                                      {levelOneOptions.map((lvl, idx) => {
                                        const lvl1Label = `${isRTL ? (lvl?.name_ar || lvl?.name_en) : (lvl?.name_en || lvl?.name_ar)}`
                                        return (
                                          <CommandGroup key={`lvl1-${idx}`} heading={lvl1Label} className="px-2">
                                            <div className="flex items-center gap-2 py-1">
                                              <RadioGroup value={form.getValues("level_1") || ""} onValueChange={(val)=>{ form.setValue("level_1", val); handleLevelOneChange(val)}}>
                                                <div className="flex items-center gap-2">
                                                  <RadioGroupItem value={lvl1Label} id={`lvl1-${idx}`} />
                                                  <label htmlFor={`lvl1-${idx}`} className="text-sm cursor-pointer">{lvl1Label}</label>
                                                </div>
                                              </RadioGroup>
                                            </div>
                                            {form.getValues("level_1") === lvl1Label && (
                                              <div className="pl-6 py-1">
                                                <RadioGroup value={form.getValues("level_2") || ""} onValueChange={(val)=>{ form.setValue("level_2", val); setIsCatPopoverOpen(false) }}>
                                                  {(levelTwoOptions || []).map((s, jdx) => {
                                                    const lvl2Label = `${isRTL ? (s?.name_ar || s?.name_en) : (s?.name_en || s?.name_ar)}`
                                                    return (
                                                      <div key={`lvl2-${idx}-${jdx}`} className="flex items-center gap-2 py-1">
                                                        <RadioGroupItem value={lvl2Label} id={`lvl2-${idx}-${jdx}`} />
                                                        <label htmlFor={`lvl2-${idx}-${jdx}`} className="text-sm cursor-pointer">{lvl2Label}</label>
                                                      </div>
                                                    )
                                                  })}
                                                </RadioGroup>
                                              </div>
                                            )}
                                          </CommandGroup>
                                        )
                                      })}
                                    </CommandList>):(<CommandEmpty>{t("NoResults") || "No results found."}</CommandEmpty>)
                                    }
                                  
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="status_item"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("Condition")}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <motion.div variants={inputVariants} whileFocus="focus">
                                    <SelectTrigger className="rounded-lg bg-background border-input text-foreground focus:border-ring focus:ring-2 focus:ring-ring">
                                      <SelectValue placeholder={t("SelectCondition")} />
                                    </SelectTrigger>
                                  </motion.div>
                                </FormControl>
                                <SelectContent className="z-[9999]">
                                  {itemsStatus.map((condition) => (
                                    <SelectItem key={condition} value={condition}>
                                      {t(condition)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <motion.div variants={itemVariants}>
                      <Card className="rounded-xl shadow-md bg-muted border-border">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-primary">
                            <Navigation className="h-5 w-5 text-primary" />
                            {t("CurrentPosition") || "Current Position"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <motion.div variants={buttonVariants}  whileTap="tap">
                            <Button type="button" onClick={getCurrentPosition} disabled={isGettingLocation} className="w-full py-2 rounded-lg bg-secondary/80 border border-primary text-secondary-foreground font-medium transition-all">
                              {isGettingLocation ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                        </CardContent>

                        <AnimatePresence>
                          {selectedPosition && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                            <Card className="rounded-lg border border-border bg-card/50 mt-2">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-card-foreground">
                                  <MapPin className="h-5 w-5 text-primary" />
                                  {t("SelectedPosition") || "Selected Position"}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    <strong>{t("Name") || "Name"}:</strong> {selectedPosition.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    <strong>{t("Latitude") || "Latitude"}:</strong> {selectedPosition.lat.toFixed(6)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    <strong>{t("Longitude") || "Longitude"}:</strong> {selectedPosition.lng.toFixed(6)}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                            </motion.div>
                          )}

                        </AnimatePresence>
                      </Card>
                    </motion.div>

                    {/* Interactive Map Section */}
                    <motion.div variants={itemVariants}>
                      <Card className="rounded-xl shadow-md bg-muted border-border">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-primary">
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 8, ease: "linear" }}
                            >
                              <Map className="h-5 w-5 text-primary" />
                            </motion.div>
                            {t("InteractiveMap") || "Interactive Map"}
                            {isMapRefreshing && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center text-sm text-muted-foreground ml-auto z-10"
                              >
                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                <span>Updating...</span>
                              </motion.div>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Interactive Map */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <LocationMap
                              latitude={selectedPosition?.lat || geoLocation?.lat || 30.0444}
                              longitude={selectedPosition?.lng || geoLocation?.lng || 31.2357}
                              onLocationSelect={(location) => {
                                setGeoLocation({ lat: location.lat, lng: location.lng, accuracy: 0, name: location.name || "Selected Location" })
                                setSelectedPosition(location)
                              }}
                              height="300px"
                              className="shadow-lg"
                            />
                          </motion.div>

                          {/* Map Controls */}
                          <motion.div
                            className="flex flex-wrap gap-4 justify-center"
                            variants={itemVariants}
                          >
                            <motion.div whileHover="hover" whileTap="tap">
                              <Button
                                type="button"
                                onClick={getCurrentPosition}
                                disabled={isGettingLocation}
                                className="bg-primary hover:bg-primary/90 text-white shadow-lg"
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

                            <motion.div whileHover="hover" whileTap="tap">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsMapRefreshing(true)
                                  setTimeout(() => setIsMapRefreshing(false), 1000)
                                }}
                                className="border-primary text-primary hover:bg-primary/90"
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                {t("RefreshMap") || "Refresh Map"}
                              </Button>
                            </motion.div>
                          </motion.div>
             
                        </CardContent>
                      </Card>
                    </motion.div>


                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!isStep1Valid}
                      className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 transition-all"
                    >
                      {t("continue")}
                    </Button>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div className="space-y-6" variants={sectionVariants}>
                    {/* Current Images Section */}
                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        {t("currentMedia") || "Current Media"}
                      </FormLabel>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        <AnimatePresence>
                          {existingImages.map((img) => {
                            const mediaType = getMediaType(img.type)
                            // console.log('Existing image media type:', { fileId: img.fileId, type: img.type, mediaType })
                            
                            return (
                              <motion.div key={img.fileId} variants={imageVariants} initial="hidden" animate="visible" exit="exit" layout>
                                <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                                  <div className="aspect-square relative">
                                    {mediaType === 'video' ? (
                                      <div className="w-full h-full relative">
                                        <video
                                          src={img.url}
                                          className="w-full h-full object-cover"
                                          controls
                                          muted
                                          loop
                                          playsInline
                                          preload="metadata"
                                          onError={(e) => {
                                            console.error('Video load error:', e, 'URL:', img.url)
                                            // Show fallback if video fails to load
                                            e.target.style.display = 'none'
                                            e.target.nextElementSibling.style.display = 'flex'
                                          }}
                                          onLoadStart={() => console.log('Video loading started:', img.url)}
                                          onCanPlay={() => console.log('Video can play:', img.url)}
                                        />
                                        <div className="absolute inset-0 bg-gray-200 items-center justify-center hidden" style={{ display: 'none' }}>
                                          <div className="text-center text-gray-600">
                                            <div className="text-4xl mb-2">🎥</div>
                                            <div className="text-sm">Video not available</div>
                                          </div>
                                        </div>
                                      </div>
                                    ) : mediaType === 'audio' ? (
                                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <div className="text-center text-white">
                                          <div className="text-4xl mb-2">🎵</div>
                                          <div className="text-sm font-medium">Audio File</div>
                                        </div>
                                        <audio
                                          src={img.url}
                                          className="hidden"
                                        />
                                      </div>
                                    ) : (
                                      <Image src={img.url || "/placeholder.svg"} alt={`${t("images")} old`} fill className="object-cover" />
                                    )}
                                  </div>
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute right-1 top-1">
                                    <Button type="button" variant="destructive" size="icon" className="h-6 w-6 rounded-full" onClick={() => removeExistingImageById(img.fileId)}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </motion.div>
                                </Card>
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>
                      </div>
                      {existingImages.length === 0 && (
                        <p className="text-xs text-muted-foreground">{t("noCurrentImages") || "No current images."}</p>
                      )}
                    </div>

                    {/* New Images Section */}
                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-primary" />
                        {t("newMedia")}. {t("totalMedia")}
                      </FormLabel>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        <AnimatePresence>
                          {imageUrls.map((url, index) => {
                            // Check if this is an existing image or a new uploaded file
                            const isExistingImage = index < existingImages.length
                            const file = isExistingImage ? existingImages[index] : imagesFile[index - existingImages.length]
                            const mediaType = getMediaType(file?.type)
                            // console.log('Image media type:', { 
                            //   index, 
                            //   isExistingImage, 
                            //   fileType: file?.type, 
                            //   mediaType, 
                            //   url: url.substring(0, 50) + '...' 
                            // })
                            
                            return (
                              <motion.div key={`new-media-${index}-${file?.name || 'unknown'}`} variants={imageVariants} initial="hidden" animate="visible" exit="exit" layout>
                                <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                                  <div className="aspect-square relative">
                                    {mediaType === 'video' ? (
                                      <video
                                        src={isExistingImage ? file.url : url}
                                        className="w-full h-full object-cover"
                                        controls
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                        onError={(e) => {
                                          console.error('Video load error:', e, 'URL:', isExistingImage ? file.url : url)
                                        }}
                                        onLoadStart={() => console.log('Video loading started:', isExistingImage ? file.url : url)}
                                        onCanPlay={() => console.log('Video can play:', isExistingImage ? file.url : url)}
                                      />
                                    ) : mediaType === 'audio' ? (
                                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <div className="text-center text-white">
                                          <div className="text-4xl mb-2">🎵</div>
                                          <div className="text-sm font-medium">Audio File</div>
                                        </div>
                                        <audio
                                          src={isExistingImage ? file.url : url}
                                          className="hidden"
                                        />
                                      </div>
                                    ) : (
                                      <Image src={isExistingImage ? file.url : url || "/placeholder.svg"} alt={`${t("images")} ${index + 1}`} fill className="object-cover" />
                                    )}
                                  </div>
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute right-1 top-1">
                                    <Button type="button" variant="destructive" size="icon" className="h-6 w-6 rounded-full" onClick={() => removeImage(index)}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </motion.div>
                                </Card>
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>

                        {(existingImages.length + imagesFile.length) < MAX_IMAGES && (
                          <motion.div variants={imageVariants} initial="hidden" animate="visible" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Card className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 hover:border-primary hover:bg-muted transition-all shadow-sm">
                              <CardContent className="flex h-full w-full flex-col items-center justify-center p-4">
                                <label htmlFor="image-upload" className="cursor-pointer text-center">
                                  <motion.div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10" whileHover={{ scale: 1.1, backgroundColor: "rgba(73, 197, 182, 0.2)" }}>
                                    <Upload className="h-5 w-5 text-primary" />
                                  </motion.div>
                                  <p className="text-xs text-muted-foreground">{t("Clicktoupload")}</p>
                                  <input id="image-upload" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/mov,video/avi,video/mkv,video/webm,video/flv,video/wmv,video/mpeg,video/mpg,video/m4v,video/m4a,video/m4b,video/m4p,audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/m4b,audio/m4p" multiple className="hidden bg-background border-input" onChange={handleImageUpload} />
                                </label>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t("UploadUpTo")} {MAX_IMAGES - existingImages.length} {t("newMedia")}. {t("totalMedia")} {existingImages.length + imagesFile.length}/{MAX_IMAGES}.
                      </p>
                    </div>
                    {/* Allowed Categories */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="allowed_categories"
                        render={() => (
                          <FormItem >
                            <div className="mb-4 ">
                              <FormLabel className="text-base">
                                {t("Whatwillyouacceptinreturn")}
                              </FormLabel>
                              <FormDescription className="text-muted-foreground">
                                {t("Selectthecategoriesofitemsyourewillingtoacceptinexchange")}
                              </FormDescription>
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                              {allowedCategories.map((category) => {
                                const isAll = category === "all"
                                const selected = form.getValues("allowed_categories") || []
                                const isAllSelected = selected.includes("all")

                                return (
                                  <FormField
                                    key={category}
                                    control={form.control}
                                    name="allowed_categories"
                                    render={({ field }) => (
                                      <FormItem
                                        className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-3 bg-muted border-input hover:scale-105"
                                      >
                                        <FormControl>
                                          <Checkbox
                                          
                                            checked={field.value?.includes(category)}
                                            disabled={!isAll && isAllSelected}
                                            onCheckedChange={(checked) => {
                                              if (isAll) {
                                                field.onChange(checked ? ["all"] : [])
                                              } else {
                                                let newValue = field.value?.filter((v) => v !== "all") || []
                                                if (checked) {
                                                  newValue = [...newValue, category]
                                                } else {
                                                  newValue = newValue.filter((v) => v !== category)
                                                }
                                                field.onChange(newValue)
                                              }
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal capitalize px-1 ">
                                          {t(category)}
                                        </FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                )
                              })}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                      {/* Value Estimation */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="value_estimate"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild >
                                    <motion.div 
                                      variants={buttonVariants} 
                                      whileHover="hover" 
                                      whileTap="tap" 
                                      className="max-[370px]:w-full relative"
                                    >
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {requestAiPriceEstimate() }}
                                        disabled={isEstimating}
                                        className="h-8 gap-1 rounded-lg max-[370px]:min-w-[100%] border-input bg-background text-foreground hover:bg-muted hover:border-primary transition-all relative"
                                      >
                                        {isEstimating ? (
                                          <>
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            {t("Estimating") || "Estimating..."}
                                          </>
                                        ) : (
                                          <>
                                            <Info className="h-3 w-3" />
                                            {t("GetAIEstimate") || "Get AI Estimate"}
                                          </>
                                        )}
                                        {/* AI Badge */}
                                        {!isEstimating && (
                                          <motion.div
                                            className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg"
                                            animate={{ 
                                              scale: [1, 1.1, 1],
                                              opacity: [0.8, 1, 0.8]
                                            }}
                                            transition={{ 
                                              duration: 1.5, 
                                              repeat: Infinity, 
                                              ease: "easeInOut" 
                                            }}
                                          >
                                            AI
                                          </motion.div>
                                        )}
                                      </Button>
                                    </motion.div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {t("GetAIpoweredpriceestimatebasedonyouritemdetails") ||
                                        "Get an AI-powered price estimate based on your item details"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {t("Clicktoautomaticallyestimateyouritemprice") ||
                                        "Click to automatically estimate your item price"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>

                              </TooltipProvider>
                            </div>
                            
                            <AnimatePresence>
                              {aiPriceEstimation !== null && (
                                <motion.p
                                  className="text-md text-secondary2 font-semibold"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                >
                                  {t("AIsuggestsvalueof") || "AI suggests a value of"} {t('le')||"LE"} {aiPriceEstimation}
                                </motion.p>
                              )}
                            </AnimatePresence>
                            <FormDescription className="text-muted-foreground">
                              {t("Setfairmarketvaluetohelpfacilitatebalancedswaps") ||
                                "Set a fair market value to help facilitate balanced swaps."}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex flex-col-2 gap-2">
                      <Button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full py-3 rounded-xl bg-muted text-muted-foreground font-semibold shadow-md hover:bg-muted/80 transition-all"
                      >
                        {t("goBack")}
                      </Button>
                        <Button
                        type="submit"
                        onClick={() => handleSubmit(form.getValues())}
                          disabled={!isStep2Valid || (!isDirty && !isMediaDirty && aiPriceEstimation === value_estimate && existingImages.length === 0 && imagesFile.length === 0) || isSubmitting}
                          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 transition-all"
                        >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("Saving") || "Saving..."}
                          </>
                        ) : (
                          t("save")
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </motion.div>
  )
}
