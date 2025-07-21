"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { useTranslations } from "@/lib/use-translations"
import { ChevronRight } from "lucide-react"

const headerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
}

export const HeaderComp = () => {
  const { t } = useTranslations()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <section className="container py-2">
        <motion.div
          className="mb-4 flex items-center justify-between"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-xl font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t("allProducts")}
          </motion.h2>
          <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <Link href="/" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              {t("goBack")}
              <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </motion.div>
  )
}
