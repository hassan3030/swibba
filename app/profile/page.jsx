"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { getUserById, getUserByProductId } from "@/callAPI/users"
import { getProductByUserId, getProductById } from "@/callAPI/products"
import { getOfferById, getOfferItemsByOfferId, getOffeReceived, getCompletedOffer, getAllMessage, addMessage, acceptedOfferById, rejectOfferById, deleteOfferItemsById, completedOfferById, deleteFinallyOfferById} from "@/callAPI/swap"
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
  
  // Offers data for tabs
  const [sentOffers, setSentOffers] = useState([])
  const [receivedOffers, setReceivedOffers] = useState([])
  const [sentSwapItems, setSentSwapItems] = useState([])
  const [receivedSwapItems, setReceivedSwapItems] = useState([])
  const [sentUserSwaps, setSentUserSwaps] = useState([])
  const [receivedUserSwaps, setReceivedUserSwaps] = useState([])
  const [sentItemsOffer, setSentItemsOffer] = useState([])
  const [receivedItemsOffer, setReceivedItemsOffer] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [message, setMessage] = useState("")
  const [myUserId, setMyUserId] = useState(null)

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

  // Fetch received offers with full data
  const getrecievedOffers = async () => {
    try {
      const token = await getCookie()
      if (!token) return
      
      const { id } = await decodedToken()
      const offersReceived = await getOffeReceived(id)
      
      const offerItems = []
      const items = []
      const usersSwaper = []

      for (const offer of offersReceived.data) {
        const offerItem = await getOfferItemsByOfferId(offer.id)
        const user_from = await getUserById(offer.from_user_id)
        const user_to = await getUserById(offer.to_user_id)
        usersSwaper.push(user_from.data, user_to.data)
        if (offerItem?.success && Array.isArray(offerItem.data)) {
          offerItems.push(...offerItem.data)
        }
      }

      for (const item of offerItems) {
        const product = await getProductById(item.item_id)
        items.push({
          ...product.data,
          offer_item_id: item.id,
          offered_by: item.offered_by,
          offer_id: item.offer_id,
          user_id: product.data.user_id,
          quantity: item.quantity,
        })
      }

      const uniqueUsers = Array.from(
        new Map(
          (usersSwaper || []).filter((u) => u && u.id).map((user) => [user.id, user])
        ).values()
      )

      setReceivedOffers(offersReceived.data)
      setReceivedUserSwaps(uniqueUsers)
      setReceivedSwapItems(items)
      setReceivedItemsOffer(offerItems)
      
      const filteredOffers = offersReceived.data.filter(
        (offer) => offer.status_offer === "pending" || offer.status_offer === "accepted"
      )
      setrecievedOffers(filteredOffers.length)
    } catch (error) {
      setrecievedOffers(0)
      setReceivedOffers([])
    }
  }

  // Fetch sent offers with full data
  const getOffers = async () => {
    const token = await getCookie()
    if (!token) return
    
    const { id } = await decodedToken()
    const offers = await getOfferById(id)

    const offerItems = []
    const items = []
    const usersSwaper = []

    for (const offer of offers.data) {
      const offerItem = await getOfferItemsByOfferId(offer.id)
      const user_from = await getUserById(offer.from_user_id)
      const user_to = await getUserById(offer.to_user_id)
      usersSwaper.push(user_from.data, user_to.data)
      if (offerItem?.success && Array.isArray(offerItem.data)) {
        offerItems.push(...offerItem.data)
      }
    }

    for (const item of offerItems) {
      const product = await getProductById(item.item_id)
      items.push({
        ...product.data,
        offer_item_id: item.id,
        offered_by: item.offered_by,
        offer_id: item.offer_id,
        quantity: item.quantity,
      })
    }

    const uniqueUsers = Array.from(
      new Map(
        (usersSwaper || []).filter((u) => u && u.id).map((user) => [user.id, user])
      ).values()
    )

    setSentOffers(offers.data)
    setSentUserSwaps(uniqueUsers)
    setSentSwapItems(items)
    setSentItemsOffer(offerItems)

    if (offers.success && Array.isArray(offers.data)) {
      const filteredOffers = offers.data.filter(
        (offer) => offer.status_offer === "pending" || offer.status_offer === "accepted"
      )
      setSentOffersCount(filteredOffers.length)
    } else {
      setSentOffersCount(0)
    }
  }
  
  // Fetch user ID
  const fetchUserId = async () => {
    try {
      const { id } = await decodedToken()
      setMyUserId(id)
    } catch (error) {
      setMyUserId(null)
    }
  }
  
  // Fetch chat messages
  const handleGetMessages = async () => {
    try {
      const messages = await getAllMessage()
      setChatMessages(messages.data || [])
    } catch (error) {
      setChatMessages([])
    }
  }
  
  const handleSendMessage = async (to_user_id, offer_id) => {
    if (!message.trim()) return
    try {
      await addMessage(message.trim(), to_user_id, offer_id)
      setMessage("")
      handleGetMessages()
    } catch (error) {
      // Handle error
    }
  }

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      await fetchUserId()
      await Promise.all([
        getCompletedOffers(),
        getrecievedOffers(),
        getUser(),
        getOffers(),
        getUserProducts(),
        handleGetMessages()
      ])
    }
    fetchData()
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
