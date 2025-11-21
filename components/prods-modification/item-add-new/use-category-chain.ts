import { useState, useEffect } from 'react'
import { getAllCategories, getAllSubCategories, getAllBrands, getAllModels } from '@/callAPI/static'
import { extractId } from './helpers'

interface Category {
  id: string | { id: string }
  name: string
  parent_category?: string | { id: string }
  translations?: Array<{ name: string }>
}

interface SubCategory extends Category {
  parent_category: string | { id: string }
}

interface Brand extends Category {
  parent_category: string | { id: string }
  sub_category: string | { id: string }
}

interface Model extends Category {
  parent_brand: string | { id: string }
  sub_category: string | { id: string }
}

export const useCategoryChain = () => {
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [allSubCategories, setAllSubCategories] = useState<SubCategory[]>([])
  const [allBrands, setAllBrands] = useState<Brand[]>([])
  const [allModels, setAllModels] = useState<Model[]>([])
  
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [filteredModels, setFilteredModels] = useState<Model[]>([])
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null)
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)

  // Fetch all data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [categoriesRes, subCategoriesRes, brandsRes, modelsRes] = await Promise.all([
          getAllCategories(),
          getAllSubCategories(),
          getAllBrands(),
          getAllModels(),
        ])

        if (categoriesRes.success) setAllCategories(categoriesRes.data || [])
        if (subCategoriesRes.success) setAllSubCategories(subCategoriesRes.data || [])
        if (brandsRes.success) setAllBrands(brandsRes.data || [])
        if (modelsRes.success) setAllModels(modelsRes.data || [])
      } catch (error) {
        console.error('Error fetching data for chained selects:', error)
      }
    }

    fetchAllData()
  }, [])

  // Handler for category selection - filters subcategories by category
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategoryId(categoryName)
    setSelectedSubCategoryId(null)
    setSelectedBrandId(null)

    if (categoryName && categoryName !== 'none') {
      const category = allCategories.find((cat) => cat.name === categoryName)
      if (category) {
        const categoryId = extractId(category.id)

        const filtered = allSubCategories.filter((subCat) => {
          const subCatParentId = extractId(subCat.parent_category)
          return subCatParentId === categoryId
        })
        setFilteredSubCategories(filtered)
      } else {
        setFilteredSubCategories([])
      }
    } else {
      setFilteredSubCategories([])
      setFilteredBrands([])
      setFilteredModels([])
    }
  }

  // Handler for subcategory selection - filters brands
  const handleSubCategorySelect = (subCategoryId: string) => {
    setSelectedSubCategoryId(subCategoryId)
    setSelectedBrandId(null)

    if (subCategoryId && subCategoryId !== 'none' && selectedCategoryId) {
      const category = allCategories.find((cat) => cat.name === selectedCategoryId)
      if (category) {
        const categoryId = extractId(category.id)

        const filtered = allBrands.filter((brand) => {
          const brandParentCategory = extractId(brand.parent_category)
          const brandSubCategory = extractId(brand.sub_category)
          return brandParentCategory === categoryId && brandSubCategory === subCategoryId
        })
        setFilteredBrands(filtered)
      } else {
        setFilteredBrands([])
      }
    } else {
      setFilteredBrands([])
      setFilteredModels([])
    }
  }

  // Handler for brand selection - filters models
  const handleBrandSelect = (brandId: string) => {
    setSelectedBrandId(brandId)

    if (brandId && brandId !== 'none' && selectedSubCategoryId) {
      const filtered = allModels.filter((model) => {
        const modelParentBrand = extractId(model.parent_brand)
        const modelSubCategory = extractId(model.sub_category)
        return modelParentBrand === brandId && modelSubCategory === selectedSubCategoryId
      })
      setFilteredModels(filtered)
    } else {
      setFilteredModels([])
    }
  }

  return {
    allCategories,
    allSubCategories,
    allBrands,
    allModels,
    filteredSubCategories,
    filteredBrands,
    filteredModels,
    selectedCategoryId,
    selectedSubCategoryId,
    selectedBrandId,
    handleCategorySelect,
    handleSubCategorySelect,
    handleBrandSelect,
  }
}
