"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Package, Star, Settings, ArrowRightLeft } from "lucide-react"
import { TbShoppingCartUp } from "react-icons/tb"
import { BiCartDownload } from "react-icons/bi"
import Link from "next/link"
import { useTranslations } from "@/lib/use-translations"
import { ProductsList } from "@/components/products/productsPage"
import OffersPage from "@/app/offers/page"

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
  showSwitchHeart
}) {
  const { t } = useTranslations()

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

          {/* Mobile Tabs */}
          <div className="sm:hidden">
            <div className="grid grid-cols-2 gap-3">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.value
                return (
                  <TooltipProvider key={tab.value}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          onClick={() => setActiveTab(tab.value)}
                          className={`
                            relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl
                            transition-all duration-300 border
                            ${isActive 
                              ? 'bg-card text-foreground shadow-lg border-primary/40 shadow-primary/10' 
                              : 'bg-card/50 text-muted-foreground border-border/30 hover:border-border/60 hover:bg-card/80'
                            }
                          `}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.05 * index }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className={`
                            p-2.5 rounded-xl transition-colors
                            ${isActive ? 'bg-primary/10' : 'bg-muted/50'}
                          `}>
                            <tab.icon className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          {tab.value === "swaps" ? (
                            <div className="absolute -top-2 -right-2 flex items-center gap-0.5">
                              <motion.span
                                className={`
                                  rounded-full px-1 py-0.5 text-[10px] font-bold min-w-[20px] text-center shadow-md flex items-center gap-0.5
                                  ${isActive 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted/90 text-foreground border border-border/40'
                                  }
                                `}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 * index }}
                              >
                                <TbShoppingCartUp className="h-2.5 w-2.5" />
                                {tab.sentCount}
                              </motion.span>
                              <span className="text-[8px] text-muted-foreground">|</span>
                              <motion.span
                                className={`
                                  rounded-full px-1 py-0.5 text-[10px] font-bold min-w-[20px] text-center shadow-md flex items-center gap-0.5
                                  ${isActive 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted/90 text-foreground border border-border/40'
                                  }
                                `}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 * index + 0.05 }}
                              >
                                <BiCartDownload className="h-2.5 w-2.5" />
                                {tab.receivedCount}
                              </motion.span>
                            </div>
                          ) : (
                            <motion.span
                              className={`
                                absolute -top-2 -right-2 rounded-full px-1.5 py-0.5 text-xs font-bold min-w-[24px] text-center shadow-md flex items-center gap-0.5
                                ${isActive 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted/90 text-foreground border border-border/40'
                                }
                              `}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 * index }}
                            >
                              {tab.countIcon && <tab.countIcon className="h-2.5 w-2.5" />}
                              {tab.count}
                            </motion.span>
                          )}
                          {isActive && (
                            <motion.div
                              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"
                              layoutId="activeMobileTab"
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-popover text-popover-foreground text-sm z-50 shadow-lg border">
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold">{tab.label}</p>
                          <p className="text-muted-foreground text-xs">{tab.count} {tab.count === 1 ? 'item' : 'items'}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t("myItems") || "My Items"}
              </h2>
              <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg w-full sm:w-auto">
                <Link href="/profile/items">
                  <Settings className="mr-2 h-4 w-4" />
                  {t("manageItems") || "Manage Items"}
                </Link>
              </Button>
            </div>

            {Array.isArray(myAvailableItems) && myAvailableItems.length > 0 ? (
              <ProductsList
                items={myAvailableItems}
                showFilters={false}
                showbtn={false}
                showSwitchHeart={showSwitchHeart}
              />
            ) : (
              <Card className="shadow-lg border-border/50">
                <CardContent className="p-8 sm:p-12 lg:p-16 text-center">
                  <div className="max-w-md mx-auto space-y-4 sm:space-y-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
                      <Package className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold">{t("noItemsFound") || "No Items Yet"}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {t("noItemsDescription") || "You haven't added any items yet. Start by adding your first item."}
                    </p>
                    <Button asChild className="mt-6" size="lg">
                      <Link href="/profile/settings/editItem/new">{t("addNewItem") || "Add Item"}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
            <OffersPage />
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
            <Card className="shadow-lg border-border/50">
              <CardContent className="p-6">
                {Array.isArray(myUnavailableItems) && myUnavailableItems.length > 0 ? (
                  <ProductsList 
                    items={myUnavailableItems} 
                    showFilters={false} 
                    showSwitchHeart={false} 
                    showbtn={false} 
                    LinkItemOffer={true} 
                  />
                ) : (
                  <div className="p-8 sm:p-12 lg:p-16 text-center">
                    <div className="max-w-md mx-auto space-y-4 sm:space-y-5">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
                        <Star className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold">{t("noItemsInOffers") || "No Items In Offers"}</h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {t("youHaveNotItem") || "You don't have any items currently in offers."}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </AnimatePresence>
    </Tabs>
  )
}
