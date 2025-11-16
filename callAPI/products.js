import axios from "axios"
import { getCookie, decodedToken, baseItemsURL, baseURL, handleApiError, makeAuthenticatedRequest , validateAuth , getOptionalAuth } from "./utiles.js"
import { getUserByProductId } from "./users.js"
import { checkItemIncludedInCompletedOffer } from "./swap.js"

// Get available/unavailable products by user ID
export const getAvailableAndUnavailableProducts = async (user_id) => {
  try {
    if (!user_id) {
      throw new Error("User ID is required");
    }

    const token = await getCookie();
    if (!token) {
      return { success: false, error: "Authentication required", status: 401 };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(
      // `${baseItemsURL}/Items?filter[user_id][_eq]=${user_id}&filter[status_swap][_eq]=${status}&fields=*,translations.*,images.*,images.directus_files_id.*`,
      `${baseItemsURL}Items`
      , {
        filter: {
          user_id: { _eq: user_id },
          status_swap: { _eq:  "unavailable" },
        },
        fields: "*,translations.*,images.*,images.directus_files_id.*",
      },   
      { headers }
    );

    // console.log(`Retrieved unavailable products for user:`, user_id);
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      message: `unavailable products retrieved successfully`,
    };
  } catch (error) {
    return handleApiError(error, "Get Available/Unavailable Products");
  }
};

// Get all products with smart filtering based on authentication and filters
export const getProducts = async (filters = {} , additionalParams = {} , limitFrom=0 , limitTo=0) => {
 let limitProducts = limitTo - limitFrom
  // Get optional authentication - doesn't throw error if not authenticated
  const { token, userId } = await getOptionalAuth()
  
  // Check if filters is empty, null, or undefined
  const hasFilters = filters && typeof filters === 'object' && Object.keys(filters).length > 0
  
  // Check if additionalParams is empty, null, or undefined
  const hasAdditionalParams = additionalParams && typeof additionalParams === 'object' && Object.keys(additionalParams).length > 0
  
  // Build base filter
  let baseFilter = {}
  
  if (token) {
    // Authenticated access - exclude user's own items and unavailable items
      baseFilter.status_swap = { _eq: "available" }
      baseFilter.quantity = { _gt	: 0 }
      baseFilter.user_id = { _neq: `${userId}`}
      baseFilter.completed_offer = { _neq: "true"}
  } else { // finished it here 
   // Public access - show only available items
    baseFilter.status_swap = { _eq: "available" }
    baseFilter.quantity = { _gt: 0 }
    baseFilter.completed_offer = { _neq: "true"}

  }
  

  // Combine base filter with additional filters if they exist
  const finalFilter = hasFilters ? { ...baseFilter, ...filters } : baseFilter
  
  // Build base params
  const baseParams = {
    fields: "*,images.*,translations.*,images.directus_files_id.*",
    filter: finalFilter
  }
  
  // Pagination support - check if page and limit are in filters or additionalParams
  let page = filters.page || additionalParams.page
  let limit = filters.limit || additionalParams.limit
  
  if (page && limit) {
    baseParams.limit = parseInt(limit) || 10
    baseParams.offset = ((parseInt(page) || 1) - 1) * baseParams.limit
  } else if (limit) {
    baseParams.limit = parseInt(limit)
  } else if (limitTo > limitFrom) {
    // Use legacy limitFrom/limitTo if provided
    baseParams.limit = limitProducts
    baseParams.offset = limitFrom
  }
  
  // Combine base params with additional params if they exist (but exclude page/limit to avoid duplicates)
  let finalParams = baseParams
  if (hasAdditionalParams) {
    const { page: _, limit: __, ...restAdditionalParams } = additionalParams
    finalParams = { ...baseParams, ...restAdditionalParams }
  }
  
  let response;
  try {
    response = await axios.get(`${baseItemsURL}Items`, {
      params: finalParams
    })
    
    // console.log("response", response)  
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      total: response.data.meta?.total_count || response.data.data?.length || 0,
      page: page ? parseInt(page) : 1,
      limit: baseParams.limit || response.data.data?.length || 0,
      message: "Products retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Products")
  }
}



// Get top price products with enhanced filtering
export const getProductTopPrice = async (limit = 10) => {
  try {
    const decoded = await decodedToken()
    let url
    const queryParams = new URLSearchParams()
    queryParams.append("filter[status_swap][_eq]", "available")
    queryParams.append("filter[quantity][_gt]", 0)
    queryParams.append("sort", "-price")
    queryParams.append("limit", limit.toString())
    
    if (decoded?.id) {
      queryParams.append("filter[user_id][_neq]", decoded.id)
    }

    url = `${baseItemsURL}Items?${queryParams.toString()}`
    ,
      {
        params: {
          fields: "*,translations.*,images.*,images.directus_files_id.*"
        }
      }
    const response = await axios.get(url)

    // console.log("Top price products retrieved successfully, count:", response.data.data?.length || 0)
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      message: "Top price products retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Top Price Products")
  }
}

// Search products with enhanced filtering
export const getProductSearchFilter = async (filter) => {
  try {
    if (!filter || typeof filter !== "string" || filter.trim().length === 0) {
      throw new Error("Search filter is required and must be a non-empty string")
    }

    const cleanFilter = filter.trim()
    const queryParams = new URLSearchParams()

    queryParams.append("filter[_and][0][status_swap][_neq]", "unavailable")
    queryParams.append("filter[_and][0][quantity][_gt]", 0)
    queryParams.append("filter[_and][1][_or][0][name][_contains]", encodeURIComponent(cleanFilter))
    queryParams.append("filter[_and][1][_or][1][description][_contains]", encodeURIComponent(cleanFilter))
    queryParams.append("filter[_and][1][_or][2][category][_contains]", encodeURIComponent(cleanFilter))
    queryParams.append("filter[_and][1][_or][3][translations.name][_contains]", encodeURIComponent(cleanFilter))
    queryParams.append("filter[_and][1][_or][4][translations.description][_contains]", encodeURIComponent(cleanFilter))

    const url = `${baseItemsURL}Items?${queryParams.toString()}&fields=*,translations.*,images.*,images.directus_files_id.*`
    const response = await axios.get(url)

    // console.log("Search completed, results:", response.data.data?.length || 0)
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      search_term: cleanFilter,
      message: "Search completed successfully",
    }
  } catch (error) {
    return handleApiError(error, "Search Products")
  }
}

// Get products by category with validation
export const getProductByCategory = async (category) => {
  
  try {
    const user = await decodedToken()
    
    if (!category || typeof category !== "string" || category.trim().length === 0) {
      throw new Error("Category is required and must be a non-empty string")
    }

    const cleanCategory = category.trim().toLowerCase()
    // console.log('getProductByCategory: Searching for category:', cleanCategory)
    const response = await axios.get(`${baseItemsURL}Items`,
      {
        params: {
          fields: "*,images.*,translations.*,images.directus_files_id.*",
          filter: {
            category: { _eq: cleanCategory },
            status_swap: { _eq: "available" },
            quantity: { _gt: 0 },
            user_id: { _neq: `${user?.id}` },
          }
        }
      })

    // console.log("Products by category retrieved successfully, count:", response.data.data?.length || 0)
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      category: cleanCategory,
      message: "Products by category retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Products By Category")
  }
}

// Enhanced getProducts function with comprehensive filtering and pagination
export const getProductsEnhanced = async (filters = {}) => {
  try {
    const token = await getCookie()
    const { userId } = await validateAuth()
    // Build comprehensive filter object
    const apiFilter = {}
    const params = {
      // Include all fields including nested sub_cat structure for filtering
      fields: "*,images.*,translations.*,images.directus_files_id.*,sub_cat.*,sub_cat.level_1.*,sub_cat.level_2.*",
      filter: {
        quantity: { _gt: 0 },
      }
    }

    // Base authentication filters
    if (!token) {
      // Public access - show only available items
      apiFilter.status_swap = { _eq: "available" }
      apiFilter.quantity = { _gt: 0 }
    } else {
      // Authenticated access - exclude user's own items and unavailable items
      
      if (userId) {
        apiFilter._and = [
          { user_id: { _neq: `${userId}` } },
          { status_swap: { _eq: "available" } },
          { quantity: { _gt: 0 } }
        ]
      } else {
        apiFilter.status_swap = { _eq: "available" }
        apiFilter.quantity = { _gt: 0 }
      }
    }

    // Apply additional filters
    const additionalFilters = []

    // Category filter
    if (filters.category && filters.category !== "all") {
      // Normalize category to lowercase for consistent filtering
      const normalizedCategory = filters.category.toLowerCase()
      additionalFilters.push({ category: { _eq: normalizedCategory } })
      // console.log('Enhanced API: Category filter applied:', normalizedCategory)
    }

    // Multiple categories filter
    if (filters.categories && filters.categories.length > 0) {
      // Normalize all categories to lowercase for consistent filtering
      const normalizedCategories = filters.categories.map(cat => cat.toLowerCase())
      additionalFilters.push({ category: { _in: normalizedCategories } })
      // console.log('Enhanced API: Multiple categories filter applied:', normalizedCategories)
    }

    // Search filter with RTL support
    if (filters.search) {
      additionalFilters.push({
        _or: [
          { name: { _contains: filters.search } },
          { description: { _contains: filters.search } },
          { "translations.name": { _contains: filters.search } },
          { "translations.description": { _contains: filters.search } }
        ]
      })
    }

    // Name filter with RTL support
    if (filters.name) {
      additionalFilters.push({
        _or: [
          { name: { _contains: filters.name } },
          { "translations.name": { _contains: filters.name } }
        ]
      })
    }

    // Price range filters
    if (filters.min_price) {
      additionalFilters.push({ price: { _gte: parseFloat(filters.min_price) } })
    }
    if (filters.max_price) {
      additionalFilters.push({ price: { _lte: parseFloat(filters.max_price) } })
    }

    // Location filters
    if (filters.country && filters.country !== "all") {
      additionalFilters.push({ country: { _contains: filters.country } })
    }
    if (filters.city) {
      additionalFilters.push({ city: { _contains: filters.city } })
    }

    // Status filters
    if (filters.status_item && filters.status_item !== "all") {
      additionalFilters.push({ status_item: { _eq: filters.status_item } })
    }
    if (filters.status_swap && filters.status_swap !== "all") {
      additionalFilters.push({ status_swap: { _eq: filters.status_swap } })
    }

    // Date range filters
    if (filters.date_from) {
      additionalFilters.push({ date_created: { _gte: filters.date_from } })
    }
    if (filters.date_to) {
      additionalFilters.push({ date_created: { _lte: filters.date_to } })
    }

    // Allowed categories filter
    if (filters.allowed_categories && filters.allowed_categories.length > 0) {
      const allowedCatFilters = filters.allowed_categories.map(cat => ({
        allowed_categories: { _contains: cat }
      }))
      additionalFilters.push({ _or: allowedCatFilters })
    }

    // Brand filter
    if (filters.brand) {
      additionalFilters.push({ brand: { _eq: filters.brand } })
    }


    // Sub-level 1 filter (single value)
    // Note: Directus JSON field filtering - try multiple approaches for compatibility
  

    // Sub-level 2 filter (single value)

    // Sub-level 1 list filter (multiple values)
    // For array filters, we check if ANY of the values match
 

    // Sub-level 2 list filter (multiple values)

    // Combine all filters
    if (additionalFilters.length > 0) {
      if (apiFilter._and) {
        apiFilter._and = [...apiFilter._and, ...additionalFilters]
      } else if (Object.keys(apiFilter).length > 0) {
        apiFilter._and = [apiFilter, ...additionalFilters]
      } else {
        apiFilter._and = additionalFilters
      }
    }
    params.filter = apiFilter

    // Pagination
    if (filters.page && filters.limit) {
      params.limit = parseInt(filters.limit) || 8
      params.offset = ((parseInt(filters.page) || 1) - 1) * params.limit
    } else if (filters.limit) {
      params.limit = parseInt(filters.limit)
    } 

    // Sorting
    if (filters.sort) {
      params.sort = filters.sort
    } else {
      params.sort = "-date_created" // Default to newest first
    }

    // console.log("Enhanced API Filter params:", JSON.stringify(params, null, 2))

    const response = await axios.get(`${baseItemsURL}Items`, { params })
    
    let resultData = response.data.data || []
    let totalCount = response.data.meta?.total_count || resultData.length

    // Handle geolocation filtering client-side (requires post-processing)
    // Note: Geolocation filtering happens after pagination, so we fetch a larger set
    // when geolocation is active, or handle pagination differently
    if (filters.latitude && filters.longitude && filters.radius) {
      resultData = resultData.filter(item => {
        if (!item.latitude || !item.longitude) return false
        
        const distance = calculateDistance(
          filters.latitude, filters.longitude,
          parseFloat(item.latitude), parseFloat(item.longitude)
        )
        return distance <= (parseFloat(filters.radius) || 10)
      })
      
      // Update total count to reflect client-side filtered results
      // Note: This is approximate - accurate count would require fetching all items
      totalCount = resultData.length
    }

    // console.log("Enhanced API Response - Total items:", resultData.length)
    
    return {
      success: true,
      data: resultData,
      total: totalCount,
      count: resultData.length,
      page: parseInt(filters.page) || 1,
      limit: parseInt(filters.limit) || resultData.length,
      message: "Products retrieved successfully",
    }
  } catch (error) {
    console.error("getProductsEnhanced error:", error)
    return handleApiError(error, "Get Products Enhanced")
  }
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const d = R * c // Distance in kilometers
  return d
}


// Get product by ID with enhanced validation
export const getProductById = async (id) => {
  try {
    if (!id) {
      throw new Error("Product ID is required")
    }
    // const response = await axios.get(`${baseItemsURL}Items/${id}?fields=*,translations.*,images.*`)
    const response = await axios.get(
      `${baseItemsURL}Items/${id}`,
      {
        params: {
          fields: "*,translations.*,images.*,images.directus_files_id.*",
          
        }
      }
    );
    // console.log("response", response)
    // console.log("response.data.data", response.data.data)
    if (!response.data.data) {
      throw new Error("Product not found")
    }

    // console.log("Product retrieved successfully, ID:", id)
    return {
      success: true,
      data: response.data.data || [],
      message: "Product retrieved successfully",
    }
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        success: false,
        error: "Product not found",
        status: 404,
        context: "Get Product By ID",
      }
    }
    return handleApiError(error, "Get Product By ID")
  }
}



// Get products count
export const getProductsCount = async () => {
  try {
    const { userId } = await validateAuth()
    const response = await axios.get(`${baseItemsURL}Items`, {
      params: {
        fields: "*",
        filter: {
          status_swap: { _eq: "available" },
          quantity: { _gt: 0 },
          user_id: { _neq: `${userId}` },
        },
      }
    });
    // console.log("response", response)
    // console.log("response.data.data", response.data.data)
    if (!response.data.data) {
      throw new Error("Products count not found")
    }

    // console.log("Product retrieved successfully, ID:", id)
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      message: "Products count retrieved successfully",
    }
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        success: false,
        error: "Products count not found",
        status: 404,
        context: "Get Products Count",
      }
    }
    return handleApiError(error, "Get Products Count")
  }
}



// Get products by current user ID
export const getProductByUserId = async (availablity) => {
  try {
    return await makeAuthenticatedRequest(async () => {
      const { userId } = await validateAuth()
      if (!userId) {
        throw new Error("Authentication required")
      }
      let response;
if(availablity=="available" ){
  response = await axios.get(` ${baseItemsURL}Items` ,
    {
      params: {
        fields: "*,images.*,translations.*.*,images.directus_files_id.*",
        filter: {
          user_id: { _eq:`${userId}` },
          status_swap: { _eq: "available"},
          quantity: { _gt: 0 },
          completed_offer:{_neq: "true"}
        
        },
        sort: "-date_created",
      }
    }
    )
}

else if( availablity=="unavailable"){
  const unavailableItemsOffers = await axios.get(`${baseItemsURL}Offer_Items`,
    {
      params: {
        fields: "*",
        filter: {
          offered_by: { _eq:`${userId}` },
          // completed_offer:{_contains: "false"}
          // quantity: { _gt: 0 },
        },
        sort: "-date_created",
      }
    }
  )
  console.log("unavailableItemsOffers", unavailableItemsOffers)
  let unavailableItemsOffersIds = unavailableItemsOffers.data.data.map(item => item.item_id)
  console.log("unavailableItemsOffersIds", unavailableItemsOffersIds)
  // Filter out items whose all related offers are completed
  try {
    const offerIdSet = new Set(unavailableItemsOffers.data.data.map(it => it.offer_id).filter(Boolean))
    const offerIds = Array.from(offerIdSet)
    if (offerIds.length > 0) {
      const offersRes = await axios.get(`${baseItemsURL}Offers`, {
        params: {
          fields: "id,status_offer",
          filter: { id: { _in: offerIds } },
        },
      })
      const offers = offersRes?.data?.data || []
      // Build a map: offer_id -> status
      const offerStatusById = new Map(offers.map(o => [o.id, String(o.status_offer || "").toLowerCase()]))
      // Group offers by item_id
      const offersByItemId = new Map()
      unavailableItemsOffers.data.data.forEach(row => {
        const key = row.item_id
        if (!offersByItemId.has(key)) offersByItemId.set(key, [])
        offersByItemId.get(key).push(offerStatusById.get(row.offer_id) || "")
      })
      // Keep only items that have at least one non-completed offer
      const filteredIds = Array.from(offersByItemId.entries())
        .filter(([_, statuses]) => statuses.some(st => st !== "completed"))
        .map(([itemId]) => itemId)
      // Overwrite with filtered IDs
      unavailableItemsOffersIds = filteredIds
      console.log("unavailableItemsOffersIds (filtered non-completed only)", unavailableItemsOffersIds)
    }
  } catch (e) {
    console.warn("Failed to filter Offer_Items by offer status:", e?.message)
  }


  response = await axios.get(` ${baseItemsURL}Items`,
    {
      params: {
        fields: "*,images.*,translations.*,images.directus_files_id.*",
        filter: {
      _or: [
        { id: { _in: unavailableItemsOffersIds } } ,
         { quantity: { _eq: 0 } },
         { status_swap: { _eq: "unavailable" } },
      ],
      completed_offer:{_neq: "true"},
            user_id: { _eq:`${userId}` } ,
        },
        sort: "-date_created",
      }
    }
    )
}
else{
  response = await axios.get(` ${baseItemsURL}Items` ,
    {
      params: {
        fields: "*,images.*,translations.*,images.directus_files_id.*",
        filter: {
          user_id: { _eq:`${userId}` },
          completed_offer:{_neq: "true"}
        },
        sort: "-date_created",
      }
    }
    )
}
      // console.log("User products retrieved successfully, count:", response.data.data?.length || 0)
      return {
        success: true,
        data: response.data.data || [],
        count: response.data.data?.length || 0,
        user_id: userId,
        message: "User products retrieved successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Get Products By User ID")
  }
}
// // Get products by current user ID
// export const getProductByUserId = async (availablity) => {
//   try {
//     return await makeAuthenticatedRequest(async () => {
//       const { userId } = await validateAuth()
//       if (!userId) {
//         throw new Error("Authentication required")
//       }
//       let response;
// if(availablity=="available" ){
//   response = await axios.get(` ${baseItemsURL}Items` ,
//     {
//       params: {
//         fields: "*,images.*,translations.*.*,images.directus_files_id.*",
//         filter: {
//           user_id: { _eq:`${userId}` },
//           status_swap: { _eq: "available"},
//           quantity: { _gt: 0 },
//           completed_offer:{_neq: "true"}
        
//         },
//         sort: "-date_created",
//       }
//     }
//     )
// }

// else if( availablity=="unavailable"){
//   const unavailableItemsOffers = await axios.get(`${baseItemsURL}Offer_Items`,
//     {
//       params: {
//         fields: "*",
//         filter: {
//           offered_by: { _eq:`${userId}` },
//           // completed_offer:{_contains: "false"}
//           // quantity: { _gt: 0 },
//         },
//         sort: "-date_created",
//       }
//     }
//   )
//   console.log("unavailableItemsOffers", unavailableItemsOffers)
//   const unavailableItemsOffersIds = unavailableItemsOffers.data.data.map(item => item.item_id)
//   console.log("unavailableItemsOffersIds", unavailableItemsOffersIds)


//   response = await axios.get(` ${baseItemsURL}Items`,
//     {
//       params: {
//         fields: "*,images.*,translations.*,images.directus_files_id.*",
//         filter: {
//       _or: [
//         { id: { _in: unavailableItemsOffersIds } } ,
//          { quantity: { _eq: 0 } },
//          { status_swap: { _eq: "unavailable" } },
//       ],
//       completed_offer:{_neq: "true"},
//             user_id: { _eq:`${userId}` } ,
//         },
//         sort: "-date_created",
//       }
//     }
//     )
// }
// else{
//   response = await axios.get(` ${baseItemsURL}Items` ,
//     {
//       params: {
//         fields: "*,images.*,translations.*,images.directus_files_id.*",
//         filter: {
//           user_id: { _eq:`${userId}` },
//           completed_offer:{_neq: "true"}
//         },
//         sort: "-date_created",
//       }
//     }
//     )
// }
//       // console.log("User products retrieved successfully, count:", response.data.data?.length || 0)
//       return {
//         success: true,
//         data: response.data.data || [],
//         count: response.data.data?.length || 0,
//         user_id: userId,
//         message: "User products retrieved successfully",
//       }
//     })
//   } catch (error) {
//     return handleApiError(error, "Get Products By User ID")
//   }
// }
 
// Get products by owner ID (via product ID)
export const getProductsOwnerById = async (productId) => {
  try {
    if (!productId) {
      throw new Error("Product ID is required")
    }

    const userResult = await getUserByProductId(productId)
    if (!userResult.success) {
      throw new Error(userResult.error)
    }

    const response = await axios.get(`${baseItemsURL}Items`,
      
      {
        params: {
          fields: "*,translations.*,images.*,images.directus_files_id.*",
          filter: {
            status_swap: { _eq: "available" },
            user_id: { _eq: userResult.data.id },
            quantity: { _gt: 0 },
            completed_offer:{_neq:"true"}
          },
          sort: "-date_created",
        }
      }
    )

    // console.log("Owner products retrieved successfully, count:", response.data.data?.length || 0)
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      owner_id: userResult.data.id,
      message: "Owner products retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Products By Owner ID")
  }
}

// // Get image products by their IDs
// export const getImageProducts = async (images) => {
//   try {
//     if (!images || !Array.isArray(images) || images.length === 0) {
//       return { success: true, data: [], message: "No images to fetch." };
//     }

//     const fileIds = images.map(img => img.directus_files_id).filter(id => id);
//     if (fileIds.length === 0) {
//       return { success: true, data: [], message: "No valid file IDs provided." };
//     }

//     const response = await axios.get(`${baseURL}files`, {
//       params: {
//         filter: {
//           id: { _in: fileIds },
//         },
//       },
//     });

//     return {
//       success: true,
//       datas: true, // Maintaining compatibility with original structure
//       data: response.data.data || [],
//       message: "Image data retrieved successfully",
//     };
//   } catch (error) {
//     return handleApiError(error, "Get Image Products");
//   }
// };

// Remove a single product image relationship
export const removeProductImage = async (itemId, fileId) => {
  try {
    return await makeAuthenticatedRequest(async () => {
      if (!itemId || !fileId) {
        throw new Error("Item ID and File ID are required for deletion.");
      }

      const { token } = await validateAuth();

      // Find the specific Items_files entry to delete
      const relationRes = await axios.get(`${baseItemsURL}Items_files`, {
        params: {
          filter: {
            Items_id: { _eq: itemId },
            directus_files_id: { _eq: fileId },
          },
          limit: 1,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const relation = relationRes.data?.data?.[0];
      if (!relation) {
        // If relation doesn't exist, it might have been already deleted.
        // We can consider this a success to avoid unnecessary errors on the frontend.
        console.warn(`Image relation for item ${itemId} and file ${fileId} not found. It might be already deleted.`);
        return {
          success: true,
          message: "Image relation not found, assumed already deleted.",
        };
      }

      // Delete the Items_files entry
      await axios.delete(`${baseItemsURL}Items_files/${relation.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Optional: Delete the actual file from /files if it's no longer used anywhere else.
      // This is more complex and requires checking for other relationships.
      // For now, we only delete the relation as requested by the initial logic.

      return {
        success: true,
        message: `Image with file ID: ${fileId} was successfully unlinked from item ID: ${itemId}.`,
      };
    });
  } catch (error) {
    return handleApiError(error, "Remove Product Image");
  }
};

// Delete product finally with authentication
export const deleteProduct = async (id) => {
  try {
    return await makeAuthenticatedRequest(async () => {
      if (!id) {
        throw new Error("Product ID is required")
      }
      const {token , userId   } = await validateAuth()
      const productResult = await getProductById(id)
      if (!productResult.success) {
        throw new Error("Product not found")
      }

      if (productResult.data.user_id !== userId) {
        throw new Error("Unauthorized: You can only delete your own products")
      }
// ------------------------------------
      // const isItemsOffers = await axios.get(` ${baseItemsURL}Offer_Items`,
      //   {
      //     params: {
      //       fields: "*",
      //       filter: {
      //         offered_by: { _eq:`${userId}` },
      //         item_id: { _eq:`${id}` },
      //       }
      //     }
      //   }
      // )


      // if(isItemsOffers.data.data.length > 0){
      //   // updat quantity to 0
      //   const updateQuantity = await axios.patch(`${baseItemsURL}Items/${id}`, {
      //     quantity: 0,
      //     status_swap: "unavailable",
      //     completed_offer:"true"
      //   }, {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "Content-Type": "application/json",
      //     },
      //   })
      //   return {
      //     success: true,
      //     data: {  updateQuantity: updateQuantity.data.data   },
      //     message: "Product  successfully and quantity updated to 0",
      //   }
      // }else{
        // await new Promise((resolve) => setTimeout(resolve, 500))
        // -------------------------------------------------
        let productImages = await axios.get(`${baseItemsURL}Items/${id}`, {
         params: {
           fields: "*,images.*,images.directus_files_id.*",
         },
         headers: {
           Authorization: `Bearer ${token}`,
         },
       })
       console.log("productImages", productImages)
       // delete the product
             await axios.delete(`${baseItemsURL}Items/${id}`, {
               headers: {
                 Authorization: `Bearer ${token}`,
               },
             })
       
             // console.log("productImages", productImages)
             productImages.data.data.images.forEach(async (image) => {
              await axios.delete(`${baseURL}files/${image.directus_files_id.id}`, {
               headers: {
                 Authorization: `Bearer ${token}`,
               },
             })
             console.log("productImages")
             })
      // }

      return {
        success: true,
        data: { deleted_id: id },
        message: "Product deleted successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Delete Product")
  }
}




// Add product with images and comprehensive validation
export const addProduct = async (payload, files) => {
  try {
    return await makeAuthenticatedRequest(async () => {
      if (!payload || typeof payload !== "object") {
        throw new Error("Product data is required")
      }



      if (!files || !Array.isArray(files) || files.length === 0) {
        throw new Error("At least one image is required")
      }

      // Validate required fields
      const requiredFields = ["name", "price", "category"]
      for (const field of requiredFields) {
        if (!payload[field]) {
          throw new Error(`${field} is required`)
        }
      }
      const { token, userId }  = await validateAuth()

      if (!token || !userId) {
        throw new Error("Authentication required")
      }

      // Validate file types
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "video/mp4", "video/mov", "video/avi", "video/mkv", "video/webm", "video/flv", "video/wmv", "video/mpeg", "video/mpg", "video/m4v", "video/m4a", "video/m4b", "video/m4p", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/m4b", "audio/m4p"]
      const invalidFiles = files.filter((file) => !allowedTypes.includes(file.type))
      if (invalidFiles.length > 0) {
        throw new Error("Only JPEG, PNG, and WebP images are allowed")
      }

      // Create the item
      const itemRes = await axios.post(
        `${baseItemsURL}Items`,
        {
          ...payload,
          user_id: userId,
          status_swap: "available",
          // date_created: new Date().toISOString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const itemId = await itemRes.data?.data?.id
      if (!itemId) {
        throw new Error("Failed to create product")
      }

      // console.log("Product created successfully, ID:", itemId)

      // Upload and link images with error handling
      const uploadResults = []
      for (let i = 0; i < files.length; i++) {
        try {
          const file = files[i]
          let formData = new FormData()
          formData.append("file", file)

          const fileRes = await axios.post(`${baseURL}files`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          })
          console.log("fileRes", fileRes)
          const fileId = fileRes.data?.data?.id
          if (!fileId) {
            throw new Error(`Failed to upload image ${i + 1}`)
          }
          
          if (!token) {
            throw new Error("Authentication required")
          }
          await axios.post(
            `${baseItemsURL}Items_files`,
            {
              Items_id: itemId,
              directus_files_id: fileId,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          )

          uploadResults.push({ index: i, file_id: fileId, success: true })
        } catch (uploadError) {
          console.error(`Failed to upload image ${i + 1}:`, uploadError.message)
          uploadResults.push({ index: i, success: false, error: uploadError.message })
        }
      }

      const successfulUploads = uploadResults.filter((r) => r.success).length
      if (successfulUploads === 0) {
        // If all uploads failed, throw error and do not allow product creation without images
        throw new Error("All image uploads failed. Product was not created with images. Please try again.")
      }
      //  console.log(`Product added successfully with ${successfulUploads}/${files.length} images, ID:`, itemId)

      return {
        success: true,
        data: {
          id: itemId,
          images_uploaded: successfulUploads,
          total_images: files.length,
          upload_results: uploadResults,
        },
        message: `Product added successfully with ${successfulUploads} images`,
      }
    })
  } catch (error) {
    return handleApiError(error, "Add Product")
  }
}

// Update product with images and comprehensive validation
export const updateProduct = async (payload, files, itemId) => { 
  try {
    return await makeAuthenticatedRequest(async () => {
      if (!payload || typeof payload !== "object" || !itemId) {
        throw new Error("Product data and ID are required")
      }

      // Allow zero new files if there are retained existing images
      const retainedIds = Array.isArray(payload.retained_image_file_ids) ? payload.retained_image_file_ids : []
      const deletedIds = Array.isArray(payload.deleted_image_file_ids) ? payload.deleted_image_file_ids : []
      
      if ((!files || !Array.isArray(files) || files.length === 0) && retainedIds.length === 0) {
        throw new Error("At least one image is required")
      }

      // const { token, userId } = await validateAuth()
      const token = await getCookie()
      const decoded = await decodedToken()
      const userId = decoded.id

      if (!token || !userId) {
        throw new Error("Authentication required")
      }

      // Verify ownership
      const existingProduct = await getProductById(itemId)
      if (!existingProduct.success) {
        throw new Error("Product not found")
      }

      if (existingProduct.data.user_id !== userId) {
        throw new Error("Unauthorized: You can only update your own products")
      }

      // Validate file types
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      const invalidFiles = files.filter((file) => !allowedTypes.includes(file.type))
      if (invalidFiles.length > 0) {
        throw new Error("Only JPEG, PNG, and WebP images are allowed")
      }
      
      console.log("payload in products.js", payload)
      const { deleted_image_file_ids, retained_image_file_ids, ...filteredPayload } = payload;
       console.log("filteredPayload",filteredPayload);
      // const filterPaylod = 

      const itemRes = await axios.patch(
        `${baseItemsURL}Items/${itemId}`,
        {
          ...filteredPayload,
          date_updated: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )


console.log("itemRes", itemRes)
      if (!itemRes.data?.data?.id) {
        throw new Error("Failed to update product")
      }

      // Handle deleted images
      if (deletedIds.length > 0) {
        for (const fileId of deletedIds) {
          try {
            // Find and delete the Items_files relation
            const relationRes = await axios.get(`${baseItemsURL}Items_files`, {
              params: {
                filter: {
                  Items_id: { _eq: itemId },
                  directus_files_id: { _eq: fileId },
                },
                limit: 1,
              },
              headers: {
                 Authorization: `Bearer ${token}`,
                 "Content-Type": "application/json",
               },
            });
          console.log("relationRes", relationRes)
            const relation = relationRes.data?.data?.[0];
            if (relation) {
              await axios.delete(`${baseItemsURL}Items_files/${relation.id}`, {
                headers: { Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });
              console.log("relation deleted" + relation.id)
            }
          } catch (deleteError) {
            console.warn(`Failed to delete image relation for file ${fileId}:`, deleteError.message);
            // Continue with other deletions even if one fails
          }
        }
      }

      // console.log("Product updated successfully with translations, ID:", itemId)

      // Upload new images
      const uploadResults = []
      for (let i = 0; i < (files?.length || 0); i++) {
        try {
          const file = files[i]
          const formData = new FormData()
          formData.append("file", file)

          const fileRes = await axios.post(`${baseURL}files`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          })
          console.log("fileRes", fileRes)
          const fileId = fileRes.data?.data?.id
          if (!fileId) {
            throw new Error(`Failed to upload image ${i + 1}`)
          }

        const fileUploadRes = await axios.post(
            `${baseItemsURL}Items_files`,
            {
              Items_id: itemId,
              directus_files_id: fileId,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          )
          console.log("fileUploadRes" + fileUploadRes)
          uploadResults.push({ index: i, file_id: fileId, success: true })
        } catch (uploadError) {
          console.error(`Failed to upload image ${i + 1}:`, uploadError.message)
          uploadResults.push({ index: i, success: false, error: uploadError.message })
        }
      }

      const successfulUploads = uploadResults.filter((r) => r.success).length
      //  console.log(`Product updated successfully with ${successfulUploads}/${files?.length || 0} new images, retained: ${retainedIds.length}, ID:`, itemId)

      return {
        success: true,
        data: {
          ...itemRes.data.data,
          images_uploaded: successfulUploads,
          images_deleted: deletedIds.length,
          total_images: (files?.length || 0) + retainedIds.length,
          upload_results: uploadResults,
          retained_image_file_ids: retainedIds,
          deleted_image_file_ids: deletedIds,
        },
        message: `Product updated successfully with ${successfulUploads} new images, ${deletedIds.length} deleted images, and ${retainedIds.length} retained images`,
      }
    })
  } catch (error) {
    return handleApiError(error, "Update Product")
  }
} 


// Update product quantity
export const updateProductQuantity = async (itemId, quantity , status_swap , completed_offer) => {
  try {
    return await makeAuthenticatedRequest(async () => {
      if (!itemId || quantity == null || typeof quantity !== 'number' || !status_swap) {
        throw new Error("Item ID, quantity and status are required")
      }

      const { token, userId } = await validateAuth()

      if (!token || !userId) {
        throw new Error("Authentication required")
      }

      // Update the item with translations included (Directus native approach)
      const itemRes = await axios.patch(
        `${baseItemsURL}Items/${itemId}`,
        {
          quantity: quantity,
          status_swap: status_swap,
          completed_offer:completed_offer,
          date_updated: new Date().toISOString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      return {
        success: true,
        data: {
          ...itemRes.data.data,
        },
        message: "Product quantity updated successfully to " + quantity + " and status updated to " + status_swap,
      }
    })
  } catch (error) {
    return handleApiError(error, "Update Product Quantity")
  }
}
    