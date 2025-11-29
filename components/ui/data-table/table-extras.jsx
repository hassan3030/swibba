"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * Stats Card Component
 * Displays a stat with icon, label, and value
 */
export function StatsCard({
  icon: Icon,
  label,
  value,
  gradient = "from-primary/10 to-primary/5",
  borderColor = "border-primary/20",
  iconColor = "text-primary",
  delay = 0,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        `bg-gradient-to-br ${gradient} rounded-xl p-4 border ${borderColor}`,
        className
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className={cn("h-4 w-4", iconColor)} />}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </motion.div>
  )
}

/**
 * Stats Grid Component
 * Displays multiple stats in a responsive grid
 */
export function StatsGrid({ stats = [], className }) {
  const gradients = [
    { gradient: "from-primary/10 to-primary/5", border: "border-primary/20", icon: "text-primary" },
    { gradient: "from-emerald-500/10 to-emerald-500/5", border: "border-emerald-500/20", icon: "text-emerald-500" },
    { gradient: "from-yellow-500/10 to-yellow-500/5", border: "border-yellow-500/20", icon: "text-yellow-500" },
    { gradient: "from-blue-500/10 to-blue-500/5", border: "border-blue-500/20", icon: "text-blue-500" },
    { gradient: "from-purple-500/10 to-purple-500/5", border: "border-purple-500/20", icon: "text-purple-500" },
    { gradient: "from-rose-500/10 to-rose-500/5", border: "border-rose-500/20", icon: "text-rose-500" },
  ]

  return (
    <div className={cn(
      "grid gap-3",
      stats.length <= 2 ? "grid-cols-2" : 
      stats.length === 3 ? "grid-cols-3" :
      "grid-cols-2 sm:grid-cols-4",
      className
    )}>
      {stats.map((stat, index) => {
        const colorScheme = stat.colorScheme || gradients[index % gradients.length]
        
        return (
          <StatsCard
            key={stat.key || index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            gradient={stat.gradient || colorScheme.gradient}
            borderColor={stat.borderColor || colorScheme.border}
            iconColor={stat.iconColor || colorScheme.icon}
            delay={0.1 + index * 0.05}
            className={stat.className}
          />
        )
      })}
    </div>
  )
}

/**
 * Table Loading Skeleton
 * Loading state for the data table
 */
export function TableLoadingSkeleton({ rows = 5, columns = 5, className }) {
  return (
    <Card className={cn("overflow-hidden border-border/50", className)}>
      <div className="p-4 space-y-3">
        {/* Header skeleton */}
        <div className="flex gap-4 pb-2 border-b border-border/50">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        
        {/* Row skeletons */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            {Array.from({ length: columns - 1 }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </Card>
  )
}

/**
 * Card Loading Skeleton (for mobile view)
 */
export function CardLoadingSkeleton({ count = 3, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Empty State Component
 */
export function EmptyState({
  icon: Icon,
  title = "No data found",
  description,
  action,
  className,
}) {
  return (
    <Card className={cn("border-border/50", className)}>
      <CardContent className="flex flex-col items-center justify-center py-16">
        {Icon && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4"
          >
            <Icon className="h-8 w-8 text-muted-foreground" />
          </motion.div>
        )}
        <motion.h3
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg font-semibold text-foreground mb-1"
        >
          {title}
        </motion.h3>
        {description && (
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-muted-foreground text-center max-w-sm mb-4"
          >
            {description}
          </motion.p>
        )}
        {action && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {action}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

export default {
  StatsCard,
  StatsGrid,
  TableLoadingSkeleton,
  CardLoadingSkeleton,
  EmptyState,
}
