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
  getTarget,
  STANDARD_ROLE_ID,
  resetPasswordURL,
  swibbaURL
} from "./utiles.js"

// Authenticate user and get token
export const auth = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error("Email and password are required")
    }

    const authResponse = await axios.post(`${baseURL}auth/login`, {
      email: email.trim(),
      password,
    }
  )

    const token = authResponse.data?.data?.access_token
    if (!token) {
      throw new Error("Authentication failed - no token received")
    }

    const setCookieResult = await setCookie(token)
    if (!setCookieResult.success) {
      throw new Error("Failed to store authentication token")
    }

    // console.log("Authentication successful for:", email)
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
       const getTargetId  = await getTarget()
    const authResult = await auth(email, password)
    if (!authResult.success) {
      return authResult
    }

    const decoded = await decodedToken()
    if (!decoded?.id) {
      throw new Error("Failed to decode user token")
    }

    const response = await axios.get(`${baseURL}users/${decoded.id}`, {
      headers: {
        Authorization: `Bearer ${authResult.data.access_token}`,
        "Content-Type": "application/json",
      },
    })

    // console.log("Login successful for user:", decoded.id)
    if (getTargetId) {
        window.location.reload()
             window.location.replace(`/swap/${getTargetId}`);
        } else {
           window.location.reload()
    window.location.replace(`/`);
        }
   

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
  
    const response = await axios.post(`${baseURL}users/register`, {
      email: cleanEmail,
      password: password,
      first_name: cleanFirstName,

    }
      );
      

      const getRes = await axios.get(`${baseURL}users`, {
      params: {
        filter: { email: { _eq: cleanEmail } },
      },
    });
    // console.log('i am in regisration getRes  ',getRes )

    const user = getRes.data.data[0];
    if (!user) {
      // console.log('User not found.');
      return;
    }
    // console.log('i am in regisration user ',user )

    const userId = user.id;
    // console.log('i am in regisration userId ',userId )

    // Step 2: Update (PATCH) the user status to active
    const patchRes = await axios.patch(`${baseURL}users/${userId}`,
      { status: 'active' ,
        role:STANDARD_ROLE_ID
      },
    );

    // console.log('User activated:', patchRes.data.data);

// console.log('User registered:', response.data.data);

const logining  =  await login(email , password)
    // console.log('i am in regisration function2 ',logining )

  } catch (error) {
    // console.error('Registration error:', error.response?.data || error.message);
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
      // console.warn("No authentication token found. Making an unauthenticated request.");
    }

    // Configure headers with the token if it exists
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(`${baseURL}users/${id}?fields=*,translations.*`, { headers });

    // console.log("User data retrieved for ID:", id);

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


export const getKYC = async (id) => {
  try {
    if (!id) {
      throw new Error("User ID is required")
    }
   const user = await getUserById(id)
   if (!user.success) {
    throw new Error(user.error)
   }
   else {
    const {first_name, last_name, email , phone_number, avatar, country, city, street, post_code, geo_location} = user.data
    if(!first_name || !last_name || !email || !phone_number || !avatar || !country || !city || !street || !post_code || !geo_location) {
      // console.log("User data is required for KYC")
      return {
        success: false,
        data: false,
        error: "User data is required for KYC",
        message: "User data is required for KYC",
      }
    }
    else {
      // console.log("User data for KYC:", user.data)
      // console.log(" data for KYC: stable for verification")
      return {
        success: true,
        data: true,
        message: "KYC retrieved successfully",
      }
    }
  }
   
  } catch (error) {
    return handleApiError(error, "Get KYC")
  }
}

// Get all user 
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${baseURL}users`);
    return {
      success: true,
      data: response.data.data,
      count: response.data.data.length || 0,
      message: "Users data retrieved successfully",
    };
  } catch (error) {
    return handleApiError(error, "Get Users not valid");
  }
}

// Get user by product ID
export const getUserByProductId = async (productId) => {
  try {
    if (!productId) {
      throw new Error("Product ID is required")
    }

    const productRes = await axios.get(`${baseItemsURL}Items/${productId}?fields=*,translations.*,images.*`)
    const userId = productRes.data?.data?.user_id
     // console.log('userId' , userId)
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

// // Edit profile with enhanced validation and authentication
// export const editeProfile = async (userData, authId, avatar = null) => {
//   try {
//     return await makeAuthenticatedRequest(async () => {
//       const decoded = await decodedToken()
//       if (!decoded?.id) {
//         throw new Error("Authentication required")
//       }
//       if (decoded.id !== authId) {
//         throw new Error("Unauthorized: Cannot edit another user's profile")
//       }
//       const token = await getCookie()
//       if (!token) {
//         throw new Error("Authentication token not found")
//       }
//       const updateData = { ...userData }
//       // Remove avatar if it's not a string (ID)
// if ('avatar' in updateData && (typeof updateData.avatar !== 'string' || !updateData.avatar)) {
//   delete updateData.avatar;
// }
//       const response = await axios.patch(`${baseURL}/users/${decoded.id}`, updateData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })
//       if (avatar) {
//           // Remove old avatar if exists
//           const currentUser = await getUserById(decoded.id)
//           if (currentUser.success && currentUser.data.avatar) {
//             await axios.delete(`${baseURL}/files/${currentUser.data.avatar}`, {
//               headers: { Authorization: `Bearer ${token}` },
//             })
//           }
//        else {
// // Upload new avatar
//           const formData = new FormData()
//           formData.append("file", avatar)

//           const avatarResponse = await axios.post(`${baseURL}/files`, formData, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "multipart/form-data",
//             },
//           })
//        }       
//       }
//       console.log("Profile updated successfully")
//       return {
//         success: true,
//         data: response.data.data,
//         avatar: avatarResponse?.data.data,
//         message: "Profile updated successfully",
//       }
//     })
//   } catch (error) {
//     return handleApiError(error, "Edit Profile")
//   }
// }

// // ----------------------------------
// export const editeProfileImage = async (authId, avatar = null) => {
//   try {
//     if (!authId) {
//       throw new Error("Authentication ID is required");
//     }

//     const token = await getCookie();
//     const decoded = await decodedToken();
//     if (!token) {
//       throw new Error("Authentication token not found");
//     }

// // Remove old avatar if exists
//           const currentUser = await getUserById(decoded.id)
//           if (currentUser.success && currentUser.data.avatar) {
//             await axios.delete(`${baseURL}/files/${currentUser.data.avatar}`, {
//               headers: { Authorization: `Bearer ${token}` },
//             })
//           }


//     if (avatar) {
//       const formData = new FormData();
//       formData.append("file", avatar);

//       const avatarResponse = await axios.post(`${baseURL}/files`, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       console.log("Profile image updated successfully");
//       return {
//         success: true,
//         data: avatarResponse.data.data,
//         message: "Profile image updated successfully",
//       };
//     } else {
//       throw new Error("No avatar file provided");
//     }
//   } catch (error) {
//     return handleApiError(error, "Edit Profile Image");
//   }
// }
// // ----------------------------------
// Edit profile with enhanced validation and authentication
export const editeProfile = async (userData, authId, avatar = null , translations) => {
  console.log("translations call api :  " , translations)
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
      const updateData = { ...userData , translations: translations }

      if (avatar) {
        try {
          // Remove old avatar if exists
          const currentUser = await getUserById(decoded.id)
          if (currentUser.success && currentUser.data.avatar) {
            await axios.delete(`${baseURL}files/${currentUser.data.avatar}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          }

          // Upload new avatar
          const formData = new FormData()
          formData.append("file", avatar)

          const avatarResponse = await axios.post(`${baseURL}files`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          })

          updateData.avatar = avatarResponse.data.data.id
        } catch (avatarError) {
          // console.warn("Avatar upload failed:", avatarError.message)
        }
      }

      const response = await axios.patch(`${baseURL}users/${decoded.id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // console.log("Profile updated successfully")
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



// Change password with validation for authenticated users
export const changePassword = async (newPassword, email) => {
  try {
    return await makeAuthenticatedRequest(async () => {
      if (!newPassword || !email) {
        throw new Error("New password and email are required");
      }

      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      const decoded = await decodedToken();
      if (!decoded?.id) {
        throw new Error("Authentication required");
      }

      const userResult = await getUserById(decoded.id);
      if (!userResult.success) {
        throw new Error("Failed to verify user");
      }

      if (userResult.data.email !== email.toLowerCase().trim()) {
        throw new Error("Email verification failed");
      }

      const token = await getCookie();
      const response = await axios.patch(
        `${baseURL}users/${decoded.id}`,
        {
          password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // console.log("Password change successful");
      return {
        success: true,
        data: response.data.data,
        message: "Password changed successfully",
      };
    });
  } catch (error) {
    return handleApiError(error, "Change Password");
  }
};


// Logout user
export const logout = async () => {
  try {
    const result = await removeCookie()
    // console.log("User logged out successfully")
    return {
      success: true,
      message: "Logged out successfully",
    }
  } catch (error) {
    return handleApiError(error, "Logout")
  }
}




// Update phone verification status
export const updatePhoneVerification = async (userId, phoneNumber, isVerified = true) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const token = await getCookie();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const updateData = {
      phone_number: phoneNumber,
      verified: isVerified.toString()
    };

    const response = await axios.patch(
      `${baseURL}users/${userId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("Phone verification status updated successfully");
    return {
      success: true,
      data: response.data.data,
      message: "Phone verification status updated successfully",
    };
  } catch (error) {
    return handleApiError(error, "Update Phone Verification");
  }
};

// Add customer message with validation
export const addMessage = async (email, name, message, phone_number) => {
  try {
    if (!email || !name || !message) {
      throw new Error("Email, name, and message are required");
    }

    const messageData = {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      message: message.trim(),
      phone_number: phone_number || null,
    };

    const token = await getCookie();
    if (!token) {
      throw new Error("Authentication token not found");
    }
    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
      const decoded = await decodedToken();
      if (decoded?.id) {
        messageData.user_id = decoded.id;
      }
    } else {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(
      `${baseItemsURL}Customers_Problems`,
      messageData,
      { headers }
    );

    //  console.log("Message added successfully");
    return {
      success: true,
      data: response.data.data,
      message: "Message sent successfully",
    };
  } catch (error) {
    return handleApiError(error, "Add Message");
  }
};

// Request password reset
export const forgotPassword = async (email) => {
  console.log("forget Password email", email)
  try {
    if (!email) {
      throw new Error("Email is required");
    }
    // const response = await axios.post(`${baseURL}auth/password/request`, {
    const response = await axios.post(`${baseURL}auth/password/request`, {
      email:email,
      reset_url: `${resetPasswordURL}`,
      // PASSWORD_RESET_URL_ALLOW_LIST: "https://dev.swibba.com/auth/forgot-password",
      // reset_url: "http://localhost:3000/auth/reset-password",

      // PASSWORD_RESET_URL_ALLOW_LIST: "http://localhost:3000/auth/reset-password",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // const response = await fetch('https://dev-dashboard.swibba.com/auth/password/request', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     email: email,
  //     reset_url: `http://localhost:3000/auth/reset-password`
  //   }),
  // });

  console.log("forget Password response", response)
    return {
      success: response.status === 200 || response.status === 201 || response.status === 204,
      message: "Password reset link sent successfully. Please check your email.",
    };
  } catch (error) {
    return handleApiError(error, "Forget Password");
  }
};



// Reset password with validation
export const resetPassword = async (password, token) => {
  try {
    if (!password || !token) {
      throw new Error("New password and token are required");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const response = await axios.post(
      // `${baseURL}auth/reset-password`,
      `${baseURL}auth/password/reset`,
      {
        password,
        token,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
      message: "Password reset successfully",
    };
  } catch (error) {
    return handleApiError(error, "Reset Password");
  }
};




// login By Google
export const loginByGoogle = async () => {
  try {
    if (!password || !token) {
      throw new Error("New password and token are required");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const response = await axios.post(
      // `${baseURL}auth/reset-password`,
      `${baseURL}auth/password/reset`,
      {
        password,
        token,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
      message: "Password reset successfully",
    };
  } catch (error) {
    return handleApiError(error, "Reset Password");
  }
};


// sign up  By Google
export const signupByGoogle = async () => {
  try {
    if (!password || !token) {
      throw new Error("New password and token are required");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const response = await axios.post(
      // `${baseURL}auth/reset-password`,
      `${baseURL}auth/password/reset`,
      {
        password,
        token,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
      message: "Password reset successfully",
    };
  } catch (error) {
    return handleApiError(error, "Reset Password");
  }
};

