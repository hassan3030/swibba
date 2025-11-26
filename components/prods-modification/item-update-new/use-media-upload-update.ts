import { useState, useEffect } from 'react'
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES, MAX_IMAGES } from './constants'
import { mediaURL } from '@/callAPI/utiles'
import { removeProductImage } from '@/callAPI/products'

export interface ExistingImage {
  fileId: string
  url: string
  type: string
}

export const useMediaUploadUpdate = (
  toast: any,
  t: (key: string) => string,
  formGetValues: any,
  initialImages?: any[]
) => {
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImageUrls, setNewImageUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])
  const [isMediaDirty, setIsMediaDirty] = useState(false)

  // Initialize existing images from props
  useEffect(() => {
    if (!initialImages || initialImages.length === 0) return

    // Check if images already have directus_files_id (direct structure)
    if (initialImages[0] && initialImages[0].directus_files_id) {
      const list = initialImages.map((img) => ({
        fileId: img.directus_files_id.id,
        url: `${mediaURL}${img.directus_files_id.id}`,
        type: img.directus_files_id.type || 'image/jpeg',
      }))
      setExistingImages(list)
    }
  }, [initialImages])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const files = Array.from(e.target.files)

    // Validate file size and type
    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: t('error') || 'ERROR',
          description: `${t('File')} ${file.name} ${t('istoolargeMaximumsizeis5MB') || 'is too large. Maximum size is 100MB.'}`,
          variant: 'destructive',
        })
        return false
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: t('error') || 'ERROR',
          description: `${t('File')} ${file.name} ${t('hasanunsupportedformatPleaseuploadJPEGPNGorWebP') || 'has an unsupported format.'}`,
          variant: 'destructive',
        })
        return false
      }
      return true
    })

    // Check total count (existing + new)
    const totalCount = existingImages.length + newImages.length + validFiles.length
    if (totalCount > MAX_IMAGES) {
      toast({
        title: t('error') || 'ERROR',
        description: `${t('Youcanuploadmaximumof') || 'You can upload a maximum of'} ${MAX_IMAGES} ${t('images') || 'images'}.`,
        variant: 'destructive',
      })
      return
    }

    // Create URLs for preview
    const urls = validFiles.map((file) => URL.createObjectURL(file))

    setNewImages((prev) => [...prev, ...validFiles])
    setNewImageUrls((prev) => [...prev, ...urls])
    setIsMediaDirty(true)
  }

  const removeImage = (index: number) => {
    const existingCount = existingImages.length

    if (index < existingCount) {
      // Remove existing image
      const fileId = existingImages[index].fileId
      setDeletedImageIds((prev) => [...prev, fileId])
      setExistingImages((prev) => prev.filter((_, i) => i !== index))
    } else {
      // Remove new image
      const newIndex = index - existingCount
      URL.revokeObjectURL(newImageUrls[newIndex])
      setNewImages((prev) => prev.filter((_, i) => i !== newIndex))
      setNewImageUrls((prev) => prev.filter((_, i) => i !== newIndex))
    }
    setIsMediaDirty(true)
  }

  const removeExistingImage = async (itemId: string, fileId: string) => {
    try {
      setDeletedImageIds((prev) => [...prev, fileId])
      setExistingImages((prev) => prev.filter((img) => img.fileId !== fileId))
      setIsMediaDirty(true)
      
      // Try to remove from server
      const result = await removeProductImage(itemId, fileId)
      if (result.success) {
        toast({ title: t('success') || 'Success', description: t('ImageRemoved') || 'Image removed.' })
      }
    } catch (error) {
      toast({ 
        title: t('ImageRemovedFromPreview') || 'Image removed from preview', 
        description: t('WillBeRemovedOnSave') || 'Will be removed on save.' 
      })
    }
  }

  // Combined image URLs for display (existing + new)
  const allImageUrls = [
    ...existingImages.map((img) => img.url),
    ...newImageUrls,
  ]

  // Retained file IDs (existing images not deleted)
  const retainedFileIds = existingImages.map((img) => img.fileId)

  const resetMedia = () => {
    newImageUrls.forEach((url) => URL.revokeObjectURL(url))
    setNewImages([])
    setNewImageUrls([])
    setDeletedImageIds([])
    setIsMediaDirty(false)
  }

  return {
    newImages,
    existingImages,
    allImageUrls,
    deletedImageIds,
    retainedFileIds,
    isMediaDirty,
    handleImageUpload,
    removeImage,
    removeExistingImage,
    resetMedia,
    totalImagesCount: existingImages.length + newImages.length,
  }
}
