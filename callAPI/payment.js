import axios from "axios"
import {
  baseURL,
  baseItemsURL,
  getCookie,
  decodedToken,
  handleApiError,
  makeAuthenticatedRequest,
  validateAuth,
  STATIC_ADMIN_TOKEN
} from "./utiles.js"

// Add cash balance to user account
export const addCashBalance = async (amount, description = "") => {
  try {
    if (!amount || amount <= 0) {
      throw new Error("Valid amount is required")
    }

    const { token, userId } = await validateAuth()
    
    const cashData = {
      user_id: userId,
      amount: parseFloat(amount),
      type: "deposit",
      description: description || "Cash balance deposit",
      status: "completed",
      date_created: new Date().toISOString()
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }

    const response = await axios.post(
      `${baseURL}items/cash_balance`,
      cashData,
      { headers }
    )

    console.log("Cash balance added successfully:", response.data)
    
    // Check if user should be verified based on cash amount
    await checkAndUpdateUserVerification(userId, amount)

    return {
      success: true,
      data: response.data.data,
      message: "Cash balance added successfully"
    }
  } catch (error) {
    return handleApiError(error, "Add Cash Balance")
  }
}

// Get user's cash balance history
export const getCashBalanceHistory = async (userId = null) => {
  try {
    const { token, userId: currentUserId } = await validateAuth()
    const targetUserId = userId || currentUserId

    const headers = {
      Authorization: `Bearer ${token}`
    }

    const response = await axios.get(
      `${baseItemsURL}/cash_balance?filter[user_id][_eq]=${targetUserId}&sort=-date_created`,
      { headers }
    )

    return {
      success: true,
      data: response.data.data || [],
      message: "Cash balance history retrieved successfully"
    }
  } catch (error) {
    return handleApiError(error, "Get Cash Balance History")
  }
}

// Get current user's total balance
export const getCurrentBalance = async () => {
  try {
    const { token, userId } = await validateAuth()

    const headers = {
      Authorization: `Bearer ${token}`
    }

    // Get all transactions for the user
    const response = await axios.get(
      `${baseItemsURL}/cash_balance?filter[user_id][_eq]=${userId}`,
      { headers }
    )

    const transactions = response.data.data || []
    
    // Calculate total balance
    let totalBalance = 0
    transactions.forEach(transaction => {
      if (transaction.type === "deposit") {
        totalBalance += parseFloat(transaction.amount)
      } else if (transaction.type === "withdraw") {
        totalBalance -= parseFloat(transaction.amount)
      }
    })

    return {
      success: true,
      data: {
        balance: totalBalance,
        transactions: transactions
      },
      message: "Current balance retrieved successfully"
    }
  } catch (error) {
    return handleApiError(error, "Get Current Balance")
  }
}

// Withdraw cash from user balance
export const withdrawCash = async (amount, paymentMethodId, description = "") => {
  try {
    if (!amount || amount <= 0) {
      throw new Error("Valid amount is required")
    }

    if (!paymentMethodId) {
      throw new Error("Payment method is required")
    }

    const { token, userId } = await validateAuth()

    // Check if user has sufficient balance
    const balanceResult = await getCurrentBalance()
    if (!balanceResult.success) {
      throw new Error("Failed to check current balance")
    }

    const currentBalance = balanceResult.data.balance
    if (currentBalance < amount) {
      throw new Error("Insufficient balance")
    }

    const withdrawData = {
      user_id: userId,
      amount: parseFloat(amount),
      type: "withdraw",
      payment_method_id: paymentMethodId,
      description: description || "Cash withdrawal",
      status: "pending", // Withdrawals start as pending
      date_created: new Date().toISOString()
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }

    const response = await axios.post(
      `${baseURL}items/cash_balance`,
      withdrawData,
      { headers }
    )

    console.log("Cash withdrawal requested successfully:", response.data)

    return {
      success: true,
      data: response.data.data,
      message: "Withdrawal requested successfully"
    }
  } catch (error) {
    return handleApiError(error, "Withdraw Cash")
  }
}

// Get top products by price
export const getTopProductsByPrice = async (limit = 10) => {
  try {
    const token = await getCookie()
    
    const headers = token ? {
      Authorization: `Bearer ${token}`
    } : {
      Authorization: `Bearer ${STATIC_ADMIN_TOKEN}`
    }

    const response = await axios.get(
      `${baseItemsURL}/Items?sort=-price&limit=${limit}&filter[status_swap][_eq]=available&fields=*,images.*`,
      { headers }
    )

    return {
      success: true,
      data: response.data.data || [],
      message: "Top products retrieved successfully"
    }
  } catch (error) {
    return handleApiError(error, "Get Top Products")
  }
}

// Check and update user verification based on cash amount and product prices
export const checkAndUpdateUserVerification = async (userId, cashAmount) => {
  try {
    const { token } = await validateAuth()

    // Get top products to compare prices
    const topProductsResult = await getTopProductsByPrice(1)
    if (!topProductsResult.success || !topProductsResult.data.length) {
      console.log("No products found for verification check")
      return { success: false, message: "No products found for verification" }
    }

    const topProduct = topProductsResult.data[0]
    const topProductPrice = parseFloat(topProduct.price) || 0

    console.log(`Checking verification: Cash ${cashAmount}, Top product price: ${topProductPrice}`)

    // Check if cash amount is at least 10% of top product price and max 10000
    const minRequiredAmount = Math.min(topProductPrice * 0.1, 10000)
    
    if (cashAmount >= minRequiredAmount) {
      // Update user verification status
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }

      const updateData = {
        verified: true,
        verification_date: new Date().toISOString(),
        verification_method: "cash_balance",
        verification_amount: cashAmount
      }

      const response = await axios.patch(
        `${baseItemsURL}/users/${userId}`,
        updateData,
        { headers }
      )

      console.log("User verification updated successfully")

      return {
        success: true,
        data: {
          verified: true,
          minRequired: minRequiredAmount,
          topProductPrice,
          cashAmount
        },
        message: "User verified successfully"
      }
    } else {
      console.log(`Cash amount ${cashAmount} is below required ${minRequiredAmount}`)
      return {
        success: false,
        data: {
          verified: false,
          minRequired: minRequiredAmount,
          topProductPrice,
          cashAmount
        },
        message: `Minimum ${minRequiredAmount.toFixed(2)} required for verification`
      }
    }
  } catch (error) {
    return handleApiError(error, "Check User Verification")
  }
}

// Add payment method
export const addPaymentMethod = async (paymentData) => {
  try {
    const { token, userId } = await validateAuth()

    const methodData = {
      ...paymentData,
      user_id: userId,
      date_created: new Date().toISOString(),
      is_verified: false
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }

    const response = await axios.post(
      `${baseItemsURL}/payment_methods`,
      methodData,
      { headers }
    )

    return {
      success: true,
      data: response.data.data,
      message: "Payment method added successfully"
    }
  } catch (error) {
    return handleApiError(error, "Add Payment Method")
  }
}

// Get user's payment methods
export const getPaymentMethods = async () => {
  try {
    const { token, userId } = await validateAuth()

    const headers = {
      Authorization: `Bearer ${token}`
    }

    const response = await axios.get(
      `${baseItemsURL}/payment_methods?filter[user_id][_eq]=${userId}&sort=-date_created`,
      { headers }
    )

    return {
      success: true,
      data: response.data.data || [],
      message: "Payment methods retrieved successfully"
    }
  } catch (error) {
    return handleApiError(error, "Get Payment Methods")
  }
}

// Update payment method
export const updatePaymentMethod = async (methodId, updateData) => {
  try {
    const { token, userId } = await validateAuth()

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }

    // Ensure user can only update their own payment methods
    const response = await axios.patch(
      `${baseItemsURL}/payment_methods/${methodId}`,
      {
        ...updateData,
        user_id: userId // Ensure user_id doesn't change
      },
      { headers }
    )

    return {
      success: true,
      data: response.data.data,
      message: "Payment method updated successfully"
    }
  } catch (error) {
    return handleApiError(error, "Update Payment Method")
  }
}

// Delete payment method
export const deletePaymentMethod = async (methodId) => {
  try {
    const { token } = await validateAuth()

    const headers = {
      Authorization: `Bearer ${token}`
    }

    await axios.delete(
      `${baseItemsURL}/payment_methods/${methodId}`,
      { headers }
    )

    return {
      success: true,
      message: "Payment method deleted successfully"
    }
  } catch (error) {
    return handleApiError(error, "Delete Payment Method")
  }
}

// Get transaction history
export const getTransactionHistory = async (limit = 50, offset = 0) => {
  try {
    const { token, userId } = await validateAuth()

    const headers = {
      Authorization: `Bearer ${token}`
    }

    const response = await axios.get(
      `${baseItemsURL}/cash_balance?filter[user_id][_eq]=${userId}&sort=-date_created&limit=${limit}&offset=${offset}`,
      { headers }
    )

    return {
      success: true,
      data: response.data.data || [],
      total: response.data.meta?.total_count || 0,
      message: "Transaction history retrieved successfully"
    }
  } catch (error) {
    return handleApiError(error, "Get Transaction History")
  }
}

// Update transaction status (admin function)
export const updateTransactionStatus = async (transactionId, status) => {
  try {
    const { token } = await validateAuth()

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }

    const response = await axios.patch(
      `${baseItemsURL}/cash_balance/${transactionId}`,
      { status },
      { headers }
    )

    return {
      success: true,
      data: response.data.data,
      message: "Transaction status updated successfully"
    }
  } catch (error) {
    return handleApiError(error, "Update Transaction Status")
  }
}

// Export all functions
export default {
  addCashBalance,
  getCashBalanceHistory,
  getCurrentBalance,
  withdrawCash,
  getTopProductsByPrice,
  checkAndUpdateUserVerification,
  addPaymentMethod,
  getPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
  getTransactionHistory,
  updateTransactionStatus
}
