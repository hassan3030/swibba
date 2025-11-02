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
      <div className="mx-4 max-[370px]:mx-0 lg:mx-8">
        <h1 className="text-3xl m-1 font-bold text-primary/90 max-[370px]:text-xl">{t('ListNewItem')||"List a New Item"}</h1>
        <p className="text-foreground/70 m-1  max-[370px]:text-sm">{t('Createadetailedlistingtofindtheperfectswapforyouritem')||"Create a detailed listing to find the perfect swap for your item."}</p>
      </div>
      <ItemAdd />
    </div>
  )
}
