"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { AlertCircle, Home } from "lucide-react"

export default function Error({ error, reset }) {
  const { t } = useTranslations()
  const { isRTL } = useLanguage()

  useEffect(() => {
    // Optionally log the error to your error reporting service
    // console.error(error)
  }, [error])

  return (
    <div className="relative flex min-h-[60vh] items-center justify-center px-4 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-lg text-center">
        {/* Icon Container */}
        <div className="relative mb-8 flex justify-center">
          {/* Icon background */}
          <div className="flex items-center justify-center w-28 h-28 rounded-full bg-red-50 dark:bg-red-950/30">
            <AlertCircle className="w-14 h-14 text-red-500 dark:text-red-400" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl text-foreground">
          {t("somethingWentWrong") || (isRTL ? "حدث خطأ ما" : "Something went wrong")}
        </h1>

        {/* Message */}
        <p className="mb-8 text-base md:text-lg text-muted-foreground leading-relaxed">
          {isRTL 
            ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
            : "An unexpected error occurred. Please try again."
          }
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button 
            asChild 
            size="lg"
            className="px-8 py-3 rounded-full font-semibold"
          >
            <Link href="/">
              <Home className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("returnToHome") || (isRTL ? "الرجوع للصفحة الرئيسية" : "Go to Home")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}


