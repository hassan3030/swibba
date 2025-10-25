"use client"
import { motion } from "framer-motion"
import { ItemUpdate } from "@/components/prods-modification/item-update"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getProductById } from "@/callAPI/products"
import Link from "next/link"
import { useTranslations } from "@/lib/use-translations"
import { useState, useEffect } from "react"
import { mediaURL } from "@/callAPI/utiles";
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

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
}

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
      <div className="min-h-screen bg-background flex items-center justify-center dark:bg-[#121212] ">
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
          <p className="text-muted-foreground">{t("loading") || "Loading..."}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      className="container py-2  dark:bg-[#121212] "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="mb-2 flex items-center gap-2 "
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
      </motion.div> 

      <motion.div className="mb-2 " variants={itemVariants} initial="hidden" animate="visible">
        <motion.h1
          className="text-3xl font-bold "
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {t("Updateitem") || "Update Item"}
        </motion.h1>
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {t("Updatedetailedlistingtofindtheperfectswapforyouritem") ||
            "Update a detailed listing to find the perfect swap for your item"}
        </motion.p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} >
        {item && <ItemUpdate {...item} />}
      </motion.div>
    </motion.div>
  )
}
