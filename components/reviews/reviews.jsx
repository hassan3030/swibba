"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Send, CheckCircle, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { addReview, getReviewConditins } from "@/callAPI/swap"
import { decodedToken } from "@/callAPI/utiles"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/lib/use-translations"
import { getUserById } from "@/callAPI/users"
import { getCurrentUserId } from "@/callAPI/utiles"
import Image from "next/image"
import { mediaURL } from "@/callAPI/utiles";

// Animation variants 
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
}

const starVariants = {
  inactive: {
    scale: 1,
    rotate: 0,
  },
  active: {
    scale: 1.2,
    rotate: -10,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  hover: {
    scale: 1.3,
    rotate: -5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
}

const successVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
}

const SwapRating = ({ from_user_id, to_user_id, offer_id, userName, userAvatar, onRatingSubmitted, onClose }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslations()

  const [myEmail, setMyEmail] = useState("")

  const getMyDataUser = async()=>{ 
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        return
      }
      
      const myUser = await getUserById(userId)
      if (myUser && myUser.data && myUser.data.email) {
        setMyEmail(myUser.data.email)
      } else {
        setMyEmail("")
      }
    } catch (error) {
      setMyEmail("")
    }
  }

  useEffect(() => {
    getMyDataUser()
  }, [])

  const checkReview = async () => {
    try {
      const {id} = await decodedToken()
      if (!id) {
        setHasReviewed(false)
        return
      }
      
      const rev = await getReviewConditins(id, offer_id)
      if (rev && rev.data && typeof rev.data.has_reviewed === 'boolean') {
        setHasReviewed(rev.data.has_reviewed)
      } else {
        setHasReviewed(false)
      }
    } catch (error) {
      setHasReviewed(false)
    }
  }

  const handleAddRating = async () => {
    await addReview(from_user_id, to_user_id, offer_id, rating, message , myEmail)
  }

  const handleStarClick = (starRating) => {
    setRating(starRating)
  }

  const handleStarHover = (starRating) => {
    setHoverRating(starRating)
  }

  const handleStarLeave = () => {
    setHoverRating(0)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: t("error") || "Error",
        description: t("Pleaseselectastarratingbeforesubmitting") || "Please select a star rating before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await handleAddRating()
      toast({
        title: t("Ratingsubmitted") || "Rating submitted",
        description: t("Thankyouforrating") || "Thank you for rating",
      })
      
      setHasReviewed(true)
      
      if (onRatingSubmitted) {
        onRatingSubmitted()
      }
      
      router.refresh()
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: t("FailedtosubmitratingPleasetryagainlater") || "Failed to submit rating Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingText = (rating) => {
    switch (rating) {
      case 1:
        return t("Poor") || "Poor"
      case 2:
        return t("Fair") || "Fair"
      case 3:
        return t("Good") || "Good"
      case 4:
        return t("VeryGood") || "Very Good"
      case 5:
        return t("Excellent") || "Excellent"
      default:
        return t("Selectarating") || "Select a rating"
    }
  }

  useEffect(() => {
    checkReview()
  }, [hasReviewed])

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" className="w-full">
      <Card className="shadow-2xl border-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {t("RateYourSwapPartner") || "Rate Your Swap Partner"}
          </h3>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 p-4 bg-muted/50">
          {userAvatar && (
            <Image
              width={48}
              height={48}
              src={userAvatar}
              alt={userName}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          {userName && (
            <p className="font-medium text-base">{userName}</p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!hasReviewed ? (
            <motion.div
              key="rating-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="p-4 space-y-4">
                {/* Star Rating */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    {getRatingText(hoverRating || rating)}
                  </p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        onMouseLeave={handleStarLeave}
                        className="focus:outline-none"
                        variants={starVariants}
                        initial="inactive"
                        animate={star <= (hoverRating || rating) ? "active" : "inactive"}
                        whileHover="hover"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Star
                          className={`h-8 w-8 transition-colors duration-200 ${
                            star <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Message with inline send button */}
                <div className="relative">
                  <Textarea
                    placeholder={t("Leaveamessageoptional") || "Leave a message (optional)"}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px] resize-none pr-12 pb-12"
                    maxLength={500}
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{message.length}/500</span>
                    <Button
                      size="icon"
                      onClick={handleSubmit}
                      disabled={isSubmitting || rating === 0}
                      className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          ) : (
            <motion.div
              key="success-message"
              variants={successVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="p-4"
            >
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    {t("ReviewSubmitted") || "Review Submitted"}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-500">
                    {t("YouhavealreadyreviewedthisofferThankyouforyourfeedback") ||
                      "You have already reviewed this offer. Thank you for your feedback!"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

export default SwapRating
