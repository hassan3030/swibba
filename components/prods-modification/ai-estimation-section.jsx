import { motion } from "framer-motion"
import { DollarSign, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useTranslations } from "@/lib/use-translations"

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
}

export const AIEstimationSection = ({
  aiPriceEstimation,
  isEstimating,
  product,
  onAiEstimation,
  onPriceEstimationChange
}) => {
  const { t } = useTranslations()

  return (
    <motion.div variants={cardVariants}>
      <Card className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-primary">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("AIValueEstimation") || "AI Value Estimation"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("EstimatedValue") || "Estimated Value"}
            </label>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <Input
                type="number"
                value={aiPriceEstimation || ""}
                onChange={(e) => onPriceEstimationChange(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="flex-1 bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <Button
            type="button"
            onClick={onAiEstimation}
            disabled={isEstimating || !product || product.length < 3}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            variant="default"
          >
            {isEstimating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("GettingAIEstimation") || "Getting AI Estimation..."}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t("GetAIEstimate") || "Get AI Estimate"}
              </>
            )}
          </Button>
          
          {!product || product.length < 3 ? (
            <p className="text-xs text-foreground/70 text-center">
              {t("EnterProductNameFirst") || "Enter a product name first to get AI estimation"}
            </p>
          ) : (
            <p className="text-xs text-foreground/70 text-center">
              {t("AIEstimationDescription") || "AI will analyze your product and provide a market value estimate"}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
