"use client"
import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { getProducts } from "@/callAPI/products"
import { getCookie } from "@/callAPI/utiles"
import { ItemsList } from "@/components/products/items-list"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [showSwitchHeart, setShowSwitchHeart] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    
    async function fetchData() {
      try {
        setIsLoading(true)
        // Fetch ALL products - don't pass limit to get all available items
        const productsData = await getProducts()
        
        if (productsData.success) {
          setProducts(productsData.data)
          setTotalCount(productsData.total || productsData.data?.length || 0)
        }

        const token = await getCookie()
        if (token) setShowSwitchHeart(true)
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching products:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
    
    return () => controller.abort()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen py-4 bg-background dark:bg-gray-950 flex items-center justify-center">
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
          <p className="text-primary/90">Loading products...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div className="p-4 bg-background dark:bg-gray-950" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        {/* <HeaderComp /> */}
      </motion.div>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" >
        <ItemsList 
          items={products} 
          showbtn={true} 
          showSwitchHeart={showSwitchHeart} 
          totalCount={totalCount}
          skipFetch={true}
        />
      </motion.div>
    </motion.div>
  )
}
