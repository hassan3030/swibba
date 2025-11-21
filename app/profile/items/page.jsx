"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ModernItemCard from "./modern-item-card"
import ModernItemCardList from "./modern-item-card-list"
import { Plus, AlertCircle, Grid3x3, List } from "lucide-react"
import { getProductByUserId } from "@/callAPI/products"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { useRouter } from "next/navigation"

// Animation variants
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
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 100, damping: 5 },
  },
  tap: { scale: 0.95 },
}

const emptyStateVariants = {
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

export default function ManageItemsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const [activeTab, setActiveTab] = useState("active")
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid") // "grid" or "list"
  const { t } = useTranslations()
  const { isRTL } = useLanguage()
  const router = useRouter()

  const filteredItems = async () => {
    setIsLoading(true)
    const data = await getProductByUserId("all")
    setItems(data.data)
    setIsLoading(false)
    return data.data
  }

  useEffect(() => {
    filteredItems()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-primary/80">Loading items...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-background dark:bg-gray-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Modern Header Section */}
      <div className="border-b border-border/50">
        <div className="container py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`flex flex-col gap-4 ${isRTL ? 'sm:flex-row-reverse' : 'sm:flex-row'} items-start sm:items-center justify-between`}
          >
            <div className={isRTL ? 'text-right w-full sm:w-auto' : 'text-left w-full sm:w-auto'}>
              <motion.h1 
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold   mb-2 leading-tight ${isRTL ? 'force-rtl' : ''}`}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {t("myItems") || "My Items"}
              </motion.h1>
              <motion.p 
                className={`text-sm sm:text-base text-muted-foreground flex items-center ${isRTL ? 'flex-row-reverse force-rtl' : ''}`}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <span className="mx-2">{t("manageEditandupdate") || "Manage, edit, and update your listed items."}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {items.length}
                </span>
              </motion.p>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`flex gap-2 w-full sm:w-auto ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {/* View Toggle */}
              <div className="flex rounded-lg border border-border/50 bg-background/50 p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="px-3"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1 sm:flex-initial">
                <Button asChild size="lg" className="w-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90">
                  <Link href="/profile/settings/editItem/new" className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Plus className={isRTL ? 'ml-2' : 'mr-2'} />
                    {t("addNewItem") || "Add New Item"}
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container py-8">
        <motion.div className="grid grid-cols-1 gap-6" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={cardVariants}>
          <Card className="border-none shadow-none bg-transparent overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
              

                <TabsContent value="active" className="mt-6">
                  <AnimatePresence mode="popLayout">
                    {items.length === 0 ? (
                      <motion.div
                        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 sm:p-12 text-center"
                        variants={emptyStateVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
                          className="mb-6 p-4 sm:p-6 rounded-full bg-primary/10 border border-primary/20"
                        >
                          <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                        </motion.div>
                        <motion.h3 
                          className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {t("noItemsFound") || "No items found"}
                        </motion.h3>
                        <motion.p 
                          className="mt-2 text-sm sm:text-base text-muted-foreground max-w-md"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          {searchTerm || category !== "all" || status !== "all"
                            ? "Try adjusting your search or filters"
                            : "You don't have any active items. Start building your collection by adding your first item!"}
                        </motion.p>
                        <motion.div 
                          variants={buttonVariants} 
                          whileHover="hover" 
                          whileTap="tap"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Button asChild size="lg" className="mt-6 sm:mt-8 shadow-lg hover:shadow-xl transition-all duration-300">
                            <Link href="/profile/settings/editItem/new" className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <Plus className={isRTL ? 'ml-2' : 'mr-2'} />
                              {t("addNewItem") || "Add Your First Item"}
                            </Link>
                          </Button>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-5"}
                        variants={containerVariants} 
                        initial="hidden" 
                        animate="visible"
                      >
                        {items.map((item, index) => (
                          <motion.div
                            key={item.id}
                            variants={cardVariants}
                            layout
                            layoutId={`item-${item.id}`}
                            custom={index}
                            whileHover={{ y: -4 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            {viewMode === "grid" ? (
                              <ModernItemCard item={item} />
                            ) : (
                              <ModernItemCardList item={item} />
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>

                <TabsContent value="inactive" className="mt-6">
                  <motion.div
                    className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
                    variants={emptyStateVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <AlertCircle className="mb-2 h-8 w-8 text-foreground/70" />
                    <h3 className="text-lg font-medium">
                      {t("no") && t("activeItems")}
                      {"inactive items"}
                    </h3>
                    <p className="mt-1 text-sm text-foreground/70">{t() || "You don't have any inactive items."}</p>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
