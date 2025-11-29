"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/use-translations"
import { Home, Search, ArrowLeft, RefreshCcw } from "lucide-react"

export default function NotFound() {
  const { t } = useTranslations()
  
  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background via-background to-primary/5">
      <div className="text-center max-w-lg mx-auto">
        {/* Animated 404 Number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 100 }}
          className="relative mb-8"
        >
          {/* Background Glow Effect */}
          <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-primary via-emerald-500 to-primary rounded-full scale-150" />
          
          {/* 404 Text */}
          <div className="relative">
            <h1 className="text-[120px] sm:text-[180px] font-black leading-none bg-gradient-to-br from-primary via-primary/80 to-emerald-500 bg-clip-text text-transparent select-none">
              404
            </h1>
        
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
        >
          {t("pageNotFound") || "Page Not Found"}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed"
        >
          {t("hintNotFoundPage") || "The page you're looking for doesn't exist or has been removed. Please try again."}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
            <Link href="/">
              <Home className="h-4 w-4" />
              {t("returnToHome") || "Go to home page"}
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="gap-2 w-full sm:w-auto border-primary/30 text-primary hover:bg-primary/10">
            <Link href="/products">
              <Search className="h-4 w-4" />
              {t("BrowseProducts") || "Browse Products"}
            </Link>
          </Button>
        </motion.div>

      </div>
    </div>
  )
}
