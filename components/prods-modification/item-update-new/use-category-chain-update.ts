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

export const useCategoryChainUpdate = (
  initialCategory?: string,
  initialSubCategory?: string,
  initialBrand?: string,
  initialModel?: string
) => {
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [allSubCategories, setAllSubCategories] = useState<SubCategory[]>([])
  const [allBrands, setAllBrands] = useState<Brand[]>([])
  const [allModels, setAllModels] = useState<Model[]>([])
  
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [filteredModels, setFilteredModels] = useState<Model[]>([])
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategory || null)
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(initialSubCategory || null)
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(initialBrand || null)
  const [isInitialized, setIsInitialized] = useState(false)

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

        if (categoriesRes.success && 'data' in categoriesRes) setAllCategories(categoriesRes.data || [])
        if (subCategoriesRes.success && 'data' in subCategoriesRes) setAllSubCategories(subCategoriesRes.data || [])
        if (brandsRes.success && 'data' in brandsRes) setAllBrands(brandsRes.data || [])
        if (modelsRes.success && 'data' in modelsRes) setAllModels(modelsRes.data || [])
      } catch (error) {
        console.error('Error fetching data for chained selects:', error)
      }
    }

    fetchAllData()
  }, [])

  // Initialize chain from existing item data after all data is loaded
  useEffect(() => {
    if (
      isInitialized ||
      allCategories.length === 0 ||
      allSubCategories.length === 0 ||
      allBrands.length === 0 ||
      allModels.length === 0
    ) {
      return
    }

    if (initialCategory) {
      // Find category by name to get its ID
      const categoryObj = allCategories.find((cat) => cat.name === initialCategory)
      if (categoryObj) {
        const categoryId = extractId(categoryObj.id)
        setSelectedCategoryId(initialCategory)

        // Filter subcategories by parent_category
        const filteredSubs = allSubCategories.filter((subCat) => {
          const subCatParentId = extractId(subCat.parent_category)
          return subCatParentId === categoryId
        })
        setFilteredSubCategories(filteredSubs)

        // If sub_category exists, set it and filter brands
        if (initialSubCategory && initialSubCategory !== 'none') {
          setSelectedSubCategoryId(initialSubCategory)

          // Filter brands by parent_category and sub_category
          const filteredBrandsList = allBrands.filter((brand) => {
            const brandParentCategory = extractId(brand.parent_category)
            const brandSubCategory = extractId(brand.sub_category)
            return brandParentCategory === categoryId && brandSubCategory === initialSubCategory
          })
          setFilteredBrands(filteredBrandsList)

          // If brand exists, set it and filter models
          if (initialBrand && initialBrand !== 'none') {
            setSelectedBrandId(initialBrand)

            // Filter models by parent_brand and sub_category
            const filteredModelsList = allModels.filter((model) => {
              const modelParentBrand = extractId(model.parent_brand)
              const modelSubCategory = extractId(model.sub_category)
              return modelParentBrand === initialBrand && modelSubCategory === initialSubCategory
            })
            setFilteredModels(filteredModelsList)
          }
        }
      }
    }

    setIsInitialized(true)
  }, [allCategories, allSubCategories, allBrands, allModels, initialCategory, initialSubCategory, initialBrand])

  // Handler for category selection - filters subcategories by category
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategoryId(categoryName)
    setSelectedSubCategoryId(null)
    setSelectedBrandId(null)
    setFilteredBrands([])
    setFilteredModels([])

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
    }
  }

  // Handler for subcategory selection - filters brands
  const handleSubCategorySelect = (subCategoryId: string) => {
    setSelectedSubCategoryId(subCategoryId)
    setSelectedBrandId(null)
    setFilteredModels([])

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
    isInitialized,
  }
}
