"use client"
import { motion } from "framer-motion"
import { ArrowRightLeft, Package } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import SwapItemCard from "@/components/send-received-item/swap-item-card"
import { fadeInUp } from "./animation-variants"

export function ItemsSection({ 
  offer, 
  myItems, 
  theirItems, 
  isReceived, 
  t 
}) {
  if (!["pending", "accepted"].includes(offer.status_offer)) {
    return null
  }

  return (
    <motion.div variants={fadeInUp}>
      <Card className="mb-6 overflow-hidden shadow-lg">
        {/* Header */}
        {/* <div className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">{t("ItemExchange") || "Item Exchange"}</h3>
          </div>
        </div> */}

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6">
            {/* My Items */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">{t("Myitems") || "My Items"}</h4>
                  <p className="text-xs text-muted-foreground">
                    {myItems.length} {myItems.length === 1 ? t("item") || "item" : t("items") || "items"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {myItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="h-full"
                  >
                    <SwapItemCard {...item} />
                  </motion.div>
                ))}
                {myItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t("NoItems") || "No items"}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Exchange Icon - Flipped */}
            <div className="hidden lg:flex flex-col items-center justify-center py-8">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center shadow-xl shadow-primary/25">
                <ArrowRightLeft className="h-6 w-6 text-white " />
              </div>
            </div>

            {/* Mobile Divider - Flipped */}
            <div className="lg:hidden flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <ArrowRightLeft className="h-5 w-5 text-white rotate-90" />
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            {/* Their Items */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <h4 className="font-bold">{t("Theiritems") || "Their Items"}</h4>
                  <p className="text-xs text-muted-foreground">
                    {theirItems.length} {theirItems.length === 1 ? t("item") || "item" : t("items") || "items"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {theirItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="h-full"
                  >
                    <SwapItemCard {...item} />
                  </motion.div>
                ))}
                {theirItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t("NoItems") || "No items"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ItemsSection
