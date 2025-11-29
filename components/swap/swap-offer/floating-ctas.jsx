"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Star, Stars, X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FaFaceGrinStars } from "react-icons/fa6"

export function FloatingCTAs({ onChatClick, onReviewClick, showReview, chatCount, t, isRTL, isReviewOpen }) {
  const [showChatLabel, setShowChatLabel] = useState(true)
  const [showRateLabel, setShowRateLabel] = useState(true)

  return (
    <motion.div 
      className={`fixed bottom-14 md:bottom-6 ${isRTL ? 'left-6 items-start' : 'right-6 items-end'} z-50 flex flex-col gap-3`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
    >
      {/* Chat CTA with Label */}
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Chat Label Popup */}
        <AnimatePresence>
          {showChatLabel && (
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -20 : 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: isRTL ? -20 : 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-2 bg-background/40 border border-border shadow-lg rounded-full py-2 px-3 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <span className="text-sm font-medium text-foreground whitespace-nowrap">
                {t("ChatwithSwapPartner") || "Chat with Swap Partner"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowChatLabel(false)
                }}
                className="h-5 w-5 rounded-full bg-gray-200  dark:bg-gray-700 hover:bg-gray-300 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={onChatClick}
                className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:shadow-xl hover:shadow-primary/40 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="h-6 w-6" />
                {chatCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center text-white">
                    {chatCount > 9 ? '9+' : chatCount}
                  </span>
                )}
              </motion.button>
            </TooltipTrigger>
            {!showChatLabel && (
              <TooltipContent side={isRTL ? 'right' : 'left'}>
                <p>{t("ChatwithSwapPartner") || "Chat with Partner"}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Review CTA - Only show when completed and review modal is not open */}
      {showReview && !isReviewOpen && (
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Rate Label Popup */}
          <AnimatePresence>
            {showRateLabel && (
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: isRTL ? -20 : 20, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center gap-2 bg-background/40 border border-border shadow-lg rounded-full py-2 px-3 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  {t("RateYourSwapPartner") || "Rate Your Swap Partner"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowRateLabel(false)
                  }}
                  className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rate Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={onReviewClick}
                  className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:shadow-xl hover:shadow-primary/40 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <FaFaceGrinStars className="h-6 w-6" />
                </motion.button>
              </TooltipTrigger>
              {!showRateLabel && (
                <TooltipContent side={isRTL ? 'right' : 'left'}>
                  <p>{t("RateYourSwapPartner") || "Rate Partner"}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </motion.div>
  )
}

export default FloatingCTAs
