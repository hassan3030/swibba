"use client"
import { motion, AnimatePresence } from "framer-motion"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import SwapRating from "@/components/reviews/reviews"
import { mediaURL } from "@/callAPI/utiles"

export function ReviewPanel({ isOpen, onClose, myUserId, otherUser, offerId, t }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="pointer-events-auto w-full max-w-md">
              <SwapRating
                from_user_id={myUserId}
                to_user_id={otherUser?.id}
                offer_id={offerId}
                userName={`${otherUser?.first_name || ""} ${otherUser?.last_name || ""}`.trim()}
                userAvatar={otherUser?.avatar ? `${mediaURL}${otherUser.avatar}` : "/placeholder.svg"}
                onClose={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ReviewPanel
