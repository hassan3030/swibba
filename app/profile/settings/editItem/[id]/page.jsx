"use client"
import { motion } from "framer-motion"
import { ItemUpdateNew } from "@/components/prods-modification/item-update-new"
import { getProductById } from "@/callAPI/products"
import { useTranslations } from "@/lib/use-translations"
import { useState, useEffect } from "react"

export default function EditItemPage({ params }) {
  const [item, setItem] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useTranslations()

  useEffect(() => {
    const fetchItem = async () => {
      const { id } = await params
      const itemData = await getProductById(id)
      setItem(itemData.data)
      setIsLoading(false)
    }
    fetchItem()
  }, [params])

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
          <p className="text-foreground/70">{t("loading") || "Loading..."}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950">
      {/* Modern Hero Section - Same as Add Item */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text mb-4">
              {t("UpdateItem") || "Update Item"}
            </h1>
            <p className="text-lg text-foreground/70 leading-relaxed">
              {t("Updatedetailedlistingtofindtheperfectswapforyouritem") ||
                "Update your listing details to find the perfect swap for your item."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {item && <ItemUpdateNew {...item} />}
      </div>
    </div>
  )
}
