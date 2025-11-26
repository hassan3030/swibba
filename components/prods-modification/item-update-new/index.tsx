"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { Form } from "@/components/ui/form"
import { decodedToken } from "@/callAPI/utiles"
import { getUserById } from "@/callAPI/users"
import { containerVariants, itemVariants } from "./constants"
import { useCategoryChainUpdate } from "./use-category-chain-update"
import { useLocationServiceUpdate } from "./use-location-service-update"
import { useMediaUploadUpdate } from "./use-media-upload-update"
import { useAiEstimationUpdate } from "./use-ai-estimation-update"
import { useItemFormUpdate, ItemData } from "./use-item-form-update"
import { BasicInfoSection } from "../item-add-new/basic-info-section"
import { CategorySelector } from "../item-add-new/category-selector"
import { LocationSection } from "../item-add-new/location-section"
import { DescriptionSection } from "../item-add-new/description-section"
import { AllowedCategoriesSection } from "../item-add-new/allowed-categories-section"
import { MediaUploadSectionUpdate } from "./media-upload-section-update"
import { AiEstimationSection } from "../item-add-new/ai-estimation-section"
import { StepNavigation } from "../item-add-new/step-navigation"
import { ProgressStepper } from "../item-add-new/progress-stepper"
import { FileText, MapPin, ImageIcon, Eye } from "lucide-react"

interface ItemUpdateProps extends ItemData {}

export function ItemUpdateNew(props: ItemUpdateProps) {
  const {
    id,
    name,
    description,
    category,
    sub_category,
    brand,
    model,
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

  const [step, setStep] = useState(1)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const { t } = useTranslations()
  const { isRTL } = useLanguage()

  // Fetch user data
  useEffect(() => {
    const getUser = async () => {
      const decoded = await decodedToken()
      if (decoded && typeof decoded === 'object' && 'id' in decoded) {
        const userData = await getUserById((decoded as any).id)
        if (userData.success && 'data' in userData) {
          setUser(userData.data)
        }
      }
    }
    getUser()
  }, [isRTL])

  // Initialize hooks with existing data
  const categoryChain = useCategoryChainUpdate(category, sub_category, brand, model)

  const location = useLocationServiceUpdate(
    toast,
    t,
    (field: string, value: any) => {
      form.setValue(field as any, value)
    },
    initialGeoLocation
  )

  const media = useMediaUploadUpdate(toast, t, () => form.getValues(), images)

  const ai = useAiEstimationUpdate(
    toast,
    t,
    () => form.getValues(),
    location.geo_location,
    media.newImages,
    media.existingImages,
    value_estimate
  )

  const itemData: ItemData = {
    id,
    name,
    description,
    category,
    sub_category,
    brand,
    model,
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
  }

  const { form, isSubmitting, handleSubmit } = useItemFormUpdate(
    t,
    toast,
    user,
    location.geo_location,
    ai.aiPriceEstimation,
    ai.aiResponse,
    media.newImages,
    media.existingImages,
    media.deletedImageIds,
    media.retainedFileIds,
    categoryChain.filteredSubCategories,
    categoryChain.filteredBrands,
    categoryChain.filteredModels,
    categoryChain.allCategories,
    itemData,
    isRTL
  )

  // Validation for step 1 - Basic Info
  const isStep1Valid =
    (form.watch("name")?.length ?? 0) >= 3 &&
    (form.watch("description")?.length ?? 0) >= 20 &&
    !!form.watch("category") &&
    !!form.watch("status_item") &&
    !!form.watch("price") &&
    !!form.watch("quantity")

  const getStep1Missing = () => {
    const missing = []
    if (!((form.watch("name")?.length ?? 0) >= 3)) missing.push(t("Name") || "Name")
    if (!((form.watch("description")?.length ?? 0) >= 20)) missing.push(t("description") || "Description")
    if (!form.watch("category")) missing.push(t("category") || "Category")
    if (!form.watch("status_item")) missing.push(t("Condition") || "Condition")
    if (!form.watch("price")) missing.push(t("price") || "Price")
    if (!form.watch("quantity")) missing.push(t("quantity") || "Quantity")
    return missing
  }

  // Validation for step 2 - Location
  const isStep2Valid =
    !!form.watch("country") &&
    !!form.watch("city") &&
    !!form.watch("street") &&
    Object.keys(location.geo_location).length > 0

  const getStep2Missing = () => {
    const missing = []
    if (!form.watch("country")) missing.push(t("Country") || "Country")
    if (!form.watch("city")) missing.push(t("City") || "City")
    if (!form.watch("street")) missing.push(t("Street") || "Street")
    if (!(Object.keys(location.geo_location).length > 0)) missing.push(t("locationSelected") || "Location")
    return missing
  }

  // Validation for step 3 - Media & Preferences
  const isStep3Valid =
    media.totalImagesCount > 0 &&
    (form.watch("allowed_categories")?.length ?? 0) > 0

  const getStep3Missing = () => {
    const missing = []
    if (media.totalImagesCount === 0) missing.push(t("Images") || "Images")
    if (!((form.watch("allowed_categories")?.length ?? 0) > 0)) missing.push(t("AllowedCategories") || "Allowed Categories")
    return missing
  }

  const onSubmit = async (data: any, event?: any) => {
    if (event) event.preventDefault()
     
    const { name, description, category, status_item, price, country, city, street, allowed_categories, quantity } =
      form.getValues()
      
    if (
      !name ||
      !description ||
      !category ||
      !status_item ||
      !price ||
      !country ||
      !city ||
      !street ||
      !allowed_categories ||
      allowed_categories.length === 0 ||
      !quantity
    ) {
      toast({
        title: t("error") || "ERROR",
        description: t("Pleasefillallitemdetails") || "Please fill all item details before submitting.",
        variant: "destructive",
      })
      return
    }
    
    if (media.totalImagesCount === 0) {
      toast({
        title: t("error") || "ERROR",
        description: t("Pleaseuploaleastimageyouritem") || "Please upload at least one image of your item.",
        variant: "destructive",
      })
      return
    }

    // Show hint toast if AI estimation is not available, but don't prevent saving
    if (ai.aiPriceEstimation === null || ai.aiPriceEstimation <= 0) {
      toast({
        title: t("AIEstimationRecommended") || "💡 AI Estimation Recommended",
        description:
          t("ConsidergettingAIestimatetogetbetterpriceestimate") ||
          "Consider getting an AI estimate for a better price estimation!",
        duration: 4000,
        variant: "default",
      })
    }

    try {
      await handleSubmit()
    } catch (error) {
      console.error("Error updating item:", error)
      toast({
        title: t("error") || "ERROR",
        description: t("FailedtoupdateitemPleasetryagain") || "Failed to update item. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-5xl mx-auto"
    >
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <motion.div
              className="rounded-3xl shadow-2xl bg-background dark:bg-gray-950 backdrop-blur-sm text-card-foreground border border-border/50 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Progress Stepper as Card Header */}
              <ProgressStepper
                currentStep={step}
                steps={[
                  { id: 1, title: "ItemDetails", icon: <FileText className="h-5 w-5 sm:h-6 sm:w-6" /> },
                  { id: 2, title: "Location", icon: <MapPin className="h-5 w-5 sm:h-6 sm:w-6" /> },
                  { id: 3, title: "Media", icon: <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" /> },
                  { id: 4, title: "Review", icon: <Eye className="h-5 w-5 sm:h-6 sm:w-6" /> },
                ]}
                t={t}
              />

              {/* Form Content */}
              <div className="p-6 sm:p-8 md:p-12">
                {step === 1 && (
                  <motion.div
                    className="space-y-6"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                          {t("ItemDetails") || "Item Details"}
                        </h2>
                      </div>
                    </div>

                    <div className="grid w-full gap-6">
                      <BasicInfoSection form={form} t={t} />
                      <CategorySelector
                        form={form}
                        t={t}
                        isRTL={isRTL}
                        allCategories={categoryChain.allCategories}
                        filteredSubCategories={categoryChain.filteredSubCategories}
                        filteredBrands={categoryChain.filteredBrands}
                        filteredModels={categoryChain.filteredModels}
                        selectedCategoryId={categoryChain.selectedCategoryId}
                        selectedSubCategoryId={categoryChain.selectedSubCategoryId}
                        selectedBrandId={categoryChain.selectedBrandId}
                        handleCategorySelect={(name) => {
                          form.setValue("category", name)
                          categoryChain.handleCategorySelect(name)
                        }}
                        handleSubCategorySelect={(id) => {
                          form.setValue("sub_category", id)
                          categoryChain.handleSubCategorySelect(id)
                        }}
                        handleBrandSelect={(id) => {
                          form.setValue("brand", id)
                          categoryChain.handleBrandSelect(id)
                        }}
                      />
                      <DescriptionSection form={form} t={t} />
                    </div>

                    <StepNavigation
                      step={step}
                      setStep={setStep}
                      isStepValid={isStep1Valid}
                      isSubmitting={isSubmitting}
                      onSubmit={() => handleSubmit()}
                      getStepMissing={getStep1Missing}
                      totalSteps={4}
                      t={t}
                    />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    className="space-y-6" 
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                          {t("Location") || "Location"}
                        </h2>
                      </div>
                    </div>

                    <LocationSection
                      form={form}
                      t={t}
                      geo_location={location.geo_location}
                      isGettingLocation={location.isGettingLocation}
                      selectedPosition={location.selectedPosition}
                      isMapRefreshing={location.isMapRefreshing}
                      setIsMapRefreshing={location.setIsMapRefreshing}
                      getCurrentPosition={location.getCurrentPosition}
                      handleLocationSelect={location.handleLocationSelect}
                    />

                    <StepNavigation
                      step={step}
                      setStep={setStep}
                      isStepValid={isStep2Valid}
                      isSubmitting={isSubmitting}
                      onSubmit={() => handleSubmit()}
                      getStepMissing={getStep2Missing}
                      totalSteps={4}
                      t={t}
                    />
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    className="space-y-6" 
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                          {t("Media") || "Media & Preferences"}
                        </h2>
                      </div>
                    </div>

                    <AllowedCategoriesSection form={form} t={t} />

                    <MediaUploadSectionUpdate
                      existingImages={media.existingImages}
                      newImageUrls={media.allImageUrls.slice(media.existingImages.length)}
                      handleImageUpload={media.handleImageUpload}
                      removeImage={media.removeImage}
                      t={t}
                    />

                    <StepNavigation
                      step={step}
                      setStep={setStep}
                      isStepValid={isStep3Valid}
                      isSubmitting={isSubmitting}
                      onSubmit={() => handleSubmit()}
                      getStepMissing={getStep3Missing}
                      totalSteps={4}
                      t={t}
                    />
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div 
                    className="space-y-6" 
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                          {t("Review") || "Review & Submit"}
                        </h2>
                      </div>
                    </div>

                    <AiEstimationSection
                      aiPriceEstimation={ai.aiPriceEstimation}
                      isEstimating={ai.isEstimating}
                      aiPriceEstimationHint={ai.aiPriceEstimationHint}
                      requestAiPriceEstimate={ai.requestAiPriceEstimate}
                      formData={form.getValues()}
                      images={media.newImages}
                      totalImagesCount={media.totalImagesCount}
                      t={t}
                    />

                    <StepNavigation
                      step={step}
                      setStep={setStep}
                      isStepValid={ai.aiPriceEstimation !== null && ai.aiPriceEstimation > 0}
                      isSubmitting={isSubmitting}
                      onSubmit={() => handleSubmit()}
                      getStepMissing={() => ai.aiPriceEstimation === null || ai.aiPriceEstimation <= 0 ? [t("AIEstimation") || "AI Estimation"] : []}
                      totalSteps={4}
                      t={t}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </form>
        </Form>
      </div>
    </motion.div>
  )
}
