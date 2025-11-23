"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "@/lib/use-translations"
import { getCookie } from "@/callAPI/utiles"
import { getProducts } from "@/callAPI/products"
import { getAllUsers } from "@/callAPI/users"
import { getAllCategories } from "@/callAPI/static"
import HeroSection from "@/components/home/hero-section"
import LoadingSpinner from "@/components/loading/loading-spinner"
import LazyStatsSection from "@/components/home/lazy-stats-section"
import LazyCategoriesSection from "@/components/home/lazy-categories-section"
import LazyRecentProducts from "@/components/home/lazy-recent-products"
import LazyTopDeals from "@/components/home/lazy-top-deals"
import LazyAutomativeProducts from "@/components/home/lazy-automative-products"
import LazyElectronicsProducts from "@/components/home/lazy-electronics-products"
import HowItWorks from "@/components/home/how-it-works"

export default function Home() {
  const { t } = useTranslations()
  const [showSwitchHeart, setShowSwitchHeart] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [itemsCount, setItemsCount] = useState(0)
  const [usersCount, setUsersCount] = useState(0)
  const [categories, setCategories] = useState([])
  const [categoriesNames, setCategoriesNames] = useState([])

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const [itemsResponse, usersResponse, categoriesResponse] = await Promise.all([
          getProducts(),
          getAllUsers(),
          getAllCategories()
        ])

        setItemsCount(itemsResponse.count || 0)
        setUsersCount(usersResponse.count || 0)

        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data || [])
          setCategoriesNames(categoriesResponse.names || [])
        }

        const token = await getCookie()
        setShowSwitchHeart(!!token)
      } finally {
        setIsInitialLoading(false)
      }
    }

    initializeApp()
  }, [])

  // Show full‑page branded loader while initializing
  if (isInitialLoading) {
    return <LoadingSpinner branded fullPage={true} size="md" />
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-white dark:bg-gray-950">
      {/* Modern gradient shapes positioned throughout the page - Swibba Green Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Top left gradient blob - Primary Green */}
        <div className="absolute -top-40 -left-40 w-48 h-48 md:w-96 md:h-96 bg-gradient-to-br from-emerald-400/25 to-green-400/20 dark:from-emerald-600/20 dark:to-green-600/15 rounded-full blur-3xl animate-blob" />
        
        {/* Top right gradient blob - Teal accent */}
        <div className="absolute top-20 right-10 w-60 h-40 md:w-80 md:h-80 bg-gradient-to-br from-teal-400/20 to-cyan-400/15 dark:from-teal-600/15 dark:to-cyan-600/12 rounded-full blur-3xl animate-blob animation-delay-2000" />
        
        {/* Middle left gradient blob - Deep Green */}
        <div className="absolute top-1/3 -left-20 w-[350px] h-[250px] md:w-[500px] md:h-[500px] bg-gradient-to-br from-green-500/20 to-emerald-500/18 dark:from-green-600/15 dark:to-emerald-600/13 rounded-full blur-3xl animate-blob animation-delay-4000" />
        
        {/* Middle right gradient blob - Light Green */}
        <div className="absolute top-1/2 right-0 w-[325px] h-[225px] md:w-[450px] md:h-[450px] bg-gradient-to-br from-lime-400/18 to-green-400/15 dark:from-lime-600/13 dark:to-green-600/12 rounded-full blur-3xl animate-blob animation-delay-3000" />
        
        {/* Bottom left gradient blob - Forest Green */}
        <div className="absolute bottom-40 left-20 w-[310px] h-[210px] md:w-[420px] md:h-[420px] bg-gradient-to-br from-emerald-500/22 to-teal-500/18 dark:from-emerald-600/17 dark:to-teal-600/14 rounded-full blur-3xl animate-blob animation-delay-1000" />
        
        {/* Bottom right gradient blob - Mint Green */}
        <div className="absolute -bottom-20 -right-20 w-[375px] h-[275px] md:w-[550px] md:h-[550px] bg-gradient-to-br from-green-400/20 to-emerald-400/18 dark:from-green-600/15 dark:to-emerald-600/13 rounded-full blur-3xl animate-blob animation-delay-5000" />
        
        {/* Center accent blob - Subtle Green */}
        <div className="absolute top-2/3 left-1/2 -translate-x-1/2 w-48 h-48 md:w-96 md:h-96 bg-gradient-to-br from-teal-300/15 to-emerald-300/12 dark:from-teal-700/10 dark:to-emerald-700/8 rounded-full blur-3xl animate-blob animation-delay-6000" />
      </div>

      {/* Content with proper stacking */}
      <div className="relative z-20">
        <HeroSection />
        <HowItWorks />
        <LazyCategoriesSection t={t} categories={categories} categoriesNames={categoriesNames} />
        <LazyRecentProducts showSwitchHeart={showSwitchHeart} t={t} />
        <LazyTopDeals showSwitchHeart={showSwitchHeart} t={t} />
        <LazyAutomativeProducts showSwitchHeart={showSwitchHeart} t={t} />
        <LazyElectronicsProducts showSwitchHeart={showSwitchHeart} t={t} />
              <LazyStatsSection t={t} itemsCount={itemsCount} usersCount={usersCount} />

      </div>
    </main>
  )
}