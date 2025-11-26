import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateProduct } from '@/callAPI/products'
import { extractId, slugify, getTranslationValue } from './helpers'
import { createFormSchema } from '../item-add-new/form-schema'

export interface ItemData {
  id: string
  name: string
  description: string
  category: string
  sub_category?: string
  brand?: string
  model?: string
  status_item: string
  value_estimate?: number
  allowed_categories?: string[]
  status_swap?: string
  geo_location?: any
  price: number
  city?: string
  country?: string
  street?: string
  images?: any[]
  translations?: any[]
  quantity: number
}

export const useItemFormUpdate = (
  t: (key: string) => string,
  toast: any,
  user: any,
  geo_location: any,
  aiPriceEstimation: number | null,
  aiResponse: any,
  newImages: File[],
  existingImages: any[],
  deletedImageIds: string[],
  retainedFileIds: string[],
  filteredSubCategories: any[],
  filteredBrands: any[],
  filteredModels: any[],
  allCategories: any[],
  itemData: ItemData,
  isRTL: boolean
) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const formSchema = createFormSchema(t)

  // Get initial values from translations based on current language
  const getInitialValue = (field: string, fallback: string = '') => {
    return getTranslationValue(itemData.translations, field, isRTL, fallback)
  }

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: getInitialValue('name', itemData.name),
      slug: slugify(getInitialValue('name', itemData.name)),
      description: getInitialValue('description', itemData.description),
      category: itemData.category || '',
      sub_category: itemData.sub_category || 'none',
      brand: itemData.brand || 'none',
      model: itemData.model || 'none',
      status_item: (itemData.status_item || 'excellent') as any,
      value_estimate: itemData.value_estimate || aiPriceEstimation || 0,
      allowed_categories: itemData.allowed_categories || ([] as any[]),
      status_swap: itemData.status_swap || 'available',
      price: itemData.price || 1,
      quantity: itemData.quantity || 1,
      city: getInitialValue('city', itemData.city || ''),
      country: itemData.country || '',
      street: getInitialValue('street', itemData.street || ''),
      user_id: '',
    },
  })

  // Update form values when language changes
  useEffect(() => {
    if (itemData.translations && itemData.translations.length > 0) {
      const name = getTranslationValue(itemData.translations, 'name', isRTL, itemData.name)
      const description = getTranslationValue(itemData.translations, 'description', isRTL, itemData.description)
      const city = getTranslationValue(itemData.translations, 'city', isRTL, itemData.city || '')
      const street = getTranslationValue(itemData.translations, 'street', isRTL, itemData.street || '')

      form.setValue('name', name)
      form.setValue('description', description)
      form.setValue('city', city)
      form.setValue('street', street)
    }
  }, [isRTL, itemData.translations])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    const totalImages = existingImages.length + newImages.length
    if (totalImages === 0) {
      toast({
        title: t('error') || 'ERROR',
        description: t('Pleaseuploaleastimageyouritem') || 'Please upload at least one image of your item.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Get selected sub_category, brand, and model objects for translations
      const selectedSubCategoryId = form.getValues('sub_category')
      const selectedBrandId = form.getValues('brand')
      const selectedModelId = form.getValues('model')

      const selectedSubCategory =
        selectedSubCategoryId && selectedSubCategoryId !== 'none'
          ? filteredSubCategories.find((subCat) => {
              const subCatId = extractId(subCat.id)
              return subCatId === selectedSubCategoryId
            })
          : null

      const selectedBrand =
        selectedBrandId && selectedBrandId !== 'none'
          ? filteredBrands.find((brand) => {
              const brandId = extractId(brand.id)
              return brandId === selectedBrandId
            })
          : null

      const selectedModel =
        selectedModelId && selectedModelId !== 'none'
          ? filteredModels.find((model) => {
              const modelId = extractId(model.id)
              return modelId === selectedModelId
            })
          : null

      const selectedCategoryName = form.getValues('category')
      const selectedCategory =
        selectedCategoryName
          ? allCategories.find((cat) => {
              const catId = extractId(cat.id)
              return cat.name === selectedCategoryName || catId === selectedCategoryName
            })
          : null

      // Helper to get translation by language code
      const getTranslation = (item: any, languagesCode: string) => {
        if (!item) return null
        if (item.translations && Array.isArray(item.translations)) {
          const translation = item.translations.find((t: any) => t.languages_code === languagesCode)
          if (translation) return translation.name || item.name || null
          if (languagesCode === 'en-US' && item.translations[0]) return item.translations[0].name || item.name || null
          if (languagesCode === 'ar-SA' && item.translations[1]) return item.translations[1].name || item.name || null
        }
        return item.name || null
      }

      // Build translations
      let translationsToSend = []

      if (aiResponse && aiResponse.name_translations) {
        // AI provided new translations
        translationsToSend = [
          {
            languages_code: 'en-US',
            name: aiResponse.name_translations.en,
            slug: slugify(aiResponse.name_translations.en),
            description: aiResponse.description_translations.en,
            city: aiResponse.city_translations.en,
            street: aiResponse.street_translations.en,
            sub_category: getTranslation(selectedSubCategory, 'en-US'),
            brand: getTranslation(selectedBrand, 'en-US'),
            model: getTranslation(selectedModel, 'en-US'),
          },
          {
            languages_code: 'ar-SA',
            name: aiResponse.name_translations.ar,
            slug: slugify(aiResponse.name_translations.ar),
            description: aiResponse.description_translations.ar,
            city: aiResponse.city_translations.ar,
            street: aiResponse.street_translations.ar,
            sub_category: getTranslation(selectedSubCategory, 'ar-SA'),
            brand: getTranslation(selectedBrand, 'ar-SA'),
            model: getTranslation(selectedModel, 'ar-SA'),
          },
        ]
      } else if (itemData.translations && itemData.translations.length > 0) {
        // Update existing translations with current form values for current language
        const currentName = form.getValues('name')
        const currentDescription = form.getValues('description')
        const currentCity = form.getValues('city')
        const currentStreet = form.getValues('street')

        translationsToSend = itemData.translations.map((translation: any) => {
          const isCurrentLanguage =
            (!isRTL && translation.languages_code === 'en-US') ||
            (isRTL && translation.languages_code === 'ar-SA')

          if (isCurrentLanguage) {
            return {
              ...translation,
              name: currentName,
              slug: slugify(currentName),
              description: currentDescription,
              city: currentCity,
              street: currentStreet,
              sub_category: getTranslation(selectedSubCategory, translation.languages_code),
              brand: getTranslation(selectedBrand, translation.languages_code),
              model: getTranslation(selectedModel, translation.languages_code),
            }
          } else {
            return {
              ...translation,
              sub_category: getTranslation(selectedSubCategory, translation.languages_code),
              brand: getTranslation(selectedBrand, translation.languages_code),
              model: getTranslation(selectedModel, translation.languages_code),
            }
          }
        })
      } else {
        // No existing translations - create new ones
        const currentName = form.getValues('name')
        const currentDescription = form.getValues('description')
        const currentCity = form.getValues('city')
        const currentStreet = form.getValues('street')

        const enTranslation = {
          languages_code: 'en-US',
          name: currentName,
          slug: slugify(currentName),
          description: currentDescription,
          city: currentCity,
          street: currentStreet,
          sub_category: getTranslation(selectedSubCategory, 'en-US'),
          brand: getTranslation(selectedBrand, 'en-US'),
          model: getTranslation(selectedModel, 'en-US'),
        }

        const arTranslation = {
          languages_code: 'ar-SA',
          name: currentName,
          slug: slugify(currentName),
          description: currentDescription,
          city: currentCity,
          street: currentStreet,
          sub_category: getTranslation(selectedSubCategory, 'ar-SA'),
          brand: getTranslation(selectedBrand, 'ar-SA'),
          model: getTranslation(selectedModel, 'ar-SA'),
        }

        translationsToSend = isRTL ? [arTranslation, enTranslation] : [enTranslation, arTranslation]
      }

      // Get form values and exclude fields that don't exist in the Items collection
      const formValues = form.getValues()
      const { level_1, level_2, user_id, slug, ...cleanFormValues } = formValues as any

      const payload = {
        ...cleanFormValues,
        geo_location,
        value_estimate: aiPriceEstimation || itemData.value_estimate,
        translations: translationsToSend.length > 0 ? translationsToSend : undefined,
        retained_image_file_ids: retainedFileIds,
        deleted_image_file_ids: deletedImageIds,
        sub_category: selectedSubCategoryId && selectedSubCategoryId !== 'none' ? selectedSubCategoryId : 'none',
        brand: selectedBrandId && selectedBrandId !== 'none' ? selectedBrandId : 'none',
        model: selectedModelId && selectedModelId !== 'none' ? selectedModelId : 'none',
      }

      const result = await updateProduct(payload, newImages, itemData.id)
      
      if (result.success) {
        toast({
          title: t('successfully') || 'Success',
          description: t('Itemupdatedsuccessfully') || 'Item updated successfully!',
        })
        router.push('/profile/items')
      } else {
        throw new Error(result.error || 'Failed to update item')
      }
    } catch (err: any) {
      console.error(err)
      toast({
        title: t('error') || 'ERROR',
        description: err.message || t('Errorupdatingitem') || 'Error updating item.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    isSubmitting,
    handleSubmit,
  }
}
