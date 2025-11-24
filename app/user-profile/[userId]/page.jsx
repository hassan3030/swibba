"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Star, ArrowLeft, MapPin, ArrowLeftRight, Verified, BadgeX, Clock } from "lucide-react"
import { getUserById } from "@/callAPI/users"
import { getCompletedOffer } from "@/callAPI/swap"
import { mediaURL } from "@/callAPI/utiles"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import LoadingSpinner from "@/components/loading/loading-spinner"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslations()
  const { isRTL } = useLanguage()
  const [user, setUser] = useState(null)
  const [completedOffersCount, setCompletedOffersCount] = useState(0)
  const [rate, setRate] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  const userId = params.userId

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        // Fetch user data
        const userData = await getUserById(userId)
        if (!userData?.data) {
          setIsLoading(false)
          return
        }
        setUser(userData.data)
        
        // Fetch completed offers and rating
        try {
          const completedOffers = await getCompletedOffer(userId)
          setCompletedOffersCount(completedOffers?.count || 0)
          setRate(completedOffers?.rate || 0)
        } catch (error) {
          setCompletedOffersCount(0)
          setRate(0)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchUserData()
    }
  }, [userId])

  if (isLoading) {
    return (
      <div className="min-h-screen py-4 bg-background dark:bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen py-4 bg-background dark:bg-gray-950 flex items-center justify-center">
        <p className="text-muted-foreground">{t("userNotFound") || "User not found"}</p>
      </div>
    )
  }

  const fullStars = Math.floor(rate || 0)
  const hasHalfStar = (rate || 0) % 1 >= 0.5
  const avatar = user?.avatar ? `${mediaURL}${user.avatar}` : ""
  const fullName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`.trim() 
    : t("account") || "Account"
  
  const location = user?.country || user?.city || user?.street
    ? `${isRTL ? user?.translations?.[1]?.country || "" : user?.translations?.[0]?.country || user?.country || ""} ${isRTL ? user?.translations?.[1]?.city || "" : user?.translations?.[0]?.city || user?.city || ""} ${isRTL ? user?.translations?.[1]?.street || "" : user?.translations?.[0]?.street || user?.street || ""}`.trim()
    : t("noAddress") || "No address"

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pb-8 sm:pb-12 pt-16 sm:pt-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className={`max-w-7xl mx-auto`}>
            {/* Back Button */}
            <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                {t("back") || "Back"}
              </Button>
            </div>

            <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              {/* Avatar Section */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2
                }}
                className="relative flex-shrink-0"
              >
                <Avatar className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 ring-4 ring-background shadow-2xl">
                  <AvatarImage src={avatar || "/placeholder.svg"} alt={fullName} />
                  <AvatarFallback className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    {fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Verified Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 500 }}
                  className={`absolute -bottom-1 ${isRTL ? '-left-1' : '-right-1'}`}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-background rounded-full p-1 sm:p-1.5 shadow-lg ring-2 ring-background">
                          {user?.Verified === "true" || user?.Verified === true ? (
                            <Verified className="h-4 w-4 sm:h-5 sm:w-5 text-primary fill-primary" />
                          ) : (
                            <BadgeX className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          {user?.Verified === "true" || user?.Verified === true 
                            ? (t("verified") || "Verified Account") 
                            : (t("notVerified") || "Not Verified")}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
              </motion.div>

              {/* Info Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 space-y-3 sm:space-y-4 w-full"
              >
                <div className="space-y-2 sm:space-y-3">
                  <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent `}>
                    {fullName}
                  </h1>
                  
                  <div className={`flex flex-col gap-2`}>
                    <div className={`flex items-center gap-1 sm:gap-1.5 text-muted-foreground ${isRTL ? 'justify-center sm:justify-end' : 'justify-center sm:justify-start'}`}>
                      <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span className="text-xs sm:text-sm line-clamp-1">{location}</span>
                    </div>
                    
                    <div className={`flex flex-wrap items-center gap-2 sm:gap-3 ${isRTL ? 'justify-center sm:justify-end' : 'justify-center sm:justify-start'}`}>
                      {rate > 0 && (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                                star <= fullStars
                                  ? "fill-yellow-400 text-yellow-400"
                                  : star === fullStars + 1 && hasHalfStar
                                  ? "fill-yellow-400/50 text-yellow-400"
                                  : "fill-none text-muted-foreground/30"
                              }`}
                            />
                          ))}
                          {/* <span className="text-xs sm:text-sm font-semibold ml-1">{rate.toFixed(1)}</span> */}
                          {/* <span className="text-[10px] sm:text-xs text-muted-foreground">/5.0</span> */}
                        </div>
                      )}
                      
                      {user?.date_created && (
                        <div className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground">
                          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span className="text-xs sm:text-sm">
                            {t("joined") || "Joined"} {new Date(user.date_created).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Badges */}
                  <div className={`flex items-center gap-2 sm:gap-3 flex-wrap ${isRTL ? 'justify-center sm:justify-end' : 'justify-center sm:justify-start'}`}>
                    <Badge variant="secondary" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 gap-1.5 sm:gap-2">
                      <ArrowLeftRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      {completedOffersCount > 1000 
                        ? "1000+"
                        : completedOffersCount || 0} {t("swaps") || "swaps"}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
