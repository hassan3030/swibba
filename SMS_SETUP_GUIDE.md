# SMS Verification Setup Guide

## Step 1: Twilio Account Setup

1. **Create a Twilio Account**
   - Go to [https://www.twilio.com](https://www.twilio.com)
   - Sign up for a free account
   - Verify your email and phone number

2. **Get Your Credentials**
   - Go to the Twilio Console Dashboard
   - Find your Account SID and Auth Token
   - Purchase a phone number for sending SMS

## Step 2: Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

## Step 3: Install Dependencies

```bash
npm install twilio
```

## Step 4: Test the Implementation

1. Start your development server: `npm run dev`
2. Go to the profile settings page
3. Click "Verify" next to the phone number field
4. Enter a valid phone number with country code
5. Check your phone for the SMS verification code
6. Enter the code to complete verification

## Features Implemented

- ✅ Real SMS sending via Twilio
- ✅ 6-digit verification codes
- ✅ 5-minute code expiration
- ✅ Rate limiting (3 attempts per hour per phone)
- ✅ Resend functionality with cooldown
- ✅ Proper error handling
- ✅ Phone number validation
- ✅ User-friendly UI with loading states

## Security Features

- Rate limiting to prevent spam
- Code expiration after 5 minutes
- Maximum 5 verification attempts per code
- Phone number format validation
- Secure API endpoints

## Cost Considerations

- Twilio charges per SMS sent
- Free tier includes limited SMS credits
- Monitor usage in Twilio Console
- Consider implementing additional rate limiting for production

## Troubleshooting

### Common Issues:

1. **"Invalid phone number format"**
   - Ensure phone number includes country code (e.g., +1234567890)
   - Check that the country code is valid

2. **"Permission to send SMS denied"**
   - Verify your Twilio phone number is properly configured
   - Check if the destination country is supported

3. **"Too many verification attempts"**
   - Wait for the rate limit to reset (1 hour)
   - This is a security feature to prevent abuse

4. **Environment variables not loading**
   - Ensure variables are in `.env.local` file
   - Restart your development server after adding variables

## Production Considerations

1. **Database Storage**: Replace in-memory storage with Redis or database
2. **Monitoring**: Set up logging and monitoring for SMS delivery
3. **Compliance**: Ensure compliance with local SMS regulations
4. **Backup Provider**: Consider having a backup SMS provider
5. **Analytics**: Track verification success rates and costs
