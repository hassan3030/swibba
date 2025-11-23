"use client"
import { motion } from "framer-motion"
import {  getProducts } from "@/callAPI/products"
import { ProductsList } from "@/components/products/productsPage"
import { useState, useEffect } from "react"

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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

const FilterItemsPage = ({ params }) => {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      
      // Get the search term from URL params
      const { name } = await params
      const searchTerm = decodeURIComponent(name || "").trim()
      // console.log("searchTerm", searchTerm)
      
      // If no search term, get all products
      if (!searchTerm) {
        const additionalParams = {
          limit: 3,
          sort: "-date_created"  // Descending order by creation date
        }
        const productsData = await getProducts({}, additionalParams)
        setProducts(productsData.data)
        // console.log("productsData (all)", productsData)
      } else {
        // Filter by search term with partial text matching across multiple fields including translations
        const filters = {
          _or: [
            { name: { _contains: searchTerm } },
            { category: { _contains: searchTerm } },
            { city: { _contains: searchTerm } },
            { country: { _contains: searchTerm } },
            { street: { _contains: searchTerm } },
            { price: { _contains: searchTerm } },
            { "translations.name": { _contains: searchTerm } },
            { "translations.description": { _contains: searchTerm } }
          ]
        }
        
        // Add date-based descending sorting and limit
        const additionalParams = {
          limit: 100,
          sort: "-date_created"  // Descending order by creation date
        }
        
        const productsData = await getProducts(filters, additionalParams)
        setProducts(productsData.data)
        // console.log("productsData (filtered)", productsData)
      }
      
      setIsLoading(false)
    }
    fetchProducts()
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
          <p className="text-muted-foreground">Loading filtered items...</p>
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
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <ProductsList items={products} />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default FilterItemsPage
