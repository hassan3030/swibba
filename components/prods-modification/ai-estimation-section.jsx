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
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {t("AIValueEstimation") || "AI Value Estimation"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t("EstimatedValue") || "Estimated Value"}
            </label>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={aiPriceEstimation || ""}
                onChange={(e) => onPriceEstimationChange(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="flex-1"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <Button
            type="button"
            onClick={onAiEstimation}
            disabled={isEstimating || !product || product.length < 3}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
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
            <p className="text-xs text-muted-foreground text-center">
              {t("EnterProductNameFirst") || "Enter a product name first to get AI estimation"}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              {t("AIEstimationDescription") || "AI will analyze your product and provide a market value estimate"}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
