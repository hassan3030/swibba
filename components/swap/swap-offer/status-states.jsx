"use client"
import { motion } from "framer-motion"
import { ShieldCheck, CheckCircle, XCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { scaleIn } from "./animation-variants"

export function CompletedState({ 
  onReviewClick, 
  onChatClick, 
  otherUser, 
  handleCopyPhone, 
  phoneCopied, 
  t 
}) {
  return (
    <motion.div variants={scaleIn}>
      <Card className="mb-6 overflow-hidden border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/10">
        <div className="bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 p-8 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
           
            </div>
          </motion.div>
          
          <motion.h3 
            className="text-2xl sm:text-3xl font-bold  bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {t("SwapCompletedSuccessfully") || "Swap Completed!"}
          </motion.h3>
          
          <motion.p 
            className="text-muted-foreground max-w-md mx-auto pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t("Thankyouforcompletingtheswap") || "Thank you for completing the swap. Don't forget to rate your experience!"}
          </motion.p>
        </div>
      </Card>
    </motion.div>
  )
}

export function RejectedState({ t }) {
  return (
    <motion.div variants={scaleIn}>
      <Card className="mb-6 overflow-hidden border-2 border-red-500/30 shadow-xl shadow-red-500/10">
        <div className="bg-gradient-to-br from-red-500/10 via-rose-500/5 to-pink-500/10 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-2xl shadow-red-500/40">
              <XCircle className="h-12 w-12 text-white" />
            </div>
          </motion.div>
          
          <h3 className="text-2xl font-bold mb-3 text-red-600 dark:text-red-400">
            {t("SwapRejected") || "Swap Rejected"}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t("Theswapwasrejectedbyyou") || "This swap was rejected and is no longer active."}
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

export default { CompletedState, RejectedState }
