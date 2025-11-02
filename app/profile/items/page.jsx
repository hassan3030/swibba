"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ItemCard from "./item-card"
import { Plus, AlertCircle } from "lucide-react"
import { getProductByUserId } from "@/callAPI/products"
import { useTranslations } from "@/lib/use-translations"
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
  const { t } = useTranslations()
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
      className="container py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
     

      <motion.div className="grid grid-cols-1 gap-8 mt-2" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={cardVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <CardTitle className="text-secondary">{t("myItems") || "Your Items"}</CardTitle>
                  <CardDescription>
                    {t("manageEditandupdate") || "Manage, edit, and update your listed items."}
                  </CardDescription>
                </div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button asChild>
                    <Link href="/profile/settings/editItem/new">
                      <Plus className="mr-2 h-4 w-4" />
                      {t("addNewItem") || "Add Item"}
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
              

                <TabsContent value="active" className="mt-6">
                  <AnimatePresence mode="popLayout">
                    {items.length === 0 ? (
                      <motion.div
                        className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
                        variants={emptyStateVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                        >
                          <AlertCircle className="mb-2 h-8 w-8 text-foreground/70" />
                        </motion.div>
                        <h3 className="text-lg font-medium">{t("noItemsFound") || "No items found"}</h3>
                        <p className="mt-1 text-sm text-foreground/70">
                          {searchTerm || category !== "all" || status !== "all"
                            ? "Try adjusting your search or filters"
                            : "You don't have any active items. Add a new item to get started!"}
                        </p>
                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                          <Button asChild className="mt-4">
                            <Link href="/profile/settings/editItem/new">
                              <Plus className="mr-2 h-4 w-4" />
                              {t("addNewItem") || "Add Item"}
                            </Link>
                          </Button>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div className="space-y-4 " variants={containerVariants} initial="hidden" animate="visible">
                        {items.map((item, index) => (
                          <motion.div
                            key={item.id}
                            variants={cardVariants}
                            layout
                            layoutId={`item-${item.id}`}
                            custom={index}
                          >
                            <ItemCard item={item} />
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
    </motion.div>
  )
}
