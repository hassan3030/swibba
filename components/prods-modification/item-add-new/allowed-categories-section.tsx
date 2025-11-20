"use client"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { allowedCategories } from "@/lib/data"
import { motion } from "framer-motion"
import { Repeat } from "lucide-react"
import { itemVariants } from "./constants"

interface AllowedCategoriesSectionProps {
  form: any
  t: (key: string) => string
}

export function AllowedCategoriesSection({ form, t }: AllowedCategoriesSectionProps) {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Repeat className="h-6 w-6 text-primary" />
          {t("Whatwillyouacceptinreturn") || "What will you accept in return?"}
        </CardTitle>
        <CardDescription className="text-base">
          {t("Selectthecategoriesofitemsyourewillingtoacceptinexchange") ||
            "Select the categories of items you're willing to accept in exchange"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div className="space-y-4" variants={itemVariants}>
      <FormField
        control={form.control}
        name="allowed_categories"
        render={() => (
          <FormItem>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allowedCategories.map((category) => {
                const isAll = category === "all"
                const selected = form.getValues("allowed_categories") || []
                const isAllSelected = selected.includes("all")

                return (
                  <FormField
                    key={category}
                    control={form.control}
                    name="allowed_categories"
                    render={({ field }) => (
                      <FormItem
                        className="flex flex-row rtl:flex-row-reverse items-start space-x-3 space-y-0 rounded-xl border-2 border-border bg-background dark:bg-gray-950 p-4 shadow-sm hover:border-primary hover:bg-primary/5 transition-all hover:shadow-md cursor-pointer"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(category)}
                            disabled={!isAll && isAllSelected}
                            onCheckedChange={(checked) => {
                              if (isAll) {
                                field.onChange(checked ? ["all"] : [])
                              } else {
                                let newValue = field.value?.filter((v: string) => v !== "all") || []
                                if (checked) {
                                  newValue = [...newValue, category]
                                } else {
                                  newValue = newValue.filter((v: string) => v !== category)
                                }
                                field.onChange(newValue)
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal capitalize text-foreground">
                          {t(category) || category}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                )
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
        </motion.div>
      </CardContent>
    </Card>
  )
}
