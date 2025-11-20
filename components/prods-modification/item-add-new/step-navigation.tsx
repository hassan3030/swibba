"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowRight, ArrowLeft, Save, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useRTL } from "@/hooks/use-rtl"

interface StepNavigationProps {
  step: number
  setStep: (step: number) => void
  isStepValid: boolean
  isSubmitting: boolean
  onSubmit: () => void
  getStepMissing: () => string[]
  totalSteps: number
  t: (key: string) => string
}

export function StepNavigation({
  step,
  setStep,
  isStepValid,
  isSubmitting,
  onSubmit,
  getStepMissing,
  totalSteps,
  t,
}: StepNavigationProps) {
  const isLastStep = step === totalSteps
  const [attemptedContinue, setAttemptedContinue] = React.useState(false)
  const { isRTL } = useRTL()

  const handleContinue = () => {
    setAttemptedContinue(true)
    if (isStepValid) {
      setStep(step + 1)
      setAttemptedContinue(false)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
    setAttemptedContinue(false)
  }

  return (
    <motion.div 
      className="space-y-4 pt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isStepValid && !isLastStep && attemptedContinue && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">{t("missing") || "Missing"}: </span>
            {getStepMissing().join(", ")}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4">
        {step > 1 && (
          <Button
            type="button"
            onClick={handleBack}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto py-6 px-8 rounded-2xl border-2 font-semibold hover:bg-primary/10 hover:border-primary transition-all duration-300"
          >
            {isRTL ? (
              <ArrowRight className="ml-2 h-5 w-5" />
            ) : (
              <ArrowLeft className="mr-2 h-5 w-5" />
            )}
            {t("goBack") || "Back"}
          </Button>
        )}
        
        {!isLastStep ? (
          <Button
            type="button"
            onClick={handleContinue}
            disabled={!isStepValid && attemptedContinue}
            size="lg"
            className="w-full py-6 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("continue") || "Continue"}
            {isRTL ? (
              <ArrowLeft className="mr-2 h-5 w-5" />
            ) : (
              <ArrowRight className="ml-2 h-5 w-5" />
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            size="lg"
            className="w-full py-6 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className={isRTL ? "ml-2 h-5 w-5 animate-spin" : "mr-2 h-5 w-5 animate-spin"} />
                {t("Saving") || "Saving..."}
              </>
            ) : (
              <>
                <Save className={isRTL ? "ml-2 h-5 w-5" : "mr-2 h-5 w-5"} />
                {t("save") || "Save Item"}
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  )
}
