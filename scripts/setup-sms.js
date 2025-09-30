#!/usr/bin/env node

/**
 * SMS Setup Script
 * This script helps you set up Twilio SMS configuration
 */

const fs = require('fs')
const path = require('path')

const envLocalPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), '.env.example')

console.log('🚀 SMS Setup Script')
console.log('==================\n')

// Check if .env.local exists
if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local file already exists')
  
  // Check if Twilio variables are set
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  const hasTwilioConfig = envContent.includes('TWILIO_ACCOUNT_SID') && 
                         envContent.includes('TWILIO_AUTH_TOKEN') && 
                         envContent.includes('TWILIO_PHONE_NUMBER')
  
  if (hasTwilioConfig) {
    console.log('✅ Twilio configuration found in .env.local')
    console.log('📝 Make sure to replace the placeholder values with your actual Twilio credentials')
  } else {
    console.log('❌ Twilio configuration not found in .env.local')
    console.log('📝 Please add the following variables to your .env.local file:')
    console.log('')
    console.log('TWILIO_ACCOUNT_SID=your_twilio_account_sid_here')
    console.log('TWILIO_AUTH_TOKEN=your_twilio_auth_token_here')
    console.log('TWILIO_PHONE_NUMBER=your_twilio_phone_number_here')
  }
} else {
  console.log('❌ .env.local file not found')
  console.log('📝 Creating .env.local file with Twilio configuration template...')
  
  const envTemplate = `# Twilio SMS Configuration
# Get these values from your Twilio Console Dashboard
# 1. Go to https://console.twilio.com/
# 2. Get your Account SID and Auth Token from the dashboard
# 3. Purchase a phone number for sending SMS
# 4. Replace the values below with your actual Twilio credentials

TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
`
  
  try {
    fs.writeFileSync(envLocalPath, envTemplate)
    console.log('✅ .env.local file created successfully')
  } catch (error) {
    console.error('❌ Failed to create .env.local file:', error.message)
    console.log('📝 Please create the file manually with the following content:')
    console.log('')
    console.log(envTemplate)
  }
}

console.log('\n📚 Next Steps:')
console.log('1. Go to https://console.twilio.com/')
console.log('2. Sign up for a free Twilio account if you haven\'t already')
console.log('3. Get your Account SID and Auth Token from the dashboard')
console.log('4. Purchase a phone number for sending SMS')
console.log('5. Update the values in your .env.local file')
console.log('6. Restart your development server: npm run dev')
console.log('\n📖 For detailed instructions, see SMS_SETUP_GUIDE.md')
