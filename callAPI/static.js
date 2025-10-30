import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"
import axios from "axios"
import {validateAuth , baseItemsURL, baseURL, handleApiError, makeAuthenticatedRequest } from "./utiles.js"

// Get available/unavailable products by user ID
export const getAllCategories = async () => {
  try {
   
    const response = await axios.get(
      `${baseItemsURL}Categories`,
      {
         // Include parent_category relation so the UI can derive subcategories
         params: { fields: "*,translations.*, main_image.*,parent_category.*,*.*.*", sort: "name" } 
    } 
    );
    console.log(`Retrieved All categories:`, response);
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      names: response.data.data.map(category => category.name) || [],
      message: `All categories retrieved successfully`,
    };
  } catch (error) {
    return handleApiError(error, "Get All Categories");
  }
};

// Get level one categories
export const getLevelOneCategories = async () => {
  try {
   
   
    const response = await axios.get(
      `${baseItemsURL}Cat_level_one`,
      {
        params: { fields: "*,translations.*" }
      }
    );
    console.log(`Retrieved All categories:`, response);
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      message: `All categories retrieved successfully`,
    };
  } catch (error) {
    return handleApiError(error, "Get All Categories");
  }
};


// Get level one categories
export const getLevelTwoCategories = async () => {
  try {
   
   
    const response = await axios.get(
      `${baseItemsURL}Cat_level_two`,
      {
        params: { fields: "*,translations.*,parent_category.*" }
      }
    );
    console.log(`Retrieved All categories:`, response);
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      message: `All categories retrieved successfully`,
    };
  } catch (error) {
    return handleApiError(error, "Get All Categories");
  }
};



// Get level one categories
export const getFounders = async () => {
  try {
   
   
    const response = await axios.get(
      `https://deel-deal-directus.csiwm3.easypanel.host/items/Founder?fields=*,*.*&sort=order`
    );
    console.log(`Retrieved Founders:`, response);
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      message: `Founders retrieved successfully`,
    };
  } catch (error) {
    return handleApiError(error, "Get Founders");
  }
};


// Get all Hints 
export const getAllHints = async () => {
  try {
    const response = await axios.get(`${baseItemsURL}Hints?fields=*,*.* &sort=date_created`)
    console.log(`Retrieved All hints:`, response.data.data);
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      message: "All hints retrieved successfully",
    };
  } catch (error) {
    return handleApiError(error, "Get All Hints");
  }
};

// Get Hint by name
export const getHintByName = async (name) => {
  try {
    const response = await axios.get(`${baseItemsURL}Hints?filter[title][_eq]=${name}&fields=*,*.*&sort=date_created`)
    console.log(`Retrieved Hint by name:`, response.data.data);
    return {
      success: true,
      data: response.data.data || [],
      count: response.data.data?.length || 0,
      message: "Hint by name retrieved successfully",
    };
  } catch (error) {
    return handleApiError(error, "Get Hint by name");
  }
};