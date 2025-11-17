#!/bin/bash

# Test Phone Number Validator Extension
DIRECTUS_URL="https://playground.datac.com"
PHONE_NUMBER="+201158952209"
TOKEN="Hcv42f7eeSJG9FUCS8-jIHK5X2mO5p-S"

echo "🧪 Testing Phone Number Validator Extension"
echo "==========================================="
echo "Backend: $DIRECTUS_URL"
echo "Phone: $PHONE_NUMBER"
echo "Token: $TOKEN"
echo ""
echo "⚠️  Note: This extension requires user to be logged in (authenticated)"
echo ""

# Test 1: Health Check
echo "📋 Test 1: Health Check"
echo "Endpoint: GET /phone-number-validator/"
echo ""

HEALTH_RESPONSE=$(curl -s -X GET "${DIRECTUS_URL}/phone-number-validator/" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
echo ""

if echo "$HEALTH_RESPONSE" | grep -q "Phone Number Validator"; then
    echo "✅ Extension is running!"
    echo ""
    
    # Test 2: Request Verification (authenticated)
    echo "📋 Test 2: Request Phone Verification (Authenticated)"
    echo "Endpoint: POST /phone-number-validator/request-verification"
    echo "Headers: Authorization: Bearer $TOKEN"
    echo ""
    
    VERIFICATION_REQUEST=$(curl -s -X POST "${DIRECTUS_URL}/phone-number-validator/request-verification" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{
        \"phone_number\": \"${PHONE_NUMBER}\",
        \"country_code\": \"+20\"
      }")
    
    echo "Response:"
    echo "$VERIFICATION_REQUEST" | jq '.' 2>/dev/null || echo "$VERIFICATION_REQUEST"
    echo ""
    
    if echo "$VERIFICATION_REQUEST" | grep -q '"success": *true'; then
        echo "✅ Verification request sent successfully!"
        echo "📱 Check your phone for the OTP code"
        echo ""
        
        # Test 3: Check Status
        echo "📋 Test 3: Check Verification Status"
        echo "Endpoint: GET /phone-number-validator/status"
        
        STATUS_RESPONSE=$(curl -s -X GET "${DIRECTUS_URL}/phone-number-validator/status?phone_number=%2B201158952209" \
          -H "Authorization: Bearer ${TOKEN}")
        
        echo "Response:"
        echo "$STATUS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATUS_RESPONSE"
        echo ""
        
        # Ask for OTP
        echo "📋 Test 4: Verify OTP"
        read -p "Enter the OTP code you received: " OTP_CODE
        
        if [ ! -z "$OTP_CODE" ]; then
            echo ""
            echo "Verifying OTP: $OTP_CODE"
            
            VERIFY_RESPONSE=$(curl -s -X POST "${DIRECTUS_URL}/phone-number-validator/verify-otp" \
              -H "Authorization: Bearer ${TOKEN}" \
              -H "Content-Type: application/json" \
              -d "{
                \"phone_number\": \"${PHONE_NUMBER}\",
                \"otp\": \"${OTP_CODE}\"
              }")
            
            echo "Response:"
            echo "$VERIFY_RESPONSE" | jq '.' 2>/dev/null || echo "$VERIFY_RESPONSE"
            echo ""
            
            if echo "$VERIFY_RESPONSE" | grep -q '"success": *true'; then
                echo "✅ Phone number verified successfully!"
                echo ""
                
                # Test 5: Check status after verification
                echo "📋 Test 5: Check Status After Verification"
                
                FINAL_STATUS=$(curl -s -X GET "${DIRECTUS_URL}/phone-number-validator/status?phone_number=%2B201158952209" \
                  -H "Authorization: Bearer ${TOKEN}")
                
                echo "Response:"
                echo "$FINAL_STATUS" | jq '.' 2>/dev/null || echo "$FINAL_STATUS"
            else
                echo "❌ OTP verification failed"
                echo "Possible reasons:"
                echo "  - Invalid OTP code"
                echo "  - OTP expired"
                echo "  - Maximum attempts exceeded"
            fi
        else
            echo "⏭️  Skipping OTP verification"
        fi
        
        # Test 6: Resend OTP
        echo ""
        echo "📋 Test 6: Test Resend OTP (optional)"
        read -p "Do you want to test resend OTP? (y/n): " RESEND_TEST
        
        if [ "$RESEND_TEST" = "y" ]; then
            echo ""
            echo "Requesting OTP resend..."
            
            RESEND_RESPONSE=$(curl -s -X POST "${DIRECTUS_URL}/phone-number-validator/resend-otp" \
              -H "Authorization: Bearer ${TOKEN}" \
              -H "Content-Type: application/json" \
              -d "{\"phone_number\": \"${PHONE_NUMBER}\"}")
            
            echo "Response:"
            echo "$RESEND_RESPONSE" | jq '.' 2>/dev/null || echo "$RESEND_RESPONSE"
        fi
        
    else
        echo "❌ Verification request failed"
        echo "Possible reasons:"
        echo "  - Phone number already verified"
        echo "  - Invalid authentication token"
        echo "  - Rate limiting"
        echo "  - SMS provider configuration issue"
    fi
    
else
    echo "❌ Extension is not running or not accessible"
    echo "Check if the extension is properly installed and deployed"
fi

echo ""
echo "🎯 Testing Summary"
echo "=================="
echo "Tested Endpoints:"
echo "  ✓ GET  /phone-number-validator/ (Health Check)"
echo "  ✓ POST /phone-number-validator/request-verification"
echo "  ✓ POST /phone-number-validator/verify-otp"
echo "  ✓ POST /phone-number-validator/resend-otp"
echo "  ✓ GET  /phone-number-validator/status"
echo ""
echo "Key Differences from Auth Extension:"
echo "  - Requires user authentication (Bearer token)"
echo "  - Only verifies phone numbers for existing users"
echo "  - Stores verification data in directus_users table"
echo "  - Simpler workflow focused on phone verification only"