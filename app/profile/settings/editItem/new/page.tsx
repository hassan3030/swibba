"use client"

import { ItemAdd } from "@/components/prods-modification/item-add"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/lib/use-translations";



export default function NewItemPage() {
    const { t } = useTranslations();
  return (
    <div className="w-full py-2 ">
      <div className="m-1  flex items-center gap-2 mx-2 max-[370px]:mx-0 lg:mx-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/profile">
            <ArrowLeft className="m-1 h-4 w-4" />
           {t('goBackProfile')||"Back to profile"}
          </Link>
        </Button>
      </div>

      <div className="mx-4 max-[370px]:mx-0 lg:mx-8">
        <h1 className="text-3xl m-1 font-bold  max-[370px]:text-xl">{t('ListNewItem')||"List a New Item"}</h1>
        <p className="text-muted-foreground m-1  max-[370px]:text-sm">{t('Createadetailedlistingtofindtheperfectswapforyouritem')||"Create a detailed listing to find the perfect swap for your item."}</p>
      </div>
      <ItemAdd />
    </div>
  )
}
