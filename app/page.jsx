"use client"

import { useEffect, useState } from "react"
import  FloatingActionButton  from "@/components/general/floating-action-button"
import { useTranslations } from "@/lib/use-translations"
import { getCookie } from "@/callAPI/utiles"
import HeroSection from "@/components/home/hero-section"
import LoadingSpinner from "@/components/loading/loading-spinner"
import LazyStatsSection from "@/components/home/lazy-stats-section"
import LazyCategoriesSection from "@/components/home/lazy-categories-section"
import LazyRecentProducts from "@/components/home/lazy-recent-products"
import LazyTopDeals from "@/components/home/lazy-top-deals"
import LazyAutomativeProducts from "@/components/home/lazy-automative-products"
import LazyElectronicsProducts from "@/components/home/lazy-electronics-products"


export default function Home() {
  const { t } = useTranslations()
  const [showSwitchHeart, setShowSwitchHeart] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const getWishList = async () => {
    const token = await getCookie()
    if (token) {
      setShowSwitchHeart(true)
    }
  }

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await getWishList()
      } catch (error) {
        // console.error("Error initializing app:", error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    initializeApp()
  }, [])

  return (
    <>
      {isInitialLoading && <LoadingSpinner branded fullPage={true} size="md" />}
      {showSwitchHeart && <FloatingActionButton/>}

      <main className="min-h-screen dark:bg-[#121212] relative overflow-hidden">
        {/* Hero Section */}
        <HeroSection/>

        {/* Lazy-loaded Stats Section */}
        <LazyStatsSection t={t} />

        {/* Lazy-loaded Categories Section */}
        <LazyCategoriesSection t={t} />

        {/* Lazy-loaded Products Section */}
        <LazyRecentProducts showSwitchHeart={showSwitchHeart} t={t} />

        {/* Lazy-loaded Top Deals Section */}
        <LazyTopDeals showSwitchHeart={showSwitchHeart} t={t} />

        {/* Lazy-loaded Lazy Automative Products Section */}
        <LazyAutomativeProducts showSwitchHeart={showSwitchHeart} t={t} />

        {/* Lazy-loaded Lazy Electronics Products Section */}
        <LazyElectronicsProducts showSwitchHeart={showSwitchHeart} t={t} />

      </main>
    </>
  )
}