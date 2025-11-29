"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2,
  Clock,
  ArrowRightLeft,
} from "lucide-react"

export function OffersStats({ offers, t }) {
  const stats = {
    total: offers.length,
    completed: offers.filter(o => o.status_offer === "completed").length,
    pending: offers.filter(o => o.status_offer === "pending").length,
    accepted: offers.filter(o => o.status_offer === "accepted").length,
    totalMyValue: offers.reduce((sum, o) => {
      return sum + (o.myItems || []).reduce((s, item) => {
        return s + (parseFloat(item.product?.price || 0) * parseInt(item.quantity || 1))
      }, 0)
    }, 0),
    totalTheirValue: offers.reduce((sum, o) => {
      return sum + (o.theirItems || []).reduce((s, item) => {
        return s + (parseFloat(item.product?.price || 0) * parseInt(item.quantity || 1))
      }, 0)
    }, 0),
  }

  const statCards = [
    {
      label: t("totalSwaps") || "Total Swaps",
      value: stats.total,
      icon: ArrowRightLeft,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: t("completed") || "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: t("pending") || "Pending",
      value: stats.pending + stats.accepted,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      label: t("myTotalValue") || "My Total Value",
      value: `${stats.totalMyValue.toFixed(0)} ${t("le") || "LE"}`,
      icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      isValue: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
