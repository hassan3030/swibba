"use client"

import { useMemo } from "react"
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
  Eye,
  Package,
  ArrowRightLeft,
} from "lucide-react"
import { TbShoppingCartUp } from "react-icons/tb"
import { BiCartDownload } from "react-icons/bi"
import { mediaURL } from "@/callAPI/utiles"
import { cn } from "@/lib/utils"

/**
 * User Cell with Avatar
 */
const UserAvatarCell = ({ user, isRTL, t }) => {
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-border flex-shrink-0">
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
      <Avatar className="h-10 w-10 border-2 border-border flex-shrink-0">
        <AvatarImage src={avatarSrc} alt={displayName} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {displayName[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{displayName}</p>
        {user.email && (
          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
            {user.email}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Type Badge Component (Sent/Received)
 */
const TypeBadge = ({ isSent, t }) => {
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
 * Items Count Cell
 */
const ItemsCell = ({ myItems = [], theirItems = [], t }) => {
  const myCount = myItems.length
  const theirCount = theirItems.length

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 text-primary">
        <Package className="h-3.5 w-3.5" />
        <span className="font-medium">{myCount}</span>
      </div>
      <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
        <Package className="h-3.5 w-3.5" />
        <span className="font-medium">{theirCount}</span>
      </div>
    </div>
  )
}

/**
 * Value Comparison Cell
 */
const ValueCell = ({ myItems = [], theirItems = [], t }) => {
  const calculateValue = (items) => 
    items.reduce((sum, item) => {
      const price = parseFloat(item.product?.price || 0)
      const qty = parseInt(item.quantity || 1)
      return sum + price * qty
    }, 0)

  const myValue = calculateValue(myItems)
  const theirValue = calculateValue(theirItems)

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm text-primary font-medium">
        {myValue.toLocaleString()} {t("LE") || "LE"}
      </span>
      <span className="text-xs text-muted-foreground">
        vs {theirValue.toLocaleString()} {t("LE") || "LE"}
      </span>
    </div>
  )
}

/**
 * Item Preview Component for card
 */
const ItemPreview = ({ item, t }) => {
  // Handle different image path formats
  const getImageUrl = () => {
    const product = item.product
    if (!product) return ""
    
    // Check for images array first
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0]
      // Check if it's already a full URL
      if (typeof firstImage === 'string') {
        if (firstImage.startsWith('http')) return firstImage
        return `${mediaURL}${firstImage}`
      }
      // If it's an object with url/path property
      if (firstImage?.url) return firstImage.url.startsWith('http') ? firstImage.url : `${mediaURL}${firstImage.url}`
      if (firstImage?.path) return firstImage.path.startsWith('http') ? firstImage.path : `${mediaURL}${firstImage.path}`
    }
    
    // Fallback to single image property
    if (product.image) {
      if (product.image.startsWith('http')) return product.image
      return `${mediaURL}${product.image}`
    }
    
    // Check for thumbnail
    if (product.thumbnail) {
      if (product.thumbnail.startsWith('http')) return product.thumbnail
      return `${mediaURL}${product.thumbnail}`
    }
    
    return ""
  }
  
  const imageSrc = getImageUrl()
  
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted/50 border border-border/50 flex-shrink-0">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={item.product?.name || "Item"} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling?.classList?.remove('hidden')
            }}
          />
        ) : null}
        <div className={cn("w-full h-full flex items-center justify-center", imageSrc && "hidden")}>
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
      <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[60px] sm:max-w-[70px] text-center">
        {item.product?.name || t("Item") || "Item"}
      </p>
    </div>
  )
}

/**
 * Items Stack Component - shows up to 3 items with overflow indicator
 */
const ItemsStack = ({ items = [], label, color, t }) => {
  const displayItems = items.slice(0, 3)
  const remainingCount = items.length - 3

  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      <p className={cn("text-xs font-medium", color)}>{label}</p>
      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
        {displayItems.length > 0 ? (
          displayItems.map((item, idx) => (
            <ItemPreview key={item.id || idx} item={item} t={t} />
          ))
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-50">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-muted/30 border border-dashed border-border flex items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-[10px] text-muted-foreground">{t("NoItems") || "No items"}</p>
          </div>
        )}
        {remainingCount > 0 && (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-muted/50 border border-border flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">+{remainingCount}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {items.reduce((sum, item) => {
          const price = parseFloat(item.product?.price || 0)
          const qty = parseInt(item.quantity || 1)
          return sum + price * qty
        }, 0).toLocaleString()} {t("LE") || "LE"}
      </p>
    </div>
  )
}

/**
 * Mobile Offer Card - Modern swap card design
 */
const OfferCard = ({ offer, currentUserId, onViewOffer, t, isRTL }) => {
  const isSent = String(offer.from_user_id?.id || offer.from_user_id) === String(currentUserId)

  return (
    <Card className="border border-border hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md bg-card overflow-hidden group">
      {/* Header - User & Date on top, Status below */}
      <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 border-b border-border/50 bg-muted/20">
        {/* Row 1: User on left, Date on right */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="h-8 w-8 border border-border flex-shrink-0">
              <AvatarImage 
                src={offer.otherUser?.avatar ? `${mediaURL}${offer.otherUser.avatar}` : ""} 
                alt={offer.otherUser?.first_name || "User"} 
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {(offer.otherUser?.first_name || offer.otherUser?.username || "?")[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium text-foreground truncate">
              {offer.otherUser?.first_name && offer.otherUser?.last_name
                ? `${offer.otherUser.first_name} ${offer.otherUser.last_name}`
                : offer.otherUser?.first_name || offer.otherUser?.username || (t("Unknown") || "Unknown")}
            </p>
          </div>
          <DateCell 
            date={offer.date_updated || offer.date_created} 
            locale={isRTL ? "ar-EG" : "en-US"} 
          />
        </div>
        {/* Row 2: Status badges */}
        <div className="flex items-center gap-2">
          <StatusBadge status={offer.status_offer} />
          <TypeBadge isSent={isSent} t={t} />
        </div>
      </div>

      <CardContent className="p-3 sm:p-4">
        {/* Swap Items Layout - My Items | Swap Icon | Their Items */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4">
          {/* My Items - Left */}
          <ItemsStack 
            items={offer.myItems || []} 
            label={t("yourItems") || "Your Items"} 
            color="text-primary"
            t={t}
          />

          {/* Swap Icon - Center */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ArrowRightLeft className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            {offer.cash_adjustment !== 0 && offer.cash_adjustment && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  offer.cash_adjustment > 0 
                    ? "bg-green-500/10 text-green-600 border-green-500/30" 
                    : "bg-red-500/10 text-red-600 border-red-500/30"
                )}
              >
                {offer.cash_adjustment > 0 ? "+" : ""}{offer.cash_adjustment} {t("LE") || "LE"}
              </Badge>
            )}
          </div>

          {/* Their Items - Right */}
          <ItemsStack 
            items={offer.theirItems || []} 
            label={t("TheirItems") || "Their Items"} 
            color="text-emerald-600 dark:text-emerald-400"
            t={t}
          />
        </div>

        {/* Action Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewOffer(offer)}
          className="w-full text-primary border-primary/30 hover:bg-primary/10 gap-2 group-hover:border-primary/50"
        >
          <Eye className="h-4 w-4" />
          {t("ViewDetails") || "View Details"}
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Wrapper component for card with divider
 */
const CardWithDivider = ({ children, isLast }) => (
  <div className="relative">
    {children}
    {!isLast && (
      <div className="border-b border-border/60 my-3 mx-2" />
    )}
  </div>
)

/**
 * Offers Table Component using Reusable DataTable
 */
export function OffersTable({
  offers,
  currentUserId,
  onViewOffer,
  t,
  isRTL,
  sortOption,
  onSortChange,
}) {
  // Define table columns
  const columns = useMemo(() => [
    {
      key: "otherUser",
      header: t("User") || "User",
      sortable: true,
      sortValue: (offer) => {
        const user = offer.otherUser
        return user?.first_name || user?.username || ""
      },
      render: (offer) => <UserAvatarCell user={offer.otherUser} isRTL={isRTL} t={t} />,
    },
    {
      key: "type",
      header: t("Type") || "Type",
      sortable: true,
      sortValue: (offer) => {
        const isSent = String(offer.from_user_id?.id || offer.from_user_id) === String(currentUserId)
        return isSent ? "sent" : "received"
      },
      render: (offer) => {
        const isSent = String(offer.from_user_id?.id || offer.from_user_id) === String(currentUserId)
        return <TypeBadge isSent={isSent} t={t} />
      },
    },
    {
      key: "items",
      header: t("Items") || "Items",
      sortable: true,
      sortValue: (offer) => (offer.myItems?.length || 0) + (offer.theirItems?.length || 0),
      render: (offer) => (
        <ItemsCell myItems={offer.myItems} theirItems={offer.theirItems} t={t} />
      ),
    },
    {
      key: "value",
      header: t("Value") || "Value",
      sortable: true,
      sortValue: (offer) => {
        const calculateValue = (items) => 
          (items || []).reduce((sum, item) => {
            const price = parseFloat(item.product?.price || 0)
            const qty = parseInt(item.quantity || 1)
            return sum + price * qty
          }, 0)
        return calculateValue(offer.myItems)
      },
      render: (offer) => (
        <ValueCell myItems={offer.myItems} theirItems={offer.theirItems} t={t} />
      ),
    },
    {
      key: "cash_adjustment",
      header: t("Cash") || "Cash",
      sortable: true,
      align: "center",
      render: (offer) => (
        <span className={cn(
          "font-medium",
          offer.cash_adjustment > 0 ? "text-green-600" : 
          offer.cash_adjustment < 0 ? "text-red-600" : "text-muted-foreground"
        )}>
          {offer.cash_adjustment > 0 ? "+" : ""}{offer.cash_adjustment || 0} {t("LE") || "LE"}
        </span>
      ),
    },
    {
      key: "date_updated",
      header: t("Date") || "Date",
      sortable: true,
      sortValue: (offer) => new Date(offer.date_updated || offer.date_created || 0).getTime(),
      render: (offer) => (
        <DateCell 
          date={offer.date_updated || offer.date_created} 
          locale={isRTL ? "ar-EG" : "en-US"} 
        />
      ),
    },
    {
      key: "status_offer",
      header: t("Status") || "Status",
      sortable: true,
      render: (offer) => <StatusBadge status={offer.status_offer} />,
    },
    {
      key: "actions",
      header: t("Actions") || "Actions",
      sortable: false,
      align: "center",
      render: (offer) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onViewOffer(offer)
          }}
          className="text-primary border-primary/30 hover:text-primary hover:bg-primary/10 gap-1.5"
        >
          <Eye className="h-4 w-4" />
          <span>{t("View") || "View"}</span>
        </Button>
      ),
    },
  ], [t, isRTL, currentUserId, onViewOffer])

  return (
    <DataTable
      data={offers}
      columns={columns}
      isLoading={false}
      searchable={false}
      sortable={true}
      paginated={true}
      pageSize={10}
      isRTL={isRTL}
      rowKeyField="id"
      onRowClick={onViewOffer}
      t={t}
      showViewToggle={true}
      renderCard={(offer, index) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          currentUserId={currentUserId}
          onViewOffer={onViewOffer}
          t={t}
          isRTL={isRTL}
        />
      )}
    />
  )
}

export default OffersTable
