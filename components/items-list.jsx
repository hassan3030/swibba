"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { ItemCardProfile } from "./item-card-profile"
import { categoriesName } from "@/lib/data"
import { useTranslations } from "@/lib/use-translations"

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

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      duration: 0.6,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: {
      duration: 0.3,
    },
  },
}

const filterVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20,
    },
  },
}

const paginationVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

export function ItemsList({
  items,
  showFilters = true,
  showCategoriesFilter = true,
  showbtn = true,
  showSwitchHeart = true,
}) {
  const [displayedItems, setDisplayedItems] = useState(items)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("all")
  const [page, setPage] = useState(1)
  const router = useRouter()
  const { t } = useTranslations()
  const itemsPerPage = 8

  // Filtering and pagination
  useEffect(() => {
    setIsLoading(true)
    let filtered = items
    if (category !== "all") {
      filtered = filtered.filter((item) => item.category === category)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setDisplayedItems(filtered)
    setPage(1)
    setIsLoading(false)
  }, [items, category, searchTerm])

  // Pagination logic
const totalPages = Math.max(1, Math.ceil(displayedItems.length / itemsPerPage));

const paginatedItems = Array.isArray(displayedItems)
  ? displayedItems.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  : [];


  // const totalPages = Math.max(1, Math.ceil(displayedItems.length / itemsPerPage))
  // const paginatedItems =  displayedItems.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const handleSearch = () => setPage(1)
  const handleCategoryChange = (value) => {
    setCategory(value)
    setPage(1)
  }
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
      {showFilters && (


        <motion.div className="flex flex-col gap-4 sm:flex-row" variants={filterVariants}>
          <motion.div
            className="relative flex-1"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Input
              placeholder={t("searcItems") || "Search items..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="border pr-10 transition-all duration-300 focus:ring-2 hover:border-primary/90  focus:ring-primary/20 focus:border-primary/20"
            />
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            </motion.div>
          </motion.div>
          {showCategoriesFilter && (
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-[180px] transition-all duration-300 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder={t("showAllCategories") || "Show All Categories"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all" value="all" className="capitalize">
                    {t("allCategories") || "All Categories"}
                  </SelectItem>
                  {categoriesName.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {t(cat) || cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </motion.div>
      )}

      <AnimatePresence mode="wait"  >
        {isLoading ? (
          <motion.div
            className="flex h-40 items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="loading"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 text-primary" />
            </motion.div>
          </motion.div>
        ) : paginatedItems.length === 0 ? (
          <motion.div
            className="flex h-40 flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            key="empty"
          >
            <motion.p
              className="text-lg font-medium"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t("noItemsFound") || "No items found"}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button onClick={() => router.push("/")}>{t("goBack") || "Go Back"}</Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="content">
            <motion.div
              className="flex flex-row gap-4 justify-center flex-wrap max-w-screen"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {paginatedItems.map((item, index) => (
                  <motion.div
                   key={crypto.randomUUID()}
                    variants={itemVariants}
                    custom={index}
                    layout
                    whileHover={{
                      y: -8,
                      transition: { type: "spring", stiffness: 300, damping: 30 },
                    }}
                  >
                    <ItemCardProfile {...item} showbtn={showbtn} showSwitchHeart={showSwitchHeart} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            <motion.div variants={paginationVariants} initial="hidden" animate="visible">
              <SimplePagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// SimplePagination component with animations
function SimplePagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useTranslations()

  if (totalPages <= 1) return null

  return (
    <motion.div
      className="flex justify-center mt-6 gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <motion.button
        className="px-3 py-1 rounded border dark:text-black bg-white hover:bg-gray-100 disabled:opacity-50 transition-all duration-200"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {t("prev") || "Prev"}
      </motion.button>

      {[...Array(totalPages)].map((_, idx) => (
        <motion.button
          key={idx + 1}
          className={`px-3 dark:text-black py-1 border rounded transition-all duration-200 ${
            currentPage === idx + 1 ? "bg-primary text-white shadow-lg" : "bg-white hover:bg-gray-100"
          }`}
          onClick={() => onPageChange(idx + 1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
        >
          {idx + 1}
        </motion.button>
      ))}

      <motion.button
        className="px-3 py-1 dark:text-black rounded border bg-white hover:bg-gray-100 disabled:opacity-50 transition-all duration-200"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {t("next") || "Next"}
      </motion.button>
    </motion.div>
  )
}
