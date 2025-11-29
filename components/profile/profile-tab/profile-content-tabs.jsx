"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Package, Star, Settings, ArrowRightLeft } from "lucide-react"
import { TbShoppingCartUp } from "react-icons/tb"
import { BiCartDownload } from "react-icons/bi"
import Link from "next/link"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { ProductsList } from "@/components/products/productsPage"
import { SwapsTable } from "@/components/profile/profile-tab/swaps-table"
import { 
  AvailableItemsEmptyState, 
  ItemsInOffersEmptyState 
} from "@/components/general/modern-empty-state"

const tabVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
}

const badgeVariants = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: {
    type: "spring",
    stiffness: 500,
    damping: 30
  }
}

export function ProfileContentTabs({ 
  activeTab, 
  setActiveTab, 
  myAvailableItems, 
  myUnavailableItems, 
  sentOffersCount, 
  recievedOffers,
  showSwitchHeart,
  // New props for swaps table
  sentOffers = [],
  receivedOffers = [],
  sentSwapItems = [],
  receivedSwapItems = [],
  sentUserSwaps = [],
  receivedUserSwaps = [],
  isLoadingSwaps = false
}) {
  const { t } = useTranslations()
  const { isRTL } = useLanguage()
  const hasAvailableItems = Array.isArray(myAvailableItems) && myAvailableItems.length > 0

  const tabs = [
    { 
      value: "items", 
      icon: Package, 
      label: t("yourProducts") || "Your Products", 
      count: Array.isArray(myAvailableItems) ? myAvailableItems.length : 0,
      countIcon: Package
    },
    {
      value: "unavailableItems",
      icon: Star,
      label: t("itemsInOffers") || "Items In Offers",
      count: Array.isArray(myUnavailableItems) ? myUnavailableItems.length : 0,
      countIcon: Star
    }, 
    { 
      value: "swaps", 
      icon: ArrowRightLeft, 
      label: t("swaps") || "Swaps", 
      count: (sentOffersCount || 0) + (recievedOffers || 0),
      sentCount: sentOffersCount || 0,
      receivedCount: recievedOffers || 0,
      sentIcon: TbShoppingCartUp,
      receivedIcon: BiCartDownload
    }
  ]

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Modern Tabs Navigation */}
      <div className="mb-8 sm:mb-10">
        <div className="relative">
          {/* Desktop/Tablet Tabs */}
          <div className="hidden sm:block">
            <div className="inline-flex w-full items-center justify-start gap-2 p-1.5 bg-muted/30 rounded-2xl border border-border/50 backdrop-blur-sm">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.value
                return (
                  <motion.button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`
                      relative flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium text-sm
                      transition-all duration-300 flex-1
                      ${isActive 
                        ? 'bg-card text-foreground shadow-lg shadow-primary/10 border border-border/60' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }
                    `}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                    <span className="truncate flex-1 text-left">{tab.label}</span>
                    {tab.value === "swaps" ? (
                      <div className="flex items-center gap-1.5">
                        <motion.span
                          className={`
                            rounded-full px-2 py-0.5 text-xs font-bold min-w-[28px] text-center flex items-center gap-1
                            ${isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted/80 text-foreground border border-border/30'
                            }
                          `}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 * index }}
                        >
                          <TbShoppingCartUp className="h-3 w-3" />
                          {tab.sentCount}
                        </motion.span>
                        <span className="text-xs text-muted-foreground">|</span>
                        <motion.span
                          className={`
                            rounded-full px-2 py-0.5 text-xs font-bold min-w-[28px] text-center flex items-center gap-1
                            ${isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted/80 text-foreground border border-border/30'
                            }
                          `}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 * index + 0.05 }}
                        >
                          <BiCartDownload className="h-3 w-3" />
                          {tab.receivedCount}
                        </motion.span>
                      </div>
                    ) : (
                      <motion.span
                        className={`
                          rounded-full px-2.5 py-0.5 text-xs font-bold min-w-[28px] text-center flex items-center gap-1
                          ${isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted/80 text-foreground border border-border/30'
                          }
                        `}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 * index }}
                      >
                        {tab.countIcon && <tab.countIcon className="h-3 w-3" />}
                        {tab.count}
                      </motion.span>
                    )}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent"
                        layoutId="activeTab"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Mobile Tabs - Same style as desktop but smaller */}
          <div className="sm:hidden">
            <div className="flex flex-col gap-2 p-1.5 bg-muted/30 rounded-2xl border border-border/50 backdrop-blur-sm">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.value
                return (
                  <motion.button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`
                      relative flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium text-xs
                      transition-all duration-300 w-full
                      ${isActive 
                        ? 'bg-card text-foreground shadow-lg shadow-primary/10 border border-border/60' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }
                    `}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                    <span className="truncate flex-1 text-left text-xs">{tab.label}</span>
                    {tab.value === "swaps" ? (
                      <div className="flex items-center gap-1">
                        <motion.span
                          className={`
                            rounded-full px-1.5 py-0.5 text-[10px] font-bold min-w-[22px] text-center flex items-center gap-0.5
                            ${isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted/80 text-foreground border border-border/30'
                            }
                          `}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                          <TbShoppingCartUp className="h-2.5 w-2.5" />
                          {tab.sentCount}
                        </motion.span>
                        <span className="text-[8px] text-muted-foreground">|</span>
                        <motion.span
                          className={`
                            rounded-full px-1.5 py-0.5 text-[10px] font-bold min-w-[22px] text-center flex items-center gap-0.5
                            ${isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted/80 text-foreground border border-border/30'
                            }
                          `}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.05 }}
                        >
                          <BiCartDownload className="h-2.5 w-2.5" />
                          {tab.receivedCount}
                        </motion.span>
                      </div>
                    ) : (
                      <motion.span
                        className={`
                          rounded-full px-1.5 py-0.5 text-[10px] font-bold min-w-[22px] text-center flex items-center gap-0.5
                          ${isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted/80 text-foreground border border-border/30'
                          }
                        `}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        {tab.countIcon && <tab.countIcon className="h-2.5 w-2.5" />}
                        {tab.count}
                      </motion.span>
                    )}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent"
                        layoutId="activeMobileTab"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        <TabsContent value="items" className="mt-0">
          <motion.div
            key="items"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <h2 className={`text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent ${isRTL ? 'text-right w-full sm:w-auto' : ''}`}>
                {t("myItems") || "My Items"}
              </h2>
              {hasAvailableItems && (
                <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg w-full sm:w-auto">
                  <Link href="/profile/my-items">
                    <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t("manageItems") || "Manage Items"}
                  </Link>
                </Button>
              )}
            </div>

            {hasAvailableItems ? (
              <ProductsList
                items={myAvailableItems}
                showFilters={false}
                showbtn={false}
                showSwitchHeart={showSwitchHeart}
              />
            ) : (
              <AvailableItemsEmptyState />
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="swaps" className="mt-0">
          <motion.div
            key="swaps"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <SwapsTable 
              sentOffers={sentOffers}
              receivedOffers={receivedOffers}
              sentSwapItems={sentSwapItems}
              receivedSwapItems={receivedSwapItems}
              sentUserSwaps={sentUserSwaps}
              receivedUserSwaps={receivedUserSwaps}
              isLoading={isLoadingSwaps}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="unavailableItems" className="mt-0">
          <motion.div
            key="unavailableItems"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <h2 className="mb-6 text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t("itemsInOffers") || "Items In Offers"}
            </h2>
            {Array.isArray(myUnavailableItems) && myUnavailableItems.length > 0 ? (
              <ProductsList 
                items={myUnavailableItems} 
                showFilters={false} 
                showSwitchHeart={false} 
                showbtn={false} 
                LinkItemOffer={true} 
              />
            ) : (
              <ItemsInOffersEmptyState />
            )}
          </motion.div>
        </TabsContent>
      </AnimatePresence>
    </Tabs>
  )
}
