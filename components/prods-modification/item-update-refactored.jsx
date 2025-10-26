"use client"
import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod" 
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { categoriesName, itemsStatus, allowedCategories, countriesList } from "@/lib/data"
import { countriesListWithFlags } from "@/lib/countries-data"

// Import our refactored components
import { useItemUpdate } from "@/hooks/use-item-update"
import { 
  FormFieldWrapper, 
  TextField, 
  TextAreaField, 
  SelectField, 
  CheckboxField 
} from "@/components/prods-modification/form-fields"
import { ImageUploadSection } from "@/components/prods-modification/image-upload-section"
import { AIEstimationSection } from "@/components/prods-modification/ai-estimation-section"
import { LocationSection } from "@/components/prods-modification/location-section"

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
    },
  },
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  status_item: z.string().min(1, "Please select item status"),
  value_estimate: z.number().min(0, "Value estimate must be positive"),
  allowed_categories: z.array(z.string()).min(1, "Please select at least one allowed category"),
  status_swap: z.string().min(1, "Please select swap status"),
  price: z.number().min(0, "Price must be positive"),
  country: z.string().min(1, "Please select a country"),
  city: z.string().min(1, "City is required"),
  street: z.string().min(1, "Street is required"),
  geo_location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
})

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

  const { toast } = useToast()
  const { t } = useTranslations()
  const { isRTL } = useLanguage()

  // Use our custom hook for state management
  const {
    // State
    imagesFile,
    imageUrls,
    existingImages,
    retainedExistingFileIds,
    deletedImageIds,
    isSubmitting,
    isMediaDirty,
    aiPriceEstimation,
    isEstimating,
    product,
    bigImage,
    step,
    geoLocation,
    isGettingLocation,
    selectedPosition,
    currentPosition,
    isMapRefreshing,
    
    // Setters
    setAiPriceEstimation,
    setProduct,
    setBigImage,
    setStep,
    setSelectedPosition,
    setCurrentPosition,
    setIsMapRefreshing,
    
    // Actions
    handleAiEstimation,
    getCurrentLocation,
    handleSubmit,
    handleImageUpload,
    removeImage,
  } = useItemUpdate(props)

  // Form setup
  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
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

  const { formState: { isDirty } } = form

  // Update product name when form name changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.name) {
        setProduct(value.name)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, setProduct])

  // Form submission
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

  // Navigation functions
  const nextStep = () => {
    if (step === 1 && isStep1Valid) {
      setStep(2)
    }
  }

  const prevStep = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-center min-h-screen bg-background py-2 px-2 md:px-2"
    >
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <div className="grid gap-2 md:grid-cols-1 rounded-2xl shadow-xl bg-card text-card-foreground p-6 md:p-10 border border-border">
              <div className="grid gap-8 md:grid-cols-1">
                
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <motion.div className="space-y-6" variants={sectionVariants}>
                    <div className="grid gap-4">
                      <FormFieldWrapper>
                        <TextField
                          control={form.control}
                          name="name"
                          label="Name"
                          placeholder="NamePlaceholder"
                          description="BeSpecificAboutBrandModelAndKeyFeatures"
                          required
                        />
                      </FormFieldWrapper>

                      <FormFieldWrapper>
                        <TextAreaField
                          control={form.control}
                          name="description"
                          label="Description"
                          placeholder="DescriptionPlaceholder"
                          description="ProvideDetailedDescriptionOfYourItem"
                          required
                          rows={4}
                        />
                      </FormFieldWrapper>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormFieldWrapper>
                          <SelectField
                            control={form.control}
                            name="category"
                            label="Category"
                            placeholder="SelectCategory"
                            description="ChooseTheMostAppropriateCategory"
                            options={categoriesName}
                            required
                          />
                        </FormFieldWrapper>

                        <FormFieldWrapper>
                          <SelectField
                            control={form.control}
                            name="status_item"
                            label="ItemStatus"
                            placeholder="SelectItemStatus"
                            description="Describetheconditionofyouritem"
                            options={itemsStatus}
                            required
                          />
                        </FormFieldWrapper>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormFieldWrapper>
                          <TextField
                            control={form.control}
                            name="price"
                            label="Price"
                            placeholder="EnterPrice"
                            description="SetYourDesiredPrice"
                            required
                          />
                        </FormFieldWrapper>

                        <FormFieldWrapper>
                          <TextField
                            control={form.control}
                            name="quantity"
                            label="Quantity"
                            placeholder="EnterQuantity"
                            description="HowManyItemsDoYouHave"
                            required
                          />
                        </FormFieldWrapper>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormFieldWrapper>
                          <SelectField
                            control={form.control}
                            name="country"
                            label="Country"
                            placeholder="SelectCountry"
                            description="ChooseYourCountry"
                            options={countriesListWithFlags}
                            valueKey="code"
                            labelKey="name"
                            required
                          />
                        </FormFieldWrapper>

                        <FormFieldWrapper>
                          <TextField
                            control={form.control}
                            name="city"
                            label="City"
                            placeholder="EnterCity"
                            description="EnterYourCity"
                            required
                          />
                        </FormFieldWrapper>

                        <FormFieldWrapper>
                          <TextField
                            control={form.control}
                            name="street"
                            label="Street"
                            placeholder="EnterStreet"
                            description="EnterYourStreetAddress"
                            required
                          />
                        </FormFieldWrapper>
                      </div>

                      <FormFieldWrapper>
                        <SelectField
                          control={form.control}
                          name="status_swap"
                          label="SwapStatus"
                          placeholder="SelectSwapStatus"
                          description="ChooseWhetherYouWantToSwapOrSell"
                          options={[
                            { value: "available", label: "Available" },
                            { value: "unavailable", label: "Unavailable" }
                          ]}
                          required
                        />
                      </FormFieldWrapper>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!isStep1Valid}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {t("Next") || "Next"}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Media and Additional Settings */}
                {step === 2 && (
                  <motion.div className="space-y-6" variants={sectionVariants}>
                    {/* Image Upload Section */}
                    <ImageUploadSection
                      existingImages={existingImages}
                      imageUrls={imageUrls}
                      imagesFile={imagesFile}
                      onImageUpload={handleImageUpload}
                      onRemoveImage={removeImage}
                      bigImage={bigImage}
                      onSetBigImage={setBigImage}
                      isMediaDirty={isMediaDirty}
                    />

                    {/* AI Estimation Section */}
                    <AIEstimationSection
                      aiPriceEstimation={aiPriceEstimation}
                      isEstimating={isEstimating}
                      product={product}
                      onAiEstimation={handleAiEstimation}
                      onPriceEstimationChange={setAiPriceEstimation}
                    />

                    {/* Allowed Categories */}
                    <FormFieldWrapper>
                      <CheckboxField
                        control={form.control}
                        name="allowed_categories"
                        label="AllowedCategories"
                        description="SelectCategoriesYouAreWillingToSwapFor"
                        options={allowedCategories}
                      />
                    </FormFieldWrapper>

                    {/* Location Section */}
                    <LocationSection
                      geoLocation={geoLocation}
                      selectedPosition={selectedPosition}
                      currentPosition={currentPosition}
                      isGettingLocation={isGettingLocation}
                      isMapRefreshing={isMapRefreshing}
                      onGetCurrentLocation={getCurrentLocation}
                      onSetSelectedPosition={setSelectedPosition}
                      onSetCurrentPosition={setCurrentPosition}
                      onSetIsMapRefreshing={setIsMapRefreshing}
                    />

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <Button
                        type="button"
                        onClick={prevStep}
                        variant="outline"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        {t("Previous") || "Previous"}
                      </Button>

                      <Button
                        type="submit"
                        disabled={!isStep2Valid || isSubmitting}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("Updating") || "Updating..."}
                          </>
                        ) : (
                          t("UpdateItem") || "Update Item"
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
