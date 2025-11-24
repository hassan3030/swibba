import { z } from 'zod'
import { itemsStatus, allowedCategories } from '@/lib/data'

export const createFormSchema = (t: (key: string) => string) => {
  return z.object({
    name: z
      .string()
      .min(3, t('Namemustbeatleast3characters') || 'Name must be at least 3 characters')
      .max(100, t('Namemustbelessthan100characters') || 'Name must be less than 100 characters'),
    slug: z
      .string()
      .min(3, 'Slug must be at least 3 characters')
      .max(100, 'Slug must be less than 100 characters'),
    description: z
      .string()
      .min(20, t('Descriptiomustbeatleast20characters') || 'Description must be at least 20 characters')
      .max(2000, t('Descriptionmustbelessthan2000characters') || 'Description must be less than 2000 characters'),
    category: z.string().min(1, t('categoryIsRequired') || 'Category is required'),
    sub_category: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    level_1: z.string().optional(),
    level_2: z.string().optional(),
    condition: z.enum(itemsStatus as any),
    status_item: z.enum(itemsStatus as any),
    allowed_categories: z
      .array(z.enum(allowedCategories as any))
      .min(1, t('Selectatleastonecategory') || 'Select at least one category'),
    price: z.coerce.number().positive(t('Pricecannotbenegative') || 'Price cannot be negative'),
    country: z.string().min(1, t('SelectCountry') || 'Select country'),
    city: z.string().min(1, t('Cityisrequired') || 'City is required'),
    street: z.string().min(1, t('Streetisrequired') || 'Street is required'),
    quantity: z
      .coerce.number({
        required_error: t('Quantityisrequired') || 'Quantity is required',
        invalid_type_error: t('Quantitymustbeanumber') || 'Quantity must be a number',
      })
      .min(1, t('Quantitymustbegreaterthan0') || 'Quantity must be greater than 0')
      .max(100, t('Quantitymustbelessthan100') || 'Quantity must be less than 100'),
  })
}

export type FormSchema = z.infer<ReturnType<typeof createFormSchema>>
