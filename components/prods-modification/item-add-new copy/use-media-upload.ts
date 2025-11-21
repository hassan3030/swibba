import { useState } from 'react'
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES, MAX_IMAGES } from './constants'

export const useMediaUpload = (toast: any, t: (key: string) => string, formGetValues: any) => {
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Require basic form fields before allowing image upload
    const { name, description, category, status_item, price, country, city, street, quantity } = formGetValues()
    if (!name || !description || !category || !status_item || !price || !country || !city || !street || !quantity) {
      toast({
        title: t('error') || 'ERROR',
        description:
          t('Pleasefillallitemdetailsbeforeuploadingimages') || 'Please fill all item details before uploading images.',
        variant: 'destructive',
      })
      return
    }

    if (!e.target.files || e.target.files.length === 0) return

    const newFiles = Array.from(e.target.files)

    // Validate file size and type
    const validFiles = newFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: t('error') || 'ERROR',
          description: `${t('File')} ${file.name} ${t('istoolargeMaximumsizeis5MB') || 'is too large. Maximum size is 5MB.'}`,
          variant: 'destructive',
        })
        return false
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: t('error') || 'ERROR',
          description: `${t('File')} ${file.name} ${t('hasanunsupportedformatPleaseuploadJPEGPNGorWebP') || 'has an unsupported format. Please upload JPEG, PNG, or WebP.'}`,
          variant: 'destructive',
        })
        return false
      }
      return true
    })

    // Check if adding these files would exceed the maximum
    if (images.length + validFiles.length > MAX_IMAGES) {
      toast({
        title: t('error') || 'ERROR',
        description: `${t('Youcanuploadmaximumof') || 'You can upload a maximum of'} ${MAX_IMAGES} ${t('images') || 'images'}.`,
        variant: 'destructive',
      })
      return
    }

    // Create URLs for preview
    const newImageUrls = validFiles.map((file) => URL.createObjectURL(file))

    setImages((prev) => [...prev, ...validFiles])
    setImageUrls((prev) => [...prev, ...newImageUrls])
  }

  const removeImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imageUrls[index])

    setImages((prev) => prev.filter((_, i) => i !== index))
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const resetMedia = () => {
    // Cleanup all URLs
    imageUrls.forEach((url) => URL.revokeObjectURL(url))
    setImages([])
    setImageUrls([])
  }

  return {
    images,
    imageUrls,
    handleImageUpload,
    removeImage,
    resetMedia,
    setImages,
    setImageUrls,
  }
}
