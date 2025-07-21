export const itemsSwapStatus = [
  "available",
 "unavailable",
  
]

export const itemsStatus = [
  "new",
  "like-new",
"excellent",
  "good",
  "fair",
  "old"
  
]



export const offerStatus = [
  "pending",
  "rejected",
  "accepted",
  "completed"
]

export const transactionStatus = [
  "pending",
  "rejected",
  "accepted",
  "completed"
  
]



export const categoriesName = [
"realestate",
"books",
"software",
"jewelry",
 "automotive",
"electronics",
 "fashion",
 "home",
 "beauty",
 "toys",
 "sports",
 "health",
 "furniture",
 "pets"
  
]
export const allowedCategories = [ ...categoriesName,"all"]
export const categories = [
  {
    name: `${categoriesName[0]}`,
    imageSrc:  "/categories/realestate.jpg",
  },
  {
    name: `${categoriesName[1]}`,
    imageSrc:  "/categories/book.jpg",
  },
  {
    name: `${categoriesName[2]}`,
    imageSrc: "/categories/sw.jpg",
  },
  {
    name: `${categoriesName[3]}`,
    imageSrc:  "/categories/jewelry.jpg",
  },
  {
    name: `${categoriesName[4]}`,
    imageSrc: "/categories/automotive.jpg",
  },
  {
    name: `${categoriesName[5]}`,
    imageSrc:  "/categories/electronics.jpg",
  },
  {
    name: `${categoriesName[6]}`,
    imageSrc:  "/categories/fashion.jpg",
  },
  {
    name: `${categoriesName[7]}`,
    imageSrc:  "/categories/kitchen.jpg",
  },
  {
     name: `${categoriesName[8]}`,
    imageSrc:  "/categories/Beauty.jpg",
  },
  {
    name: `${categoriesName[9]}`,
    imageSrc: "/categories/Toys.jpg",
  },
 
  {
   name: `${categoriesName[10]}`,
    imageSrc:  "/categories/Sports.jpg",
  },
  {
    name: `${categoriesName[11]}`,
    imageSrc:  "/categories/Health.jpg",
  },
  {
    name: `${categoriesName[12]}`,
    imageSrc:"/categories/Furniture.jpg",
  }
  
]



// Static user data
export const currentUser = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  profile_image: "/placeholder.svg?height=200&width=200&text=John",
  phone_number: "+1 (555) 123-4567",
  location: {
    city: "New York",
    country: "USA",
    coordinates: {
      lat: 40.7128,
      lng: -74.006,
    },
  },
  ratings: 4.8,
  verified: true,
  created_at: "2023-01-15T08:30:00Z",
  bio: "Passionate about trading and finding great deals. I love electronics and vintage items.",
  preferences: {
    notifications: true,
    newsletter: false,
    darkMode: true,
    language: "en",
  },
}

// Static items data
export const items = [
  {
    id: "item-1",
    user_id: "user-1",
    name: "Apple iPhone 14 Pro Max",
    description:
      "Mint condition iPhone 14 Pro Max with 256GB storage. Includes original box, charger, and AppleCare+ until 2024.",
    category: "Electronics",
    allowed_categories: ["Electronics", "Computers", "Phones"],
    value_estimate: 999,
    images: ["/placeholder.svg?height=400&width=300&text=iPhone+14"],
    location: {
      city: "New York",
      country: "USA",
    },
    status: "Available",
    created_at: "2023-05-10T14:30:00Z",
    user: {
      id: "user-1",
      name: "John Doe",
      profile_image: "/placeholder.svg?height=200&width=200&text=John",
      ratings: 4.8,
      verified: true,
    },
  },
  {
    id: "item-2",
    user_id: "user-2",
    name: "Sony PlayStation 5",
    description:
      "Brand new PS5 Disc Edition, unopened. Includes extra controller and 3 games (Spider-Man, God of War, Horizon).",
    category: "Electronics",
    allowed_categories: ["Electronics", "Gaming"],
    value_estimate: 599,
    images: ["/placeholder.svg?height=400&width=300&text=PS5"],
    location: {
      city: "Los Angeles",
      country: "USA",
    },
    status: "Available",
    created_at: "2023-05-15T10:15:00Z",
    user: {
      id: "user-2",
      name: "Jane Smith",
      profile_image: "/placeholder.svg?height=200&width=200&text=Jane",
      ratings: 4.6,
      verified: true,
    },
  },
  {
    id: "item-3",
    user_id: "user-3",
    name: "MacBook Pro M2",
    description:
      "MacBook Pro with M2 chip, 16GB RAM, 512GB SSD. Purchased 3 months ago, like new condition with AppleCare+.",
    category: "Electronics",
    allowed_categories: ["Electronics", "Computers"],
    value_estimate: 1799,
    images: ["/placeholder.svg?height=400&width=300&text=MacBook"],
    location: {
      city: "San Francisco",
      country: "USA",
    },
    status: "Available",
    created_at: "2023-05-18T09:45:00Z",
    user: {
      id: "user-3",
      name: "Robert Johnson",
      profile_image: "/placeholder.svg?height=200&width=200&text=Robert",
      ratings: 4.9,
      verified: true,
    },
  },
  {
    id: "item-4",
    user_id: "user-4",
    name: "Tesla Model 3",
    description:
      "2022 Tesla Model 3 Long Range, White exterior, Black interior. 15,000 miles, excellent condition, FSD package included.",
    category: "Cars",
    allowed_categories: ["Cars", "Real Estate"],
    value_estimate: 45000,
    images: ["/placeholder.svg?height=400&width=300&text=Tesla"],
    location: {
      city: "Miami",
      country: "USA",
    },
    status: "Available",
    created_at: "2023-05-20T16:30:00Z",
    user: {
      id: "user-4",
      name: "Emily Davis",
      profile_image: "/placeholder.svg?height=200&width=200&text=Emily",
      ratings: 4.7,
      verified: true,
    },
  },
  {
    id: "item-5",
    user_id: "user-5",
    name: "Luxury Condo in Downtown",
    description:
      "2-bedroom luxury condo in downtown area. 1,200 sq ft, modern finishes, floor-to-ceiling windows, 24/7 concierge.",
    category: "Real Estate",
    allowed_categories: ["Real Estate", "Cars"],
    value_estimate: 750000,
    images: ["/placeholder.svg?height=400&width=300&text=Condo"],
    location: {
      city: "Chicago",
      country: "USA",
    },
    status: "Available",
    created_at: "2023-05-22T11:20:00Z",
    user: {
      id: "user-5",
      name: "Michael Wilson",
      profile_image: "/placeholder.svg?height=200&width=200&text=Michael",
      ratings: 4.5,
      verified: true,
    },
  },
  {
    id: "item-6",
    user_id: "user-1",
    name: "Rolex Submariner",
    description:
      "Authentic Rolex Submariner Date, black dial, stainless steel. Purchased in 2021, comes with box, papers, and warranty.",
    category: "Others",
    allowed_categories: ["Others", "Electronics"],
    value_estimate: 12000,
    images: ["/placeholder.svg?height=400&width=300&text=Rolex"],
    location: {
      city: "New York",
      country: "USA",
    },
    status: "Available",
    created_at: "2023-05-25T13:10:00Z",
    user: {
      id: "user-1",
      name: "John Doe",
      profile_image: "/placeholder.svg?height=200&width=200&text=John",
      ratings: 4.8,
      verified: true,
    },
  },
  {
    id: "item-7",
    user_id: "user-1",
    name: "Canon EOS R5 Camera",
    description:
      "Canon EOS R5 mirrorless camera with RF 24-70mm f/2.8 lens. Includes extra battery, 128GB card, and camera bag.",
    category: "Electronics",
    allowed_categories: ["Electronics"],
    value_estimate: 3999,
    images: ["/placeholder.svg?height=400&width=300&text=Canon"],
    location: {
      city: "New York",
      country: "USA",
    },
    status: "Available",
    created_at: "2023-05-28T15:45:00Z",
    user: {
      id: "user-1",
      name: "John Doe",
      profile_image: "/placeholder.svg?height=200&width=200&text=John",
      ratings: 4.8,
      verified: true,
    },
  },
  {
    id: "item-8",
    user_id: "user-6",
    name: "Peloton Bike+",
    description:
      "Peloton Bike+ in excellent condition. Purchased 6 months ago, barely used. Includes mat, shoes (size 10), and weights.",
    category: "Others",
    allowed_categories: ["Others", "Electronics"],
    value_estimate: 1800,
    images: ["/placeholder.svg?height=400&width=300&text=Peloton"],
    location: {
      city: "Boston",
      country: "USA",
    },
    status: "Available",
    created_at: "2023-06-01T09:30:00Z",
    user: {
      id: "user-6",
      name: "Sarah Brown",
      profile_image: "/placeholder.svg?height=200&width=200&text=Sarah",
      ratings: 4.4,
      verified: false,
    },
  },
]

// Static offers data
export const offers = [
  {
    id: "offer-1",
    from_user_id: "user-2",
    to_user_id: "user-1",
    cash_adjustment: 200,
    status: "Pending",
    escrow_required: false,
    created_at: "2023-06-05T14:20:00Z",
    items: [
      {
        id: "item-2",
        offered_by: "user-2",
        name: "Sony PlayStation 5",
        value_estimate: 599,
        images: ["/placeholder.svg?height=400&width=300&text=PS5"],
      },
    ],
    for_items: [
      {
        id: "item-1",
        offered_by: "user-1",
        name: "Apple iPhone 14 Pro Max",
        value_estimate: 999,
        images: ["/placeholder.svg?height=400&width=300&text=iPhone+14"],
      },
    ],
  },
  {
    id: "offer-2",
    from_user_id: "user-3",
    to_user_id: "user-1",
    cash_adjustment: 0,
    status: "Pending",
    escrow_required: true,
    created_at: "2023-06-07T10:15:00Z",
    items: [
      {
        id: "item-3",
        offered_by: "user-3",
        name: "MacBook Pro M2",
        value_estimate: 1799,
        images: ["/placeholder.svg?height=400&width=300&text=MacBook"],
      },
    ],
    for_items: [
      {
        id: "item-6",
        offered_by: "user-1",
        name: "Rolex Submariner",
        value_estimate: 12000,
        images: ["/placeholder.svg?height=400&width=300&text=Rolex"],
      },
    ],
  },
]

// // Get user offers
// export function getUserOffers(userId) {
//   return offers.filter((offer) => offer.from_user_id === userId || offer.to_user_id === userId)
// }

// // Get offer by ID
// export function getOfferById(offerId) {
//   return offers.find((offer) => offer.id === offerId)
// }

// // Get user items
// export function getUserItems(userId) {
//   return items.filter((item) => item.user_id === userId)
// }

// // Get item by ID
// export function getItemById(itemId) {
//   return items.find((item) => item.id === itemId)
// }

// // Get items by category
// export function getItemsByCategory(category) {
//   if (category === "all") {
//     return items
//   }
//   return items.filter((item) => item.category === category)
// }

// // Search items
// export function searchItems(query) {
//   const searchTerm = query.toLowerCase()
//   return items.filter(
//     (item) => item.name.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm),
//   )
// }
// Current User
// const currentUser = users[0]

// Export functions to get data
export function getAllItems() {
  return items
}

export function getItemById(id) {
  return items.find((item) => item.id === id)
}

export function getUserItems(userId) {
  return items.filter((item) => item.user_id === userId)
}

export function getFeaturedItems() {
  return items.filter((item) => item.featured)
}

export function getItemsByCategory(categoryName) {
  return items.filter((item) => item.category === categoryName)
}

export function getUserById(id) {
  return users.find((user) => user.id === id)
}

export function getAllCategories() {
  return []
}

export function getFeaturedCategories() {
  return []
}

export function getOffersByItemId(itemId) {
  return offers.filter((offer) => offer.item_id === itemId)
}

export function getOffersByUserId(userId) {
  return offers.filter((offer) => offer.user_id === userId)
}

export function getReceivedOffers(userId) {
  const userItems = getUserItems(userId).map((item) => item.id)
  return offers.filter((offer) => userItems.includes(offer.item_id))
}

// Get offers related to a user (both sent and received)
export function getUserOffers(userId) {
  // Get offers made by the user
  const sentOffers = offers.filter((offer) => offer.user_id === userId)

  // Get offers received for the user's items
  const userItems = getUserItems(userId).map((item) => item.id)
  const receivedOffers = offers.filter((offer) => userItems.includes(offer.item_id))

  // Combine both types of offers
  return [...sentOffers, ...receivedOffers]
}


