# DeelDeal

![DeelDeal Logo](public/logo.png)

DeelDeal is a modern platform that revolutionizes the way people trade and swap items. It enables users to exchange various products including real estate, electronics, cars, and more, with support for multi-item offers and negotiated trades.

## Features

### Core Functionality
- **User Authentication**
  - Email/Password registration and login
  - Google OAuth integration
  - Secure session management

- **Item Management**
  - Add, edit, and delete items
  - Multiple image uploads
  - Detailed item descriptions
  - Category classification

- **Swap System**
  - Create multi-item swap offers
  - Add cash difference in trades
  - Real-time offer status updates
  - Negotiation system

### User Experience
- **Search & Discovery**
  - Full-text search capability
  - Advanced filtering options
  - Category-based browsing
  - Responsive grid layout

- **User Interface**
  - Modern, responsive design
  - Mobile-first approach
  - Dark/Light theme support
  - Intuitive navigation

### Administration
- **Admin Dashboard**
  - Directus headless CMS integration
  - User management
  - Content moderation
  - Analytics and reporting

## Technology Stack

### Frontend
- **Next.js** - React framework for production
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

### Backend
- **Directus** - Headless CMS
- **PostgreSQL** - Primary database

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- PostgreSQL database
- Directus instance

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/deeldeal.git
cd deeldeal/front
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
Create a `.env` file in the root directory and add the following variables:
```env
NEXT_PUBLIC_API_URL=your_directus_api_url
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
# Add other required environment variables as specified in config/environment.js
```

4. Start the development server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
/front
├── app/                 # Next.js app directory
│   ├── auth/           # Authentication pages
│   ├── products/       # Product-related pages
│   └── profile/        # User profile pages
├── components/         # Reusable React components
├── config/            # Configuration files
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── public/            # Static assets
└── styles/            # Global styles
```

## API Integration

### Directus Setup
1. Install and configure Directus
2. Create necessary collections:
   - Users
   - Items
   - Offers
   - Categories

### API Endpoints
The application uses the following main endpoints:

- `/api/auth/*` - Authentication routes
- `/api/items` - Item management
- `/api/offers` - Swap offers
- `/api/users` - User management

Detailed API documentation is available in the Directus admin panel.

## Screenshots

### Homepage
[Homepage Screenshot Placeholder]

### Product Listing
[Product Listing Screenshot Placeholder]

### Swap Offer Interface
[Swap Interface Screenshot Placeholder]

## Contributing

We welcome contributions to DeelDeal! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For support or queries, please contact us at support@deeldeal.com

---

Made with ❤️ by the DeelDeal Team