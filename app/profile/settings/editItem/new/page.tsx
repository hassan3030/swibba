"use client"

import { ItemListingForm } from "@/components/item-listing-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/lib/use-translations";



export default function NewItemPage() {
    const { t } = useTranslations();
  return (
    <div className="container py-2">
      <div className="mb-1 flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/profile">
            <ArrowLeft className="mr-2 h-4 w-4" />
           {t('goBackProfile')||"Back to profile"}
          </Link>
        </Button>
      </div>

      <div className="">
        <h1 className="text-3xl font-bold">{t('ListNewItem')||"List a New Item"}</h1>
        <p className="text-muted-foreground">{t('Createadetailedlistingtofindtheperfectswapforyouritem')||"Create a detailed listing to find the perfect swap for your item."}</p>
      </div>
      <ItemListingForm />
    </div>
  )
}
