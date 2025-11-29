"use client"
import { motion } from "framer-motion"
import { Handshake, Trash2, ShieldCheck, Clock, Loader2, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fadeInUp } from "./animation-variants"
import { useLanguage } from "@/lib/language-provider"

export function ActionButtons({ 
  offer, 
  isReceived, 
  handleAcceptSwap, 
  handleRejectSwap,
  handleCompleteSwap, 
  handleDeleteFinally,
  setShowRejectDialog,
  setShowCompleteDialog,
  t 
}) {
  const { isRTL } = useLanguage()

  return (
    <motion.div variants={fadeInUp}>
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-6">
          {/* Received Pending */}
          {isReceived && offer.status_offer === "pending" && (
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <div className="flex-1 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Eye className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm text-primary dark:text-primary">
                    {t("ReviewOfferAndDecide") || "Review the offer and make your decision"}
                  </p>
                </div>
              </div>
              <div className={`flex flex-col sm:flex-row gap-3 shrink-0 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                <Button
                  size="lg"
                  onClick={handleAcceptSwap}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 hover:shadow-emerald-500/40 shadow-lg shadow-emerald-500/25 rounded-xl h-12 transition-all"
                >
                  <Handshake className="h-5 w-5" />
                  {t("AcceptSwap") || "Accept Swap"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowRejectDialog(true)}
                  className="flex items-center justify-center gap-2 border-red-500/30 text-red-600 hover:bg-red-500/20 hover:border-red-500/50 rounded-xl h-12 transition-all"
                >
                  <Trash2 className="h-5 w-5" />
                  {t("RejectSwap") || "Reject Swap"}
                </Button>
              </div>
            </div>
          )}

          {/* Received Accepted */}
          {isReceived && offer.status_offer === "accepted" && (
            <div className="p-5 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-2xl">
              <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-6 w-6 text-amber-500" />
                  </motion.div>
                </div>
                <div >
                  <p className="font-semibold text-amber-700 dark:text-amber-300">
                    {t("WaitingForCompletion") || "Waiting for completion"}
                  </p>
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                    {t("YouarewaitingtocompletswapfromanotherUser") || "The other user needs to complete the swap"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sent Pending */}
          {!isReceived && offer.status_offer === "pending" && (
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <div className="flex-1 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {t("WaitingForResponse") || "Waiting for response from the other user"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowRejectDialog(true)}
                className="flex items-center gap-2 border-red-500/30 text-red-600 hover:bg-red-500/20 hover:border-red-500/50 rounded-xl shrink-0 transition-all"
              >
                <Trash2 className="h-5 w-5" />
                {t("cancelSwap") || "Cancel Swap"}
              </Button>
            </div>
          )}

          {/* Sent Accepted */}
          {!isReceived && offer.status_offer === "accepted" && (
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <div className="flex-1 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    {t("ReadyToComplete") || "The swap has been accepted. Ready to complete?"}
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => setShowCompleteDialog(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 hover:shadow-emerald-500/40 shadow-lg shadow-emerald-500/25 rounded-xl h-12 shrink-0 transition-all"
              >
                <ShieldCheck className="h-5 w-5" />
                {t("CompleteSwap") || "Complete Swap"}
              </Button>
            </div>
          )}

          {/* Completed/Rejected - Delete Option */}
          {(offer.status_offer === "completed" || offer.status_offer === "rejected") && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={handleDeleteFinally}
                className="flex items-center gap-2 border-red-500/30 text-red-600 hover:text-red-600 hover:bg-red-500/10 hover:border-red-500/50 rounded-xl"
              >
                <Trash2 className="h-5 w-5" />
                {t("DeleteFromHistory") || "Delete from History"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ActionButtons
