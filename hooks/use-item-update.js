import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { useTranslations } from '@/lib/use-translations'
import { updateProduct } from '@/callAPI/products'
import { sendMessage } from '@/callAPI/aiChat'
import { decodedToken } from '@/callAPI/utiles'
import { getUserById } from '@/callAPI/users'

export const useItemUpdate = (initialData) => {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslations()
  
  // State management
  const [imagesFile, setImagesFile] = useState([])
  const [imageUrls, setImageUrls] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [retainedExistingFileIds, setRetainedExistingFileIds] = useState([])
  const [deletedImageIds, setDeletedImageIds] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMediaDirty, setIsMediaDirty] = useState(false)
  const [aiPriceEstimation, setAiPriceEstimation] = useState(initialData.value_estimate || 0)
  const [isEstimating, setIsEstimating] = useState(false)
  const [product, setProduct] = useState(initialData.name)
  const [bigImage, setBigImage] = useState("")
  const [step, setStep] = useState(1)
  const [geoLocation, setGeoLocation] = useState(initialData.geo_location || {})
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(
    initialData.geo_location && Object.keys(initialData.geo_location).length > 0 
      ? initialData.geo_location 
      : null
  )
  const [currentPosition, setCurrentPosition] = useState(null)
  const [isMapRefreshing, setIsMapRefreshing] = useState(false)
  const [aiResponse, setAiResponse] = useState(null)
  const [isAiLoading, setIsAiLoading] = useState(false)

  // Initialize existing images
  useEffect(() => {
    if (initialData.images && initialData.images.length > 0) {
      const imageData = initialData.images.map(img => ({
        fileId: img.directus_files_id.id,
        url: `${process.env.NEXT_PUBLIC_MEDIA_URL || 'https://deel-deal-directus.csiwm3.easypanel.host/assets/'}${img.directus_files_id.id}`,
        id: img.directus_files_id.id
      }))
      setExistingImages(imageData)
      setRetainedExistingFileIds(imageData.map(img => img.fileId))
      setBigImage(imageData[0]?.url || "")
    }
  }, [initialData.images])

  // AI Price Estimation
  const handleAiEstimation = async () => {
    if (!product || product.length < 3) {
      toast({
        title: t("error") || "ERROR",
        description: t("Pleaseenterproductnamefirst") || "Please enter a product name first.",
        variant: "destructive",
      })
      return
    }

    setIsEstimating(true)
    try {
      const response = await sendMessage(
        `Please estimate the market value for this item: ${product}. Consider factors like brand, condition, age, and current market trends. Provide only a numerical value without currency symbols or text.`
      )
      
      const estimatedValue = parseFloat(response.replace(/[^\d.]/g, ''))
      if (!isNaN(estimatedValue) && estimatedValue > 0) {
        setAiPriceEstimation(estimatedValue)
        toast({
          title: t("AIEstimationComplete") || "AI Estimation Complete",
          description: `${t("EstimatedValue") || "Estimated value"}: $${estimatedValue}`,
        })
      } else {
        throw new Error("Invalid estimation received")
      }
    } catch (error) {
      console.error("AI estimation error:", error)
      toast({
        title: t("AIEstimationFailed") || "AI Estimation Failed",
        description: t("UnabletogetAIestimationPleasetryagain") || "Unable to get AI estimation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEstimating(false)
    }
  }

  // Location handling
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: t("LocationNotSupported") || "Location Not Supported",
        description: t("Geolocationisnotsupportedbythisbrowser") || "Geolocation is not supported by this browser.",
        variant: "destructive",
      })
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        setCurrentPosition(newLocation)
        setSelectedPosition(newLocation)
        setGeoLocation(newLocation)
        setIsGettingLocation(false)
        toast({
          title: t("LocationRetrieved") || "Location Retrieved",
          description: t("Yourlocationhasbeensuccessfullyretrieved") || "Your location has been successfully retrieved.",
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
      }
    )
  }

  // Form submission
  const handleSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      // Prepare translations
      const translationsToSend = []
      if (data.name !== initialData.name || data.description !== initialData.description) {
        const user = await decodedToken()
        const userData = await getUserById(user.id)
        
        translationsToSend.push({
          languages_id: userData.data.language_id,
          name: data.name,
          description: data.description,
          city: data.city,
          street: data.street,
        })
      }

      const payload = {
        ...data,
        geo_location: selectedPosition,
        value_estimate: aiPriceEstimation,
        retained_image_file_ids: retainedExistingFileIds,
        deleted_image_file_ids: deletedImageIds,
        translations: translationsToSend
      }

      const updateItem = await updateProduct(payload, imagesFile, initialData.id)
      
      if (updateItem.success) {
        const hasTranslations = translationsToSend.length > 0
        toast({
          title: t("successfully") || "Successfully",
          description: `Item updated successfully with images${hasTranslations ? ' and translations' : ''}!`,
        })
        router.push('/profile/my-items')
      } else {
        throw new Error(updateItem.error || "Failed to update item")
      }
    } catch (err) {
      setIsSubmitting(false)
      console.error("Update error:", err)
      toast({
        title: t("error") || "ERROR",
        description: err.message || t("FailedtoupdateitemPleasetryagain") || "Failed to update item. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Image handling
  const handleImageUpload = (files) => {
    const newFiles = Array.from(files)
    setImagesFile(prev => [...prev, ...newFiles])
    setIsMediaDirty(true)
    
    // Create preview URLs
    const newUrls = newFiles.map(file => URL.createObjectURL(file))
    setImageUrls(prev => [...prev, ...newUrls])
  }

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      const imageToRemove = existingImages[index]
      setDeletedImageIds(prev => [...prev, imageToRemove.fileId])
      setRetainedExistingFileIds(prev => prev.filter(id => id !== imageToRemove.fileId))
      setExistingImages(prev => prev.filter((_, i) => i !== index))
    } else {
      const newIndex = index - existingImages.length
      setImagesFile(prev => prev.filter((_, i) => i !== newIndex))
      setImageUrls(prev => prev.filter((_, i) => i !== newIndex))
    }
    setIsMediaDirty(true)
  }

  return {
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
    aiResponse,
    isAiLoading,
    
    // Setters
    setImagesFile,
    setImageUrls,
    setExistingImages,
    setRetainedExistingFileIds,
    setDeletedImageIds,
    setIsSubmitting,
    setIsMediaDirty,
    setAiPriceEstimation,
    setIsEstimating,
    setProduct,
    setBigImage,
    setStep,
    setGeoLocation,
    setIsGettingLocation,
    setSelectedPosition,
    setCurrentPosition,
    setIsMapRefreshing,
    setAiResponse,
    setIsAiLoading,
    
    // Actions
    handleAiEstimation,
    getCurrentLocation,
    handleSubmit,
    handleImageUpload,
    removeImage,
  }
}
