"use client"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { itemsStatus } from "@/lib/data"
import { motion } from "framer-motion"
import { Package, DollarSign, Hash, CheckCircle } from "lucide-react"
import { itemVariants } from "./constants"
import { slugify } from "./helpers"

interface BasicInfoSectionProps {
  form: any
  t: (key: string) => string
}

export function BasicInfoSection({ form, t }: BasicInfoSectionProps) {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <motion.div className="space-y-6" variants={itemVariants}>
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground flex items-center gap-2 font-semibold">
                <Package className="h-4 w-4 text-primary" />
                {t("Name") || "Name"}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., MacBook Pro 16-inch 2021"
                  {...field}
                  className="rounded-xl h-12 bg-background border-input text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  onChange={(e) => {
                    field.onChange(e)
                    // Auto-generate slug from name
                    const slug = slugify(e.target.value)
                    form.setValue('slug', slug)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground flex items-center gap-2 font-semibold">
                <DollarSign className="h-4 w-4 text-primary" />
                {t("price") || "Price"}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 500"
                  {...field}
                  type="number"
                  min={1}
                  className="rounded-xl h-12 bg-background border-input text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground flex items-center gap-2 font-semibold">
                <Hash className="h-4 w-4 text-primary" />
                {t("quantity") || "Quantity"}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("quantityofyouritem") || "Quantity of your item"}
                  {...field}
                  type="number"
                  min={1}
                  max={100}
                  className="rounded-xl h-12 bg-background border-input text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value)
                    form.trigger("quantity")
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status_item"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground flex items-center gap-2 font-semibold">
                <CheckCircle className="h-4 w-4 text-primary" />
                {t("Condition") || "Condition"}
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl h-12 bg-background border-input text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder={t("SelectCondition") || "Select condition"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background border-input text-foreground z-[9999]">
                  {itemsStatus.map((condition) => (
                    <SelectItem key={condition} value={condition} className="capitalize">
                      {t(condition) || condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
