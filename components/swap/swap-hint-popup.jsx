"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, ArrowUp } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"
import { PiSwapBold } from "react-icons/pi"

const SwapHintPopup = ({ showSwapHint, setShowSwapHint, router }) => {
  const { t } = useTranslations()

  return (
    <AnimatePresence>
      {showSwapHint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed mt-4 inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex items-center justify-center"
          onClick={() => { setShowSwapHint(false); router.refresh() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full h-full flex flex-col items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10"
              onClick={() => { setShowSwapHint(false); router.refresh() }}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center space-y-8 max-w-2xl mx-auto text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4"
              >
                <PiSwapBold className="h-12 w-12 text-primary" />
              </motion.div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <h2 className="text-4xl font-bold text-foreground">
                  {t("checkSwaps") || "Check Swaps"}
                </h2>
                <p className="text-xl text-foreground/70">
                  {t("checkSendOffersMessage") || "Your swap offer has been created successfully! Check your sent offers in the header."}
                </p>
              </motion.div>

              {/* Arrow pointing to header */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute top-20 flex flex-col items-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                >
                  <ArrowUp className="h-12 w-12 text-primary" />
                </motion.div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-4 mt-8"
              >
                <Button
                  onClick={() => {
                    setShowSwapHint(false)
                    router.push("/offers")
                  }}
                  className="bg-primary hover:bg-primary/80 text-white px-8 py-6 text-lg"
                >
                  {t("ViewSwaps") || "View Send Swaps"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setShowSwapHint(false); router.refresh() }}
                  className="px-8 py-6 text-lg"
                >
                  {t("close") || "Close"}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SwapHintPopup
