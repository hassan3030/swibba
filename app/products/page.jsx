"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getProducts } from "@/callAPI/products"
import { getCookie } from "@/callAPI/utiles"
import { ItemsList } from "@/components/items-list"
import { HeaderComp } from "./HeaderComp"

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

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
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
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [showSwitchHeart, setShowSwitchHeart] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const productsData = await getProducts()
      setProducts(productsData.data)

      const token = await getCookie()
      if (token) setShowSwitchHeart(true)
      setIsLoading(false)
    }
    fetchData()
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
          <p className="text-muted-foreground">Loading products...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div className="mt-1 mx-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <HeaderComp />
      </motion.div>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <ItemsList items={products} showbtn={true} showSwitchHeart={showSwitchHeart} />
      </motion.div>
    </motion.div>
  )
}
