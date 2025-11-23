"use client"

import { useState, useEffect } from "react"
import { getProductsEnhanced } from "@/callAPI/products"
import { getAllCategories, getAllSubCategories, getAllBrands, getAllModels } from "@/callAPI/static"

/**
 * Custom hook to manage products data loading
 */
export function useProductsData(items, skipFetch) {
  const [allItems, setAllItems] = useState(items || [])
  const [isLoading, setIsLoading] = useState(!items || items.length === 0)
  const [allItemsFetched, setAllItemsFetched] = useState(false)
  const [productsCount, setProductsCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    
    const loadAllItems = async () => {
      // If items are provided as props and skipFetch is true, use them directly
      if (items && items.length > 0) {
        setAllItems(items)
        setAllItemsFetched(true)
        setIsLoading(false)
        return
      }
      
      // Skip fetching if explicitly told to and no items provided
      if (skipFetch) {
        setAllItemsFetched(true)
        setIsLoading(false)
        return
      }
      
      // Otherwise, fetch all items from API
      setIsLoading(true)
      try {
        const response = await getProductsEnhanced({})
        if (response.success) {
          setAllItems(response.data || [])
          setProductsCount(response.data?.length || 0)
          setAllItemsFetched(true)
        } else {
          setAllItems([])
          setProductsCount(0)
          setAllItemsFetched(true)
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Error loading items:", error)
        }
        setAllItems([])
        setProductsCount(0)
        setAllItemsFetched(true)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadAllItems()
    
    return () => controller.abort()
  }, [items, skipFetch])

  return { allItems, isLoading, allItemsFetched, productsCount, setProductsCount }
}

/**
 * Custom hook to manage static data (categories, brands, etc.)
 */
export function useStaticData() {
  const [allCategoriesData, setAllCategoriesData] = useState([])
  const [allSubCategoriesData, setAllSubCategoriesData] = useState([])
  const [allBrandsData, setAllBrandsData] = useState([])
  const [allModelsData, setAllModelsData] = useState([])

  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [catsRes, subCatsRes, brandsRes, modelsRes] = await Promise.all([
          getAllCategories(),
          getAllSubCategories(),
          getAllBrands(),
          getAllModels()
        ])
        
        if (catsRes?.success) setAllCategoriesData(catsRes.data || [])
        if (subCatsRes?.success) setAllSubCategoriesData(subCatsRes.data || [])
        if (brandsRes?.success) setAllBrandsData(brandsRes.data || [])
        if (modelsRes?.success) setAllModelsData(modelsRes.data || [])
      } catch (error) {
        // Silent error handling
      }
    }
    
    loadStaticData()
  }, [])

  return {
    allCategoriesData,
    allSubCategoriesData,
    allBrandsData,
    allModelsData
  }
}
