"use client"

import { useState, useEffect, useMemo } from "react"
import { calculateDistance, getItemName, getItemDescription, extractId } from "./utils"

const initialFiltersState = {
  name: "",
  category: "all",
  subCategories: [],
  brands: [],
  models: [],
  allowedCategories: [],
  location: {
    country: "all",
    city: "",
    useCurrentLocation: false,
    latitude: null,
    longitude: null,
    radius: 10,
  },
  dateRange: {
    from: "",
    to: "",
  },
  status: "all",
  priceRange: {
    min: "",
    max: "",
  },
}

/**
 * Custom hook to manage filtering logic
 */
export function useFilters(allItems, category, searchTerm, defaultCategory, isRTL) {
  const [filters, setFilters] = useState(initialFiltersState)
  const [displayedItems, setDisplayedItems] = useState([])
  const [productsCount, setProductsCount] = useState(0)

  // Sync defaultCategory with filters
  useEffect(() => {
    setFilters(prev => ({ ...prev, category: defaultCategory }))
  }, [defaultCategory])

  // Check if any filters are applied
  const hasActiveFilters = useMemo(() => {
    return (
      category !== "all" ||
      filters.category !== "all" ||
      searchTerm !== "" ||
      filters.name !== "" ||
      filters.subCategories.length > 0 ||
      filters.brands.length > 0 ||
      filters.models.length > 0 ||
      filters.allowedCategories.length > 0 ||
      (filters.location.country && filters.location.country !== "all") ||
      filters.location.city !== "" ||
      filters.location.useCurrentLocation ||
      filters.dateRange.from !== "" ||
      filters.dateRange.to !== "" ||
      filters.status !== "all" ||
      filters.priceRange.min !== "" ||
      filters.priceRange.max !== ""
    )
  }, [category, searchTerm, filters])

  // Apply all filters
  useEffect(() => {
    let filteredItems = [...allItems]
    
    // Apply search filter
    if (searchTerm) {
      filteredItems = filteredItems.filter(item => {
        const itemName = getItemName(item, isRTL)
        const itemDescription = getItemDescription(item, isRTL)
        return itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               itemDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }
    
    // Apply name filter
    if (filters.name) {
      filteredItems = filteredItems.filter(item => {
        const itemName = getItemName(item, isRTL)
        return itemName?.toLowerCase().includes(filters.name.toLowerCase())
      })
    }
    
    // Apply category filter
    const activeCategory = category !== "all" ? category : filters.category
    if (activeCategory !== "all") {
      filteredItems = filteredItems.filter(item => 
        item.category?.toLowerCase() === activeCategory.toLowerCase()
      )
    }
    
    // Apply subCategories filter
    if (filters.subCategories.length > 0) {
      filteredItems = filteredItems.filter(item => {
        if (!item.sub_category) return false
        const itemSubCatId = extractId(item.sub_category)
        return filters.subCategories.some(subCatId => {
          const filterSubCatId = extractId(subCatId)
          return String(itemSubCatId) === String(filterSubCatId)
        })
      })
    }
    
    // Apply brands filter
    if (filters.brands.length > 0) {
      filteredItems = filteredItems.filter(item => {
        if (!item.brand) return false
        const itemBrandId = extractId(item.brand)
        return filters.brands.some(brandId => {
          const filterBrandId = extractId(brandId)
          return String(itemBrandId) === String(filterBrandId)
        })
      })
    }
    
    // Apply models filter
    if (filters.models.length > 0) {
      filteredItems = filteredItems.filter(item => {
        if (!item.model) return false
        const itemModelId = extractId(item.model)
        return filters.models.some(modelId => {
          const filterModelId = extractId(modelId)
          return String(itemModelId) === String(filterModelId)
        })
      })
    }
    
    // Apply status filter
    if (filters.status !== "all") {
      filteredItems = filteredItems.filter(item => item.status_item === filters.status)
    }
    
    // Apply price range filters
    if (filters.priceRange.min) {
      filteredItems = filteredItems.filter(item => 
        parseFloat(item.price) >= parseFloat(filters.priceRange.min)
      )
    }
    if (filters.priceRange.max) {
      filteredItems = filteredItems.filter(item => 
        parseFloat(item.price) <= parseFloat(filters.priceRange.max)
      )
    }
    
    // Apply location filters
    if (filters.location.country && filters.location.country !== "all") {
      filteredItems = filteredItems.filter(item => 
        item.country?.toLowerCase().includes(filters.location.country.toLowerCase())
      )
    }
    if (filters.location.city) {
      filteredItems = filteredItems.filter(item => 
        item.city?.toLowerCase().includes(filters.location.city.toLowerCase())
      )
    }
    
    // Apply geolocation filter
    if (filters.location.useCurrentLocation && filters.location.latitude && filters.location.longitude) {
      filteredItems = filteredItems.filter(item => {
        if (!item.latitude || !item.longitude) return false
        const distance = calculateDistance(
          filters.location.latitude, filters.location.longitude,
          parseFloat(item.latitude), parseFloat(item.longitude)
        )
        return distance <= (parseFloat(filters.location.radius) || 10)
      })
    }
    
    // Apply allowed categories filter
    if (filters.allowedCategories.length > 0) {
      filteredItems = filteredItems.filter(item => {
        if (!item.allowed_categories) return false
        return filters.allowedCategories.some(cat => 
          item.allowed_categories.includes(cat)
        )
      })
    }
    
    // Apply date range filters
    if (filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from)
      filteredItems = filteredItems.filter(item => {
        const itemDate = new Date(item.date_created)
        return itemDate >= fromDate
      })
    }
    if (filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to)
      filteredItems = filteredItems.filter(item => {
        const itemDate = new Date(item.date_created)
        return itemDate <= toDate
      })
    }
    
    setDisplayedItems(filteredItems)
    setProductsCount(filteredItems.length)
  }, [allItems, category, searchTerm, filters, isRTL])

  const updateFilter = (filterPath, value) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      const keys = filterPath.split('.')
      let current = newFilters
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newFilters
    })
  }

  const toggleArrayFilter = (filterPath, value) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      let currentArray = newFilters[filterPath] || []
      
      if (currentArray.includes("all")) {
        currentArray = []
      }
      
      if (currentArray.includes(value)) {
        newFilters[filterPath] = currentArray.filter(item => item !== value)
      } else {
        newFilters[filterPath] = [...currentArray, value]
      }
      
      return newFilters
    })
  }

  const toggleAllCategories = (filterPath) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      const currentArray = newFilters[filterPath] || []
      
      if (currentArray.includes("all")) {
        newFilters[filterPath] = [] 
      } else {
        newFilters[filterPath] = ["all"]
      }
      
      return newFilters
    })
  }

  const clearAllFilters = () => {
    setFilters(initialFiltersState)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.name) count++
    if (filters.category !== "all") count++
    if (filters.subCategories.length > 0) count++
    if (filters.brands.length > 0) count++
    if (filters.models.length > 0) count++
    if (filters.allowedCategories.length > 0) count++
    if (filters.location.country && filters.location.country !== "all") count++
    if (filters.location.city) count++
    if (filters.location.useCurrentLocation) count++
    if (filters.dateRange.from || filters.dateRange.to) count++
    if (filters.status !== "all") count++
    if (filters.priceRange.min || filters.priceRange.max) count++
    return count
  }

  return {
    filters,
    displayedItems,
    productsCount,
    hasActiveFilters,
    updateFilter,
    toggleArrayFilter,
    toggleAllCategories,
    clearAllFilters,
    getActiveFiltersCount,
  }
}
