"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, Info, Loader2, Navigation, MapPin } from "lucide-react"
import Image from "next/image"
import { itemsStatus, categoriesName, allowedCategories } from "@/lib/data"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { addProduct } from "@/callAPI/products"

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
  const router = useRouter()
  const [images, setImages] = useState([])
  const [imageUrls, setImageUrls] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiPriceEstimation, setAiPriceEstimation] = useState(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [geo_location, set_geo_location] = useState({})
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(null)
  const [selectedPosition, setSelectedPosition] = useState(null)
  const mapInstanceRef = useRef(null)
  const { toast } = useToast()
  const { t } = useTranslations()

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp" ]
  const MAX_IMAGES = 3

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
    valueEstimate: z.coerce.number().positive(t("Valuemustbegreaterthan0") || "Value must be greater than 0"),
    allowedCategories: z
      .array(z.enum(allowedCategories))
      .min(1, t("Selectatleastonecategory") || "Select at least one category"),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      status_item: "excellent",
      valueEstimate: 0,
      allowed_categories: [],
      status_swap: "available",
      price: 0,
      city: "",
      country: "",
      street: "",
      user_id: "",
    },
  })

  const handleImageUpload = (e) => {
    if (!e.target.files || e.target.files.length === 0) return

    const newFiles = Array.from(e.target.files)

    // Validate file size and type
    const validFiles = newFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: t("error") || "ERROR ",
          description: `${t("File")} ${file.name} ${
            t("istoolargeMaximumsizeis5MB") || "is too large. Maximum size is 5MB."
          }`,
          variant: "destructive",
        })
        return false
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: t("error") || "ERROR ",
          description: `${t("File")} ${file.name}  ${
            t("hasanunsupportedformatPleaseuploadJPEGPNGorWebP") ||
            "has an unsupported format. Please upload JPEG, PNG, or WebP."
          }`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    // Check if adding these files would exceed the maximum
    if (images.length + validFiles.length > MAX_IMAGES) {
      toast({
        title: t("error") || "ERROR ",
        description: `${t("Youcanuploadmaximumof") || "You can upload a maximum of"} ${MAX_IMAGES} ${
          t("images") || "images"
        }.`,
        variant: "destructive",
      })
      return
    }

    // Create URLs for preview
    const newImageUrls = validFiles.map((file) => URL.createObjectURL(file))

    setImages((prev) => [...prev, ...validFiles])
    setImageUrls((prev) => [...prev, ...newImageUrls])
  }

  const removeImage = (index) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imageUrls[index])

    setImages((prev) => prev.filter((_, i) => i !== index))
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const requestAiPriceEstimate = async () => {
    const { name, description, category, condition, price } = form.getValues()

    if (!name || !description || !category || !condition) {
      toast({
        title: t("error") || "ERROR ",
        description:
          t("PleasedescriptioncategoryconditionAIpriceestimate") ||
          "Please fill in the item name, description, category, and condition for an AI price estimate.",
        variant: "destructive",
      })
      return
    }

    setIsEstimating(true)

    try {
      // Simulate AI processing time
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Base price factors - either from user input or category-based defaults
      const basePrice = parseFloat(price) || getCategoryBasePrice(category)
      
      // Condition factors - how condition affects value
      const conditionFactors = {
        "new": 1.0,
        "excellent": 0.85,
        "good": 0.7,
        "fair": 0.5,
        "poor": 0.3
      }
      
      // Category-specific depreciation rates
      const categoryDepreciationRates = {
        "electronics": 0.25, // Electronics depreciate faster
        "clothing": 0.4,
        "furniture": 0.15,
        "books": 0.1,
        "toys": 0.2,
        "sports": 0.15,
        "automotive": 0.2,
        "jewelry": 0.05, // Jewelry holds value better
        "collectibles": 0.05,
        "art": 0.02
      }
      
      // Market demand multiplier (could be based on real market data)
      const marketDemandMultiplier = getMarketDemandMultiplier(category)
      
      // Image quality factor (placeholder - in a real system this would analyze images)
      const imageQualityFactor = images.length > 0 ? 1.05 : 0.95
      
      // Calculate the estimated value
      let estimatedValue = basePrice
      
      // Apply condition adjustment
      const conditionFactor = conditionFactors[condition] || 0.7
      estimatedValue *= conditionFactor
      
      // Apply category-specific depreciation
      const depreciationRate = categoryDepreciationRates[category] || 0.2
      estimatedValue *= (1 - depreciationRate)
      
      // Apply market demand
      estimatedValue *= marketDemandMultiplier
      
      // Apply image quality factor
      estimatedValue *= imageQualityFactor
      
      // Add slight randomness to make it feel more "AI-like" (±5%)
      const randomFactor = 0.95 + (Math.random() * 0.1)
      estimatedValue *= randomFactor
      
      // Round to nearest whole number
      const finalEstimate = Math.round(estimatedValue)
      
      setAiPriceEstimation(finalEstimate)
      form.setValue("valueEstimate", finalEstimate)
      
      console.log("AI Price Estimation Details:", {
        basePrice,
        condition,
        conditionFactor,
        category,
        depreciationRate,
        marketDemandMultiplier,
        imageQualityFactor,
        randomFactor,
        finalEstimate
      })
    } catch (error) {
      console.error("Error getting AI price estimate:", error)
      toast({
        title: t("error") || "ERROR ",
        description:
          t("FailedtogetAIpriceestimatePleasetryagainorenteryourownestimate") ||
          "Failed to get AI price estimate. Please try again or enter your own estimate.",
        variant: "destructive",
      })
    } finally {
      setIsEstimating(false)
    }
  }
  
  // Helper function to get base price by category
  const getCategoryBasePrice = (category) => {
    const basePrices = {
      "electronics": 500,
      "clothing": 50,
      "furniture": 200,
      "books": 15,
      "toys": 25,
      "sports": 75,
      "automotive": 300,
      "jewelry": 200,
      "collectibles": 100,
      "art": 150
    }
    return basePrices[category] || 100
  }
  
  // Helper function to simulate market demand
  const getMarketDemandMultiplier = (category) => {
    // Simulated market demand (in a real app, this could come from an API)
    const marketDemand = {
      "electronics": 1.2, // High demand
      "clothing": 0.9,
      "furniture": 0.85,
      "books": 0.7,
      "toys": 0.8,
      "sports": 1.1,
      "automotive": 0.95,
      "jewelry": 1.15,
      "collectibles": 1.3, // Very high demand
      "art": 1.25
    }
    return marketDemand[category] || 1.0
  }

  const onSubmit = async (data, event) => {
    if (event) event.preventDefault();
    if (images.length === 0) {
      toast({
        title: t("error") || "ERROR ",
        description: t("Pleaseuploaleastimageyouritem") || "Please upload at least one image of your item.",
        variant: "destructive",
      })
      console.log("No images uploaded")
      return;
    }

    setIsSubmitting(true)

    try {
      await handleSubmit()
      console.log("Form data:", data)
      console.log("Images:", images)
      // No navigation or refresh here
    } catch (error) {
      console.error("Error creating item:", error)
      toast({
        title: t("error") || "ERROR ",
        description: "Failed to create item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
            message = t("Locationinformationisunavailable") || "Location request timed out"
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
      const payload = { ...form.getValues(), geo_location }
      console.log("Payload:", payload)
      console.log("geo_location:", geo_location)

      await addProduct(payload, files)

      toast({
        title: t("successfully"),
        description: t("Itemaddedsuccessfullywithimage") || "Item added successfully with images!",
      })

      form.reset()
      setImages([])
      setImageUrls([])
      // router.refresh()
    } catch (err) {
      console.error(err)
      toast({
        title: t("error") || "ERROR ",
        description: err.message || t("Erroraddingitem") || "Error adding item.",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Form {...form}>
        <form
          onSubmit={(e) => form.handleSubmit((data) => onSubmit(data, e))(e)}
          className="space-y-8"
        >
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left column - Basic details */}
            <motion.div className="space-y-6" variants={itemVariants}>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{t("ItemDetails") || "Item Details"}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("Providedetailedinformationunderstandoffering") ||
                    "Provide detailed information about your item to help others understand what you're offering."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <motion.div  >
                  <Button
                    onClick={() => {
                      handleSubmit()
                    }}
                  >
                    {t("CreateListing") || "Creating new product"}
                  </Button>
                </motion.div>

                {/* Name field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ItemName") || "Item Name"}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., MacBook Pro 16-inch 2021" {...field} />
                      </FormControl>
                      <FormDescription>
                        {t("Bespecificaboutbrandmodelkeyfeatures") ||
                          "Be specific about brand, model, and key features."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location section */}
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-5 w-5" />
                        Current Position
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button onClick={getCurrentPosition} disabled={isGettingLocation} className="w-full">
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
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                {t("SelectedPosition") || "Selected Position"}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-sm">
                                  <strong>{t("Name") || "Name"}:</strong> {selectedPosition.name}
                                </p>
                                <p className="text-sm">
                                  <strong>{t("Latitude") || "Latitude"}:</strong> {selectedPosition.lat.toFixed(6)}
                                </p>
                                <p className="text-sm">
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

                {/* Price field */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("price") || "Price"}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 500" {...field} type="number" />
                      </FormControl>
                      <FormDescription></FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Country field */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Country") || "Country"}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Egypt" {...field} />
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
                      <FormLabel>{t("City") || "City"}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("e.g., Sohage") || "e.g., Sohage"} {...field} />
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
                      <FormLabel>{t("Street") || "Street"}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("egOmarebnElkhtab") || "e.g., Omar ebn Elkhtab"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("description") || "Description"}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          t("Describeyouritemndetailincludingconditionfeaturesandanyrelevanthistory") ||
                          "Describe your item in detail, including condition, features, and any relevant history."
                        }
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("detailsprovidethemorelikelyfindgoodswap") ||
                        "The more details you provide, the more likely you are to find a good swap."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Category field */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("category") || "Category"}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Selectacategory") || "Select a category"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

                {/* Condition field */}
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Condition") || "Condition"}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("SelectCondition") || "Select condition"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
            </motion.div>

            {/* Right column - Images and value */}
            <motion.div className="space-y-6" variants={itemVariants}>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{t("ImagesValue") || "Images & Value"}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("Uploadclearphotosofyouritemandsetitsestimatedvalue") ||
                    "Upload clear photos of your item and set its estimated value"}
                </p>
              </div>

              {/* Image upload section */}
              <div>
                <FormLabel>{t("ItemImages") || "Item Images"}</FormLabel>
                <div className="mt-2 grid grid-cols-3 gap-4">
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
                        <Card className="relative overflow-hidden">
                          <div className="aspect-square relative">
                            <Image
                              src={url || "/placeholder.svg"}
                              alt={`Item image ${index + 1}`}
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

                  {images.length < MAX_IMAGES && (
                    <motion.div variants={imageUploadVariants} initial="hidden" animate="visible" whileHover="hover">
                      <Card className="flex aspect-square items-center justify-center">
                        <CardContent className="flex h-full w-full flex-col items-center justify-center p-4">
                          <label htmlFor="image-upload" className="cursor-pointer text-center">
                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                              <Upload className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">{t("Clicktoupload") || "Click to upload"}</p>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
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
                  {t("Uploadupto") || "Upload up to"} {MAX_IMAGES} {t("images") || "images"} (JPEG, PNG, WebP, max 5MB
                  each)
                </p>
              </div>

              {/* Value estimation section */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="valueEstimate"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>{t("aIExpectedPrice") || "Estimated Value"} ($)</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={requestAiPriceEstimate}
                                  disabled={isEstimating}
                                  className="h-8 gap-1"
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
                      <FormControl>
                        <Input type="number" min="0" step="1" {...field} />
                      </FormControl>
                      <AnimatePresence>
                        {aiPriceEstimation !== null && (
                          <motion.p
                            className="text-xs text-[#49c5b6]"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            {t("AIsuggestsvalueof") || "AI suggests a value of"} ${aiPriceEstimation}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <FormDescription>
                        {t("Setfairmarketvaluetohelpfacilitatebalancedswaps") ||
                          "Set a fair market value to help facilitate balanced swaps."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Allowed categories section */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="allowed_categories"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">
                          {t("Whatwillyouacceptinreturn") || "What will you accept in return?"}
                        </FormLabel>
                        <FormDescription>
                          {t("Selectthecategoriesofitemsyourewillingtoacceptinexchange") ||
                            "Select the categories of items you're willing to accept in exchange"}
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
                                  className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-3"
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
                                  <FormLabel className="font-normal capitalize px-1">
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
            </motion.div>
          </div>

          {/* Submit buttons */}
          <motion.div className="flex justify-end gap-4" variants={itemVariants}>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button type="button" variant="outline" onClick={() => router.push("/profile")}>
                {t("Cancel") || "Cancel"}
              </Button>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                type="submit"
                className="bg-[#49c5b6] hover:bg-[#3db6a7]"
                disabled={isSubmitting}
                onClick={() => {
                  handleSubmit()
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("CreateListing") || "Create Listing...."}
                  </>
                ) : (
                  <>{t("CreateListing") || "Create Listing"}</>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  )
}
