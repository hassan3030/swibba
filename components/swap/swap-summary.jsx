"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeftRight, Verified } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslations } from "@/lib/use-translations"
import { useRTL } from "@/hooks/use-rtl"
import { mediaURL } from "@/callAPI/utiles"

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

const swapSummaryVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
}

const SwapSummary = ({
  makeSwapRef,
  selectedMyItems,
  selectedOtherItems,
  mySelectedValue,
  otherSelectedValue,
  priceDifference,
  userData,
  otherUserData,
  handleAddOffer,
  disabledOffer,
}) => {
  const { t } = useTranslations()
  const { isRTL, getDirectionClass } = useRTL()

  const canCreateSwap = selectedMyItems.length > 0 && selectedOtherItems.length > 0

  return (
    <AnimatePresence>
      {canCreateSwap && (
        <motion.div
          ref={makeSwapRef}
          variants={swapSummaryVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="mb-4 mt-6"
        >
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <motion.div
                className="flex flex-row rtl:flex-row-reverse items-center justify-between gap-6 mb-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Your Items */}
                <motion.div className="text-center flex-1" variants={itemVariants} whileHover={{ scale: 1.05 }}>
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Avatar className="h-full w-full border">
                      <AvatarImage
                        src={
                          userData?.avatar
                            ? `${mediaURL}${userData.avatar}`
                            : "/placeholder.svg"
                        }
                        alt={userData?.first_name || t("User") || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {userData?.first_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {(userData?.verified === "true" || userData?.verified === true) && (
                      <div className={`absolute -top-1 z-10 ${isRTL ? '-left-1' : '-right-1'}`}>
                        <Verified className="h-4 w-4 text-primary bg-background rounded-full p-0.5 border border-background" />
                      </div>
                    )}
                  </div>
                  <motion.div
                    className="text-3xl font-bold text-primary mb-1"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  >
                    {selectedMyItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                  </motion.div>
                  <div className="text-sm text-foreground/70 mb-2">{t("yourItems") || "Your Items"}</div>
                  <div className="text-xl font-semibold text-secondary2">{Number(mySelectedValue).toLocaleString()} {t("LE")}</div>
                </motion.div>

                {/* Swap Icon */}
                <motion.div
                  className="flex items-center justify-center flex-shrink-0"
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                    <ArrowLeftRight className={`h-8 w-8 text-white ${isRTL ? 'rotate-180' : ''}`} />
                  </div>
                </motion.div>

                {/* Their Items */}
                <motion.div className="text-center flex-1" variants={itemVariants} whileHover={{ scale: 1.05 }}>
                  <div className="relative w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Avatar className="h-full w-full border">
                      <AvatarImage
                        src={
                          otherUserData?.avatar
                            ? `${mediaURL}${otherUserData.avatar}`
                            : "/placeholder.svg"
                        }
                        alt={otherUserData?.first_name || t("User") || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {otherUserData?.first_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {(otherUserData?.verified === "true" || otherUserData?.verified === true) && (
                      <div className={`absolute -top-1 z-10 ${isRTL ? '-left-1' : '-right-1'}`}>
                        <Verified className="h-4 w-4 text-accent bg-background rounded-full p-0.5 border border-background" />
                      </div>
                    )}
                  </div>
                  <motion.div
                    className="text-3xl font-bold text-accent mb-1"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                  >
                    {selectedOtherItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                  </motion.div>
                  <div className="text-sm text-foreground/70 mb-2">{t("Theiritems") || "Their Items"}</div>
                  <div className="text-xl font-semibold text-secondary2">{Number(otherSelectedValue).toLocaleString()} {t("LE")}</div>
                </motion.div>
              </motion.div>

              {/* Price Difference */}
              <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  className={`text-2xl font-bold p-4 rounded-lg ${
                    priceDifference > 0
                      ? "bg-secondary2/10 text-secondary2 border border-secondary2/20"
                      : priceDifference < 0
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-card text-foreground/70 border border-border"
                  }`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <div className="text-sm text-foreground/70 mb-2">{t("PriceDifference") || "Price Difference"}</div>
                  {priceDifference > 0 ? "+" : ""}
                  {priceDifference !== 0 && Number(priceDifference).toLocaleString()}
                  {priceDifference !== 0 && t("le")}
                  {priceDifference > 0 && <span className={`text-sm ${getDirectionClass("ml-2", "mr-2")}`}>({t("Yougain") || "You gain"})</span>}
                  {priceDifference < 0 && <span className={`text-sm ${getDirectionClass("ml-2", "mr-2")}`}>({t("Youpayextra") || "You pay extra"})</span>}
                  {priceDifference === 0 && <span className={`text-sm ${getDirectionClass("ml-2", "mr-2")}`}>({t("Equalvalue") || "Equal value"})</span>}
                </motion.div>
              </motion.div>

              {/* Make Swap Button */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    size="lg"
                    className="px-12 py-6 text-lg bg-primary hover:from-secondary hover:bg-primary/80 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handleAddOffer}
                    disabled={disabledOffer}
                  >
                    {disabledOffer ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full ${getDirectionClass("mr-3", "ml-3")}`}
                        />
                        {t("CreatingSwap") || "Creating Swap..."}
                      </>
                    ) : (
                      <>
                        <ArrowLeftRight className={`h-5 w-5 ${getDirectionClass("mr-3", "ml-3")}`} />
                        {t("swapMaker") || "Make Swap"}
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SwapSummary
