"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, Info, Loader2, Navigation, MapPin } from "lucide-react"
import Image from "next/image"
import { itemsStatus, categoriesName, allowedCategories } from "@/lib/data"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"
import {countriesList} from "@/lib/data"; // Add this import at the top (you need a countries array)
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
  const [images, setImages] = useState([])
  const [imageUrls, setImageUrls] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiPriceEstimation, setAiPriceEstimation] = useState(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [geo_location, set_geo_location] = useState({})
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(null)
  const [selectedPosition, setSelectedPosition] = useState(null)
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
    value_estimate: z.coerce.number().positive(t("Valuemustbegreaterthan0") || "Value must be greater than 0"),
    allowedCategories: z
      .array(z.enum(allowedCategories))
      .min(1, t("Selectatleastonecategory") || "Select at least one category"),
      price:  z.coerce.number().positive(t("Pricecannotbenegative") || "Price cannot be negative"),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      status_item: "excellent",
      value_estimate: 0,
      allowed_categories: [],
      status_swap: "available",
      price: 1,
      city: "",
      country: "",
      street: "",
      user_id: "",
    },
  })

  const handleImageUpload = (e) => {
    const { name, description, category, condition, price, country, city, street, allowed_categories } = form.getValues();
    if (!name || !description || !category || !condition || !price || !country || !city || !street || !allowed_categories || allowed_categories.length === 0) {
      toast({
        title: t("error") || "ERROR",
        description: t("Pleasefillallitemdetailsbeforeuploadingimages") || "Please fill all item details before uploading images.",
        variant: "destructive",
      });
      return;
    }

    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);

    const validFiles = newFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: t("error") || "ERROR",
          description: `${t("File")} ${file.name} ${(t("istoolargeMaximumsizeis5MB") || "is too large. Maximum size is 5MB.")}`,
          variant: "destructive",
        });
        return false;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: t("error") || "ERROR",
          description: `${t("File")} ${file.name} ${(t("hasanunsupportedformatPleaseuploadJPEGPNGorWebP") || "has an unsupported format. Please upload JPEG, PNG, or WebP.")}`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > MAX_IMAGES) {
      toast({
        title: t("error") || "ERROR",
        description: `${t("Youcanuploadmaximumof") || "You can upload a maximum of"} ${MAX_IMAGES} ${(t("images") || "images")}.`,
        variant: "destructive",
      });
      return;
    }

    const newImageUrls = validFiles.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...validFiles]);
    setImageUrls((prev) => [...prev, ...newImageUrls]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imageUrls[index])
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const requestAiPriceEstimate = async () => {
    const { name, description, category, condition, price } = form.getValues()

    if (!name || !description || !category || !condition) {
      toast({
        title: t("error") || "ERROR",
        description:
          t("PleasedescriptioncategoryconditionAIpriceestimate") ||
          "Please fill in the item name, description, category, and condition for an AI price estimate.",
        variant: "destructive",
      })
      return
    }

    setIsEstimating(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const basePrice = parseFloat(price) || getCategoryBasePrice(category)
      const conditionFactors = {
        "new": 1.0,
        "excellent": 0.85,
        "good": 0.7,
        "fair": 0.5,
        "poor": 0.3
      }
      const categoryDepreciationRates = {
        "electronics": 0.25,
        "clothing": 0.4,
        "furniture": 0.15,
        "books": 0.1,
        "toys": 0.2,
        "sports": 0.15,
        "automotive": 0.2,
        "jewelry": 0.05,
        "collectibles": 0.05,
        "art": 0.02
      }
      const marketDemandMultiplier = getMarketDemandMultiplier(category)
      const imageQualityFactor = images.length > 0 ? 1.05 : 0.95
      let estimatedValue = basePrice
      const conditionFactor = conditionFactors[condition] || 0.7
      estimatedValue *= conditionFactor
      const depreciationRate = categoryDepreciationRates[category] || 0.2
      estimatedValue *= (1 - depreciationRate)
      estimatedValue *= marketDemandMultiplier
      estimatedValue *= imageQualityFactor
      const randomFactor = 0.95 + (Math.random() * 0.1)
      estimatedValue *= randomFactor
      const finalEstimate = Math.round(estimatedValue)
      setAiPriceEstimation(finalEstimate)
      form.setValue("value_estimate", finalEstimate)
    } catch (error) {
      console.error("Error getting AI price estimate:", error)
      toast({
        title: t("error") || "ERROR",
        description:
          t("FailedtogetAIpriceestimatePleasetryagainorenteryourownestimate") ||
          "Failed to get AI price estimate. Please try again or enter your own estimate.",
        variant: "destructive",
      })
    } finally {
      setIsEstimating(false)
    }
  }
  
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
  
  const getMarketDemandMultiplier = (category) => {
    const marketDemand = {
      "electronics": 1.2,
      "clothing": 0.9,
      "furniture": 0.85,
      "books": 0.7,
      "toys": 0.8,
      "sports": 1.1,
      "automotive": 0.95,
      "jewelry": 1.15,
      "collectibles": 1.3,
      "art": 1.25
    }
    return marketDemand[category] || 1.0
  }

  const onValidSubmit = async (data) => {
    if (images.length === 0) {
      toast({
        title: t("error") || "ERROR",
        description: t("Pleaseuploaleastimageyouritem") || "Please upload at least one image of your item.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = { ...data, geo_location };
      await addProduct(payload, images);

      toast({
        title: t("successfully"),
        description: t("Itemaddedsuccessfullywithimage") || "Item added successfully with images!",
      });

      form.reset();
      setImages([]);
      setImageUrls([]);
      setStep(1);
    } catch (err) {
      console.error("Error creating item:", err);
      toast({
        title: t("error") || "ERROR",
        description: err.message || t("Erroraddingitem") || "Error adding item.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalidSubmit = (errors) => {
    console.log("Form errors:", errors);
    toast({
        title: t("error") || "ERROR",
        description: t("Pleasefillallrequiredfields") || "Please fill all required fields correctly before submitting.",
        variant: "destructive",
    });
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

  const [step, setStep] = useState(1);

  const isStep1Valid = form.watch("name")?.length >= 3 &&
    form.watch("description")?.length >= 20 &&
    !!form.watch("category") &&
    !!form.watch("condition") &&
    !!form.watch("price");

  const isStep2Valid = images.length > 0 &&
    !!form.watch("value_estimate") &&
    form.watch("allowed_categories")?.length > 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-center min-h-screen w-full py-8 px-4 sm:px-6 lg:px-8 bg-gray-950 text-gray-50"
    >
      <div className="w-full max-w-4xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onValidSubmit, onInvalidSubmit)}
            className="space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-1 rounded-2xl shadow-xl bg-gray-900 p-6 md:p-10 border border-gray-800">
              {step === 1 && (
                <motion.div className="space-y-6" variants={itemVariants}>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-gray-50 tracking-tight">{t("ItemDetails") || "Item Details"}</h2>
                    <p className="text-base text-gray-500 dark:text-gray-400">
                      {t("Providedetailedinformationunderstandoffering") ||
                        "Provide detailed information about your item to help others understand what you're offering."}
                    </p>
                  </div>

                  <div className="grid gap-4">
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400">{t("ItemName") || "Item Name"}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., MacBook Pro 16-inch 2021" {...field} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-50 focus:border-[#f2b230] focus:ring-2 focus:ring-[#f2b230]" />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            {t("Bespecificaboutbrandmodelkeyfeatures") ||
                              "Be specific about brand, model, and key features."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <motion.div variants={itemVariants}>
                      <Card className="rounded-xl shadow-md bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-gray-300">
                            <Navigation className="h-5 w-5 text-teal-400" />
                            {t("CurrentPosition") || "Current Position"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <motion.div variants={buttonVariants}  whileTap="tap">
                            <Button type="button" onClick={getCurrentPosition} disabled={isGettingLocation} className="w-full py-2 rounded-lg bg-teal-500/10 text-teal-300 font-medium hover:bg-teal-500/20 transition-all hover:scale-[1.02]">
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
                            <Card className="rounded-lg border border-gray-700 bg-gray-800/50 mt-4">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gray-300">
                                  <MapPin className="h-5 w-5 text-[#f2b230]" />
                                  {t("SelectedPosition") || "Selected Position"}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-400">
                                    <strong>{t("Name") || "Name"}:</strong> {selectedPosition.name}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    <strong>{t("Latitude") || "Latitude"}:</strong> {selectedPosition.lat.toFixed(6)}
                                  </p>
                                  <p className="text-sm text-gray-400">
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

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400">{t("price") || "Price"}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 500" {...field} type="number" min={1} className="rounded-lg bg-gray-800 border-gray-700 text-gray-50 focus:border-[#f2b230] focus:ring-2 focus:ring-teal-200 transition-all" />
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
                          <FormLabel className="text-gray-400">{t("Country") || "Country"}</FormLabel>
                          <FormControl>
                            <Select
                              multiple
                              searchable
                              onValueChange={field.onChange}
                              defaultValue={field.value || []}
                            >
                              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-50">
                                <SelectValue placeholder={t("SelectCountry") || "Select country/countries"} />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700 text-gray-50">
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
                          <FormLabel className="text-gray-400">{t("City") || "City"}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("e.g., Sohage") || "e.g., Sohage"} {...field} className="rounded-lg bg-gray-800 border-gray-700 text-gray-50 focus:border-[#f2b230] focus:ring-2 focus:ring-teal-200 transition-all" />
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
                          <FormLabel className="text-gray-400">{t("Street") || "Street"}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("egOmarebnElkhtab") || "e.g., Omar ebn Elkhtab"} {...field} className="rounded-lg bg-gray-800 border-gray-700 text-gray-50 focus:border-[#f2b230] focus:ring-2 focus:ring-teal-200 transition-all" />
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
                        <FormLabel className="text-gray-400">{t("description") || "Description"}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={
                              t("Describeyouritemndetailincludingconditionfeaturesandanyrelevanthistory") ||
                              "Describe your item in detail, including condition, features, and any relevant history."
                            }
                            className="min-h-[120px] rounded-lg bg-gray-800 border-gray-700 text-gray-50 focus:border-[#f2b230] focus:ring-2 focus:ring-teal-200 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          {t("detailsprovidethemorelikelyfindgoodswap") ||
                            "The more details you provide, the more likely you are to find a good swap."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400">{t("category") || "Category"}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-50">
                                <SelectValue placeholder={t("Selectacategory") || "Select a category"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-gray-50">
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
                          <FormLabel className="text-gray-400">{t("Condition") || "Condition"}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-50">
                                <SelectValue placeholder={t("SelectCondition") || "Select condition"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-gray-50">
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

                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!isStep1Valid}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#49c5b6] to-[#3db6a7] text-white font-semibold shadow-md hover:from-[#3db6a7] hover:to-[#2ea89a] transition-all"
                  >
                    {t("Continue") || "Continue"}
                  </Button>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div className="space-y-6" variants={itemVariants}>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="allowed_categories"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base font-semibold text-gray-300">
                              {t("Whatwillyouacceptinreturn") || "What will you accept in return?"}
                            </FormLabel>
                            <FormDescription className="text-gray-400">
                              {t("Selectthecategoriesofitemsyourewillingtoacceptinexchange") ||
                                "Select the categories of items you're willing to accept in exchange"}
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                                      className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-gray-700 bg-gray-800 p-4 shadow-sm hover:border-[#f2b230] transition-all"
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
                                      <FormLabel className="font-normal capitalize text-gray-300">
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
                    <h2 className="text-2xl font-semibold text-gray-50">{t("ImagesValue") || "Images & Value"}</h2>
                    <p className="text-sm text-gray-400">
                      {t("Uploadclearphotosofyouritemandsetitsestimatedvalue") ||
                        "Upload clear photos of your item and set its estimated value"}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <FormLabel className="font-semibold text-gray-300">{t("ItemImages") || "Item Images"}</FormLabel>
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
                            <Card className="relative overflow-hidden rounded-xl shadow-md border border-gray-700 bg-gray-800">
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
                          <Card className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-600 bg-gray-800/50 hover:border-teal-400 hover:bg-gray-800 transition-all shadow-sm">
                            <CardContent className="flex h-full w-full flex-col items-center justify-center p-4">
                              <label htmlFor="image-upload" className="cursor-pointer text-center">
                                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-700">
                                  <Upload className="h-6 w-6 text-teal-400" />
                                </div>
                                <p className="text-sm text-[8px]  text-teal-400 font-semibold">{t("Clicktoupload") || "Click to upload"}</p>
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
                    <p className="mt-2 text-xs text-gray-500">
                      {t("Uploadupto") || "Upload up to"} <span className="font-bold text-teal-400">{MAX_IMAGES}</span> {t("images") || "images"} (JPEG, PNG, WebP, max 5MB each)
                    </p>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="value_estimate"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between gap-2">
                            <FormLabel className="font-semibold text-gray-300">{t("aIExpectedPrice") || "Estimated Value"} ({t("le")})</FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {requestAiPriceEstimate() }}
                                      disabled={isEstimating}
                                      className="h-8 gap-1 rounded-lg border-teal-400/50 bg-gray-800 text-teal-300 hover:bg-gray-700"
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
                            <Input type="number" min="0" step="1" {...field} className="rounded-lg bg-gray-800 border-gray-700 text-gray-50 focus:border-[#f2b230] focus:ring-2 focus:ring-teal-200 transition-all" />
                          </FormControl>
                          <AnimatePresence>
                            {aiPriceEstimation !== null && (
                              <motion.p
                                className="text-xs text-teal-500 dark:text-teal-400 font-semibold"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                              >
                                {t("AIsuggestsvalueof") || "AI suggests a value of"} ${aiPriceEstimation}
                              </motion.p>
                            )}
                          </AnimatePresence>
                          <FormDescription className="text-gray-500">
                            {t("Setfairmarketvaluetohelpfacilitatebalancedswaps") ||
                              "Set a fair market value to help facilitate balanced swaps."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          type="button"
                          onClick={() => setStep(1)}
                          className="w-full py-3 rounded-xl bg-gray-900 text-gray-50 font-semibold shadow-md hover:bg-gray-600 transition-all"
                        >
                          {t("Back") || "Back"}
                        </Button>
                        <Button
                          type="submit"
                          disabled={!isStep2Valid || isSubmitting}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f2b230] to-[#967b43] text-white font-semibold shadow-md hover:from-[#ecb649] hover:to-[#8b5b3a] transition-all"
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
