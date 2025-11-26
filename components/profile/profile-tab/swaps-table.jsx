"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowRightLeft,
  ExternalLink,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Download,
  Eye,
  Loader2,
} from "lucide-react"
import { TbShoppingCartUp } from "react-icons/tb"
import { BiCartDownload } from "react-icons/bi"
import Link from "next/link"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { mediaURL } from "@/callAPI/utiles"
import { SwapsEmptyState } from "@/components/general/modern-empty-state"

// Status badge component
const StatusBadge = ({ status, t }) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      label: t("pending") || "Pending",
    },
    accepted: {
      icon: CheckCircle2,
      color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      label: t("accepted") || "Accepted",
    },
    rejected: {
      icon: XCircle,
      color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      label: t("rejected") || "Rejected",
    },
    completed: {
      icon: CheckCircle2,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      label: t("completed") || "Completed",
    },
  }

  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon

  return (
    <Badge variant="outline" className={`${config.color} font-medium flex items-center gap-1.5 px-2.5 py-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

// Action type badge
const ActionBadge = ({ isSent, t }) => {
  return (
    <Badge 
      variant="outline" 
      className={`font-medium flex items-center gap-1.5 px-2.5 py-1 ${
        isSent 
          ? "bg-primary/10 text-primary border-primary/20" 
          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      }`}
    >
      {isSent ? (
        <>
          <TbShoppingCartUp className="h-3 w-3" />
          {t("Sent") || "Sent"}
        </>
      ) : (
        <>
          <BiCartDownload className="h-3 w-3" />
          {t("Received") || "Received"}
        </>
      )}
    </Badge>
  )
}

// Stats cards at top
const SwapStats = ({ sentCount, receivedCount, pendingCount, completedCount, t }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20"
    >
      <div className="flex items-center gap-2 mb-1">
        <TbShoppingCartUp className="h-4 w-4 text-primary" />
        <span className="text-xs text-muted-foreground">{t("Sent") || "Sent"}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{sentCount}</p>
    </motion.div>
    
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl p-4 border border-emerald-500/20"
    >
      <div className="flex items-center gap-2 mb-1">
        <BiCartDownload className="h-4 w-4 text-emerald-500" />
        <span className="text-xs text-muted-foreground">{t("Received") || "Received"}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{receivedCount}</p>
    </motion.div>
    
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-xl p-4 border border-yellow-500/20"
    >
      <div className="flex items-center gap-2 mb-1">
        <Clock className="h-4 w-4 text-yellow-500" />
        <span className="text-xs text-muted-foreground">{t("Pending") || "Pending"}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
    </motion.div>
    
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-4 border border-blue-500/20"
    >
      <div className="flex items-center gap-2 mb-1">
        <CheckCircle2 className="h-4 w-4 text-blue-500" />
        <span className="text-xs text-muted-foreground">{t("Completed") || "Completed"}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{completedCount}</p>
    </motion.div>
  </div>
)

export function SwapsTable({ 
  sentOffers = [], 
  receivedOffers = [], 
  sentSwapItems = [],
  receivedSwapItems = [],
  sentUserSwaps = [],
  receivedUserSwaps = [],
  isLoading = false 
}) {
  const { t } = useTranslations()
  const { isRTL } = useLanguage()

  // Combine and format all offers into table rows
  const allOffers = [
    ...sentOffers.map(offer => ({
      ...offer,
      isSent: true,
      items: sentSwapItems.filter(item => item.offer_id === offer.id),
      users: sentUserSwaps,
    })),
    ...receivedOffers.map(offer => ({
      ...offer,
      isSent: false,
      items: receivedSwapItems.filter(item => item.offer_id === offer.id),
      users: receivedUserSwaps,
    })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  // Calculate stats
  const pendingCount = allOffers.filter(o => o.status_offer === "pending").length
  const completedCount = allOffers.filter(o => o.status_offer === "completed").length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (allOffers.length === 0) {
    return <SwapsEmptyState />
  }

  // Get user for offer
  const getUserForOffer = (offer) => {
    const users = offer.isSent ? sentUserSwaps : receivedUserSwaps
    const targetUserId = offer.isSent ? offer.to_user_id : offer.from_user_id
    return users.find(u => u?.id === targetUserId)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Calculate total value - sum all items in the offer
  const calculateTotalValue = (items) => {
    if (!items || items.length === 0) return 0
    return items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header with View All link */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          {t("AllSwaps") || "All Swaps"}
        </h3>
        <Button asChild variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/10">
          <Link href="/offers">
            <Eye className="mr-2 h-4 w-4" />
            {t("ViewAllOffers") || "View Full Details"}
          </Link>
        </Button>
      </div>

      {/* Desktop Table */}
      <Card className="shadow-lg border-border/50 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">{t("User") || "User"}</TableHead>
                <TableHead className="font-semibold">{t("Items") || "Items"}</TableHead>
                <TableHead className="font-semibold">{t("totalPrice") || "Total Value"}</TableHead>
                <TableHead className="font-semibold">{t("Date") || "Date"}</TableHead>
                <TableHead className="font-semibold">{t("statusSwap") || "Status"}</TableHead>
                <TableHead className="font-semibold">{t("action") || "Type"}</TableHead>
                <TableHead className="font-semibold text-center">{t("ViewDetails") || "Action"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {allOffers.map((offer, index) => {
                  const user = getUserForOffer(offer)
                  const offerItems = offer.items || []
                  const itemCount = offerItems.length
                  const totalValue = calculateTotalValue(offerItems)

                  return (
                    <motion.tr
                      key={offer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-muted/20 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-border">
                            <AvatarImage 
                              src={user?.avatar ? `${mediaURL}${user.avatar}` : ""} 
                              alt={user?.username || "User"} 
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {(user?.first_name || user?.username || "U")[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">
                              {user?.first_name && user?.last_name 
                                ? `${user.first_name} ${user.last_name}` 
                                : user?.first_name || user?.username || t("Unknown")}
                            </p>
                            {user?.username && (
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                @{user.username}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{itemCount}</span>
                          <span className="text-muted-foreground text-sm">
                            {itemCount === 1 ? t("item") || "item" : t("items") || "items"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">
                          {totalValue.toLocaleString()} {t("LE") || "LE"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">
                          {formatDate(offer.date_created)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={offer.status_offer} t={t} />
                      </TableCell>
                      <TableCell>
                        <ActionBadge isSent={offer.isSent} t={t} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          asChild 
                          variant="ghost" 
                          size="sm"
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Link href="/offers">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        <AnimatePresence>
          {allOffers.map((offer, index) => {
            const user = getUserForOffer(offer)
            const offerItems = offer.items || []
            const itemCount = offerItems.length
            const totalValue = calculateTotalValue(offerItems)

            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-border">
                          <AvatarImage 
                            src={user?.avatar ? `${mediaURL}${user.avatar}` : ""} 
                            alt={user?.username || "User"} 
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {(user?.first_name || user?.username || "U")[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {user?.first_name && user?.last_name 
                              ? `${user.first_name} ${user.last_name}` 
                              : user?.first_name || user?.username || t("Unknown")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(offer.date_created)}
                          </p>
                        </div>
                      </div>
                      <ActionBadge isSent={offer.isSent} t={t} />
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">{t("Items") || "Items"}</p>
                          <p className="font-semibold">{itemCount}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">{t("totalPrice") || "Value"}</p>
                          <p className="font-semibold text-primary">{totalValue.toLocaleString()} {t("LE")}</p>
                        </div>
                      </div>
                      <StatusBadge status={offer.status_offer} t={t} />
                    </div>

                    <Button 
                      asChild 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-primary border-primary/30 hover:bg-primary/10"
                    >
                      <Link href="/offers">
                        <Eye className="mr-2 h-4 w-4" />
                        {t("ViewDetails") || "View Details"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
