"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Status Badge Component
 * Displays status with icon and appropriate colors
 */
export function StatusBadge({ status, variant = "default", className, t }) {
  const statusConfig = {
    // Offer/Swap statuses
    pending: {
      icon: Clock,
      color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      labelKey: "Pending",
      fallback: "Pending",
    },
    accepted: {
      icon: CheckCircle2,
      color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      labelKey: "Accepted",
      fallback: "Accepted",
    },
    rejected: {
      icon: XCircle,
      color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      labelKey: "Rejected",
      fallback: "Rejected",
    },
    completed: {
      icon: CheckCircle2,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      labelKey: "Completed",
      fallback: "Completed",
    },
    cancelled: {
      icon: XCircle,
      color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
      labelKey: "Cancelled",
      fallback: "Cancelled",
    },
    // Generic statuses
    active: {
      icon: CheckCircle2,
      color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      labelKey: "Active",
      fallback: "Active",
    },
    inactive: {
      icon: AlertCircle,
      color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
      labelKey: "Inactive",
      fallback: "Inactive",
    },
    error: {
      icon: XCircle,
      color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      labelKey: "Error",
      fallback: "Error",
    },
    warning: {
      icon: AlertCircle,
      color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      labelKey: "Warning",
      fallback: "Warning",
    },
    success: {
      icon: CheckCircle2,
      color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      labelKey: "Success",
      fallback: "Success",
    },
  }

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending
  const Icon = config.icon
  const label = t ? (t(config.labelKey) || config.fallback) : config.fallback

  return (
    <Badge
      variant="outline"
      className={cn(
        config.color,
        "font-medium flex items-center gap-1.5 px-2.5 py-1 w-fit",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

/**
 * User Avatar Cell Component
 * Displays user avatar with name and optional subtitle
 */
export function UserCell({ user, showUsername = true, size = "default" }) {
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className={cn(
          "border-2 border-border",
          size === "sm" ? "h-8 w-8" : "h-10 w-10"
        )}>
          <AvatarFallback className="bg-muted text-muted-foreground">?</AvatarFallback>
        </Avatar>
        <span className="text-muted-foreground">Unknown</span>
      </div>
    )
  }

  const displayName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.first_name || user.username || "Unknown"

  return (
    <div className="flex items-center gap-3">
      <Avatar className={cn(
        "border-2 border-border",
        size === "sm" ? "h-8 w-8" : "h-10 w-10"
      )}>
        <AvatarImage src={user.avatarUrl || ""} alt={displayName} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {displayName[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{displayName}</p>
        {showUsername && user.username && (
          <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
        )}
      </div>
    </div>
  )
}

/**
 * Price Cell Component
 * Displays formatted price with currency
 */
export function PriceCell({ value, currency = "LE", className }) {
  const formattedValue = typeof value === "number" 
    ? value.toLocaleString() 
    : value

  return (
    <span className={cn("font-semibold text-primary", className)}>
      {formattedValue} {currency}
    </span>
  )
}

/**
 * Date Cell Component
 * Displays formatted date
 */
export function DateCell({ date, format = "short", locale, className }) {
  if (!date) return <span className="text-muted-foreground">-</span>

  const dateObj = typeof date === "string" ? new Date(date) : date
  
  const formatOptions = {
    short: { month: "short", day: "numeric", year: "numeric" },
    long: { month: "long", day: "numeric", year: "numeric" },
    full: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
    time: { hour: "2-digit", minute: "2-digit" },
    datetime: { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" },
  }

  const formatted = dateObj.toLocaleDateString(locale, formatOptions[format] || formatOptions.short)

  return (
    <span className={cn("text-muted-foreground text-sm", className)}>
      {formatted}
    </span>
  )
}

/**
 * Action Buttons Cell Component
 * Configurable action buttons for table rows
 */
export function ActionCell({ actions = [], item }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {actions.map((action, index) => {
        const Icon = action.icon || Eye
        
        if (action.href) {
          return (
            <Button
              key={index}
              asChild
              variant={action.variant || "ghost"}
              size="sm"
              className={cn("text-primary hover:text-primary hover:bg-primary/10", action.className)}
            >
              <a href={typeof action.href === "function" ? action.href(item) : action.href}>
                <Icon className="h-4 w-4" />
                {action.label && <span className="ml-1.5">{action.label}</span>}
              </a>
            </Button>
          )
        }

        return (
          <Button
            key={index}
            variant={action.variant || "ghost"}
            size="sm"
            className={cn("text-primary hover:text-primary hover:bg-primary/10", action.className)}
            onClick={() => action.onClick?.(item)}
          >
            <Icon className="h-4 w-4" />
            {action.label && <span className="ml-1.5">{action.label}</span>}
          </Button>
        )
      })}
    </div>
  )
}

/**
 * Count Badge Cell Component
 * Displays a count with icon
 */
export function CountCell({ count, icon: Icon, label, className }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      <span className="font-medium">{count}</span>
      {label && <span className="text-muted-foreground text-sm">{label}</span>}
    </div>
  )
}

/**
 * Type Badge Component
 * For displaying types like "Sent" / "Received"
 */
export function TypeBadge({ type, config = {}, className }) {
  const defaultConfig = {
    sent: {
      color: "bg-primary/10 text-primary border-primary/20",
      label: "Sent",
    },
    received: {
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      label: "Received",
    },
    ...config,
  }

  const typeConfig = defaultConfig[type?.toLowerCase()] || { color: "bg-muted", label: type }
  const Icon = typeConfig.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        typeConfig.color,
        "font-medium flex items-center gap-1.5 px-2.5 py-1 w-fit",
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {typeConfig.label}
    </Badge>
  )
}

export default {
  StatusBadge,
  UserCell,
  PriceCell,
  DateCell,
  ActionCell,
  CountCell,
  TypeBadge,
}
