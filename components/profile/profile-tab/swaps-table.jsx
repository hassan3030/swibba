"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DataTable,
  StatusBadge,
  DateCell,
} from "@/components/ui/data-table"
import {
  ArrowRightLeft,
  Package,
  Eye,
  Loader2,
} from "lucide-react"
import { TbShoppingCartUp } from "react-icons/tb"
import { BiCartDownload } from "react-icons/bi"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { mediaURL } from "@/callAPI/utiles"
import { SwapsEmptyState } from "@/components/general/modern-empty-state"
import { cn } from "@/lib/utils"

/**
 * Type Badge (Sent/Received)
 */
const ActionBadge = ({ isSent, t }) => {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium flex items-center gap-1.5 px-2.5 py-1 w-fit",
        isSent 
          ? "bg-primary/10 text-primary border-primary/20" 
          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      )}
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

/**
 * User Cell with Avatar
 */
const UserAvatarCell = ({ user, t }) => {
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-border">
          <AvatarFallback className="bg-muted text-muted-foreground">?</AvatarFallback>
        </Avatar>
        <span className="text-muted-foreground">{t?.("Unknown") || "Unknown"}</span>
      </div>
    )
  }

  const displayName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.first_name || user.username || (t?.("Unknown") || "Unknown")

  const avatarSrc = user.avatar 
    ? `${mediaURL}${user.avatar}` 
    : ""

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 border-2 border-border">
        <AvatarImage src={avatarSrc} alt={displayName} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {displayName[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{displayName}</p>
        {user.username && (
          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
            @{user.username}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Mobile Swap Card - Optimized for mobile responsive
 */
const SwapCard = ({ offer, t, isRTL, formatDate, calculateTotalValue }) => {
  const user = offer.targetUser
  const itemCount = offer.items?.length || 0
  const totalValue = calculateTotalValue(offer.items)

  return (
    <Card className="border border-border shadow-sm rounded-xl hover:border-primary/30 transition-colors">
      <CardContent className="p-3 sm:p-4">
        {/* Header - User & Type */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-border flex-shrink-0">
              <AvatarImage 
                src={user?.avatar ? `${mediaURL}${user.avatar}` : ""} 
                alt={user?.username || "User"} 
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {(user?.first_name || user?.username || "U")[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground text-sm truncate">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : user?.first_name || user?.username || (t("Unknown") || "Unknown")}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(offer.date_created)}
              </p>
            </div>
          </div>
          <ActionBadge isSent={offer.isSent} t={t} />
        </div>
        
        {/* Stats Grid - 2x2 on small screens */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-center p-2 bg-muted/30 rounded-lg">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">{t("Items") || "Items"}</p>
            <p className="font-semibold text-sm sm:text-base">{itemCount}</p>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded-lg">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">{t("totalPrice") || "Value"}</p>
            <p className="font-semibold text-primary text-sm sm:text-base">{totalValue.toLocaleString()} {t("LE")}</p>
          </div>
        </div>

        {/* Status Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <StatusBadge status={offer.status_offer} />
        </div>

        {/* Action Button - Full Width */}
        <Button 
          asChild 
          variant="outline" 
          size="sm" 
          className="w-full text-primary border-primary/30 hover:bg-primary/10 gap-2"
        >
          <Link href="/offers">
            <Eye className="h-4 w-4" />
            {t("View") || "View"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

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

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Calculate total value
  const calculateTotalValue = (items) => {
    if (!items || items.length === 0) return 0
    return items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1), 0)
  }

  // Combine and format all offers
  const allOffers = useMemo(() => {
    const combined = [
      ...sentOffers.map(offer => ({
        ...offer,
        isSent: true,
        items: sentSwapItems.filter(item => item.offer_id === offer.id),
        targetUser: sentUserSwaps.find(u => u?.id === offer.to_user_id) || null,
      })),
      ...receivedOffers.map(offer => ({
        ...offer,
        isSent: false,
        items: receivedSwapItems.filter(item => item.offer_id === offer.id),
        targetUser: receivedUserSwaps.find(u => u?.id === offer.from_user_id) || null,
      })),
    ]
    return combined.sort((a, b) => new Date(b.created_at || b.date_created) - new Date(a.created_at || a.date_created))
  }, [sentOffers, receivedOffers, sentSwapItems, receivedSwapItems, sentUserSwaps, receivedUserSwaps])

  // Define columns
  const columns = useMemo(() => [
    {
      key: "user",
      header: t("User") || "User",
      sortable: true,
      sortValue: (offer) => offer.targetUser?.first_name || offer.targetUser?.username || "",
      render: (offer) => <UserAvatarCell user={offer.targetUser} t={t} />,
    },
    {
      key: "items",
      header: t("Items") || "Items",
      sortable: true,
      sortValue: (offer) => offer.items?.length || 0,
      render: (offer) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{offer.items?.length || 0}</span>
          <span className="text-muted-foreground text-sm">
            {(offer.items?.length || 0) === 1 ? t("item") || "item" : t("items") || "items"}
          </span>
        </div>
      ),
    },
    {
      key: "value",
      header: t("totalPrice") || "Total Value",
      sortable: true,
      sortValue: (offer) => calculateTotalValue(offer.items),
      render: (offer) => (
        <span className="font-semibold text-primary">
          {calculateTotalValue(offer.items).toLocaleString()} {t("LE") || "LE"}
        </span>
      ),
    },
    {
      key: "date",
      header: t("Date") || "Date",
      sortable: true,
      sortValue: (offer) => new Date(offer.date_created || 0).getTime(),
      render: (offer) => (
        <DateCell 
          date={offer.date_created} 
          locale={isRTL ? "ar-EG" : "en-US"} 
        />
      ),
    },
    {
      key: "status",
      header: t("statusSwap") || "Status",
      sortable: true,
      render: (offer) => <StatusBadge status={offer.status_offer} />,
    },
    {
      key: "type",
      header: t("action") || "Type",
      sortable: true,
      sortValue: (offer) => offer.isSent ? "sent" : "received",
      render: (offer) => <ActionBadge isSent={offer.isSent} t={t} />,
    },
    {
      key: "actions",
      header: t("Actions") || "Actions",
      sortable: false,
      align: "center",
      render: () => (
        <Button 
          asChild 
          variant="outline" 
          size="sm"
          className="text-primary border-primary/30 hover:text-primary hover:bg-primary/10 gap-1.5"
        >
          <Link href="/offers">
            <Eye className="h-4 w-4" />
            <span>{t("View") || "View"}</span>
          </Link>
        </Button>
      ),
    },
  ], [t, isRTL, calculateTotalValue])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Empty state
  if (allOffers.length === 0) {
    return <SwapsEmptyState />
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
            {t("ViewAllOffers") || "View All"}
          </Link>
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        data={allOffers}
        columns={columns}
        isLoading={false}
        searchable={false}
        sortable={true}
        paginated={true}
        pageSize={5}
        isRTL={isRTL}
        rowKeyField="id"
        t={t}
        renderCard={(offer, index) => (
          <SwapCard
            key={offer.id || index}
            offer={offer}
            t={t}
            isRTL={isRTL}
            formatDate={formatDate}
            calculateTotalValue={calculateTotalValue}
          />
        )}
      />
    </div>
  )
}

export default SwapsTable
