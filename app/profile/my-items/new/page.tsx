"use client"

import { ItemAdd } from "@/components/prods-modification/item-add-new"
import { useTranslations } from "@/lib/use-translations"

export default function NewItemPage() {
  const { t } = useTranslations()
  
  return (
    <div className="min-h-screen bg-background dark:bg-gray-950">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text mb-4">
              {t('ListNewItem') || "List a New Item"}
            </h1>
            <p className="text-lg text-foreground/70 leading-relaxed">
              {t('Createadetailedlistingtofindtheperfectswapforyouritem') || "Create a detailed listing to find the perfect swap for your item."}
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ItemAdd />
      </div>
    </div>
  )
}
