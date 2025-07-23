import axios from "axios"
import {
  baseURL,
  getCookie,
  setCookie,
  decodedToken,
  baseItemsURL,
  removeCookie,
  handleApiError,
  makeAuthenticatedRequest,
} from "./utiles.js"

const STATIC_ADMIN_TOKEN =  '6cORce4QNZNlriCXfWWiYn7gcn_XUQOL';

// Authenticate user and get token
export const auth = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error("Email and password are required")
    }

    const authResponse = await axios.post(`${baseURL}/auth/login`, {
      email: email.toLowerCase().trim(),
      password,
    })

    const token = authResponse.data?.data?.access_token
    if (!token) {
      throw new Error("Authentication failed - no token received")
    }

    const setCookieResult = await setCookie(token)
    if (!setCookieResult.success) {
      throw new Error("Failed to store authentication token")
    }

    console.log("Authentication successful for:", email)
    return {
      success: true,
      data: authResponse.data.data,
      message: "Authentication successful",
    }
  } catch (error) {
    return handleApiError(error, "Authentication") 
  }
}

// Login user with enhanced error handling
export const login = async (email, password) => {
  try {
    const authResult = await auth(email, password)
    if (!authResult.success) {
      return authResult
    }

    const decoded = await decodedToken()
    if (!decoded?.id) {
      throw new Error("Failed to decode user token")
    }

    const response = await axios.get(`${baseURL}/users/${decoded.id}`, {
      headers: {
        Authorization: `Bearer ${authResult.data.access_token}`,
        "Content-Type": "application/json",
      },
    })

    console.log("Login successful for user:", decoded.id)
    window.location.reload()
           window.location.replace('/');

    return {
      success: true,
      data: {
        user: response.data.data,
        token: authResult.data.access_token,
      },
      message: "Login successful",
    }
  } catch (error) {
    return handleApiError(error, "Login")
  }
}

// Register user with enhanced Directus handling
// export const register = async (email, password, first_name, additional_data = {}) => {
//   try {
//     // Input validation
//     if (!email || !password || !first_name) {
//       throw new Error("Email, password, and first name are required")
//     }

//     // Email format validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     if (!emailRegex.test(email)) {
//       throw new Error("Please provide a valid email address")
//     }

//     // Password strength validation
//     if (password.length < 8) {
//       throw new Error("Password must be at least 8 characters long")
//     }

//     const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/
//     if (!passwordRegex.test(password)) {
//       throw new Error("Password must contain at least one letter and one number")
//     }

//     const cleanEmail = email.toLowerCase().trim()
//     const cleanFirstName = first_name.trim()

//     // Check if user already exists
//     try {
//       const existingUserCheck = await axios.get(
//         // if not work remove it encodeURIComponent
//         `${baseURL}/users?filter[email][_eq]=${encodeURIComponent(cleanEmail)}`,
//         {
//           headers: {
//             Authorization: `Bearer ${STATIC_ADMIN_TOKEN}`,
//           },
//         },
//       )

//       if (existingUserCheck.data?.data?.length > 0) {
//         throw new Error("An account with this email already exists")
//       }
//     } catch (checkError) {
//       if (checkError.message.includes("already exists")) {
//         throw checkError
//       }
//       console.warn("Could not verify existing user, proceeding with registration")
//     }

//     // Prepare user data for Directus
    
//     const userData = {
//       email: cleanEmail,
//       password,
//       first_name: cleanFirstName,
//     }

//  const userRegister = await axios.post(`${baseURL}/users/register`,  userData );


//     // const userRegister = await axios.post(`${baseURL}/users`, userData, {
//     //   headers: {
//     //     "Content-Type": "application/json",
//     //     Authorization: `Bearer ${STATIC_ADMIN_TOKEN}`,
//     //   },
//     // })

//     // if (!userRegister.data?.data) {
//     //   throw new Error("Failed to create user account")

//     // }
    
//   const registerUserCheck = await axios.get(
//         // if not work remove it encodeURIComponent
//         `${baseURL}/users?filter[email][_eq]=${encodeURIComponent(cleanEmail)}`,
//         {
//           headers: {
//             Authorization: `Bearer ${STATIC_ADMIN_TOKEN}`,
//           },
//         },
//       )

// const userRegisterId = registerUserCheck.data.data.id;
//     // Step 2: Update (PATCH) the user status to active
//     const statusChange = await axios.patch(`https://deel-deal-directus.csiwm3.easypanel.host/users/${userRegisterId}`,
//       { status: 'active' },
//       {
//         headers: {
//           Authorization: `Bearer ${STATIC_ADMIN_TOKEN}`,
//         },
//       }
//     );

//     console.log('User activated patch:', statusChange.data);
    
//     console.log("User created successfully in Directus, ID:", userRegisterId)

//     // Attempt automatic login after registration
//     let autoLoginResult = null
//     try {
//       console.log("Attempting automatic login after registration...")
//       autoLoginResult = await auth(cleanEmail, password)

//       if (autoLoginResult.success) {
//         console.log("Auto-login successful after registration")
//       }
//     } catch (loginError) {
//       console.warn("Auto-login failed after registration:", loginError.message)
//     }

//     return {
//       success: true,
//       data: {
//         user: {
//           id: userRegisterId,
//           email: cleanEmail,
//           first_name: cleanFirstName,
//         },
//         auto_login: autoLoginResult?.success || false,
//         token: autoLoginResult?.success ? autoLoginResult.data?.access_token : null,
//       },
//       message: autoLoginResult?.success
//         ? "Registration successful and automatically logged in"
//         : "Registration successful. Please log in to continue.",
//     }
//   } catch (error) {
    // Handle Directus-specific errors
    // if (error.response?.data?.errors) {
    //   const directusErrors = error.response.data.errors
    //   let errorMessage = "Registration failed"

    //   if (Array.isArray(directusErrors)) {
    //     const errorMessages = directusErrors.map((err) => {
    //       if (err.extensions?.code === "RECORD_NOT_UNIQUE") {
    //         return "An account with this email already exists"
    //       }
    //       if (err.extensions?.code === "FAILED_VALIDATION") {
    //         return `Validation error: ${err.message}`
    //       }
    //       return err.message || "Unknown error"
    //     })
    //     errorMessage = errorMessages.join(", ")
    //   } else if (directusErrors.message) {
    //     errorMessage = directusErrors.message
    //   }

    //   return {
    //     success: false,
    //     error: errorMessage,
    //     status: error.response?.status || 400,
    //     code: "DIRECTUS_REGISTRATION_ERROR",
    //   }
    // }

    // return handleApiError(error, "Registration")
//   }
// }

export const register = async (email, password, first_name, additional_data = {}) => {
  // Input validation
    if (!email || !password || !first_name) {
      throw new Error("Email, password, and first name are required")
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error("Please provide a valid email address")
    }

    // Password strength validation
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long")
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/
    if (!passwordRegex.test(password)) {
      throw new Error("Password must contain at least one letter and one number")
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanFirstName = first_name.trim()
   

   try {
    //  Check if user already exists
     const existingUserCheck = await axios.get(
        `${baseURL}/users?filter[email][_eq]=${cleanEmail}`,
        {
          headers: {
            Authorization: `Bearer ${STATIC_ADMIN_TOKEN}`,
          },
        },
      )
    console.log('i am in regisration existingUserCheck ',existingUserCheck )

     
      if (existingUserCheck.data?.data?.length > 0) {
        throw new Error("An account with this email already exists")
      }

    const response = await axios.post('https://deel-deal-directus.csiwm3.easypanel.host/users/register', {
      email: cleanEmail,
      password,
      first_name: cleanFirstName,

    }
      );
      


      const getRes = await axios.get('https://deel-deal-directus.csiwm3.easypanel.host/users', {
      params: {
        filter: { email: { _eq: cleanEmail } },
      },
      headers: {
        Authorization: `Bearer ${STATIC_ADMIN_TOKEN}`,
      },
    });
    console.log('i am in regisration getRes  ',getRes )

    const user = getRes.data.data[0];
    console.log('i am in regisration user ',user )
    if (!user) {
      console.log('User not found.');
      return;
    }

    const userId = user.id;
    console.log('i am in regisration userId ',userId )

    // Step 2: Update (PATCH) the user status to active
    const patchRes = await axios.patch(`https://deel-deal-directus.csiwm3.easypanel.host/users/${userId}`,
      { status: 'active' },
      {
        headers: {
          Authorization: `Bearer ${STATIC_ADMIN_TOKEN}`,
        },
      }
    );

    console.log('User activated:', patchRes.data.data);

console.log('User registered:', response.data.data);

const logining  =  await login(email , password)
    console.log('i am in regisration function2 ',logining )

  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
  }
}








// Add customer message with validation
export const addMessage = async (email, name, message, phone_number) => {
  try {
    if (!email || !name || !message) {
      throw new Error("Email, name, and message are required")
    }

    const messageData = {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      message: message.trim(),
      phone_number: phone_number || null,
    }

    const token = await getCookie()
    if (token) {
      const decoded = await decodedToken()
      if (decoded?.id) {
        messageData.user_id = decoded.id
      }
    }

    const response = await axios.post(`${baseURL}/items/Customers_Problems`, messageData)

    console.log("Message added successfully")
    return {
      success: true,
      data: response.data,
      message: "Message sent successfully",
    }
  } catch (error) {
    return handleApiError(error, "Add Message")
  }
}

// Get user by ID with enhanced error handling
export const getUserById = async (id) => {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }

    // Retrieve the authentication token
    const token = await getCookie();
    if (!token) {
      // Handle cases where the token is not available, if necessary
      // For example, you might want to allow certain public profiles to be viewed
      console.warn("No authentication token found. Making an unauthenticated request.");
    }

    // Configure headers with the token if it exists
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(`${baseURL}/users/${id}`, { headers });

    console.log("User data retrieved for ID:", id);

    return {
      success: true,
      data: response.data.data,
      message: "User data retrieved successfully",
    };
  } catch (error) {
    // Improved error logging
    console.error(`Failed to get user by ID ${id}:`, error.response?.data || error.message);
    return handleApiError(error, "Get User By ID");
  }
};

// Get all user 
export const getAllUsers = async () => {
  try {
    const tokenAdmin =  await getCookie()
    if (!tokenAdmin) {
      const response = await axios.get(`${baseURL}/users`)

    // console.log("User data retrieved for ID:", id)
    return {
      success: true,
       count: response.data.data?.length || 0, 
      message: "Users data retrieved successfully",
    }
    }

    const response = await axios.get(`${baseURL}/users`)

    // console.log("User data retrieved for ID:", id)
    return {
      success: true,
       data: response.data.data ,
       count: response.data.data?.length || 0,
      message: "Users data retrieved successfully",
    }
  } catch (error) {
    return handleApiError(error, "Get Users not valid")
  }
}

// Get user by product ID
export const getUserByProductId = async (productId) => {
  try {
    if (!productId) {
      throw new Error("Product ID is required")
    }

    const productRes = await axios.get(`${baseItemsURL}/Items/${productId}`)
    const userId = productRes.data?.data?.user_id
     console.log('userId' , userId)
    if (!userId) {
      throw new Error("No user associated with this product");
    }

    // Fetch the user's data using the retrieved userId
    const userResult = await getUserById(userId);

    if (!userResult.success) {
      // The error from getUserById is already logged, so just re-throw or handle
      throw new Error(userResult.error || "Failed to get user data");
    }

    return userResult;
  } catch (error) {
    console.error(`Failed to get user by product ID ${productId}:`, error.response?.data || error.message);
    return handleApiError(error, "Get User By Product ID");
  }
};

// Edit profile with enhanced validation and authentication
export const editeProfile = async (userData, authId, avatar = null) => {
  try {
    return await makeAuthenticatedRequest(async () => {
      const decoded = await decodedToken()
      if (!decoded?.id) {
        throw new Error("Authentication required")
      }

      if (decoded.id !== authId) {
        throw new Error("Unauthorized: Cannot edit another user's profile")
      }

      const token = await getCookie()
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const updateData = { ...userData }

      if (avatar) {
        try {
          // Remove old avatar if exists
          const currentUser = await getUserById(decoded.id)
          if (currentUser.success && currentUser.data.avatar) {
            await axios.delete(`${baseURL}/files/${currentUser.data.avatar}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          }

          // Upload new avatar
          const formData = new FormData()
          formData.append("file", avatar)

          const avatarResponse = await axios.post(`${baseURL}/files`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          })

          updateData.avatar = avatarResponse.data.data.id
        } catch (avatarError) {
          console.warn("Avatar upload failed:", avatarError.message)
        }
      }

      const response = await axios.patch(`${baseURL}/users/${decoded.id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Profile updated successfully")
      return {
        success: true,
        data: response.data.data,
        message: "Profile updated successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Edit Profile")
  }
}

// Reset password with validation
export const resetPassword = async (newPassword, email) => {
  try {
    return await makeAuthenticatedRequest(async () => {
      if (!newPassword || !email) {
        throw new Error("New password and email are required")
      }

      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long")
      }

      const decoded = await decodedToken()
      if (!decoded?.id) {
        throw new Error("Authentication required")
      }

      const userResult = await getUserById(decoded.id)
      if (!userResult.success) {
        throw new Error("Failed to verify user")
      }

      if (userResult.data.email !== email.toLowerCase().trim()) {
        throw new Error("Email verification failed")
      }

      const token = await getCookie()
      const response = await axios.patch(
        `${baseURL}/users/${decoded.id}`,
        {
          password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      console.log("Password reset successful")
      return {
        success: true,
        data: response.data.data,
        message: "Password reset successfully",
      }
    })
  } catch (error) {
    return handleApiError(error, "Reset Password")
  }
}

// Logout user
export const logout = async () => {
  try {
    const result = await removeCookie()
    console.log("User logged out successfully")
    return {
      success: true,
      message: "Logged out successfully",
    }
  } catch (error) {
    return handleApiError(error, "Logout")
  }
}
