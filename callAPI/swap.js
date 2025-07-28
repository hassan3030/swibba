import axios from "axios"
import {validateAuth , getCookie, decodedToken, baseItemsURL, baseURL, handleApiError, makeAuthenticatedRequest } from "./utiles.js"
import { getUserByProductId } from "./users.js"


// ========================= OFFERS MANAGEMENT =========================

// Get all offers with enhanced filtering
export const getAllOffers = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    // Add filters if provided
    if (filters.status) {
      queryParams.append("filter[status_offer][_eq]", filters.status)
    }
    if (filters.from_user_id) {
      queryParams.append("filter[from_user_id][_eq]", filters.from_user_id)
    }
    if (filters.to_user_id) {
      queryParams.append("filter[to_user_id][_eq]", filters.to_user_id)
    }
    if (filters.sort) {
      queryParams.append("sort", filters.sort)
    } else {
      queryParams.append("sort", "-date_created")
    }

    const url = `${baseItemsURL}/Offers${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    const response = await axios.get(url)

    console.log("Offers retrieved successfully, count:", response.data.data?.length || 0)
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      filters: filters,
      message: "Offers retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get All Offers")
  }
}

// Get offers by from_user_id (keeping original function name)
export const getOfferById = async (id) => {
  try {
    if (!id) {
      throw new Error("User ID is required")
    }

    const response = await axios.get(`${baseItemsURL}/Offers?filter[from_user_id][_eq]=${id}&sort=-date_created`)

    console.log("Sent offers retrieved successfully for user:", id)
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      user_id: id,
      message: "Sent offers retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Offers By User ID")
  }
}

// Get offers notifications (to_user_id)
export const getOffersNotifications = async (id) => {
  try {
    if (!id) {
      throw new Error("User ID is required")
    }

    const response = await axios.get(`${baseItemsURL}/Offers?filter[to_user_id][_eq]=${id}&sort=-date_created`)

    console.log("Received offers retrieved successfully for user:", id)
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      user_id: id,
      message: "Received offers retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Offers Notifications")
  }
}

// Get items by offer ID
export const getItemsByOfferId = async (id) => {
  try {
    if (!id) {
      throw new Error("Offer ID is required")
    }

    const response = await axios.get(`${baseItemsURL}/Offer_Items?filter[offer_id][_eq]=${id}`)

    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      offer_id: id,
      message: "Offer items retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Items By Offer ID")
  }
}

// Delete offer by ID (reject offer)
export const deleteOfferById = async (id) => {
   
  try {
    const auth = await validateAuth()

    return await makeAuthenticatedRequest(async () => {
      if (!id) {
        throw new Error("Offer ID is required")
      }

      // Get all items in the offer
      const itemsResult = await getItemsByOfferId(id)
      if (!itemsResult.success) {
        throw new Error("Failed to fetch offer items")
      }

      const items = itemsResult.data

      // Restore item availability
      const restorePromises = items.map(async (item) => {
        if (item.item_id) {
          try {
            await axios.patch(`${baseItemsURL}/Items/${item.item_id}`, {
              status_swap: "available",
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })
            return { item_id: item.item_id, success: true }
          } catch (error) {
            console.warn(`Failed to restore item ${item.item_id}:`, error.message)
            return { item_id: item.item_id, success: false, error: error.message }
          }
        }
      })

      const restoreResults = await Promise.allSettled(restorePromises)

      // Delete offer items
      const deleteItemPromises = items.map(async (item) => {
        if (item.id) {
          try {
            await axios.delete(`${baseItemsURL}/Offer_Items/${item.id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })
            return { offer_item_id: item.id, success: true }
          } catch (error) {
            console.warn(`Failed to delete offer item ${item.id}:`, error.message)
            return { offer_item_id: item.id, success: false, error: error.message }
          }
        }
      })

      await Promise.allSettled(deleteItemPromises)

      // Delete related chats
      try {
        const chatRes = await axios.get(`${baseItemsURL}/Chat?filter[offer_id][_eq]=${id}`)
        const chats = chatRes.data?.data || []

        const deleteChatPromises = chats.map((chat) =>
          chat.id ? axios.delete(`${baseItemsURL}/Chat/${chat.id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            }) : Promise.resolve(),
        )

        await Promise.allSettled(deleteChatPromises)
      } catch (chatError) {
        console.warn("Failed to delete some chat messages:", chatError.message)
      }

      // Update offer status to rejected
      await axios.patch(`${baseItemsURL}/Offers/${id}`, {
        status_offer: "rejected",
      },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      console.log("Offer rejected successfully, ID:", id)
      return {
        success: true,
        data: {
          offer_id: id,
          items_restored: items.length,
          restore_results: restoreResults,
        },
        message: "Offer rejected successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Delete Offer By ID")
  }
}






// Finally Delete offer by ID 
export const deleteFinallyOfferById = async (id) => {
  try {
    const auth = await validateAuth()
    return await makeAuthenticatedRequest(async () => {
      if (!id) {
        throw new Error("Offer ID is required")
      }
 
      await axios.patch(`${baseItemsURL}/Offers/${id}`, {
        finaly_deleted: false,
      },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })
      console.log("Offer Deleted Finally successfully, ID:", id)
      return {
        success: true,
        data: {
          offer_id: id,
          items_restored: items.length,
          restore_results: restoreResults,
        },
        message: "Offer Finally Deleted successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Finally Delete Offer By ID")
  }
}

// Accept offer (keeping original function name)
export const acceptedOffer = async (id) => {
  try {
    const auth = await validateAuth()
    return await makeAuthenticatedRequest(async () => {
      if (!id) {
        throw new Error("Offer ID is required")
      }

      const response = await axios.patch(`${baseItemsURL}/Offers/${id}`, {
        status_offer: "accepted",
      },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      console.log("Offer accepted successfully, ID:", id)
      return {
        success: true,
        data: response.data.data,
        message: "Offer accepted successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Accept Offer")
  }
}

// Update offer by ID (cash adjustment)
export const updateOfferById = async (id, cash_adjustment) => {
  try {
    const auth = await validateAuth()
    return await makeAuthenticatedRequest(async () => {
      if (!id) {
        throw new Error("Offer ID is required")
      }

      if (typeof cash_adjustment !== "number") {
        throw new Error("Cash adjustment must be a number")
      }

      const response = await axios.patch(`${baseItemsURL}/Offers/${id}`, {
        cash_adjustment,
      },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      console.log("Offer cash adjustment updated successfully, ID:", id)
      return {
        success: true,
        data: response.data.data,
        message: "Cash adjustment updated successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Update Offer By ID")
  }
}

// Accept offer by ID (keeping original function name)
export const acceptedOfferById = async (id_offer) => {
  try {
    const auth = await validateAuth()
    return await makeAuthenticatedRequest(async () => {
      if (!id_offer) {
        throw new Error("Offer ID is required")
      }

      const response = await axios.patch(`${baseItemsURL}/Offers/${id_offer}`, {
        status_offer: "accepted",
      },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      console.log("Offer accepted successfully, ID:", id_offer)
      return {
        success: true,
        data: response.data.data,
        message: "Offer accepted successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Accept Offer By ID")
  }
}

// Complete offer by ID
export const completedOfferById = async (id_offer) => {
  try {
    const auth = await validateAuth()
    return await makeAuthenticatedRequest(async () => {
      if (!id_offer) {
        throw new Error("Offer ID is required")
      }

      // Get all items in the offer
      const itemsResult = await getItemsByOfferId(id_offer)
      if (!itemsResult.success) {
        throw new Error("Failed to fetch offer items")
      }

      const items = itemsResult.data

      // Delete the actual items (they've been traded)
      const deleteItemPromises = items.map(async (item) => {
        if (item.item_id) {
          try {
            await axios.delete(`${baseItemsURL}/Items/${item.item_id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })
            return { item_id: item.item_id, success: true }
          } catch (error) {
            console.warn(`Failed to delete item ${item.item_id}:`, error.message)
            return { item_id: item.item_id, success: false, error: error.message }
          }
        }
      })

      const deleteResults = await Promise.allSettled(deleteItemPromises)

      // Delete offer items
      const deleteOfferItemPromises = items.map(async (item) => {
        if (item.id) {
          try {
            await axios.delete(`${baseItemsURL}/Offer_Items/${item.id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })
            return { offer_item_id: item.id, success: true }
          } catch (error) {
            console.warn(`Failed to delete offer item ${item.id}:`, error.message)
            return { offer_item_id: item.id, success: false, error: error.message }
          }
        }
      })

      await Promise.allSettled(deleteOfferItemPromises)

      // Update offer status to completed
      const response = await axios.patch(`${baseItemsURL}/Offers/${id_offer}`, {
        status_offer: "completed",
      },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      console.log("Offer completed successfully, ID:", id_offer)
      return {
        success: true,
        data: {
          ...response.data.data,
          items_traded: items.length,
          delete_results: deleteResults,
        },
        message: "Offer completed successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Complete Offer By ID")
  }
}

// Add offer with transaction-like behavior
export const addOffer = async (to_user_id, cash_adjustment = 0, user_prods, owner_prods, message, name = "") => {
  let offer_id = null
  const createdItemIds = []
  const updatedItemIds = []

  try {
  
    return await makeAuthenticatedRequest(async () => {
      // Validation
      if (!to_user_id) {
        throw new Error("Recipient user ID is required")
      }

      if (!user_prods || !owner_prods || (!user_prods.length && !owner_prods.length)) {
        throw new Error("At least one item must be included in the offer")
      }

      const auth = await validateAuth()
      const allItems = [...(user_prods || []), ...(owner_prods || [])]

      // Validate all items exist and are available
      for (const itemId of allItems) {
        const itemResponse = await axios.get(`${baseItemsURL}/Items/${itemId}`)
        const item = itemResponse.data.data

        if (!item) {
          throw new Error(`Item ${itemId} not found`)
        }

        if (item.status_swap !== "available") {
          throw new Error(`Item ${itemId} is not available for swapping`)
        }
      }

      // Create the offer
      const offerRes = await axios.post(`${baseURL}/items/Offers`, {
        from_user_id: auth.userId,
        to_user_id,
        cash_adjustment: cash_adjustment || 0,
        status_offer: "pending",
        name: name || `Offer from ${auth.userId}`,
      },{
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      offer_id = offerRes.data.data.id
      console.log("Offer created successfully, ID:", offer_id)

      // Add items to the offer
      for (const itemId of allItems) {
        const ownerResult = await getUserByProductId(itemId)
        if (!ownerResult.success) {
          throw new Error(`Failed to get owner for item ${itemId}`)
        }

        const offerItemResponse = await axios.post(`${baseURL}/items/Offer_Items`, {
          offer_id,
          item_id: itemId,
          offered_by: ownerResult.data.id,
        },{
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

        createdItemIds.push(offerItemResponse.data.data.id)
      }

      // Update items status to unavailable
      for (const itemId of allItems) {
        await axios.patch(`${baseItemsURL}/Items/${itemId}`, {
          status_swap: "unavailable",
        },{
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })
        updatedItemIds.push(itemId)
      }

      // Add initial message if provided
      if (message && message.trim()) {
        await axios.post(`${baseURL}/items/Chat`, {
          from_user_id: auth.userId,
          to_user_id,
          offer_id,
          message: message.trim(),
        },{
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })
      }

      console.log("Offer created successfully with all items and message")
      return {
        success: true,
        data: {
          offer_id,
          items_count: allItems.length,
          has_message: !!(message && message.trim()),
        },
        message: "Offer created successfully",
      }
    })
  } catch (error) {
    // Rollback on error
    console.error("Error creating offer, attempting rollback...")

    try {
      const auth = await validateAuth()
      // Restore item statuses
      for (const itemId of updatedItemIds) {
        await axios.patch(`${baseItemsURL}/Items/${itemId}`, {
          status_swap: "available",
        },{
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })
      }

      // Delete created offer items
      for (const offerItemId of createdItemIds) {
        await axios.delete(`${baseItemsURL}/Offer_Items/${offerItemId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })
      }

      // Delete created offer
      if (offer_id) {
        await axios.delete(`${baseItemsURL}/Offers/${offer_id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })
      }

      console.log("Rollback completed successfully")
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError.message)
    }

    return handleApiError(error, "Add Offer")
  }
}

// ========================= OFFER ITEMS MANAGEMENT =========================

// Get all offer items
export const getOfferItems = async () => {
  try {
    const response = await axios.get(`${baseItemsURL}/Offer_Items`)

    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      message: "Offer items retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Offer Items")
  }
}

// Get offer item by ID
export const getOfferItemsById = async (id) => {
  try {
    if (!id) {
      throw new Error("Offer item ID is required")
    }

    const response = await axios.get(`${baseItemsURL}/Offer_Items/${id}`)

    return {
      success: true,
      data: response.data.data,
      message: "Offer item retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Offer Items By ID")
  }
}

// Get offer items by offer ID
export const getOfferItemsByOfferId = async (offer_id) => {
  try {
    if (!offer_id) {
      throw new Error("Offer ID is required")
    }

    const response = await axios.get(`${baseItemsURL}/Offer_Items?filter[offer_id][_eq]=${offer_id}`)

    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      offer_id: offer_id,
      message: "Offer items retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Offer Items By Offer ID")
  }
}

// Delete offer item by ID
export const deleteOfferItemsById = async (id, idItemItself, cashAdjustment, offer_id) => {
  try {
    const auth = await validateAuth()
    return await makeAuthenticatedRequest(async () => {
      if (!id || !idItemItself) {
        throw new Error("Offer item ID and item ID are required")
      }

      // Restore item availability
      await axios.patch(`${baseItemsURL}/Items/${idItemItself}`, {
        status_swap: "available",
      },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      // Delete offer item
      await axios.delete(`${baseItemsURL}/Offer_Items/${id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      // Update cash adjustment if provided
      if (offer_id && cashAdjustment !== null && cashAdjustment !== undefined && !isNaN(cashAdjustment)) {
        const patchRes = await axios.patch(`${baseItemsURL}/Offers/${offer_id}`, {
          cash_adjustment: cashAdjustment,
        },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })
        console.log("Cash adjustment updated:", patchRes.data)
      }

      console.log("Offer item deleted successfully, ID:", id)
      return {
        success: true,
        data: {
          deleted_offer_item_id: id,
          restored_item_id: idItemItself,
          cash_adjustment_updated: cashAdjustment !== null && !isNaN(cashAdjustment),
        },
        message: "Offer item deleted successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Delete Offer Items By ID")
  }
}

// Update offer item by ID
export const updateOfferItemsById = async (id, updateData = {}) => {
  try {
    const auth = await validateAuth()
    return await makeAuthenticatedRequest(async () => {
      if (!id) {
        throw new Error("Offer item ID is required")
      }

      if (!updateData || typeof updateData !== "object") {
        throw new Error("Update data is required")
      }

      const response = await axios.patch(`${baseItemsURL}/Offer_Items/${id}`, updateData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      console.log("Offer item updated successfully, ID:", id)
      return {
        success: true,
        data: response.data.data,
        message: "Offer item updated successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Update Offer Items By ID")
  }
}

// ========================= CHAT/MESSAGING SYSTEM =========================

// Add message
export const addMessage = async (message, to_user_id, offer_id) => {
  try {
    const auth = await validateAuth()
    return await makeAuthenticatedRequest(async () => {
      if (!message || !message.trim()) {
        throw new Error("Message content is required")
      }

      if (!to_user_id || !offer_id) {
        throw new Error("Recipient user ID and offer ID are required")
      }

      const auth = await validateAuth()

      const response = await axios.post(`${baseItemsURL}/Chat`, {
        from_user_id: auth.userId,
        to_user_id,
        offer_id,
        message: message.trim(),
      },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      console.log("Message added successfully to offer:", offer_id)
      return {
        success: true,
        data: response.data.data,
        message: "Message sent successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Add Message")
  }
}

// Get messages by offer ID
export const getMessage = async (offer_id) => {
  try {
    if (!offer_id) {
      throw new Error("Offer ID is required")
    }

    const response = await axios.get(`${baseItemsURL}/Chat?filter[offer_id][_eq]=${offer_id}&sort=date_created`)

    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      offer_id: offer_id,
      message: "Messages retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Message")
  }
}

// Get all messages
export const getAllMessage = async () => {
  try {
    const response = await axios.get(`${baseItemsURL}/Chat?sort=-date_created`)

    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      message: "All messages retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get All Messages")
  }
}

// ========================= WISHLIST MANAGEMENT =========================

// Add to wishlist
export const addWishList = async (item_id, user_id) => {
  try {
    const auth = await validateAuth()
    if (!item_id || !user_id) {
      throw new Error("Item ID and user ID are required")
    }

    // // Check if item already in wishlist
    // const existingResponse = await axios.get(
    //   `${baseItemsURL}/WishList?filter[item_id][_eq]=${item_id}&filter[user_id][_eq]=${user_id}`,
    // )

    // if (existingResponse.data.data.length > 0) {
    //   return {
    //     success: false,
    //     error: "Item already in wishlist",
    //     status: 409,
    //   }
    // }

    const response = await axios.post(`${baseItemsURL}/WishList`, {
      item_id,
      user_id,
    },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

    console.log("Item added to wishlist successfully, item ID:", item_id)
    return {
      success: true,
      data: response.data.data,
      message: "Item added to wishlist successfully",
    }
  } catch (error) {
    return handleApiError(error, "Add Wish List")
  }
}

// Get wishlist by user ID
export const getWishList = async (user_id) => {
  try {
    if (!user_id) {
      throw new Error("User ID is required")
    }

    const response = await axios.get(`${baseItemsURL}/WishList?filter[user_id][_eq]=${user_id}`)

    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      user_id: user_id,
      message: "Wishlist retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Wish List")
  }
}

// Get all wishlists
export const getAllWishList = async () => {
  try {
    const response = await axios.get(`${baseItemsURL}/WishList`)

    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      message: "All wishlists retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get All Wish List")
  }
}

// Delete wishlist item by ID
export const deleteWishList = async (id) => {
  try {

    if (!id) {
      throw new Error("Wishlist ID is required")
    }
   const auth = await validateAuth()
    await axios.delete(`${baseItemsURL}/WishList/${id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

    console.log("Item removed from wishlist successfully, ID:", id)
    return {
      success: true,
      data: { deleted_id: id },
      message: "Item removed from wishlist successfully",
    }
  } catch (error) {
    return handleApiError(error, "Delete Wish List")
  }
}

// ========================= REVIEWS SYSTEM =========================

// Add review
export const addReview = async (from_user_id, to_user_id, offer_id, rating, comment) => {
  try {
    const auth = await validateAuth()
    return await makeAuthenticatedRequest(async () => {
      if (!from_user_id || !to_user_id || !offer_id || !rating) {
        throw new Error("From user ID, to user ID, offer ID, and rating are required")
      }

      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5")
      }

      // Check if review already exists
      const existingResponse = await axios.get(
        `${baseItemsURL}/Reviews?filter[from_user_id][_eq]=${from_user_id}&filter[offer_id][_eq]=${offer_id}`,
      )

      if (existingResponse.data.data.length > 0) {
        return {
          success: false,
          error: "Review already exists for this offer",
          status: 409,
        }
      }

      const response = await axios.post(`${baseItemsURL}/Reviews`, {
        from_user_id,
        to_user_id,
        offer_id,
        rating,
        comment: comment || "No comment",
      },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      console.log("Review added successfully for offer:", offer_id)
      return {
        success: true,
        data: response.data.data,
        message: "Review added successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Add Review")
  }
}

// Get reviews for a user
export const getReview = async (to_user_id) => {
  try {
    if (!to_user_id) {
      throw new Error("User ID is required")
    }

    const response = await axios.get(`${baseItemsURL}/Reviews?filter[to_user_id][_eq]=${to_user_id}`)

    const reviews = response.data.data || []
    const averageRating =
      reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

    return {
      success: true,
      data: {
        reviews,
        total_reviews: reviews.length,
        average_rating: Math.round(averageRating * 10) / 10,
      },
      message: "Reviews retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Review")
  }
}

// Get review conditions (check if user can review)
export const getReviewConditins = async (from_user_id, offer_id) => {
  try {
    if (!from_user_id || !offer_id) {
      throw new Error("From user ID and offer ID are required")
    }

    const response = await axios.get(
      `${baseItemsURL}/Reviews?filter[from_user_id][_eq]=${from_user_id}&filter[offer_id][_eq]=${offer_id}`,
    )

    const hasReviewed = response.data.data.length > 0

    return {
      success: true,
      data: {
        can_review: !hasReviewed,
        has_reviewed: hasReviewed,
        existing_reviews: response.data.data || [],
      },
      message: hasReviewed ? "User has already reviewed this offer" : "User can review this offer",
    }
  } catch (error) {
    console.error("Failed to check review conditions:", error)
    return {
      success: false,
      error: "Failed to check review conditions",
      status: error.response?.status || 500,
    }
  }
}
