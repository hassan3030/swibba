"use client"

import { useEffect, useState } from "react"
// import  FloatingActionButton  from "@/components/general/floating-action-button"
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


export default function Home() {
  const { t } = useTranslations()
  const [showSwitchHeart, setShowSwitchHeart] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [itemsCount, setItemsCount] = useState(0)
  const [usersCount, setUsersCount] = useState(0)
  const [categories, setCategories] = useState([])
  const [categoriesNames, setCategoriesNames] = useState([])

  // Single API call to get all data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get all data in parallel
        const [itemsResponse, usersResponse, categoriesResponse] = await Promise.all([
          getProducts(),
          getAllUsers(),
          getAllCategories()
        ])

        // Set counts
        setItemsCount(itemsResponse.count || 0)
        setUsersCount(usersResponse.count || 0)

        // Set categories data
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data || [])
          setCategoriesNames(categoriesResponse.names || [])
        }

        // Check authentication
        const token = await getCookie()
        if (token) {
          setShowSwitchHeart(true)
        }
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
      {/* {showSwitchHeart && <FloatingActionButton/>} */}

      <main className="min-h-screen relative overflow-hidden bg-background dark:bg-gray-950">

        {/* Hero Section */}
        <HeroSection/>

        {/* Lazy-loaded Stats Section */}
        <LazyStatsSection t={t} itemsCount={itemsCount} usersCount={usersCount} />

        {/* Lazy-loaded Categories Section */}
        <LazyCategoriesSection t={t} categories={categories} categoriesNames={categoriesNames} />

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