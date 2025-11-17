# 📱 Directus Phone Number Validator Extension

[![npm version](https://img.shields.io/npm/v/directus-extension-phone-validator.svg)](https://www.npmjs.com/package/directus-extension-phone-validator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Directus](https://img.shields.io/badge/Directus-10.10.0+-64f.svg)](https://directus.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#-contributing)

> A production-ready Directus extension for secure phone number verification via SMS OTP. Built with TypeScript, following SOLID principles, and designed for scalability.

## ✨ Features

- 🔐 **Secure OTP Verification** - SHA-256 hashed codes with 10-minute expiry
- 🌍 **Multi-Provider SMS** - Automatic routing between Vonage (global) and BeOn (Egypt)
- 🛡️ **Rate Limiting** - Built-in protection (3 requests/hour, 1-min resend cooldown)
- 🎯 **User-Centric** - Verify phone numbers for authenticated users only
- 📊 **Status Tracking** - Real-time verification status and attempt monitoring
- 🏗️ **SOLID Architecture** - Clean, maintainable, and extensible codebase
- 🔧 **TypeScript** - Full type safety with comprehensive interfaces
- 🚀 **Production Ready** - Battle-tested with real-world usage

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Usage Examples](#-usage-examples)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## 🚀 Quick Start

```bash
# Install via npm (coming soon)
npm install directus-extension-phone-validator

# Or clone from GitHub
git clone https://github.com/hassan3030/directus-phone-validator.git
cd directus-phone-validator
npm install && npm run build

# Copy to your Directus extensions folder
cp -r dist /path/to/directus/extensions/phone-number-validator
```

**Configure environment variables:**

```env
SECRET=your-directus-secret
SENDER_NAME=YourApp
VONAGE_API_KEY=your-vonage-key
VONAGE_API_SECRET=your-vonage-secret
BEON_TOKEN=your-beon-token  # Optional: for Egyptian numbers
```

**Restart Directus and you're ready!** 🎉

## 📦 Installation

### Method 1: From GitHub (Recommended)

```bash
# Clone the repository
git clone https://github.com/hassan3030/directus-phone-validator.git
cd directus-phone-validator

# Install dependencies
npm install

# Build the extension
npm run build

# Copy to Directus extensions directory
cp -r dist /path/to/directus/extensions/phone-number-validator

# Restart Directus
docker-compose restart directus  # or your preferred method
```

### Method 2: Direct Copy

If you already have the built extension:

```bash
cp -r phone-number-validator /path/to/directus/extensions/
```

### Method 3: Docker

Add to your `docker-compose.yml`:

```yaml
services:
  directus:
    image: directus/directus:latest
    volumes:
      - ./extensions:/directus/extensions
    environment:
      SECRET: ${SECRET}
      SENDER_NAME: ${SENDER_NAME}
      VONAGE_API_KEY: ${VONAGE_API_KEY}
      VONAGE_API_SECRET: ${VONAGE_API_SECRET}
      BEON_TOKEN: ${BEON_TOKEN}
```

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SECRET` | ✅ Yes | Directus secret key for OTP hashing | `your-secret-key` |
| `SENDER_NAME` | ✅ Yes | SMS sender name (your app name) | `Swibba` |
| `VONAGE_API_KEY` | ✅ Yes | Vonage API key for SMS | `abc123...` |
| `VONAGE_API_SECRET` | ✅ Yes | Vonage API secret | `xyz789...` |
| `BEON_TOKEN` | ⚠️ Optional | BeOn token (for Egyptian numbers) | `token123...` |

### Database Schema

Add these fields to `directus_users` collection:

```sql
ALTER TABLE directus_users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE directus_users ADD COLUMN IF NOT EXISTS country_code VARCHAR(5);
ALTER TABLE directus_users ADD COLUMN IF NOT EXISTS otp_hash VARCHAR(255);
ALTER TABLE directus_users ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE directus_users ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;
ALTER TABLE directus_users ADD COLUMN IF NOT EXISTS verified_phone BOOLEAN DEFAULT FALSE;
```

### SMS Provider Selection

- **Egyptian numbers** (`+20`): Routes to BeOn SMS (if configured)
- **All other numbers**: Routes to Vonage SMS
- **Automatic fallback**: Falls back to Vonage if BeOn unavailable

## 📡 API Documentation

### Base URL
```
https://your-directus-url/phone-number-validator
```

### Authentication
All endpoints (except health check) require a valid Directus access token:
```
Authorization: Bearer <user_access_token>
```

---
### 1. Health Check

Check if the extension is running.

```http
GET /phone-number-validator/
```

**Response:**
```json
{
  "success": true,
  "message": "Phone Number Validator Extension is running",
  "endpoints": [
    "POST /request-verification",
    "POST /verify-otp",
    "POST /resend-otp",
    "GET /status"
  ]
}
```

---

### 2. Request Verification
Send OTP to user's phone number.

```http
POST /phone-number-validator/request-verification
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "phone_number": "+201158952209",
  "country_code": "+20"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "expires_in": 600,
    "can_resend_after": 60
  }
}
```

**Error Responses:**
- `400` - Invalid phone number format
- `409` - Phone number already verified by another user
- `429` - Rate limit exceeded

---

### 3. Verify OTP

Verify the OTP code sent to user's phone.

```http
POST /phone-number-validator/verify-otp
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "phone_number": "+201158952209",
  "otp": "1234"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Phone number verified successfully",
  "data": {
    "verified_phone": "+201158952209"
  }
}
```

**Error Responses:**
- `400` - Invalid OTP or OTP expired
- `404` - No pending verification found
- `429` - Maximum attempts exceeded

---

### 4. Resend OTP

Request a new OTP code.

```http
POST /phone-number-validator/resend-otp
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "phone_number": "+201158952209"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP resent successfully",
  "data": {
    "expires_in": 600,
    "can_resend_after": 60
  }
}
```

---

### 5. Check Status

Get current verification status.

```http
GET /phone-number-validator/status?phone_number=+201158952209
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification status retrieved",
  "data": {
    "verification_pending": true,
    "expires_at": "2025-11-06T13:23:16.276Z",
    "attempts_remaining": 4,
    "can_resend": false
  }
}
```

## 💻 Usage Examples

### React/Next.js Integration

```javascript
// services/phoneVerification.js
const API_BASE = 'https://your-directus-url';

export const phoneVerificationService = {
  async requestVerification(phoneNumber, countryCode, accessToken) {
    const response = await fetch(`${API_BASE}/phone-number-validator/request-verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone_number: phoneNumber, country_code: countryCode })
    });
    
    if (!response.ok) throw new Error((await response.json()).message);
    return response.json();
  },

  async verifyOTP(phoneNumber, otp, accessToken) {
    const response = await fetch(`${API_BASE}/phone-number-validator/verify-otp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone_number: phoneNumber, otp })
    });
    
    if (!response.ok) throw new Error((await response.json()).message);
    return response.json();
  },

  async resendOTP(phoneNumber, accessToken) {
    const response = await fetch(`${API_BASE}/phone-number-validator/resend-otp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone_number: phoneNumber })
    });
    
    if (!response.ok) throw new Error((await response.json()).message);
    return response.json();
  },

  async checkStatus(phoneNumber, accessToken) {
    const response = await fetch(
      `${API_BASE}/phone-number-validator/status?phone_number=${encodeURIComponent(phoneNumber)}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    return response.json();
  }
};
```

### cURL Examples

```bash
# Request OTP
curl -X POST https://your-directus-url/phone-number-validator/request-verification \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+201158952209", "country_code": "+20"}'

# Verify OTP
curl -X POST https://your-directus-url/phone-number-validator/verify-otp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+201158952209", "otp": "1234"}'

# Check status
curl "https://your-directus-url/phone-number-validator/status?phone_number=%2B201158952209" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🏗️ Architecture

### Project Structure

```
phone-number-validator/
├── src/
│   ├── index.ts                           # Main endpoint handler
│   ├── types.ts                           # TypeScript interfaces
│   ├── services/
│   │   ├── otp.service.ts                # OTP generation & validation
│   │   ├── sms.service.ts                # SMS provider implementations
│   │   ├── phone-validation.service.ts   # Phone validation logic
│   │   └── rate-limit.service.ts         # Rate limiting service
│   └── utils/
│       ├── errors.ts                      # Custom error classes
│       ├── user.utils.ts                  # User database operations
│       └── validation.utils.ts            # Input validation
├── package.json
├── tsconfig.json
└── README.md
```

### SOLID Principles

This extension follows SOLID design principles:

1. **Single Responsibility** - Each service has one clear purpose
2. **Open/Closed** - Easy to extend with new SMS providers
3. **Liskov Substitution** - SMS providers are interchangeable
4. **Interface Segregation** - Clean, focused interfaces
5. **Dependency Inversion** - Services depend on abstractions

### Service Layer

- **OTPService**: Generates secure 4-digit codes, hashes with SHA-256, validates OTP
- **SMSService**: Multiple providers (Vonage, BeOn), automatic selection
- **PhoneValidationService**: Validates format, selects provider, handles country codes
- **RateLimitService**: Tracks frequency, enforces cooldowns, prevents abuse

## 🤝 Contributing

We love contributions! Whether it's bug fixes, feature additions, or documentation improvements, all contributions are welcome.

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/hassan3030/directus-phone-validator.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
   
   Use [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `refactor:` - Code refactoring
   - `test:` - Adding tests

5. **Push and open a Pull Request**
   ```bash
   git push origin feature/amazing-feature
   ```

### Development Setup

```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Adding a New SMS Provider

To add support for a new SMS provider:

1. Create a new class implementing `SMSProvider` interface in `src/services/sms.service.ts`
2. Update provider selection logic in `PhoneValidationService`
3. Add configuration to environment variables
4. Update documentation
5. Submit a PR!

### Code Style Guidelines

- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Write meaningful commit messages

## 🔒 Security

### Security Features

- **OTP Hashing**: SHA-256 with secret salt, never stored in plain text
- **Expiry**: 10-minute validity period for OTP codes
- **Max Attempts**: 5 verification attempts per OTP
- **Rate Limiting**: 3 requests/hour, 1-minute resend cooldown
- **Authentication**: Required Directus token for all endpoints
- **Unique Phone Numbers**: Prevents multiple users from claiming same number

### Reporting Security Vulnerabilities

**Please DO NOT open public issues for security vulnerabilities.**

Instead, email security concerns to: **hassan3030@github** or open a private security advisory.

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We'll respond within 48 hours.

### Security Best Practices

When using this extension:

1. **Use HTTPS** - Always use HTTPS in production
2. **Secure Secrets** - Never commit API keys or secrets
3. **Environment Variables** - Store sensitive config in `.env`
4. **Token Management** - Implement proper access token rotation
5. **Monitoring** - Monitor for unusual activity patterns

## 🔍 Troubleshooting

### Common Issues

#### Extension Not Loading

**Solution:**
```bash
# Rebuild extension
npm run build

# Check Directus logs
docker-compose logs -f directus

# Verify extension path
ls /path/to/directus/extensions/
```

#### SMS Not Received

**Checklist:**
- ✓ Verify SMS provider credentials in `.env`
- ✓ Check phone number format (must include country code)
- ✓ Confirm SMS provider account has credit
- ✓ Check Directus logs for errors
- ✓ Test with a different phone number

#### Invalid OTP Error

**Causes:**
- OTP expired (> 10 minutes)
- Maximum attempts exceeded (5)
- Wrong phone number
- System time incorrect

**Solution:** Request new OTP via resend endpoint

#### Rate Limit Errors

**Solution:** Wait for cooldown period:
- 1 minute for resend requests
- 1 hour if 3 requests already made

### Error Codes

| Code | Status | Message | Solution |
|------|--------|---------|----------|
| `INVALID_PHONE` | 400 | Invalid phone number | Use international format |
| `RATE_LIMITED` | 429 | Too many requests | Wait for cooldown |
| `OTP_EXPIRED` | 400 | OTP expired | Request new OTP |
| `OTP_INVALID` | 400 | Invalid OTP | Check code and retry |
| `PHONE_IN_USE` | 409 | Phone already verified | Use different number |
| `MAX_ATTEMPTS` | 400 | Maximum attempts exceeded | Request new OTP |
| `UNAUTHORIZED` | 401 | Authentication required | Provide valid token |

### Getting Help

1. **Check Documentation** - Review this README
2. **Search Issues** - Look for similar problems on GitHub
3. **Ask Community** - Open a discussion
4. **Report Bug** - Create an issue with details

## 📝 Changelog

### v1.0.0 (2025-11-06)

- ✅ Initial release
- ✅ Phone verification with SMS OTP
- ✅ Multi-provider SMS support (Vonage & BeOn)
- ✅ Rate limiting and security features
- ✅ TypeScript support with full type safety
- ✅ Comprehensive API documentation

## 🌟 Contributors

Thanks to all contributors who have helped make this project better!

Want to be added? See [Contributing](#-contributing)!

## 📄 License

This project is licensed under the **MIT License**.

### What this means:

- ✅ **Commercial use** - Use it in your business
- ✅ **Modification** - Change it as you need
- ✅ **Distribution** - Share it with others
- ✅ **Private use** - Use it privately
- ⚠️ **No warranty** - Provided as-is

## 🙏 Acknowledgments

- Built with [Directus Extensions SDK](https://docs.directus.io/extensions/)
- SMS delivery via [Vonage](https://www.vonage.com/) and [BeOn](https://beon.chat/)
- Inspired by the Directus community
- Special thanks to all contributors

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/hassan3030/directus-phone-validator/issues)
- **Discussions**: [Ask questions or share ideas](https://github.com/hassan3030/directus-phone-validator/discussions)
- **Star the repo**: If this helped you, please ⭐ star it on GitHub!

## ⭐ Show Your Support

If this project helped you:

- ⭐ **Star this repository** on GitHub
- 🐦 **Share it** on social media
- 📝 **Write a blog post** about it
- 🤝 **Contribute** code or documentation

---

<div align="center">
  <p>Made with ❤️ for the Directus community</p>
  <p>
    <a href="#-directus-phone-number-validator-extension">⬆ Back to top</a>
  </p>
</div>