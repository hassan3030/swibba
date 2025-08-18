"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, Info, Loader2, ImageIcon, DollarSign, Package } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { getImageProducts } from "@/callAPI/products"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { categoriesName, itemsStatus, allowedCategories, countriesList } from "@/lib/data"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"
import { updateProduct } from "@/callAPI/products"

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
    price,
    city,
    country,
    street,
    images,
  } = props
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
    value_estimate: z.coerce.number().positive("Value must be greater than 0"),
    allowedCategories: z.array(z.enum(allowedCat)).min(1, "Select at least one category"),
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

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name,
      description: description,
      category: category,
      status_item: status_item,
      value_estimate: value_estimate || 0,
      allowed_categories: allowed_categories,
      status_swap: status_swap,
      price: price,
      city: city,
      country: country,
      street: street,
    },
  })

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

  const requestAiPriceEstimate = async () => {
    const { name, description, category, status_item } = form.getValues()
    console.log("Requesting AI estimate for:", { name, description, category, status_item })

    if (!name || !description || !category || !status_item) {
      toast({
        title: t("error") || "ERROR",
        description: "Please fill in the item name, description, category, and condition for an AI price estimate.",
        variant: "destructive",
      })
      return
    }

    setIsEstimating(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const mockEstimate = Math.floor(Math.random() * 1000) + 100
      setAiPriceEstimation(mockEstimate)
      form.setValue("value_estimate", mockEstimate)
    } catch (error) {
      console.error("Error getting AI price estimate:", error)
      toast({
        title: t("error") || "ERROR",
        description: "Failed to get AI price estimate. Please try again or enter your own estimate.",
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
        description: "Please upload at least one image of your item.",
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
        description: "Failed to create item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    const files = imagesFile
    const payload = { ...form.getValues() }

    if (files.length === 0) {
      toast({
        title: t("error") || "ERROR",
        description: "Please fill all fields and select at least one image.",
        variant: "destructive",
      })
      return
    }

    try {
      const updateItem = await updateProduct(payload, files, id)
      if (updateItem) {
        toast({
          title: t("successfully") || "Successfully",
          description: "Item updated successfully with images!",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        title: t("error") || "ERROR",
        description: `${err.message}` || "Error updating item.",
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
    !!form.watch("street")

  const isStep2Valid =
    imagesFile.length > 0 &&
    !!form.watch("value_estimate") &&
    form.watch("allowed_categories")?.length > 0





  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-2 md:px-8"
    >
      <div className="w-full max-w-3xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-8 md:grid-cols-1 rounded-2xl shadow-xl bg-white p-6 md:p-10">
              <div className="grid gap-8 md:grid-cols-1">
                {step === 1 && (
                  <motion.div className="space-y-6" variants={sectionVariants}>
                    <div className="space-y-2">
                      <motion.h2
                        className="text-2xl font-bold bg-gradient-to-r text-[rgb(242,178,48)] bg-clip-text text-transparent"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {t("ItemDetails")}
                      </motion.h2>
                      <motion.p
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        {t("ProvideDetailsAboutYourItem")}
                      </motion.p>
                    </div>

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
                                  className="transition-all duration-200 focus:ring-2 focus:ring-[#f2b230]/20 focus:border-[#f2b230]"
                                />
                              </motion.div>
                            </FormControl>
                            <FormDescription> {t("BeSpecificAboutBrandModelAndKeyFeatures")}</FormDescription>
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
                                  className="transition-all duration-200 focus:ring-2 focus:ring-[#f2b230]/20 focus:border-[#f2b230]"
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
                                <SelectTrigger>
                                  <SelectValue placeholder={t("SelectCountry")} />
                                </SelectTrigger>
                                <SelectContent>
                                  {countriesList.map((country) => (
                                    <SelectItem key={country} value={country} className="text-right">
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
                                  className="transition-all duration-200 focus:ring-2 focus:ring-[#f2b230]/20 focus:border-[#f2b230]"
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
                                  className="transition-all duration-200 focus:ring-2 focus:ring-[#f2b230]/20 focus:border-[#f2b230]"
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
                                  className="min-h-[120px] transition-all duration-200 focus:ring-2 focus:border-[#f2b230] focus:ring-[#f2b230]/20"
                                  {...field}
                                />
                              </motion.div>
                            </FormControl>
                            <FormDescription>
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
                                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:border-[#f2b230] focus:ring-[#f2b230]/20">
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
                                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:border-[#f2b230] focus:ring-[#f2b230]/20">
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
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!isStep1Valid}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f2b230] to-[#967b43] text-white font-semibold shadow-md hover:from-[#ecb649] hover:to-[#8b5b3a] transition-all"
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
                        <ImageIcon className="h-4 w-4 text-[#f2b230]" />
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
                            <Card className="flex aspect-square items-center justify-center border-2 border-dashed border-[#f2b230]/30 hover:border-[#f2b230] transition-colors cursor-pointer">
                              <CardContent className="flex h-full w-full flex-col items-center justify-center p-4">
                                <label htmlFor="image-upload" className="cursor-pointer text-center">
                                  <motion.div
                                    className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#f2b230]/10"
                                    whileHover={{ scale: 1.1, backgroundColor: "rgba(73, 197, 182, 0.2)" }}
                                  >
                                    <Upload className="h-5 w-5 text-[#f2b230]" />
                                  </motion.div>
                                  <p className="text-xs text-muted-foreground">{t("Clicktoupload")}</p>
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
                        {t("UploadUpTo")} {MAX_IMAGES} {t("images")} (JPEG, PNG, WebP, {t("max5MBEach")})
                      </p>
                    </div>

                  

          

                    {/* Allowed Categories */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="allowed_categories"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">
                                {t("Whatwillyouacceptinreturn")}
                              </FormLabel>
                              <FormDescription>
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
                                  className="transition-all duration-200 focus:ring-2 focus:ring-[#f2b230]/20 focus:border-[#f2b230]"
                                />
                              </motion.div>
                            </FormControl>
                            <AnimatePresence>
                              {aiPriceEstimation !== null && (
                                <motion.p
                                  className="text-xs text-[#f2b230] font-medium"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                >
                                  {t("aIExpectedPrice")} {t("LE")}{aiPriceEstimation}
                                </motion.p>
                              )}
                            </AnimatePresence>
                            <FormDescription>{t("SetAFairMarketValue")}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex flex-col-2 gap-2">
                      <Button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f2b230] to-[#967b43] text-white font-semibold shadow-md hover:from-[#ecb649] hover:to-[#8b5b3a] transition-all"
                      >
                        {t("goBack")}
                      </Button>
                      <Button
                        onClick={() => onSubmit()}
                        type="submit"
                        disabled={!isStep2Valid}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f2b230] to-[#967b43] text-white font-semibold shadow-md hover:from-[#ecb649] hover:to-[#8b5b3a] transition-all"
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
