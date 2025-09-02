"use client"

import { useState , useEffect} from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, Info, Loader2, Navigation, MapPin } from "lucide-react"
import Image from "next/image"
import { itemsStatus, categoriesName, allowedCategories } from "@/lib/data"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"
import {countriesList} from "@/lib/data"; 
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { addProduct } from "@/callAPI/products"
import { sendMessage } from "@/callAPI/aiChat"
import { useLanguage } from "@/lib/language-provider"
import {  decodedToken } from "@/callAPI/utiles"
import { getUserById } from "@/callAPI/users"

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
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

const imageUploadVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
}

export function ItemListingForm() {
  const [images, setImages] = useState([])
  const [imageUrls, setImageUrls] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiPriceEstimation, setAiPriceEstimation] = useState(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [geo_location, set_geo_location] = useState({})
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(null) 
  const [selectedPosition, setSelectedPosition] = useState(null)
//AI chat
  const [aiResponse, setAiResponse] = useState(null)
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [aiInput, setAiInput] = useState("")
  const [aiSystemPrompt, setAiSystemPrompt] = useState("You are an expert product appraiser and translator that analyzes both text descriptions and visual images to provide accurate price estimations. You can identify products, assess their condition from photos, and provide realistic market valuations. You also provide high-quality translations between Arabic and English. IMPORTANT: Respond ONLY with valid JSON - no markdown, no code blocks, no extra text, just the JSON object.")
  const [aiReply, setAiReply] = useState(null)
  const [user, setUser] = useState()

  const { toast } = useToast()
  const { t } = useTranslations()
  const { isRTL, toggleLanguage } = useLanguage()

  const MAX_FILE_SIZE = 100 * 1024 * 1024 // 5MB
  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp" , "video/mp4" , "video/mov" , "video/avi" , "video/mkv" , "video/webm" , "video/flv" , "video/wmv" , "video/mpeg" , "video/mpg" , "video/m4v" , "video/m4a" , "video/m4b" , "video/m4p" , "video/m4v" , "video/m4a" , "video/m4b" , "video/m4p", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/m4b", "audio/m4p"]
  const MAX_IMAGES = 4

  const formSchema = z.object({
    name: z
      .string()
      .min(3, t("Namemustbeatleast3characters") || "Name must be at least 3 characters")
      .max(100, t("Namemustbelessthan100characters") || "Name must be less than 100 characters"),
    description: z
      .string()
      .min(20, t("Descriptiomustbeatleast20characters") || "Description must be at least 20 characters")
      .max(2000, t("Descriptionmustbelessthan2000characters") || "Description must be less than 2000 characters"),
    category: z.enum(categoriesName),
    condition: z.string(),
    // value_estimate: z.coerce.number().positive(t("Valuemustbegreaterthan0") || "Value must be greater than 0"),
    allowed_categories: z
      .array(z.enum(allowedCategories))
      .min(1, t("Selectatleastonecategory") || "Select at least one category"),
    price: z.coerce.number().positive(t("Pricecannotbenegative") || "Price cannot be negative"),
    country: z.string().min(1, t("SelectCountry") || "Select country"),
    city: z.string().min(1, t("Cityisrequired") || "City is required"),
    street: z.string().min(1, t("Streetisrequired") || "Street is required"),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      status_item: "excellent",
      value_estimate:aiPriceEstimation || 0,
      allowed_categories: [],
      status_swap: "available",
      price: 1,
      city: "",
      country: "",
      street: "",
      user_id: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  })
const getUser = async () => {
  const decoded = await decodedToken()
  if (decoded) {
    const user = await getUserById(decoded.id)
    setUser(user.data)
  }
}
// const { isRTL, toggleLanguage } = useLanguage()

  useEffect(() => {
    getUser()
    console.error("user", user)
    // console.error("isRTL", isRTL)
    // console.error("toggleLanguage", toggleLanguage)
  }, [isRTL])
  const handleImageUpload = (e) => {
    // Require basic form fields before allowing image upload
    const { name, description, category, condition, price, country, city, street } = form.getValues();
    if (!name || !description || !category || !condition || !price || !country || !city || !street) {
      toast({
        title: t("error") || "ERROR ",
        description: t("Pleasefillallitemdetailsbeforeuploadingimages") || "Please fill all item details before uploading images.",
        variant: "destructive",
      });
      return;
    }

    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);

    // Validate file size and type
    const validFiles = newFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: t("error") || "ERROR ",
          description: `${t("File")} ${file.name} ${(t("istoolargeMaximumsizeis5MB") || "is too large. Maximum size is 5MB.")}`,
          variant: "destructive",
        });
        return false;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: t("error") || "ERROR ",
          description: `${t("File")} ${file.name} ${(t("hasanunsupportedformatPleaseuploadJPEGPNGorWebP") || "has an unsupported format. Please upload JPEG, PNG, or WebP.")}`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    // Check if adding these files would exceed the maximum
    if (images.length + validFiles.length > MAX_IMAGES) {
      toast({
        title: t("error") || "ERROR ",
        description: `${t("Youcanuploadmaximumof") || "You can upload a maximum of"} ${MAX_IMAGES} ${(t("images") || "images")}.`,
        variant: "destructive",
      });
      return;
    }

    // Create URLs for preview
    const newImageUrls = validFiles.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...validFiles]);
    setImageUrls((prev) => [...prev, ...newImageUrls]);
  };

  const removeImage = (index) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imageUrls[index])

    setImages((prev) => prev.filter((_, i) => i !== index))
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const requestAiPriceEstimate = async () => {
    const { name, description, category, condition, price } = form.getValues()
  
    try {
      // Check if all required fields are filled
      if (!name || !description || !category || !condition || !price || 
          !geo_location || Object.keys(geo_location).length === 0 || 
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
      setAiInput(`Please analyze the provided images along with the following item details to provide an accurate price estimation:
        Item Details:
        - Name: ${name}
        - Description: ${description}
        - Location: ${JSON.stringify(geo_location)}
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
    const aiResponse = await sendMessage(aiInput, aiSystemPrompt)
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
    
    setAiResponse(jsonObject)
    setAiPriceEstimation(jsonObject.estimated_price)
    setIsEstimating(false)
    }
    } catch (error) {
      console.error("Error getting AI price estimate:", error)
      console.error("AI Response text:", aiResponse?.text)
      
      let errorMessage = t("FailedtogetAIpriceestimatePleasetryagainorenteryourownestimate") ||
        "Failed to get AI price estimate. Please try again or enter your own estimate."
      
      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        errorMessage = "AI response format error. Please try again."
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
  
  // Helper function to get base price by category
  
  
  
  const onSubmit = async (data, event) => {
    if (event) event.preventDefault();

    const { name, description, category, condition, price, country, city, street, allowed_categories } = form.getValues();
    if (!name || !description || !category || !condition || !price || !country || !city || !street || !allowed_categories || allowed_categories.length === 0) {
      toast({
        title: t("error") || "ERROR ",
        description: t("Pleasefillallitemdetails") || "Please fill all item details before submitting.",
        variant: "destructive",
      });
      return;
    }
    if (images.length === 0) {
      toast({
        title: t("error") || "ERROR ",
        description: t("Pleaseuploaleastimageyouritem") || "Please upload at least one image of your item.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await handleSubmit();
      console.log("Form data:", data);
      console.log("Images:", images);
      // After successful add, go back to step 1
      setStep(1)
    } catch (error) {
      console.error("Error creating item:", error);
      toast({
        title: t("error") || "ERROR ",
        description: "Failed to create item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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

  const handleSubmit = async () => {
    let files = images
    if (files.length === 0) {
      toast({
        title: t("error") || "ERROR ",
        description: t("Pleaseuploaleastimageyouritem") || "Please upload at least one image of your item.",
        variant: "destructive",
      })
      return
    }

    try {
    getUser()

      const payload = { 
        ...form.getValues(), 
        user_email: user.email,
        geo_location,
        value_estimate: aiPriceEstimation ,
        translations: [
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
        ],
      }
      console.log("Payload:", payload)
      console.log("geo_location:", geo_location)
      console.log("aiPriceEstimation:", aiPriceEstimation)

      await addProduct(payload, files)

      toast({
        title: t("successfully"),
        description: t("Itemaddedsuccessfullywithimage") || "Item added successfully with images!",
      })

      form.reset()
      setImages([])
      setImageUrls([])
      set_geo_location({})
      setSelectedPosition(null)
      setAiResponse(null)
      setAiPriceEstimation(null)
      setStep(1)
    } catch (err) {
      console.error(err)
      toast({
        title: t("error") || "ERROR ",
        description: err.message || t("Erroraddingitem") || "Error adding item.",
        variant: "destructive",
      })
      throw err
    }
  }

  const [step, setStep] = useState(1);

  // Validation for step 1 fields
  const isStep1Valid = 
    form.watch("name")?.length >= 3 &&
    form.watch("description")?.length >= 20 &&
    !!form.watch("category") &&
    !!form.watch("condition") &&
    !!form.watch("price") &&
    Object.keys(geo_location).length > 0 
    
   
  // Validation for step 2 fields
  const isStep2Valid = images.length > 0 &&
    aiPriceEstimation !== null &&
    aiPriceEstimation > 0 &&
    form.watch("allowed_categories")?.length > 0 &&
    images.length > 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-center min-h-screen w-full py-2 px-0 sm:px-0 lg:px-8 bg-background text-foreground"
    >
      <div className="w-full ">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 px-0"
          >
            <div className="grid gap-2 max-[370px]:px-1  md:grid-cols-1 rounded-2xl shadow-xl bg-card text-card-foreground p-6 md:p-10 border border-border">
              {step === 1 && (
                <motion.div className="space-y-2 max-[370px]:mx-2 max-[370px]:max-w-[calc(100%-theme(spacing.6))]" variants={itemVariants}>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">{t("ItemDetails") || "Item Details"}</h2>
                  </div>

                  <div className="grid w-full gap-2 ">
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">{t("Name") || "Name"}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., MacBook Pro 16-inch 2021" {...field} className="rounded-lg bg-background border-input text-foreground focus:border-ring focus:ring-2 focus:ring-ring transition-all" />
                          </FormControl>
                          <FormDescription className="text-muted-foreground">
                            {t("Bespecificaboutbrandmodelkeyfeatures") ||
                              "Be specific about brand, model, and key features."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">{t("price") || "Price"}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 500" {...field} type="number" min={1}      
                      className="rounded-lg bg-background border-input text-foreground focus:border-ring focus:ring-2 focus:ring-ring transition-all"
                        />
                       
                          </FormControl>
                          <FormDescription></FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">{t("Country") || "Country"}</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || ""}
                            >
                              <SelectTrigger className="bg-background border-input text-foreground focus:border-ring focus:ring-2 focus:ring-ring">
                                <SelectValue placeholder={t("SelectCountry") || "Select country/countries"} />
                              </SelectTrigger>
                              <SelectContent className="bg-background border-input text-foreground">
                                {countriesList.map((country) => (
                                  <SelectItem key={country} value={country} className="text-right">
                                    { t(country) || country }
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">{t("City") || "City"}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("e.g., Sohage") || "e.g., Sohage"} {...field} className="rounded-lg bg-background border-input text-foreground focus:border-ring focus:ring-2 focus:ring-ring transition-all" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">{t("Street") || "Street"}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("egOmarebnElkhtab") || "e.g., Omar ebn Elkhtab"} {...field} className="rounded-lg bg-background border-input text-foreground focus:border-ring focus:ring-2 focus:ring-ring transition-all" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-foreground">{t("description") || "Description"}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={
                              t("Describeyouritemndetailincludingconditionfeaturesandanyrelevanthistory") ||
                              "Describe your item in detail, including condition, features, and any relevant history."
                            }
                            className="min-h-[120px] rounded-lg bg-background border-input text-foreground focus:border-ring focus:ring-2 focus:ring-ring transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-muted-foreground">
                          {t("detailsprovidethemorelikelyfindgoodswap") ||
                            "The more details you provide, the more likely you are to find a good swap."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-2 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">{t("category") || "Category"}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="bg-background border-input text-foreground focus:border-ring focus:ring-2 focus:ring-ring">
                                <SelectValue placeholder={t("Selectacategory") || "Select a category"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-background border-input text-foreground">
                              {categoriesName.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {t(category) || category}
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
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">{t("Condition") || "Condition"}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background border-input text-foreground focus:border-ring focus:ring-2 focus:ring-ring">
                                <SelectValue placeholder={t("SelectCondition") || "Select condition"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-background border-input text-foreground">
                              {itemsStatus.map((condition) => (
                                <SelectItem key={condition} value={condition} className="capitalize">
                                  {t(condition) || condition}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    
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
                    className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 transition-all"
                  >
                    {t("continue") || "Continue"}
                  </Button>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div className="space-y-2 max-[370px]:mx-2 max-[370px]:max-w-[calc(100%-theme(spacing.6))]" variants={itemVariants}>

                  <div className="space-y-2 ">
                    <FormField
                      control={form.control}
                      name="allowed_categories"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel className="text-base font-semibold text-foreground">
                              {t("Whatwillyouacceptinreturn") || "What will you accept in return?"}
                            </FormLabel>
                            <FormDescription className="text-muted-foreground">
                              {t("Selectthecategoriesofitemsyourewillingtoacceptinexchange") ||
                                "Select the categories of items you're willing to accept in exchange"}
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
                                      className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-border bg-muted p-4 shadow-sm hover:border-primary transition-all"
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
                                      <FormLabel className="font-normal capitalize text-foreground">
                                        {t(category) || category}
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

                  
                  <div className="space-y-2">
                    <FormLabel className="font-semibold text-foreground">{t("ItemImages") || "Item Images"}</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      <AnimatePresence>
                        {imageUrls.map((url, index) => (
                          <motion.div
                            key={index}
                            variants={imageUploadVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            whileHover="hover"
                          >
                            <Card className="relative overflow-hidden rounded-xl shadow-md border border-border bg-card">
                              <div className="aspect-square relative">
                                <Image
                                  src={url || "/placeholder.svg"}
                                  alt={`Item image ${index + 1}`}
                                  fill
                                  className="object-cover rounded-xl"
                                />
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="absolute right-2 top-2"
                              >
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="h-7 w-7 rounded-full shadow-md"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {images.length < MAX_IMAGES && (
                        <motion.div 
                        variants={imageUploadVariants} initial="hidden" animate="visible" whileHover="hover">
                          <Card className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 hover:border-primary hover:bg-muted transition-all shadow-sm">
                            <CardContent className="flex h-full w-full flex-col items-center justify-center p-4">
                              <label htmlFor="image-upload" className="cursor-pointer text-center">
                                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                  <Upload className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-xs text-primary font-semibold">{t("Clicktoupload") || "Click to upload"}</p>
                                <input
                                  id="image-upload"
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,video/mp4,video/mov,video/avi,video/mkv,video/webm,video/flv,video/wmv,video/mpeg,video/mpg,video/m4v,video/m4a,video/m4b,video/m4p,audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/m4b,audio/m4p"
                                  multiple
                                  className="hidden"
                                  onChange={handleImageUpload}
                                />
                              </label>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t("Uploadupto") || "Upload up to"} <span className="font-bold text-primary">{MAX_IMAGES}</span> {t("images") || "images"} (JPEG, PNG, WebP, max 5MB each)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-foreground">{t("AIValueEstimation") || "AI Value Estimation"}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("GetAIpoweredpriceestimateandchooseacceptablecategories") ||
                        "Get AI-powered price estimate and choose acceptable categories"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="value_estimate"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild >
                                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className=" max-[370px]:w-full">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {requestAiPriceEstimate() }}
                                      disabled={isEstimating}
                                      className="h-8 gap-1 rounded-lg max-[370px]:min-w-[100%] border-input bg-background text-foreground hover:bg-muted hover:border-primary transition-all"
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
                                    </Button>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {t("GetAIpoweredpriceestimatebasedonyouritemdetails") ||
                                      "Get an AI-powered price estimate based on your item details"}
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
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          onClick={() => setStep(1)}
                          className="w-full py-2 rounded-xl bg-muted text-muted-foreground font-semibold shadow-md hover:bg-muted/80 transition-all"
                        >
                          {t("Back") || "Back"}
                        </Button>
                        <Button
                          type="submit"
                          disabled={!isStep2Valid || isSubmitting}
                          className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 transition-all"
                        >
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("save") || "Save"}
                        </Button>
                      </div>
                </motion.div>
              )}
            </div>
          </form>
        </Form>
      </div>
    </motion.div>
  )
}