"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Loader2, TrendingUp, Package, DollarSign, CheckCircle2, MapPin, Image as ImageIcon } from "lucide-react"
import { motion } from "framer-motion"

interface AiEstimationSectionProps {
  aiPriceEstimation: number | null
  isEstimating: boolean
  aiPriceEstimationHint: boolean
  requestAiPriceEstimate: () => void
  formData: any
  images: File[]
  t: (key: string) => string
}

export function AiEstimationSection({
  aiPriceEstimation,
  isEstimating,
  aiPriceEstimationHint,
  requestAiPriceEstimate,
  formData,
  images,
  t,
}: AiEstimationSectionProps) {
  const hasEstimation = aiPriceEstimation !== null && aiPriceEstimation > 0

  return (
    <div className="space-y-6">
      {/* AI Estimation Card */}
      <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{t("AIEstimation") || "AI Price Estimation"}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    {t("GetAIpoweredvaluation") || "Get an AI-powered valuation of your item"}
                  </CardDescription>
                </div>
              </div>
              {hasEstimation && (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {t("Estimated") || "Estimated"}
                </Badge>
              )}
            </div>
          </CardHeader>
        </div>

        <CardContent className="space-y-6 pt-6">
          {!hasEstimation ? (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("ReadyToEstimate") || "Ready to Get Your Item Valued?"}
                </h3>
                <p className="text-foreground/60 max-w-md mx-auto">
                  {t("AIAnalyzeDescription") || "Our AI will analyze your item details, photos, and market data to provide an accurate price estimation."}
                </p>
              </div>
              <Button
                type="button"
                onClick={requestAiPriceEstimate}
                disabled={isEstimating}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isEstimating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("Analyzing") || "Analyzing..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    {t("GetAIEstimate") || "Get AI Estimate"}
                  </>
                )}
              </Button>
              <p className="text-xs text-foreground/50">
                {t("FreeInstant") || "Free & Instant • Powered by Advanced AI"}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Estimated Value Display */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
                <div className="text-center">
                  <p className="text-sm text-foreground/60 mb-2">{t("EstimatedValue") || "Estimated Value"}</p>
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <span className="text-5xl font-bold text-green-600">{aiPriceEstimation}</span>
                    <span className="text-2xl text-foreground/60">{t("le") || "LE"}</span>
                  </div>
                  <p className="text-xs text-foreground/50 mt-2">
                    {t("BasedOnMarketAnalysis") || "Based on market analysis and item condition"}
                  </p>
                </div>
              </div>

              {/* Item Summary */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {t("ItemSummary") || "Item Summary"}
                </h4>
                <div className="space-y-3 bg-muted/30 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-foreground/60">{t("Name") || "Name"}:</span>
                    <span className="text-sm font-medium text-foreground text-right max-w-[60%]">{formData.name || "-"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-foreground/60">{t("category") || "Category"}:</span>
                    <span className="text-sm font-medium text-foreground">{formData.category || "-"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-foreground/60">{t("Condition") || "Condition"}:</span>
                    <Badge variant="secondary">{formData.status_item || "-"}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-foreground/60">{t("YourPrice") || "Your Price"}:</span>
                    <span className="text-sm font-medium text-foreground">{formData.price ? `${formData.price} LE` : "-"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-foreground/60 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {t("Location") || "Location"}:
                    </span>
                    <span className="text-sm font-medium text-foreground text-right max-w-[60%]">
                      {formData.city && formData.country ? `${formData.city}, ${formData.country}` : "-"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-foreground/60 flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {t("Photos") || "Photos"}:
                    </span>
                    <span className="text-sm font-medium text-foreground">{images.length} {t("images") || "images"}</span>
                  </div>
                </div>
              </div>

              {/* Re-estimate Button */}
              <Button
                type="button"
                variant="outline"
                onClick={requestAiPriceEstimate}
                disabled={isEstimating}
                className="w-full border-2 hover:border-primary"
              >
                {isEstimating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("Reanalyzing") || "Re-analyzing..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t("RefreshEstimate") || "Refresh Estimate"}
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
