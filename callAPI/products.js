import axios from "axios"
import { getCookie, decodedToken, baseItemsURL, baseURL, handleApiError, makeAuthenticatedRequest , validateAuth ,STATIC_ADMIN_TOKEN} from "./utiles.js"
import { getUserByProductId } from "./users.js"



// Get available/unavailable products by user ID
export const getAvailableAndUnavailableProducts = async (user_id, available = true) => {
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

    const status = available ? "available" : "unavailable";
    const response = await axios.get(
      `${baseItemsURL}/Items?filter[user_id][_eq]=${user_id}&filter[status_swap][_eq]=${status}?fields=*,translations.*,images.*`,
      { headers }
    );

    console.log(`Retrieved ${status} products for user:`, user_id);
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      message: `${status} products retrieved successfully`,
    };
  } catch (error) {
    return handleApiError(error, "Get Available/Unavailable Products");
  }
};

// Get all products with smart filtering based on authentication
export const getProducts = async (filters = {}) => {
  try {
    const token = await getCookie()
    let response;
    const queryParams = new URLSearchParams()

    if (!token) {
      // Public access - show only available items
    response = await axios.get(`${baseItemsURL}/Items`,
      {
        params: {
          fields: "*,images.*,translations.*",
          filter: {
            status_swap: { _neq: "unavailable" },
          }
        }
      })
    } else {
      // Authenticated access - exclude user's own items and unavailable items
      const decoded = await decodedToken()
      if (decoded?.id) {
        response = await axios.get(`${baseItemsURL}/Items`,
          {
            params: {
              fields: "*,images.*,translations.*",
              filter: {
                user_id: { _neq: `${decoded.id}` },
                status_swap: { _neq: "unavailable" },
              }
            }
          })
      } else {
        response = await axios.get(`${baseItemsURL}/Items`,
          {
            params: {
              fields: "*,images.*,translations.*",
              filter: {
                status_swap: { _neq: "unavailable" },
              }
            }
          })
      }
    }

    // Add additional filters
    if (filters.category) {
      response = await axios.get(`${baseItemsURL}/Items`,
        {
          params: {
            fields: "*,images.*,translations.*",
            filter: {
              category: { _eq: encodeURIComponent(filters.category) },
            }
          }
        })
    }
    if (filters.min_price) {
      response = await axios.get(`${baseItemsURL}/Items`,
        {
          params: {
            fields: "*,images.*,translations.*",
            filter: {
              price: { _gte: filters.min_price },
            }
          }
        })
    }
    if (filters.max_price) {
      response = await axios.get(`${baseItemsURL}/Items`,
        {
          params: {
            fields: "*,images.*,translations.*",
            filter: {
              price: { _lte: filters.max_price },
            }
          }
        })
    }
    if (filters.search) {
      response = await axios.get(`${baseItemsURL}/Items`,
        {
          params: {
            fields: "*,images.*,translations.*",
            filter: {
              name: { _contains: encodeURIComponent(filters.search) },
            }
          }
        })
    }
    if (filters.sort) {
      response = await axios.get(`${baseItemsURL}/Items`,
        {
          params: {
            fields: "*,images.*,translations.*",
            sort: filters.sort,
          }
        })
    }
    if (filters.limit) {
      response = await axios.get(`${baseItemsURL}/Items`,
        {
          params: {
            fields: "*,images.*,translations.*",
            limit: filters.limit,
          }
        })
    }
// handle pathname
    // url = `${baseItemsURL}/Items?${queryParams.toString()}?fields=*,translations.*,images.*`
    // url = `${baseItemsURL}/Items?fields=*,translations.*,images.*`
    //  url = `${baseItemsURL}/Items?fields=*,translations.*,images.*`
  
    console.log("response", response)
    console.error("response.data.data[0].images", response.data.images)
    console.error("response.data.data[0].images", response.data.images)
    console.log("Products retrieved successfully, count:", response.data.data?.length || 0)
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      message: "Products retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Products")
  }
}

// Get product images with validation
export const getImageProducts = async (imageIds) => {
  try {
    // if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
    //   throw new Error("Image IDs array is required and must not be empty")
    // }

    // const validIds = imageIds.filter((id) => id && typeof id === "string")
    // if (validIds.length === 0) {
    //   throw new Error("No valid image IDs provided")
    // }

    const ids = imageIds.join(",")
    const response = await axios.get(`${baseItemsURL}/Items_files?filter[id][_in]=${ids}`, 
      //  {
      //   "email": "admin@example.com",
      //    "password": "123"
      // } 
    )

    console.log("Product images retrieved successfully, count:", response.data.data?.length || 0)
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      message: "Images retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Product Images")
  }
}

// Get all product images
export const getAllImageProducts = async () => {
  try {
    const response = await axios.get(`${baseItemsURL}/Items_files`)

    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      message: "All images retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get All Product Images")
  }
}

// Get product by ID with enhanced validation
export const getProductById = async (id) => {
  try {
    if (!id) {
      throw new Error("Product ID is required")
    }

    // const response = await axios.get(`${baseItemsURL}/Items/${id}?fields=*,translations.*,images.*`)
    const response = await axios.get(
      `${baseItemsURL}/Items/${id}?fields=*,translations.*,images.*`
    );
    console.log("response", response)
    console.log("response.data.data", response.data.data)
    if (!response.data.data) {
      throw new Error("Product not found")
    }

    console.log("Product retrieved successfully, ID:", id)
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

// Get top price products with enhanced filtering
export const getProductTopPrice = async (limit = 10) => {
  try {
    const decoded = await decodedToken()
    let url

    const queryParams = new URLSearchParams()
    queryParams.append("filter[status_swap][_eq]", "available")
    queryParams.append("sort", "-price")
    queryParams.append("limit", limit.toString())
    
    if (decoded?.id) {
      queryParams.append("filter[user_id][_neq]", decoded.id)
    }

    url = `${baseItemsURL}/Items?${queryParams.toString()}&fields=*,translations.*,images.*`
    const response = await axios.get(url)

    console.log("Top price products retrieved successfully, count:", response.data.data?.length || 0)
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
    queryParams.append("filter[_and][1][_or][0][name][_contains]", encodeURIComponent(cleanFilter))
    queryParams.append("filter[_and][1][_or][1][description][_contains]", encodeURIComponent(cleanFilter))
    queryParams.append("filter[_and][1][_or][2][category][_contains]", encodeURIComponent(cleanFilter))

    const url = `${baseItemsURL}/Items?${queryParams.toString()}?fields=*,translations.*,images.*`
    const response = await axios.get(url)

    console.log("Search completed, results:", response.data.data?.length || 0)
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
    if (!category || typeof category !== "string" || category.trim().length === 0) {
      throw new Error("Category is required and must be a non-empty string")
    }

    const cleanCategory = category.trim()
    const response = await axios.get(`${baseItemsURL}/Items`,
      {
        params: {
          fields: "*,images.*,translations.*",
          filter: {
            category: { _eq: cleanCategory },
            status_swap: { _neq: "unavailable" },
          }
        }
      })

    console.log("Products by category retrieved successfully, count:", response.data.data?.length || 0)
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

// Get products by current user ID
export const getProductByUserId = async () => {
  try {
    return await makeAuthenticatedRequest(async () => {
      const decoded = await decodedToken()
      if (!decoded?.id) {
        throw new Error("Authentication required")
      }

      const response = await axios.get(` ${baseItemsURL}/Items` ,
      {
        params: {
          fields: "*,images.*,translations.*",
          filter: {
            user_id: { _eq:`${decoded.id}` },
          }
        }
      }
      )

        // /?filter[user_id][_eq]=?fields=*,translations.*,images.*`)

      console.log("User products retrieved successfully, count:", response.data.data?.length || 0)
      return {
        success: true,
        data: response.data.data || [],
        count: response.data.data?.length || 0,
        user_id: decoded.id,
        message: "User products retrieved successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Get Products By User ID")
  }
}

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

    const response = await axios.get(`${baseItemsURL}/Items/?filter[user_id][_eq]=${userResult.data.id}?fields=*,translations.*,images.*`)

    console.log("Owner products retrieved successfully, count:", response.data.data?.length || 0)
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

// Delete product with authentication
export const deleteProduct = async (id) => {
  try {
    return await makeAuthenticatedRequest(async () => {
      if (!id) {
        throw new Error("Product ID is required")
      }

      // Verify ownership before deletion
      const decoded = await decodedToken()
      const productResult = await getProductById(id)

      if (!productResult.success) {
        throw new Error("Product not found")
      }

      if (productResult.data.user_id !== decoded.id) {
        throw new Error("Unauthorized: You can only delete your own products")
      }

      // Add delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      await axios.delete(`${baseItemsURL}/Items/${id}`)

      console.log("Product deleted successfully, ID:", id)
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
      const auth = await validateAuth()
      const token = auth.token
      const decoded = auth.decoded

      if (!token || !decoded?.id) {
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
        `${baseItemsURL}/Items`,
        {
          ...payload,
          user_id: decoded.id,
          status_swap: "available",
          date_created: new Date().toISOString(),
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

      console.log("Product created successfully, ID:", itemId)

      // Upload and link images with error handling
      const uploadResults = []
      for (let i = 0; i < files.length; i++) {
        try {
          const file = files[i]
          let formData = new FormData()
          formData.append("file", file)

          const fileRes = await axios.post(`${baseURL}/files`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          })

          const fileId = fileRes.data?.data?.id
          if (!fileId) {
            throw new Error(`Failed to upload image ${i + 1}`)
          }

          await axios.post(
            `${baseItemsURL}/Items_files`,
            {
              Items_id: itemId,
              directus_files_id: fileId,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${STATIC_ADMIN_TOKEN}`,
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
      console.log(`Product added successfully with ${successfulUploads}/${files.length} images, ID:`, itemId)

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

      if (!files || !Array.isArray(files) || files.length === 0) {
        throw new Error("At least one image is required")
      }

      const token = await getCookie()
      const decoded = await decodedToken()

      if (!token || !decoded?.id) {
        throw new Error("Authentication required")
      }

      // Verify ownership
      const existingProduct = await getProductById(itemId)
      if (!existingProduct.success) {
        throw new Error("Product not found")
      }

      if (existingProduct.data.user_id !== decoded.id) {
        throw new Error("Unauthorized: You can only update your own products")
      }

      // Validate file types
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      const invalidFiles = files.filter((file) => !allowedTypes.includes(file.type))
      if (invalidFiles.length > 0) {
        throw new Error("Only JPEG, PNG, and WebP images are allowed")
      }

      // Update the item with translations included (Directus native approach)
      const itemRes = await axios.patch(
        `${baseItemsURL}/Items/${itemId}`,
        {
          ...payload,
          date_updated: new Date().toISOString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!itemRes.data?.data?.id) {
        throw new Error("Failed to update product")
      }

      console.log("Product updated successfully with translations, ID:", itemId)

      // Delete existing images
      try {
        const existingImagesRes = await axios.get(`${baseItemsURL}/Items_files?filter[Items_id][_eq]=${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const deletePromises = (existingImagesRes.data?.data || []).map((img) =>
          axios.delete(`${baseItemsURL}/Items_files/${img.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        )

        await Promise.allSettled(deletePromises)
        console.log("Existing images cleaned up")
      } catch (deleteError) {
        console.warn("Failed to delete some existing images:", deleteError.message)
      }

      // Upload new images
      const uploadResults = []
      for (let i = 0; i < files.length; i++) {
        try {
          const file = files[i]
          const formData = new FormData()
          formData.append("file", file)

          const fileRes = await axios.post(`${baseURL}/files`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          })

          const fileId = fileRes.data?.data?.id
          if (!fileId) {
            throw new Error(`Failed to upload image ${i + 1}`)
          }

          await axios.post(
            `${baseItemsURL}/Items_files`,
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
      console.log(`Product updated successfully with ${successfulUploads}/${files.length} images, ID:`, itemId)

      return {
        success: true,
        data: {
          ...itemRes.data.data,
          images_uploaded: successfulUploads,
          total_images: files.length,
          upload_results: uploadResults,
        },
        message: `Product updated successfully with ${successfulUploads} images`,
      }
    })
  } catch (error) {
    return handleApiError(error, "Update Product")
  }
} 