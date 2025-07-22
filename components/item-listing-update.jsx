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
import { categoriesName, itemsStatus, allowedCategories } from "@/lib/data"
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

export function ItemListingUpdate({
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
}) {
  const router = useRouter()
  const [imagesFile, setImagesFile] = useState([])
  const [imageUrls, setImageUrls] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiPriceEstimation, setAiPriceEstimation] = useState(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [product, setProduct] = useState(name)
  const [bigImage, setBigImage] = useState("")
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
          description: `File ${file.name} has an unsupported format. Please upload JPEG, PNG, or WebP.`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    if (imagesFile.length + validFiles.length > MAX_IMAGES) {
      toast({
        title: t("error") || "ERROR",
        description: `You can upload a maximum of ${MAX_IMAGES} images.`,
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
    const { name, description, category, condition } = form.getValues()

    if (!name || !description || !category || !condition) {
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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left column - Basic details */}
            <motion.div className="space-y-6" variants={sectionVariants}>
              <div className="space-y-2">
                <motion.h2
                  className="text-2xl font-bold bg-gradient-to-r from-[#49c5b6] to-[#3db6a7] bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Item Details
                </motion.h2>
                <motion.p
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Provide detailed information about your item to help others understand what you're offering.
                </motion.p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    onClick={() => {
                      handleSubmit()
                    }}
                    className="bg-[#49c5b6] hover:bg-[#3db6a7] text-white font-semibold"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Update Item
                  </Button>
                </motion.div>

                {/* Name field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <motion.div variants={inputVariants} whileFocus="focus">
                          <Input
                            placeholder="e.g., MacBook Pro 16-inch 2021"
                            {...field}
                            className="transition-all duration-200 focus:ring-2 focus:ring-[#49c5b6]/20"
                          />
                        </motion.div>
                      </FormControl>
                      <FormDescription>Be specific about brand, model, and key features.</FormDescription>
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
                        <DollarSign className="h-4 w-4 text-[#49c5b6]" />
                        Price
                      </FormLabel>
                      <FormControl>
                        <motion.div variants={inputVariants} whileFocus="focus">
                          <Input
                            placeholder="Enter price"
                            {...field}
                            type="number"
                            className="transition-all duration-200 focus:ring-2 focus:ring-[#49c5b6]/20"
                          />
                        </motion.div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location fields */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <motion.div variants={inputVariants} whileFocus="focus">
                          <Input
                            placeholder="e.g., Egypt"
                            {...field}
                            className="transition-all duration-200 focus:ring-2 focus:ring-[#49c5b6]/20"
                          />
                        </motion.div>
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
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <motion.div variants={inputVariants} whileFocus="focus">
                          <Input
                            placeholder="e.g., Sohage"
                            {...field}
                            className="transition-all duration-200 focus:ring-2 focus:ring-[#49c5b6]/20"
                          />
                        </motion.div>
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
                      <FormLabel>Street</FormLabel>
                      <FormControl>
                        <motion.div variants={inputVariants} whileFocus="focus">
                          <Input
                            placeholder="e.g., Omar ebn Elkhtab"
                            {...field}
                            className="transition-all duration-200 focus:ring-2 focus:ring-[#49c5b6]/20"
                          />
                        </motion.div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <motion.div variants={inputVariants} whileFocus="focus">
                        <Textarea
                          placeholder="Describe your item in detail, including condition, features, and any relevant history."
                          className="min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-[#49c5b6]/20"
                          {...field}
                        />
                      </motion.div>
                    </FormControl>
                    <FormDescription>
                      The more details you provide, the more likely you are to find a good swap.
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
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <motion.div variants={inputVariants} whileFocus="focus">
                            <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-[#49c5b6]/20">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </motion.div>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
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
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <motion.div variants={inputVariants} whileFocus="focus">
                            <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-[#49c5b6]/20">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </motion.div>
                        </FormControl>
                        <SelectContent>
                          {conditions.map((condition) => (
                            <SelectItem key={condition} value={condition}>
                              {condition}
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
            <motion.div className="space-y-6" variants={sectionVariants}>
              <div className="space-y-2">
                <motion.h2
                  className="text-2xl font-bold bg-gradient-to-r from-[#49c5b6] to-[#3db6a7] bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Images & Value
                </motion.h2>
                <motion.p
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Upload clear photos of your item and set its estimated value.
                </motion.p>
              </div>

              {/* Image Upload */}
              <div>
                <FormLabel className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#49c5b6]" />
                  Item Images
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

                  {imagesFile.length < MAX_IMAGES && (
                    <motion.div
                      variants={imageVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card className="flex aspect-square items-center justify-center border-2 border-dashed border-[#49c5b6]/30 hover:border-[#49c5b6] transition-colors cursor-pointer">
                        <CardContent className="flex h-full w-full flex-col items-center justify-center p-4">
                          <label htmlFor="image-upload" className="cursor-pointer text-center">
                            <motion.div
                              className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#49c5b6]/10"
                              whileHover={{ scale: 1.1, backgroundColor: "rgba(73, 197, 182, 0.2)" }}
                            >
                              <Upload className="h-5 w-5 text-[#49c5b6]" />
                            </motion.div>
                            <p className="text-xs text-muted-foreground">Click to upload</p>
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
                  Upload up to {MAX_IMAGES} images (JPEG, PNG, WebP, max 5MB each)
                </p>
              </div>

              {/* Value Estimation */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="value_estimate"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Estimated Value ($)</FormLabel>
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
                                        Estimating...
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
                                        Get AI Estimate
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Get an AI-powered price estimate based on your item details</p>
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
                            className="transition-all duration-200 focus:ring-2 focus:ring-[#49c5b6]/20"
                          />
                        </motion.div>
                      </FormControl>
                      <AnimatePresence>
                        {aiPriceEstimation !== null && (
                          <motion.p
                            className="text-xs text-[#49c5b6] font-medium"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            AI suggests a value of ${aiPriceEstimation}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <FormDescription>Set a fair market value to help facilitate balanced swaps.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Allowed Categories */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="allowed_categories"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">What will you accept in return?</FormLabel>
                        <FormDescription>
                          Select the categories of items you're willing to accept in exchange.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {allowedCat.map((category, index) => (
                          <FormField
                            key={category}
                            control={form.control}
                            name="allowed_categories"
                            render={({ field }) => {
                              return (
                                <motion.div
                                  key={category}
                                  className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-3 hover:bg-muted/50 transition-colors"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  whileHover={{ scale: 1.02 }}
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(category)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, category])
                                          : field.onChange(field.value?.filter((value) => value !== category))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">{category}</FormLabel>
                                </motion.div>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </motion.div>
          </div>

          {/* Submit Buttons */}
          <motion.div
            className="flex justify-end gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button type="button" variant="outline" onClick={() => router.push("/profile")}>
                Cancel
              </Button>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                type="submit"
                className="bg-[#49c5b6] hover:bg-[#3db6a7] text-white font-semibold"
                disabled={isSubmitting}
              >
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.div
                      key="updating"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="mr-2"
                      >
                        <Loader2 className="h-4 w-4" />
                      </motion.div>
                      Updating...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="update"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Update Item
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  )
}
