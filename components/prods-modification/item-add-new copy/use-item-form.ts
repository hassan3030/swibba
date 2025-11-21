import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addProduct } from '@/callAPI/products'
import { getTarget, removeTarget } from '@/callAPI/utiles'
import { extractId } from './helpers'
import { createFormSchema } from './form-schema'

export const useItemForm = (
  t: (key: string) => string,
  toast: any,
  user: any,
  geo_location: any,
  aiPriceEstimation: number | null,
  aiResponse: any,
  images: File[],
  filteredSubCategories: any[],
  filteredBrands: any[],
  filteredModels: any[]
) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const formSchema = createFormSchema(t)

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      category: '',
      sub_category: 'none',
      brand: 'none',
      model: 'none',
      level_1: '',
      level_2: '',
      status_item: 'excellent' as any,
      value_estimate: aiPriceEstimation || 0,
      allowed_categories: [] as any[],
      status_swap: 'available',
      price: 1,
      quantity: 1,
      city: '',
      country: '',
      street: '',
      user_id: '',
    },
  })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const files = images
    if (files.length === 0) {
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

      // Create translations with fallbacks
      const translations = [
        {
          languages_code: 'en-US',
          name: aiResponse?.name_translations?.en || form.getValues('name'),
          description: aiResponse?.description_translations?.en || form.getValues('description'),
          city: aiResponse?.city_translations?.en || form.getValues('city'),
          street: aiResponse?.street_translations?.en || form.getValues('street'),
          sub_category: selectedSubCategory?.translations?.[0]?.name || selectedSubCategory?.name || '',
          brand: selectedBrand?.translations?.[0]?.name || selectedBrand?.name || '',
          model: selectedModel?.translations?.[0]?.name || selectedModel?.name || '',
        },
        {
          languages_code: 'ar-SA',
          name: aiResponse?.name_translations?.ar || form.getValues('name'),
          description: aiResponse?.description_translations?.ar || form.getValues('description'),
          city: aiResponse?.city_translations?.ar || form.getValues('city'),
          street: aiResponse?.street_translations?.ar || form.getValues('street'),
          sub_category: selectedSubCategory?.translations?.[1]?.name || selectedSubCategory?.name || '',
          brand: selectedBrand?.translations?.[1]?.name || selectedBrand?.name || '',
          model: selectedModel?.translations?.[1]?.name || selectedModel?.name || '',
        },
      ]

      const payload = {
        ...form.getValues(),
        user_email: user.email,
        geo_location,
        value_estimate: aiPriceEstimation,
        translations,
        category: form.getValues('category'),
        sub_category: selectedSubCategoryId && selectedSubCategoryId !== 'none' ? selectedSubCategoryId : null,
        brand: selectedBrandId && selectedBrandId !== 'none' ? selectedBrandId : null,
        model: selectedModelId && selectedModelId !== 'none' ? selectedModelId : null,
      }

      const addNewProduct = await addProduct(payload, files)
      if (addNewProduct.success) {
        toast({
          title: t('successfully'),
          description: t('Itemaddedsuccessfullywithimage') || 'Item added successfully with images!',
        })

        form.reset()

        const targetSwapId = await getTarget()
        if (targetSwapId) {
          router.push(`/swap/${targetSwapId}`)
          await removeTarget()
        } else {
          router.push('/profile/items')
        }
      }
    } catch (err: any) {
      console.error(err)
      setIsSubmitting(false)
      toast({
        title: t('error') || 'ERROR',
        description: err.message || t('Erroraddingitem') || 'Error adding item.',
        variant: 'destructive',
      })
      throw err
    }
  }

  return {
    form,
    isSubmitting,
    handleSubmit,
  }
}
