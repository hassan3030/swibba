"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { getUserById, getUserByProductId } from "@/callAPI/users"
import { getProductByUserId, getProductById } from "@/callAPI/products"
import { getOfferById, getOfferItemsByOfferId, getOffeReceived, getCompletedOffer} from "@/callAPI/swap"
import { decodedToken, getCookie, validateAuth, mediaURL } from "@/callAPI/utiles"
import { ProfileHeroSection, ProfileStatsGrid, ProfileContentTabs } from "@/components/profile/profile-tab"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("items")
  const { t } = useTranslations()
  const params = useParams()
  const router = useRouter()
  const id = params.id
  
  // State management
  const [user, setUser] = useState(null)
  const [rate, setRate] = useState(0)
  const [avatarPath, setAvatarPath] = useState("")
  const [sentOffersCount, setSentOffersCount] = useState(0)
  const [recievedOffers, setrecievedOffers] = useState(0)
  const [myAvailableItems, setmyAvailableItems] = useState([])
  const [myUnavailableItems, setmyUnavailableItems] = useState([])
  const [showSwitchHeart, setShowSwitchHeart] = useState(false)
  const [completedOffersCount, setCompletedOffersCount] = useState(0)
  const { isRTL } = useLanguage()

  // Fetch completed offers
  const getCompletedOffers = async () => {
    try {
      const decoded = await decodedToken()
      const completedOffers = await getCompletedOffer(decoded.id)
      if (completedOffers.success) {
        setCompletedOffersCount(completedOffers.count)
      } else {
        setCompletedOffersCount(0)
      }
    } catch (error) {
      setCompletedOffersCount(0)
    }
  }

  // Fetch user data
  const getUser = async () => {
    const token = await getCookie()
    if (token) {
      const { id } = await decodedToken(token)
      if (!id) {
        router.push('/auth/login')
        return
      }
      const userData = await getUserById(id)
      if (userData.success) {
        setUser(userData.data)
      }
    }
  }

  // Get user rating
  const handleGetBreviousRating = async (id) => {
    const response = await getCompletedOffer(id)
    if (!response) {
      setRate(0)
    } else {
      setRate(response.rate || 0)
    }
  }

  // Fetch user products
  const getUserProducts = async () => {
    try {
      const userPruductsAvailable = await getProductByUserId("available")
      const userPruductsUnavailable = await getProductByUserId("unavailable")
      
      const unavailableItems = userPruductsUnavailable?.success && Array.isArray(userPruductsUnavailable.data)
        ? userPruductsUnavailable.data
        : []
      setmyUnavailableItems(unavailableItems)
      
      const availableItems = userPruductsAvailable?.success && Array.isArray(userPruductsAvailable.data)
        ? userPruductsAvailable.data
        : []
      setmyAvailableItems(availableItems)
    } catch (error) {
      setmyUnavailableItems([])
      setmyAvailableItems([])
    }
  }

  // Fetch received offers
  const getrecievedOffers = async () => {
    try {
      const { userId } = await validateAuth()
      const notifications = await getOffeReceived(userId)
      if (notifications.success && Array.isArray(notifications.data)) {
        const filteredOffers = notifications.data.filter(
          (offer) => offer.status_offer === "pending" || offer.status_offer === "accepted"
        )
        setrecievedOffers(filteredOffers.length)
      } else {
        setrecievedOffers(0)
      }
    } catch (error) {
      setrecievedOffers(0)
    }
  }

  // Fetch sent offers
  const getOffers = async () => {
    const token = await getCookie()
    if (token) {
      const { id } = await decodedToken(token)
      const offers = await getOfferById(id)

      if (offers.success && Array.isArray(offers.data)) {
        const filteredOffers = offers.data.filter(
          (offer) => offer.status_offer === "pending" || offer.status_offer === "accepted"
        )
        setSentOffersCount(filteredOffers.length)
      } else {
        setSentOffersCount(0)
      }
    }
  }

  // Initial data fetch
  useEffect(() => {
    getCompletedOffers()
    getrecievedOffers()
    getUser()
    getOffers()
    getUserProducts()
  }, [])

  // Update avatar when user changes
  useEffect(() => {
    if (user) {
      handleGetBreviousRating(user.id)
      if (user.avatar) {
        setAvatarPath(`${mediaURL}${user.avatar}`)
      }
    }
  }, [user])

  // Enhanced user object with avatar
  const enhancedUser = user ? { ...user, avatar: avatarPath } : null

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950">
      {/* Hero Section */}
      <ProfileHeroSection 
        user={enhancedUser} 
        rate={rate} 
        completedOffersCount={completedOffersCount}
      />

      {/* Stats Grid and Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileStatsGrid
          myAvailableItems={myAvailableItems}
          completedOffersCount={completedOffersCount}
          myUnavailableItems={myUnavailableItems}
          rate={rate}
        />

        {/* Content Tabs */}
        <ProfileContentTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          myAvailableItems={myAvailableItems}
          myUnavailableItems={myUnavailableItems}
          sentOffersCount={sentOffersCount}
          recievedOffers={recievedOffers}
          showSwitchHeart={showSwitchHeart}
        />
      </div>
    </div>
  )
}
