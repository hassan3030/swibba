"use client"
import { MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ProductTitle({ product, isRTL, t, onMapOpen }) {
  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-5">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight capitalize tracking-tight flex-1">
          {(!isRTL ? product.translations[0]?.name : product.translations[1]?.name) || product.name}
        </h1>
        <Badge
          variant="outline"
          className="text-primary border-primary/50 bg-primary/5 hover:bg-primary/10 px-2.5 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-full shrink-0"
        >
          {t(product.status_item)}
        </Badge>
      </div>

      {/* Location Section */}
      {product.geo_location && (
        <button
          onClick={onMapOpen}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
        >
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm sm:text-base font-medium">
            {product.geo_location.name || `${product.city}, ${t(product.country)}`}
          </span>
        </button>
      )}
    </div>
  )
}
