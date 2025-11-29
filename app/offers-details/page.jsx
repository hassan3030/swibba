"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { History } from "lucide-react"
import { 
  OffersTable, 
  OffersEmptyState, 
  OffersLoadingState,
} from "@/components/offers-details"
import PageHeader from "@/components/general/page-header"
import { getOfferById, getOffeReceived, getOfferItemsByOfferId } from "@/callAPI/swap"
import { getProductById } from "@/callAPI/products"
import { getUserById } from "@/callAPI/users"
import { decodedToken } from "@/callAPI/utiles"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"

export default function OffersDetailsPage() {
  const [offers, setOffers] = useState([])
  const [filteredOffers, setFilteredOffers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [sortOption, setSortOption] = useState("date_desc")
  
  const { t } = useTranslations()
  const { isRTL } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const decoded = await decodedToken()
        if (decoded && decoded.id) {
          setCurrentUserId(decoded.id)
        }
      } catch (error) {
        console.error("Error fetching user ID:", error)
      }
    }
    fetchUserId()
  }, [])

  const fetchOffers = useCallback(async () => {
    if (!currentUserId) return
    
    setIsLoading(true)
    try {
      const sentOffersRes = await getOfferById(currentUserId)
      const receivedOffersRes = await getOffeReceived(currentUserId)
      
      const allUserOffers = []
      const offerIds = new Set()
      
      if (sentOffersRes.success && sentOffersRes.data) {
        sentOffersRes.data.forEach(offer => {
          if (!offerIds.has(offer.id)) {
            offerIds.add(offer.id)
            allUserOffers.push(offer)
          }
        })
      }
      
      if (receivedOffersRes.success && receivedOffersRes.data) {
        receivedOffersRes.data.forEach(offer => {
          if (!offerIds.has(offer.id)) {
            offerIds.add(offer.id)
            allUserOffers.push(offer)
          }
        })
      }
      
      if (allUserOffers.length > 0) {
        const processedOffers = await Promise.all(
          allUserOffers.map(async (offer) => {
            const getUserId = (userField) => {
              if (!userField) return null
              if (typeof userField === 'object' && userField !== null) {
                return userField.id || null
              }
              return String(userField)
            }
            
            const fromUserId = getUserId(offer.from_user_id)
            const toUserId = getUserId(offer.to_user_id)
            const currentUserIdStr = String(currentUserId)
            
            let fromUser = null
            let toUser = null
            let otherUser = null
            let myUser = null
            
            if (fromUserId) {
              if (typeof offer.from_user_id === 'object' && offer.from_user_id !== null && offer.from_user_id.id) {
                fromUser = offer.from_user_id
              } else {
                try {
                  const userRes = await getUserById(fromUserId)
                  if (userRes.success && userRes.data) {
                    fromUser = userRes.data
                  }
                } catch (error) {}
              }
            }
            
            if (toUserId) {
              if (typeof offer.to_user_id === 'object' && offer.to_user_id !== null && offer.to_user_id.id) {
                toUser = offer.to_user_id
              } else {
                try {
                  const userRes = await getUserById(toUserId)
                  if (userRes.success && userRes.data) {
                    toUser = userRes.data
                  }
                } catch (error) {}
              }
            }
            
            if (fromUserId && String(fromUserId) === currentUserIdStr) {
              myUser = fromUser
              otherUser = toUser
            } else if (toUserId && String(toUserId) === currentUserIdStr) {
              myUser = toUser
              otherUser = fromUser
            } else {
              otherUser = toUser || fromUser
            }

            let myItems = []
            let theirItems = []
            try {
              const itemsRes = await getOfferItemsByOfferId(offer.id)
              if (itemsRes.success && itemsRes.data) {
                const itemPromises = itemsRes.data.map(async (item) => {
                  try {
                    const productRes = await getProductById(item.item_id)
                    if (productRes.success) {
                      return { ...item, product: productRes.data }
                    }
                  } catch (error) {}
                  return null
                })
                
                const populatedItems = (await Promise.all(itemPromises)).filter(Boolean)
                
                const fromUserIdStr = fromUserId ? String(fromUserId) : null
                const toUserIdStr = toUserId ? String(toUserId) : null
                
                if (fromUserIdStr && toUserIdStr) {
                  let myUserIdForItems = null
                  if (fromUserIdStr === currentUserIdStr) {
                    myUserIdForItems = fromUserIdStr
                  } else if (toUserIdStr === currentUserIdStr) {
                    myUserIdForItems = toUserIdStr
                  }
                  
                  if (myUserIdForItems) {
                    myItems = populatedItems.filter(item => {
                      const offeredBy = String(item.offered_by || '')
                      return offeredBy === myUserIdForItems
                    })
                    
                    theirItems = populatedItems.filter(item => {
                      const offeredBy = String(item.offered_by || '')
                      return offeredBy !== myUserIdForItems
                    })
                  } else {
                    myItems = populatedItems.filter(item => {
                      const offeredBy = String(item.offered_by || '')
                      return offeredBy === fromUserIdStr
                    })
                    
                    theirItems = populatedItems.filter(item => {
                      const offeredBy = String(item.offered_by || '')
                      return offeredBy === toUserIdStr
                    })
                  }
                } else {
                  theirItems = populatedItems
                  myItems = []
                }
              }
            } catch (error) {}

            return {
              ...offer,
              fromUser,
              toUser,
              otherUser,
              myUser,
              myItems,
              theirItems,
            }
          })
        )

        setOffers(processedOffers)
        setFilteredOffers(processedOffers)
      } else {
        setOffers([])
        setFilteredOffers([])
      }
    } catch (error) {
      setOffers([])
      setFilteredOffers([])
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    if (currentUserId) {
      fetchOffers()
    }
  }, [fetchOffers, currentUserId])

  const calculateTotalValue = useCallback((items = []) => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.product?.price || 0)
      const quantity = parseInt(item.quantity || 1)
      return sum + (price * quantity)
    }, 0)
  }, [])

  // Filter to show only completed and rejected offers (history)
  useEffect(() => {
    // Only show completed and rejected offers as history
    const historyOffers = offers.filter(offer => 
      offer.status_offer === "completed" || offer.status_offer === "rejected"
    )

    // Sort by date
    historyOffers.sort((a, b) => {
      switch (sortOption) {
        case 'date_asc':
          return new Date(a.date_updated || a.date_created || 0) - new Date(b.date_updated || b.date_created || 0)
        case 'my_value_desc':
          return calculateTotalValue(b.myItems) - calculateTotalValue(a.myItems)
        case 'my_value_asc':
          return calculateTotalValue(a.myItems) - calculateTotalValue(b.myItems)
        case 'their_value_desc':
          return calculateTotalValue(b.theirItems) - calculateTotalValue(a.theirItems)
        case 'their_value_asc':
          return calculateTotalValue(a.theirItems) - calculateTotalValue(b.theirItems)
        case 'date_desc':
        default:
          return new Date(b.date_updated || b.date_created || 0) - new Date(a.date_updated || a.date_created || 0)
      }
    })

    setFilteredOffers(historyOffers)
  }, [offers, sortOption, calculateTotalValue])

  const handleViewOffer = (offer) => {
    router.push(`/offers/${offer.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-gray-950 dark:via-gray-950 dark:to-primary/10">
      {/* Hero Header Section */}
      <PageHeader
        icon={History}
        title={isRTL ? "سجل المبادلات" : "Swap History"}
        description={
          isRTL
            ? "استعرض جميع سجلات المبادلات السابقة الخاصة بك."
            : "View all your past  swap records."
        }
        iconAnimation="none"
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Content */}
        {isLoading ? (
          <OffersLoadingState t={t} />
        ) : filteredOffers.length === 0 ? (
          <OffersEmptyState 
            t={t} 
            hasFilters={false}
            onClearFilters={() => {}}
          />
        ) : (
          <OffersTable
            offers={filteredOffers}
            currentUserId={currentUserId}
            onViewOffer={handleViewOffer}
            t={t}
            isRTL={isRTL}
            sortOption={sortOption}
            onSortChange={setSortOption}
          />
        )}
      </div>
    </div>
  )
}
