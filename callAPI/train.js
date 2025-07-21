// ------------- offers and transactions -------------------//

import axios from 'axios';
const baseURLAssets = 'http://localhost:3000/api/product/1';
export const baseItemsURL = 'http://localhost:8055/items';
export const baseURL = 'http://localhost:8055';
import {  getCookie , setCookie , decodedToken } from './utiles';
import { getUserByProductId } from './users';
import {  } from './products';




// make swap (on cart)
//    1- get user by products my token               back-end
//    2- get owner by products prod id               back-end

//    3- get  my products my token  != available     back-end
//    4- get  owner products prod id  != available   back-end

//    5- store suitable cat                          front
//    6- select items 
//    7- add message to chate                        
//    8- send request to back-end to swap items      back-end

// add to cart 
//    1-view 
//    2-delete item = change price 
//    3- delete all = withdraw delete offers 
//    4-add message to chat 

// display notifications 
//  1-view 
//  2-delete item = change price 
//  3-delete all = rejected offers
//  4-add message to chat
//  5-accepted offers completed 
//  6-store in transctions

 // display chat
//   1-view 
//   2-add message to chat
//   3-delete message 


// get all swaps (offers)


// get all swape by id (offers)

// transactions (completed offers)

// add review (rate , from , to , comment)







// ************************** offer ***************************//


/**
//  * Get All Offers
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Array>} Offers list
//  */

export const getAllOffers = async () => {
  try {
    const response = await axios.get(`${baseItemsURL}/Offers`);
    console.log(response.data.data.id) 
    return response.data.data ;
     
  } catch (err) {
    console.error('Failed to fetch Offers:', err)
    throw new Error('The API is not responding')
  }

}

/**
//  * Get  Offers by id user_from in cart
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Array>} Offers list
//  */

export const getOfferById = async (id) => {
  try {
    const response = await axios.get(`${baseItemsURL}/Offers?filter[from_user_id][_eq]=${id}`);
    console.log(response.data.data.id) 
    return response.data.data;
   
     
  } catch (err) {
    console.error('Failed to fetch Offers:', err)
    throw new Error('The API is not responding')
  }

}

/**
//  * Get  Offers by id user_to in cart
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Array>} Offers list
//  */
export const getOffersNotifications = async (id) => {
  try {
    const response = await axios.get(`${baseItemsURL}/Offers?filter[to_user_id][_eq]=${id}`);
    console.log(response.data.data.id) 
    return response.data.data;
   
     
  } catch (err) {
    console.error('Failed to fetch Offers Notifications:', err)
    throw new Error('The API is not responding')
  }

}

/**
//  * GET items by Offers id 
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Array>} Offer 
//  */
 
export const getItemsByOfferId = async (id) => {
  try {
  const items = await axios.get(`${baseItemsURL}/Offer_Items?filter[offer_id][_eq]=${id}`); 
    return items.data.data ;
  } catch (error) {
    console.error(`Failed to get items from this Offer :`, error)
    throw error
  }
}


/**
//  * delete (rejected) One  Offers by id 
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Array>} Offer 
//  */
 
export const deleteOfferById = async (id) => {
  try {
    const items = await getItemsByOfferId(id)
    console.log('getItemsByOfferId' , items)
  if(items){
   for (const item of items) {
      await axios.patch(`http://localhost:8055/items/Items/${item.item_id}`, {
        "status_swap": "available" ,       
      },
    );
    await axios.delete(`http://localhost:8055/items/Offer_Items?filter[offer_id][_eq]=${id}` );
    }

}
const chat = await axios.get(`http://localhost:8055/items/Chat?filter[offer_id][_eq]=${id}`);
if(chat){
  await axios.delete(`http://localhost:8055/items/Chat?filter[offer_id][_eq]=${id}`);
}
await axios.patch(`http://localhost:8055/items/Offers/${id}`, {
        "status_offer": "rejected",
      });

      
 
  } catch (error) {
    console.error(`Delete Offer ${id} error:`, error)
    throw error
  }
}

/**
//  * accepted One  Offers by id 
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Array>} Offer 
//  */
 
export const acceptedOffer = async (id) => {
  try {
  const response = await axios.patch(`${baseItemsURL}/Offers/${id}`,{
    "status_offer": "accepted"
  });
    return response.data.data ;
 
  } catch (error) {
    console.error(`accepted Offer ${id} error:`, error)
    throw error
  }
}

// complete swap then add to transaction
/**
//  * complete One  Offers by id 
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Array>} Offer 
//  */
 
export const completeOffer = async (id) => {
  try {
  const response = await axios.patch(`${baseItemsURL}/Offers/${id}`,{
    "status_offer": "completed"
  });
const items = await getItemsByOfferId(id)
if(items){
   for (const item of items) {
      await axios.delete(`http://localhost:8055/items/Items/${item.id}`);
    }
     await axios.delete(`${baseItemsURL}/Offer_Items?filter[offer_id][_eq]=${items.id}`);
}
    return response.data.data ;
  } catch (error) {
    console.error(`completed Offer ${id} error:`, error)
    throw error
  }
}




/**
//  * Updated One  Offers by id 
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Array>} Offer 
//  */
 
export const updateOfferById = async (id , cash_adjustment) => {
  try {
  const response = await axios.patch(`${baseItemsURL}/Offers/${id}`,
    {
      cash_adjustment ,
    }
  );
    // console.log(response.data.data) 
    return response.data.data ;
 
  } catch (error) {
    console.error(`Delete Offer ${id} error:`, error)
    throw error
  }
}


/**
//  * Add Offer
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Array>} Products list
//  */
export const addOffer = async (to_user_id, cash_adjustment=0, user_prods, owner_prods , message) => {
  try {
    const token = await getCookie();
    if (!token) return;

    const { id } = await decodedToken();

    // 1. Add offer to Offers table
    const offerRes = await axios.post( `${baseURL}/items/Offers`,
      {
        from_user_id :id,
        to_user_id:to_user_id,
        cash_adjustment:cash_adjustment,
        status_offer: "pending",
      }
    );
    const offer_id = offerRes.data.data.id;
    console.log("offer_id",offer_id);

     const allItems = [
      ...user_prods,
      ...owner_prods
    ];
    console.log("allItems",allItems);

    for (const item of allItems) {
     if (!offer_id || !item ) {
    console.error("Missing required field:", { offer_id, item });
    break;
  }
  const ownerPrducts = await getUserByProductId(item)
  await axios.post(`${baseURL}/items/Offer_Items`, {
    offer_id,
    item_id: item,
    offered_by:ownerPrducts.id
  });
    }
    // 3. Update items' status_swap to 'unavailable'
    for (const item of allItems) {
      await axios.patch(`http://localhost:8055/items/Items/${item}`, {
        "status_swap": "unavailable"
                        
      });
    }
    if(message){
      await axios.post(`${baseURL}/items/Chat`, 
        {
        from_user_id:id,
        to_user_id:to_user_id,
        offer_id: offer_id,
        message: message
      }
      )
    }
    return offer_id;
  } catch (err) {
    console.error('Failed to add offer:', err);
    await deleteOfferById(offer_id)
    throw err;
  }
};

/**
//  * Get all Offers Items 
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Array>} Offers Items
//  */

export const getOfferItems = async () => {
  try {
    const response = await axios.get(`${baseItemsURL}/Offer_Items`);
    console.log(response.data.data.id) 
    return response.data.data;
   
     
  } catch (err) {
    console.error('Failed to fetch Offers:', err)
    throw new Error('The API is not responding')
  }

}



/**
//  * Get  Offers Items by id
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Array>} Offers Items
//  */

export const getOfferItemsById = async (id) => {
  try {
    const response = await axios.get(`${baseItemsURL}/Offer_Items/${id}`);
    console.log(response.data.data.id) 
    return response.data.data;
   
     
  } catch (err) {
    console.error('Failed to fetch Offers:', err)
    throw new Error('The API is not responding')
  }

}



/**
//  * Get  Offers Items by offers id
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Array>} Offers Items
//  */

export const getOfferItemsByOfferId = async (offer_id) => {
  try {
    const response = await axios.get(`${baseItemsURL}/Offer_Items?filter[offer_id][_eq]=${offer_id}`);
    return response.data.data;
  } catch (err) {
    console.error('Failed to fetch Offer Items:', err);
    throw new Error('The API is not responding');
  }
}



/**
//  * Delete  Offers Items by id
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Array>} Offers Items
//  */

export const deleteOfferItemsById = async (id) => {
  try {
    const response = await axios.delete(`${baseItemsURL}/Offer_Items/${id}`);
    console.log(response.data.data.id) 
    return response.data.data;
   
     
  } catch (err) {
    console.error('Failed to fetch Offers:', err)
    throw new Error('The API is not responding')
  }

}



/**
//  * Update  Offers Items by id
//  * @param {Object} params - Query parameters
//  * @returns {Promise<Array>} Offers Items
//  */

export const updateOfferItemsById = async (id) => {
  try {
    // not updates 
    const response = await axios.patch(`${baseItemsURL}/Offer_Items/${id}`);
    console.log(response.data.data.id) 
    return response.data.data;
   
     
  } catch (err) {
    console.error('Failed to fetch Offers:', err)
    throw new Error('The API is not responding')
  }

}