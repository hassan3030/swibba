"use client"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { FileText } from "lucide-react"
import { itemVariants } from "./constants"

interface DescriptionSectionProps {
  form: any
  t: (key: string) => string
}

export function DescriptionSection({ form, t }: DescriptionSectionProps) {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <motion.div variants={itemVariants}>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground flex items-center gap-2 font-semibold text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  {t("description") || "Description"}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      t("Describeyouritemndetailincludingconditionfeaturesandanyrelevanthistory") ||
                      "Describe your item in detail, including condition, features, and any relevant history."
                    }
                    className="min-h-[150px] rounded-xl bg-background border-input text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-foreground/60 text-sm">
                  {t("detailsprovidethemorelikelyfindgoodswap") ||
                    "The more details you provide, the more likely you are to find a good swap."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>
      </CardContent>
    </Card>
  )
}
