
"use client"
import Link from 'next/link'
import { useTranslations } from "@/lib/use-translations"
import { ChevronRight } from 'lucide-react'

export const HeaderComp = () => {
const { t } = useTranslations()

  return (
    <div>
      <section className="container py-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t("allProducts")}</h2>
          <Link href="/" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            {t("goBack")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section> 
    </div>
  )
}
