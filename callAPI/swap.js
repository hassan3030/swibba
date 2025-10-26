import axios from "axios"
import {validateAuth , baseItemsURL, baseURL, handleApiError, makeAuthenticatedRequest, decodedToken, getCookie } from "./utiles.js"
import { getUserById, getUserByProductId } from "./users.js"
 

// ========================= OFFERS MANAGEMENT =========================


// Get product by ID with enhanced validation
export const getProductOfferItemById = async (id) => {
  try {
    if (!id) {
      throw new Error("Product ID is required")
    }
    // const response = await axios.get(`${baseItemsURL}Items/${id}?fields=*,translations.*,images.*`)
    const response = await axios.get(
      `${baseItemsURL}Items/${id}`,
      {
        params: {
          fields: "*,translations.*,images.*,images.directus_files_id.*"
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

    const url = `${baseItemsURL}Offers${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    const response = await axios.get(url)

     // console.log("Offers retrieved successfully, count:", response.data.data?.length || 0)
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

    const response = await axios.get(`${baseItemsURL}Offers`,
      {
        params: {
          fields: "*",
          filter: {
            from_user_id: {  // how ?
              _eq: id
            },
            from_finaly_deleted: {
              _in: ["false", "False" , false]
            }
          },
          sort: "-date_created",
        }
      })

    // console.log("Sent offers retrieved successfully for user:", id)
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
export const getOffeReceived = async (id) => {
  try {
    if (!id) {
      throw new Error("User ID is required")
    }

    // const auth = await validateAuth()

    const response = await axios.get(`${baseItemsURL}Offers`,
      {
        params: {
          fields: "*",
          filter: {
            to_user_id: {
              _eq: id
            },
            to_finaly_deleted: {
              _in: ["false", "False" , false]
            }
          },
          sort: "-date_created"
        }
      })

    // console.log("Received offers retrieved successfully for user:", id)
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      user_id: id,
      message: "Offers received retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Offers Received")
  }
}

// Get items by offer ID
export const getItemsByOfferId = async (id) => {
  try {
    if (!id) {
      throw new Error("Offer ID is required")
    }
    const response = await axios.get(`${baseItemsURL}Offer_Items?filter[offer_id][_eq]=${id}`)
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




// Finally Delete offer by ID 
export const deleteFinallyOfferById = async (offer_id , from_to_user) => {
  try {
    const auth = await validateAuth()
    return await makeAuthenticatedRequest(async () => {
      if (!offer_id) {
        throw new Error("Offer ID is required")
      }
      let response;
      if(from_to_user === "from") {
        response = await axios.patch(`${baseItemsURL}Offers/${offer_id}`, {
          from_finaly_deleted: "true",
        },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth.token}`,
                },
              })
      } else if(from_to_user === "to") {  
        response = await axios.patch(`${baseItemsURL}Offers/${offer_id}`, {
          to_finaly_deleted: "true",
        },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth.token}`,
                },
              })
      } else {
        throw new Error("From or To user is required")
      }
      return {
        success: true,
        data: response.data.data,
        message: "Offer Finally Deleted successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Finally Delete Offer By ID")
  }
}

//  (reject offer) offer by ID
export const rejectOfferById = async (id) => {
   
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

      // Restore item availability and quantities
      const restoreItems = items.map(async (item) => {
        if (item.item_id) {
          try {

            // Get current item state
            const itemResponse = await axios.get(`${baseItemsURL}Items/${item.item_id}`)
            const currentItem = itemResponse.data.data
            const currentQuantity = currentItem.quantity || 0
            const offerQuantity = item.quantity || 1
            const restoredQuantity = currentQuantity + offerQuantity

            await axios.patch(`${baseItemsURL}Items/${item.item_id}`, {
              quantity: restoredQuantity,
              status_swap: "available",
            }, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })
            return { item_id: item.item_id, success: true, restored_quantity: restoredQuantity }
          } catch (error) {
            console.warn(`Failed to restore item ${item.item_id}:`, error.message)
            return { item_id: item.item_id, success: false, error: error.message }
          }
        }
      })

      const restoreResults = await Promise.allSettled(restoreItems)

      // Delete offer items
      const deleteOfferItems = items.map(async (item) => {
        if (item.id) {
          try {
            await axios.delete(`${baseItemsURL}Offer_Items`,
              {          
            params: {
                filter: {
                  id: {
                    _eq: item.id
                  },
                  offer_id: {
                    _eq: id
                  }
                }
              }
            ,
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth.token}`,
                },
              }
            )
            return { offer_item_id: item.id, success: true }
          } catch (error) {
            console.warn(`Failed to delete offer item ${item.id}:`, error.message)
            return { offer_item_id: item.id, success: false, error: error.message }
          }
        }
      })

      await Promise.allSettled(deleteOfferItems)

      // Delete related chats
      try {
        const chatRes = await axios.get(`${baseItemsURL}Chat?filter[offer_id][_eq]=${id}`)
        const chats = chatRes.data?.data || []

        const deleteChats = chats.map((chat) =>
            chat.id ? axios.delete(`${baseItemsURL}Chat/${chat.id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            }) : Promise.resolve(),
        )

        await Promise.allSettled(deleteChats)
      } catch (chatError) {
        console.warn("Failed to delete some chat messages:", chatError.message)
      }

      // Update offer status to rejected
      await axios.patch(`${baseItemsURL}Offers/${id}`, {
        status_offer: "rejected",
      },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      // console.log("Offer rejected successfully, ID:", id)
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
    return handleApiError(error, "Reject Offer By ID")
  }
}


// // Accept offer (keeping original function name)
// export const acceptedOffer = async (id) => {
//   try {
//     const auth = await validateAuth()
//     return await makeAuthenticatedRequest(async () => {
//       if (!id) {
//         throw new Error("Offer ID is required")
//       }

//       const response = await axios.patch(`${baseItemsURL}/Offers/${id}`, {
//         status_offer: "accepted",
//       },
//             {
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${auth.token}`,
//               },
//             })

//       // console.log("Offer accepted successfully, ID:", id)
//       return {
//         success: true,
//         data: response.data.data,
//         message: "Offer accepted successfully",
//       }
//     })
//   } catch (error) {
//     return handleApiError(error, "Accept Offer")
//   }
// }
// Accept offer by ID (keeping original function name)  without remove item
export const acceptedOfferById = async (id_offer) => {
  try {
    const auth = await validateAuth()
    return await makeAuthenticatedRequest(async () => {
      if (!id_offer) {
        throw new Error("Offer ID is required")
      }

      const response = await axios.patch(`${baseItemsURL}Offers/${id_offer}`, {
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


// Update offer by ID (cash adjustment) when remove item
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

      const response = await axios.patch(`${baseItemsURL}Offers/${id}`, {
        cash_adjustment,
      },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      // console.log("Offer cash adjustment updated successfully, ID:", id)
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


// get number of completed offer
export const getCompletedOffer = async (user_id) => {
  try {
    const token = await getCookie()
    if (!token) {
      throw new Error("Token is required")
    }
    
    const response = await axios.get(`${baseItemsURL}completed_rate_offer`,
      {
        params: {
          filter: {
            owner_user: {
              _eq: user_id
            }
          }
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      })
    console.log("response completed offer", response)
    return {
      success: true,
      count: response.data.data?.[0]?.num_comp_offer || 0,
      user_id: user_id,
      data: response.data.data,
      message: "Completed offer retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Completed Offer")
  }
}

// Add completed offer to user's completedSwaps count
export const addCompletedOfferToUser = async (from_user_id , to_user_id) => {
  try {
    const token = await getCookie()
    if (!token) {
      throw new Error("Token is required")
    }
    let currentCompletedSwapsFrom = 0
    let currentCompletedSwapsTo = 0
    let responseFrom = []
    let responseTo = []
    if (!from_user_id || !to_user_id) {
      throw new Error("From user ID and To user ID are required")
    }
    // get completed offer to user id
    const getCompletedOfferToUserId = async (to_user_id) => {
      const response = await axios.get(`${baseItemsURL}completed_rate_offer`,
        {
          params: {
            filter: {
              owner_user: {
                _eq: to_user_id
              }
            }
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        })
      return response.data.data
    }
    
    // Call the function to get the data
    const completedOfferToUserData = await getCompletedOfferToUserId(to_user_id)
    
    // if completed offer to user id exists, update the number of completed offers
    if(completedOfferToUserData.length > 0){
      currentCompletedSwapsTo = Number(completedOfferToUserData[0].num_comp_offer) || 0
      const responseTo = await axios.patch(`${baseItemsURL}completed_rate_offer/${completedOfferToUserData[0].id}`, {
        num_comp_offer: Number(currentCompletedSwapsTo) + 1,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          },
        })    
        return {
          success: true,
          data: responseTo.data.data,
          message: "Completed offer to user updated successfully",
        }
    }else{
      responseTo = await axios.post(`${baseItemsURL}completed_rate_offer`, {
        owner_user: to_user_id,
        num_comp_offer: 1,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    }




    // get completed offer from user id
    const getCompletedOfferFromUserId = async (from_user_id) => {
      const response = await axios.get(`${baseItemsURL}completed_rate_offer`,
        {
          params: {
            filter: {
              owner_user: {
                _eq: from_user_id
              }
            }
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        })
      return response.data.data
    }
    
    // Call the function to get the data
    const completedOfferFromUserData = await getCompletedOfferFromUserId(from_user_id)
    
    // if completed offer from user id exists, update the number of completed offers
    if(completedOfferFromUserData.length > 0){
      currentCompletedSwapsFrom = Number(completedOfferFromUserData[0].num_comp_offer) || 0
      const responseFrom = await axios.patch(`${baseItemsURL}completed_rate_offer/${completedOfferFromUserData[0].id}`, {
        num_comp_offer: Number(currentCompletedSwapsFrom) + 1,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          },
        })    
    return {
      success: true,
      data: responseFrom.data.data,
      message: "Completed offer from user updated successfully",
    }
}else{
    responseFrom = await axios.post(`${baseItemsURL}completed_rate_offer`, {
    owner_user: from_user_id,
    num_comp_offer: 1,
  }, {
    headers: {
        Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
  
  }
console.log("responseFrom", responseFrom)
console.log("responseTo", responseTo)

  return {
    success: true,
    dataFrom: responseFrom.data.data,
    dataTo: responseTo.data.data,
    message: "Completed offer from user created successfully",
    }
  } catch (error) {
    return handleApiError(error, "Add Completed Offer To User")
  }
}


// Get all offer items
export const getOfferItems = async () => {
  try {
      const response = await axios.get(`${baseItemsURL}Offer_Items`)

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
// 403 (Forbidden) get mor one
    const response = await axios.get(`${baseItemsURL}Offer_Items/${id}`)

    return {
      success: true,
      data: response.data.data,
      count: response.data.data?.length || 0,
      message: "Offer item retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Offer Items By ID")
  }
}


// Get offer item by ID
export const getOfferItemsByItemIdItself = async (id) => {
  try {
    if (!id) {
      throw new Error("Offer item ID is required")
    }


    const response = await axios.get(`${baseItemsURL}Offer_Items`, {
      params: {
        filter: {
          item_id: { _eq: id },
        }
      },
    })

    // Calculate total quantity from all offer items
    const total_quantity = response.data.data.reduce((sum, item) => sum + (item.quantity || 0), 0)
    return {
      success: true,
      data: {
        offer_items: response.data.data,
        total_quantity: total_quantity,
      },
      count: response.data.data?.length || 0,
      total_quantity: response.data.data.reduce((sum, item) => sum + (item.quantity || 0), 0),
      message: "Offer item retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Offer Items By Item ID Itself")
  }
}

// Get offer items by offer ID
export const getOfferItemsByOfferId = async (offer_id) => {
  try {
    if (!offer_id) {
      throw new Error("Offer ID is required")
    }

    const auth = await validateAuth()

    const response = await axios.get(`${baseItemsURL}Offer_Items?filter[offer_id][_eq]=${offer_id}`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

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
      const deleteItems = items.map(async (item) => {
        if (item.item_id) {
          try {
            // check if item is in ore  offer items
            const offerItemResponse = getOfferItemsById(item.item_id)
            if(offerItemResponse.count > 1){
              await axios.delete(`${baseItemsURL}Offer_Items/${item.data.id}`,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                  },
                })
            }else{
              await axios.delete(`${baseItemsURL}Items/${item.item_id}`,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                  },
                })

            }

          
            return { item_id: item.item_id, success: true }
          } catch (error) {
            console.warn(`Failed to delete item ${item.item_id}:`, error.message)
            return { item_id: item.item_id, success: false, error: error.message }
          }
        }
      })

      const deleteResults = await Promise.allSettled(deleteItems)


      // Update offer status to completed
      const response = await axios.patch(`${baseItemsURL}Offers/${id_offer}`, {
        status_offer: "completed",
      },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      console.log("Offer completed successfully, ID:", id_offer)
      
      // Add completed offer to user's completedSwaps count
        await addCompletedOfferToUser( response.data.data.from_user_id, response.data.data.to_user_id )
      
      return {
        success: true,
        data: {
          ...response.data.data,
          items_traded: items.length,
          delete_results: deleteResults,
          response: response.data.data,
        },
        message: "Offer completed successfully",
      }
    })
   
  } catch (error) {
    return handleApiError(error, "Complete Offer By ID")
  }
}

// Add offer with transaction-like behavior and quantity support
export const addOffer = async (to_user_id, cash_adjustment = 0, user_prods, owner_prods, email_user_from, email_user_to) => {
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
 // validate my id 
      const auth = await validateAuth()
      
      // Handle both old format (array of IDs) and new format (array of objects with quantities)
      const processItems = (items) => {
        return items.map(item => {
          if (typeof item === 'object' && item.itemId) {
            return {
              itemId: item.itemId,
              quantity: item.quantity || 1,
              totalPrice: item.totalPrice || 0
            }
          } else {
            return {
              itemId: item,
              quantity: 1,
              totalPrice: 0
            }
          }
        })
      }

      const processedUserProds = processItems(user_prods || [])
      const processedOwnerProds = processItems(owner_prods || [])
      const allProcessedItems = [...processedUserProds, ...processedOwnerProds]

      // Validate all items exist and have sufficient quantity
      for (const item of allProcessedItems) {
        const itemResponse = await axios.get(`${baseItemsURL}Items/${item.itemId}`)
        const itemData = itemResponse.data.data

        if (!itemData) {
          throw new Error(`Item ${item.itemId} not found`)
        }

        if (itemData.status_swap !== "available") {
          throw new Error(`Item ${item.itemId} is not available for swapping`)
        }

        // Check if requested quantity is available
        const availableQuantity = itemData.quantity || 1
        if (item.quantity > availableQuantity) {
          throw new Error(`Requested quantity ${item.quantity} exceeds available quantity ${availableQuantity} for item ${item.itemId}`)
        }
      }

      // Create the offer
      const offerRes = await axios.post(`${baseURL}/items/Offers`, {
        from_user_id: auth.userId,
        to_user_id,
        cash_adjustment: cash_adjustment || 0,
        status_offer: "pending",
        email_user_from,
        email_user_to,

      },{
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      offer_id = offerRes.data.data.id
      console.log("Offer created successfully, ID:", offer_id)

      // Add items to the offer with quantity information
      for (const item of allProcessedItems) {
        const ownerResult = await getUserByProductId(item.itemId)
        if (!ownerResult.success) {
          throw new Error(`Failed to get owner for item ${item.itemId}`)
        }

        const offerItemResponse = await axios.post(`${baseURL}/items/Offer_Items`, {
          offer_id,
          item_id: item.itemId,
          offered_by: ownerResult.data.id,
          quantity: item.quantity,
          total_price: item.totalPrice,
          email_user_from,
          email_user_to,
        }, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        })

        createdItemIds.push(offerItemResponse.data.data.id)
      }

      // Update items quantity and availability status
      for (const item of allProcessedItems) {
        const itemResponse = await axios.get(`${baseItemsURL}Items/${item.itemId}`)
        const currentItem = itemResponse.data.data
        const currentQuantity = currentItem.quantity || 1
        const newQuantity = currentQuantity - item.quantity

        if (newQuantity <= 0) {
          // If all quantity is taken, mark as unavailable
          await axios.patch(`${baseItemsURL}Items/${item.itemId}`, {
            quantity: 0,
            status_swap: "unavailable",
          }, {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          })
        } else {
          // If partial quantity is taken, update quantity but keep available
          await axios.patch(`${baseItemsURL}Items/${item.itemId}`, {
            quantity: newQuantity,
            status_swap: "available",
          }, {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          })
        }
        
        updatedItemIds.push(item.itemId)
      }


      console.log("Offer created successfully with all items and message")
      return {
        success: true,
          data: {
          offer_id,
          items_count: allItems.length,
          email_user_from,
          email_user_to,
        },
        message: "Offer created successfully",
      }
    })
  } catch (error) {
    // Rollback on error
    console.error("Error creating offer, attempting rollback...")

    try {
      const auth = await validateAuth()
      // Restore item quantities and statuses
      for (const item of allProcessedItems.filter(item => updatedItemIds.includes(item.itemId))) {
        try {
          const itemResponse = await axios.get(`${baseItemsURL}Items/${item.itemId}`)
          const currentItem = itemResponse.data.data
          const restoredQuantity = (currentItem.quantity || 0) + item.quantity
          
          await axios.patch(`${baseItemsURL}Items/${item.itemId}`, {
            quantity: restoredQuantity,
            status_swap: "available",
          }, {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          })
        } catch (restoreError) {
          console.warn(`Failed to restore item ${item.itemId}:`, restoreError.message)
        }
      }

      // Delete created offer items
      for (const offerItemId of createdItemIds) {
        await axios.delete(`${baseItemsURL}Offer_Items/${offerItemId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })
      }

      // Delete created offer
      if (offer_id) {
        await axios.delete(`${baseItemsURL}Offers/${offer_id}`,
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

// Get offer item by ID
export const getOfferItemsByIdDisplayInOnePage = async (id) => {
  try {
    if (!id) {
      throw new Error("Offer item ID is required")
    }
    
    // get original item to all details
    const original_items = await axios.get(`${baseItemsURL}Items`,{
      params: {
        fields: "*,*.*.*,images.*,translations.*,images.directus_files_id.*",
        filter: {
          id: { _eq: id },
        }
      },
    })
    // get offer items to quantity details
    const offer_items = await axios.get(`${baseItemsURL}Offer_Items`, {
      params: {
        filter: {
          item_id: { _eq: id },
        },
      },
    })

    // Calculate total quantity from offer items
    // const total_quantity = offer_items_response.data.data.reduce((sum, item) => sum + (item.quantity || 0), 0)
console.log("original_items_responses", original_items)
console.log("offer_items_response", offer_items)
    return {
      success: true,
      data: {
        original_items: original_items.data.data,
        offer_items: offer_items.data.data[0],
        total_quantity: offer_items.data.data[0].quantity,
      },
      count: offer_items.data.data[0]?.length || 0,
      message: "Offer item retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Offer Items By ID")
  }
}



// Delete offer item by ID with quantity restoration
export const deleteOfferItemsById = async (id, idItemItself, cashAdjustment, offer_id) => {
  try {
    const auth = await validateAuth()
    return await makeAuthenticatedRequest(async () => {
      if (!id || !idItemItself) {
        throw new Error("Offer item ID and item ID are required")
      }

      // Get the offer item to retrieve quantity information
      const offerItemResponse = await axios.get(`${baseItemsURL}Offer_Items/${id}`)
      const offerItem = offerItemResponse.data.data
      const offerQuantity = offerItem.quantity || 1

      // Get current item state and restore quantity
      const itemResponse = await axios.get(`${baseItemsURL}Items/${idItemItself}`)
      const currentItem = itemResponse.data.data
      const currentQuantity = currentItem.quantity || 0
      const restoredQuantity = currentQuantity + offerQuantity

      // Restore item availability and quantity
      await axios.patch(`${baseItemsURL}Items/${idItemItself}`, {
        quantity: restoredQuantity,
        status_swap: "available",
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      })

      // Delete offer item
      await axios.delete(`${baseItemsURL}Offer_Items/${id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      // Update cash adjustment if provided
      if (offer_id && cashAdjustment !== null && cashAdjustment !== undefined && !isNaN(cashAdjustment)) {
        const patchRes = await axios.patch(`${baseItemsURL}Offers/${offer_id}`, {
          cash_adjustment: cashAdjustment,
        },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })
        // console.log("Cash adjustment updated:", patchRes.data)
      }

      // console.log("Offer item deleted successfully, ID:", id)
      return {
        success: true,
        data: {
          deleted_offer_item_id: id,
          restored_item_id: idItemItself,
          restored_quantity: restoredQuantity,
          offer_quantity: offerQuantity,
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

      const response = await axios.patch(`${baseItemsURL}Offer_Items/${id}`, updateData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      // console.log("Offer item updated successfully, ID:", id)
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


// Check if item exists in Offer_Items
export const checkItemInOfferItems = async (item_id) => {
  try {
    const auth = await validateAuth()
    return await makeAuthenticatedRequest(async () => {
      if (!item_id) {
        throw new Error("Item ID is required")
      }

      const response = await axios.get(`${baseItemsURL}Offer_Items?filter[item_id][_eq]=${item_id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      return {
        success: true,
        data: response.data.data || [],
        count: response.data.data?.length || 0,
        exists: (response.data.data?.length || 0) > 0,
        message: "Offer items check completed",
      }
    })
  } catch (error) {
    return handleApiError(error, "Check Item In Offer Items")
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

      const response = await axios.post(`${baseItemsURL}Chat`, {
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

      // console.log("Message added successfully to offer:", offer_id)
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

    const auth = await validateAuth()

    const response = await axios.get(`${baseItemsURL}Chat?filter[offer_id][_eq]=${offer_id}&sort=date_created`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

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

// Get messages by user (either sent or received)
export const getMessagesByUserId = async (user_id) => {
  try {
    if (!user_id) {
      throw new Error("User ID is required")
    }

    const auth = await validateAuth()

    // Fetch messages where user is either sender or recipient
    const response = await axios.get(
      `${baseItemsURL}Chat?filter[_or][0][from_user_id][_eq]=${user_id}&filter[_or][1][to_user_id][_eq]=${user_id}&sort=-date_created`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      },
    )

    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      myMessages: response.data.data?.filter(msg => msg.from_user_id === user_id),
      partnerMessages: response.data.data?.filter(msg => msg.to_user_id === user_id),
      user_id,
      message: "User messages retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Messages By User ID")
  }
}

export const getMessagesByOfferId = async (offer_id) => {
  try {
    if (!offer_id) {
      throw new Error("Offer ID is required")
    }

    const auth = await validateAuth()

    // Fetch messages where user is either sender or recipient
    const response = await axios.get(
      `${baseItemsURL}Chat?filter[offer_id][_eq]=${offer_id}`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      },
    )

    // for each message, get the user details
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      offer_id: offer_id,
      message: "Messages retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Messages By Offer ID")
  }
}
// Get all messages
export const getAllMessage = async () => {
  try {
    const auth = await validateAuth()
    const response = await axios.get(`${baseItemsURL}Chat?sort=-date_created`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

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

export const deleteMessageByOfferId = async (offer_id) => {  
  try {
    const auth = await validateAuth()
    const messages = await getMessagesByOfferId(offer_id)
    if(messages.success){
      const message = messages.data.find(msg => msg.offer_id === offer_id)
      if(message){
          await axios.delete(`${baseItemsURL}Chat/${message.id}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          })
      }
    }
    return {
      success: true,
      data: response.data.data,
      message: "Message deleted successfully",
    }
  } catch (error) {
    return handleApiError(error, "Delete Message By ID")
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

   
    const response = await axios.post(`${baseItemsURL}WishList`, {
      item_id,
      user_id,
    },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

    //  console.log("Item added to wishlist successfully, item ID:", item_id)
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

    const auth = await validateAuth()

    const response = await axios.get(`${baseItemsURL}WishList?filter[user_id][_eq]=${user_id}`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

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
    const response = await axios.get(`${baseItemsURL}WishList`)

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
    await axios.delete(`${baseItemsURL}WishList/${id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

    // console.log("Item removed from wishlist successfully, ID:", id)
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
export const addReview = async (from_user_id, to_user_id, offer_id, rating, comment , email_user_to) => {
  try {
    const auth = await validateAuth()
    return await makeAuthenticatedRequest(async () => {
      if (!from_user_id || !to_user_id || !offer_id || !rating || !email_user_to) {
        throw new Error("From user ID, to user ID, offer ID, and rating are required")
      }

      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5")
      }

      // Check if review already exists
      const existingResponse = await axios.get(
        `${baseItemsURL}Reviews?filter[from_user_id][_eq]=${from_user_id}&filter[offer_id][_eq]=${offer_id}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      )

      if (existingResponse.data.data.length > 0) {
        return {
          success: false,
          error: "Review already exists for this offer",
          status: 409,
        }
      }

      const response = await axios.post(`${baseItemsURL}Reviews`, {
        from_user_id,
        to_user_id,
        offer_id,
        rating,
        comment: comment || "No comment",
        email_user_to,
      },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
              },
            })

      // console.log("Review added successfully for offer:", offer_id)
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

    const response = await axios.get(`${baseItemsURL}Reviews?filter[to_user_id][_eq]=${to_user_id}`)

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

    const auth = await validateAuth()

    const response = await axios.get(
        `${baseItemsURL}Reviews?filter[from_user_id][_eq]=${from_user_id}&filter[offer_id][_eq]=${offer_id}`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
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
    // console.error("Failed to check review conditions:", error)
    return {
      success: false,
      error: "Failed to check review conditions",
      status: error.response?.status || 500,
    }
  }
}
