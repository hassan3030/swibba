"use client"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function OfferHeader({ 
  router, 
  statusConfig, 
  isRTL, 
  t 
}) {
  const StatusIcon = statusConfig.icon

  return (
    <header className="sticky top-0 z-40  backdrop-blur-xl border-b border-border/50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push("/offers")}
            className="gap-2 rounded-xl hover:bg-muted"
          >
            {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            <span className="hidden sm:inline">{t("Back") || "Back"}</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge 
              className={`${statusConfig.color} text-white px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-lg`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  )
}

export default OfferHeader
