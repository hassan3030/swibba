"use client"
import { AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function OfferNotFound({ router, t }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">{t("Offer not found") || "Offer not found"}</h2>
        <p className="text-muted-foreground mb-6">{t("OfferNotFoundDesc") || "This offer may have been deleted or doesn't exist."}</p>
        <Button onClick={() => router.push("/offers")} className="rounded-xl">
          {t("Back to offers") || "Back to offers"}
        </Button>
      </Card>
    </div>
  )
}

export default OfferNotFound
