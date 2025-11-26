"use client"
import { motion } from "framer-motion"
import { Check, Package, ArrowLeftRight, CheckCircle } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"
import { useRTL } from "@/hooks/use-rtl"

const SwapProgressSteps = ({ currentStep = 1, selectedMyItemsCount = 0, selectedOtherItemsCount = 0 }) => {
  const { t } = useTranslations()
  const { isRTL } = useRTL()

  const steps = [
    {
      id: 1,
      title: t("SelectTheirItem") || "Select Their Item",
      description: t("ChooseItemYouWant") || "Choose the item you want",
      icon: Package,
      completed: selectedOtherItemsCount > 0,
      active: currentStep === 1,
    },
    {
      id: 2,
      title: t("SelectYourItems") || "Select Your Items",
      description: t("ChooseWhatToOffer") || "Choose what to offer",
      icon: ArrowLeftRight,
      completed: selectedMyItemsCount > 0,
      active: currentStep === 2,
    },
    {
      id: 3,
      title: t("ConfirmSwap") || "Confirm Swap",
      description: t("ReviewAndSubmit") || "Review and submit",
      icon: CheckCircle,
      completed: false,
      active: currentStep === 3,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <div className={`flex items-center justify-center gap-2 md:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {steps.map((step, index) => (
          <div key={step.id} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Step indicator */}
            <motion.div
              className={`relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 ${
                step.completed
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : step.active
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground"
              }`}
              whileHover={{ scale: 1.05 }}
              animate={step.active ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: step.active ? Infinity : 0 }}
            >
              {step.completed ? (
                <Check className="h-5 w-5 md:h-6 md:w-6" />
              ) : (
                <step.icon className="h-5 w-5 md:h-6 md:w-6" />
              )}
              
              {/* Active pulse effect */}
              {step.active && !step.completed && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Step label - hidden on mobile */}
            <div className={`hidden md:block ${isRTL ? 'mr-3' : 'ml-3'}`}>
              <p className={`text-sm font-medium ${
                step.completed || step.active ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {step.description}
              </p>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={`w-8 md:w-16 h-0.5 mx-2 md:mx-4 ${
                steps[index + 1].completed || steps[index + 1].active
                  ? "bg-primary"
                  : "bg-muted"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile step labels */}
      <div className="md:hidden mt-4 text-center">
        <p className="text-sm font-medium text-foreground">
          {steps.find(s => s.active)?.title || steps[0].title}
        </p>
        <p className="text-xs text-muted-foreground">
          {steps.find(s => s.active)?.description || steps[0].description}
        </p>
      </div>
    </motion.div>
  )
}

export default SwapProgressSteps
