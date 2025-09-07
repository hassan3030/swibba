"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, Info, Loader2, ImageIcon, DollarSign, Package, Navigation, MapPin } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { getImageProducts } from "@/callAPI/products"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { categoriesName, itemsStatus, allowedCategories, countriesList } from "@/lib/data"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"
import { updateProduct } from "@/callAPI/products"
import { sendMessage } from "@/callAPI/aiChat"
import { useLanguage } from "@/lib/language-provider"
// import {  decodedToken } from "@/callAPI/utiles"
// import { getUserById } from "@/callAPI/users"

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

export function ItemListingUpdate(props) {
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
  console.log("itemData", images[0].directus_files_id)
  console.log("translations", translations)
  console.log("props", props)
  const router = useRouter()
  const [imagesFile, setImagesFile] = useState([])
  const [imageUrls, setImageUrls] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiPriceEstimation, setAiPriceEstimation] = useState(null)
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

//AI chat
  const [aiResponse, setAiResponse] = useState(null)
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [aiSystemPrompt, setAiSystemPrompt] = useState("You are an expert product appraiser and translator that analyzes both text descriptions and visual images to provide accurate price estimations. You can identify products, assess their condition from photos, and provide realistic market valuations. You also provide high-quality translations between Arabic and English. IMPORTANT: Respond ONLY with valid JSON - no markdown, no code blocks, no extra text, just the JSON object.")
  const [aiReply, setAiReply] = useState(null)
  const [aiInput, setAiInput] = useState("")
  const [user, setUser] = useState()
  const [originalTranslations, setOriginalTranslations] = useState(null)
  const { isRTL, toggleLanguage } = useLanguage()


  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  const MAX_IMAGES = 3
  const categories = categoriesName
  const conditions = itemsStatus
  const allowedCat = allowedCategories

  const formSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name must be less than 100 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description must be less than 2000 characters"),
    category: z.enum(categories),
    condition: z.string(),
    // value_estimate: z.coerce.number().positive("Value must be greater than 0"),
    allowedCategories: z.array(z.enum(allowedCat)).min(1, "Select at least one category"),
    price: z.coerce.number().positive(t("Pricecannotbenegative") || "Price cannot be negative"),
    country: z.string().min(1, t("SelectCountry") || "Select country"),
    city: z.string().min(1, t("Cityisrequired") || "City is required"),
    street: z.string().min(1, t("Streetisrequired") || "Street is required"),
    quantity: z.coerce.number().positive(t("Quantitycannotbenegative") || "Quantity cannot be negative"),
  })

  // Get images
  useEffect(() => {
    const fetchImages = async () => {
      if (!images || images.length === 0) return
      try {
        const fetchedImages = await getImageProducts(images)
        if (fetchedImages.datas && fetchedImages.data.length > 0) {
          setBigImage(fetchedImages.data[0].directus_files_id)
          const urls = fetchedImages.data.map((img) => `https://deel-deal-directus.csiwm3.easypanel.host/assets/${img.directus_files_id}`)
          setImageUrls(urls)
        }
      } catch (err) {
        console.error("Failed to fetch images", err)
      }
    }
    fetchImages()
  }, [images])

  const getCurrentPosition = () => {
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
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          name: "Current Location",
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
          defaultValues: {
        name: translations ? (!isRTL ? translations[0]?.name : translations[1]?.name) || name : name,
        description: translations ? (!isRTL ? translations[0]?.description : translations[1]?.description) || description : description,
        category: category,
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

    if (imagesFile.length + validFiles.length > MAX_IMAGES) {
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
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(imageUrls[index])
    setImagesFile((prev) => prev.filter((_, i) => i !== index))
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // const requestAiPriceEstimate = async () => {
  //   const { name, description, category, status_item } = form.getValues()
  //   console.log("Requesting AI estimate for:", { name, description, category, status_item })

  //   if (!name || !description || !category || !status_item) {
  //     toast({
  //       title: t("error") || "ERROR",
  //       description: "Please fill in the item name, description, category, and condition for an AI price estimate.",
  //       variant: "destructive",
  //     })
  //     return
  //   }

  //   setIsEstimating(true)

  //   try {
  //     await new Promise((resolve) => setTimeout(resolve, 1500))
  //     const mockEstimate = Math.floor(Math.random() * 1000) + 100
  //     setAiPriceEstimation(mockEstimate)
  //     form.setValue("value_estimate", mockEstimate)
  //   } catch (error) {
  //     console.error("Error getting AI price estimate:", error)
  //     toast({
  //       title: t("error") || "ERROR",
  //       description: "Failed to get AI price estimate. Please try again or enter your own estimate.",
  //       variant: "destructive",
  //     })
  //   } finally {
  //     setIsEstimating(false)
  //   }
  // }
  const requestAiPriceEstimate = async () => {
    const { name, description, category, condition, price } = form.getValues()
  
    try {
      // Check if all required fields are filled
      if (!name || !description || !category || !condition || !price || 
          !geoLocation || Object.keys(geoLocation).length === 0 
          // || !images || images.length === 0
        ) {
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
      setAiInput(`Please analyze the provided images along with the following item details to provide an accurate price estimation:
        Item Details:
        - Name: ${name}
        - Description: ${description}
        - Location: ${JSON.stringify(geoLocation)}
        - Category: ${category}
        - Base Price Reference: ${price} EGP
        - Condition: ${condition}
        
        Please examine the uploaded images carefully and provide:
        1. Visual condition assessment based on the images
        2. Brand/model identification if visible
        3. Quality and wear analysis from the images
        4. Market value estimation considering visual condition
        
        please return ONLY a JSON response in this format:
        {
        "estimated_price": [number in EGP],
        "name_translations": { "en": "...", "ar": "..." },
        "description_translations": { "en": "...", "ar": "..." },
        "city_translations": { "en": "...", "ar": "..." },
        "street_translations": { "en": "...", "ar": "..." }
        }`)
          
      setIsEstimating(true)
    // Use enhanced AI function with automatic retry (3 attempts, starting with 1 second delay)
    const aiResponse = await sendMessage(aiInput, aiSystemPrompt, 3, 1000)
    
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
    console.log("Parsed AI Response:", jsonObject)
    console.log("Estimated Price:", jsonObject.estimated_price)
    console.log("Name Translations:", jsonObject.name_translations)
    console.log("Description Translations:", jsonObject.description_translations)
    
    // Validate the parsed response
    if (!jsonObject.estimated_price || jsonObject.estimated_price === 0) {
      throw new Error("AI returned invalid price estimation")
    }
    
    setAiResponse(jsonObject)
    setAiPriceEstimation(jsonObject.estimated_price)
    
    // Show success message with attempt info
    if (aiResponse.attempt > 1) {
      toast({
        title: t("success") || "Success",
        description: `AI price estimation successful after ${aiResponse.attempt} attempts!`,
        variant: "default",
      })
    }
    
    setIsEstimating(false)
    }
    } catch (error) {
      console.error("Error getting AI price estimate:", error)
      
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
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsEstimating(false)
    }
  }


  const onSubmit = async (data) => {
    if (imagesFile.length === 0) {
      toast({
        title: t("error") || "ERROR",
        description: t("Pleaseuploaleastimageyouritem") || "Please upload at least one image of your item.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await handleSubmit()
      console.log("Form data:", data)
      console.log("Images:", imagesFile)
    } catch (error) {
      console.error("Error creating item:", error)
      toast({
        title: t("error") || "ERROR",
        description: t("FailedtocreateitemPleasetryagain") || "Failed to create item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    const files = imagesFile
    const formValues = form.getValues()
    
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
    
    const payload = {  
      ...formValues, 
      geo_location: geoLocation, 
      value_estimate: aiPriceEstimation,
      translations: translationsToSend.length > 0 ? translationsToSend : undefined
    }

    if (files.length === 0) {
      toast({
        title: t("error") || "ERROR",
        description: t("Pleasefillallfieldsandselectatleastoneimage") || "Please fill all fields and select at least one image.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Payload being sent:", payload)
      console.log("Translations being sent:", translationsToSend)
      
      const updateItem = await updateProduct(payload, files, id)
      if (updateItem.success) {
        const hasTranslations = translationsToSend.length > 0
        toast({
          title: t("successfully") || "Successfully",
          description: `Item updated successfully with images${hasTranslations ? ' and translations' : ''}!`,
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        title: t("error") || "ERROR",
        description: `${err.message}` || t("Errorupdatingitem") || "Error updating item.",
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
    imagesFile.length > 0 &&
    !!form.watch("value_estimate") &&
    form.watch("allowed_categories")?.length > 0





  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-center min-h-screen bg-background py-2 px-2 md:px-2 "
    >
      <div className="w-full">
        <Form {...form} >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 ">
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
                                  className="transition-all duration-200 bg-background border-input focus:ring-2 focus:ring-ring/20 focus:border-ring"

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
                                  <SelectValue placeholder={t("SelectCountry")} />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-input">
                                  {countriesList.map((country) => (
                                    <SelectItem key={country} value={country} className="text-right ">
                                      {t(country)}
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

                      {/* Category and Condition */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("category")||"Category"}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <motion.div variants={inputVariants} whileFocus="focus">
                                    <SelectTrigger className="rounded-lg bg-background border-input text-foreground focus:border-ring focus:ring-2 focus:ring-ring">
                                      <SelectValue placeholder={t("SelectACategory")} />
                                    </SelectTrigger>
                                  </motion.div>
                                </FormControl>
                                <SelectContent>
                                  {categoriesName.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {t(category)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                                <SelectContent>
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
                    {/* Images & Value */}
                    <div>
                      <FormLabel className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        {t("images")}
                      </FormLabel>
                      <div className="mt-2 grid grid-cols-3 gap-4">
                        <AnimatePresence>
                          {imageUrls.map((url, index) => (
                            <motion.div
                              key={index}
                              variants={imageVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              layout
                            >
                              <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                                <div className="aspect-square relative">
                                  <Image
                                    src={url || "/placeholder.svg"}
                                    alt={`${t("images")} ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="absolute right-1 top-1"
                                >
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-6 w-6 rounded-full"
                                    onClick={() => removeImage(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </motion.div>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {imagesFile.length < MAX_IMAGES && (
                          <motion.div
                            variants={imageVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Card className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 hover:border-primary hover:bg-muted transition-all shadow-sm">
                              <CardContent className="flex h-full w-full flex-col items-center justify-center p-4">
                                <label htmlFor="image-upload" className="cursor-pointer text-center">
                                  <motion.div
                                    className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
                                    whileHover={{ scale: 1.1, backgroundColor: "rgba(73, 197, 182, 0.2)" }}
                                  >
                                    <Upload className="h-5 w-5 text-primary" />
                                  </motion.div>
                                  <p className="text-xs text-muted-foreground">{t("Clicktoupload")}</p>
                                  <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    className="hidden bg-background border-input"
                                    onChange={handleImageUpload}
                                  />
                                </label>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t("UploadUpTo")} {MAX_IMAGES} {t("images")} (JPEG, PNG, WebP, {t("max5MBEach")})
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
                                        key={category}
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
                            <div className="flex items-center justify-between">
                              <FormLabel>{t("aIExpectedPrice")} ( {t("LE")} )</FormLabel>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={()=>{requestAiPriceEstimate()}}
                                        disabled={isEstimating}
                                        className="h-8 gap-1"
                                      >
                                        <AnimatePresence mode="wait">
                                          {isEstimating ? (
                                            <motion.div
                                              key="estimating"
                                              initial={{ opacity: 0 }}
                                              animate={{ opacity: 1 }}
                                              exit={{ opacity: 0 }}
                                              className="flex items-center gap-1"
                                            >
                                              <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                              >
                                                <Loader2 className="h-3 w-3" />
                                              </motion.div>
                                              {t("Estimating")}
                                            </motion.div>
                                          ) : (
                                            <motion.div
                                              key="estimate"
                                              initial={{ opacity: 0 }}
                                              animate={{ opacity: 1 }}
                                              exit={{ opacity: 0 }}
                                              className="flex items-center gap-1"
                                            >
                                              <Info className="h-3 w-3" />
                                              {t("GetAIEstimate")}
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </Button>
                                    </motion.div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t("GetAIEstimateTooltip")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <FormControl>
                              <motion.div variants={inputVariants} whileFocus="focus">
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  {...field}
                                  className="transition-all bg-background border-input duration-200 focus:ring-2 focus:ring-ring/20 focus:border-ring"
                                />
                              </motion.div>
                            </FormControl>
                            <AnimatePresence>
                              {aiPriceEstimation !== null && (
                                <motion.p
                                  className="text-xs text-primary font-medium"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                >
                                  {t("aIExpectedPrice")} {t("LE")}{aiPriceEstimation}
                                </motion.p>
                              )}
                            </AnimatePresence>
                            <FormDescription className="text-muted-foreground">{t("SetAFairMarketValue")}</FormDescription>
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
                        onClick={() => onSubmit()}
                        type="submit"
                        disabled={!isStep2Valid}
                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 transition-all"
                      >
                        {t("save")}
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
