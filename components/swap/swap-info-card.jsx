"use client"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"
import { useRTL } from "@/hooks/use-rtl"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
}

const SwapInfoCard = ({ hintSwapRules }) => {
  const { t } = useTranslations()
  const { isRTL } = useRTL()

  return (
    <motion.div variants={cardVariants}>
      <Card className="mb-8 shadow-lg border border-border/50">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="flex-shrink-0"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center border border-accent/20">
                <Info className="h-6 w-6 text-accent" />
              </div>
            </motion.div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-accent mb-3 text-start capitalize">
                {isRTL 
                  ? hintSwapRules[0]?.translations?.[0]?.title 
                  : hintSwapRules[0]?.translations?.[1]?.title}
              </h3>
              <motion.ul
                className="space-y-2 text-sm text-foreground/80"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {(() => {
                  const currentTranslation = isRTL
                    ? hintSwapRules[0]?.translations?.find(t => t.languages_code === 'ar-SA')
                    : hintSwapRules[0]?.translations?.find(t => t.languages_code === 'en-US')
                  
                  return currentTranslation?.hints_steps?.map((step, index) => (
                    <motion.li key={index} variants={itemVariants} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                      {step}
                    </motion.li>
                  ))
                })()}
              </motion.ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default SwapInfoCard
