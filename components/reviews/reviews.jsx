"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Send, CheckCircle } from "lucide-react"
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
    filter: "brightness(0.7)",
  },
  active: {
    scale: 1.2,
    rotate: -10,
    filter: "brightness(1.2)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  hover: {
    scale: 1.3,
    rotate: -5,
    filter: "brightness(1.3)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  tap: { scale: 0.95 },
}

const textVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
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

const SwapRating = ({ from_user_id, to_user_id, offer_id, userName, userAvatar, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [message, setMessage] = useState("")
  const [onClose, setOnClose] = useState(false)
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
        // console.error("No user ID available")
        return
      }
      
      const myUser = await getUserById(userId)
      if (myUser && myUser.data && myUser.data.email) {
        setMyEmail(myUser.data.email)
      } else {
        // console.error("User data not found or invalid structure:", myUser)
        setMyEmail("")
      }
    } catch (error) {
      // console.error("Error fetching user data:", error)
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
        // console.error("No user ID available for review check")
        setHasReviewed(false)
        return
      }
      
      const rev = await getReviewConditins(id, offer_id)
      if (rev && rev.data && typeof rev.data.has_reviewed === 'boolean') {
        setHasReviewed(rev.data.has_reviewed)
      } else {
        // console.error("Review data not found or invalid structure:", rev)
        setHasReviewed(false)
      }
    } catch (error) {
      //  console.error("Error checking review conditions:", error)
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
      
      // Set hasReviewed to true to show success message
      setHasReviewed(true)
      
      // Call the callback function if provided
      if (onRatingSubmitted) {
        onRatingSubmitted()
      }
      
      // Refresh the page data
      router.refresh()
      
      // Also try window.location.reload() as fallback
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
    <motion.div variants={cardVariants} initial="hidden" animate="visible" className="w-full max-w-md mx-auto">
      <Card className="shadow-xl border-0 overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <CardTitle className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: [0, -10] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
              >
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </motion.div>
              {t("RateYourSwapPartner") || "Rate Your Swap Partner"}
            </CardTitle>
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-3 mt-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
          >
            {userAvatar && (
              <Image
                width={100}
                height={100}
                src={userAvatar}
                alt={userName}
                className="w-12 h-12 rounded-full object-cover shadow-lg"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <div>
              {userName && (
                <motion.p
                  className="font-semibold text-lg"
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.5 }}
                >
                  {userName}
                </motion.p>
              )}
            </div>
          </motion.div>
        </CardHeader>

        <AnimatePresence mode="wait">
          {!hasReviewed ? (
            <motion.div
              key="rating-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="space-y-6 p-6">
                {/* Star Rating */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex justify-center gap-1 mb-2">
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
                            star <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                  <motion.p
                    className="text-sm font-medium text-muted-foreground"
                    key={hoverRating || rating}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {getRatingText(hoverRating || rating)}
                  </motion.p>
                </motion.div>

                {/* Message */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Leaveamessageoptional") || "Leave a message (optional)"}
                  </label>
                  <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                    <Textarea
                      placeholder="Share your experience with this swap partner..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[80px] resize-none transition-all duration-200 focus:ring-2 focus:ring-yellow-400/20"
                      maxLength={500}
                    />
                  </motion.div>
                  <motion.p
                    className="text-xs text-muted-foreground mt-1 text-right"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    {message.length}/500
                  </motion.p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  {onClose && (
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
                        {t("Cancel") || "Cancel"}
                      </Button>
                    </motion.div>
                  )}
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      onClick={() => {
                        handleSubmit()
                      }}
                      disabled={isSubmitting || rating === 0}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <AnimatePresence mode="wait">
                        {isSubmitting ? (
                          <motion.div
                            key="submitting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                            />
                            {t("SubmitRating") || "Submit Rating"}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="submit"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center"
                          >
                            <Send className="mr-2 h-4 w-4" />
                            {t("SubmitRating") || "Submit Rating"}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </motion.div>
          ) : (
            <motion.div
              key="success-message"
              variants={successVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3 mb-4 mx-4 mt-2"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.2 }}
              >
                <CheckCircle className="w-6 h-6 text-green-500" />
              </motion.div>
              <div>
                <motion.div
                  className="font-semibold text-green-700"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {t("ReviewSubmitted") || "Review Submitted"}
                </motion.div>
                <motion.div
                  className="text-sm text-green-600"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {t("YouhavealreadyreviewedthisofferThankyouforyourfeedback") ||
                    "You have already reviewed this offer. Thank you for your feedback!"}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

export default SwapRating
