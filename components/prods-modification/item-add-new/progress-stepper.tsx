"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressStepperProps {
  currentStep: number
  steps: Array<{
    id: number
    title: string
    icon: React.ReactNode
  }>
  t: (key: string) => string
}

export function ProgressStepper({ currentStep, steps, t }: ProgressStepperProps) {
  return (
    <div className="w-full py-6 px-4 sm:px-8 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id
          const isLast = index === steps.length - 1
          const nextStepCompleted = currentStep > step.id + 1

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="relative flex flex-col items-center w-full">
                <div
                  className={cn(
                    "relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 transition-all duration-300 z-10 bg-background",
                    isCompleted
                      ? "border-green-500 bg-green-500 text-white shadow-lg shadow-green-500/30"
                      : isActive
                      ? "border-primary bg-primary/10 text-primary shadow-md"
                      : "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <div className="flex items-center justify-center">
                      {step.icon}
                    </div>
                  )}
                </div>

                {/* Step Title */}
                <div
                  className={cn(
                    "mt-2 text-xs sm:text-sm font-medium text-center transition-colors duration-300 whitespace-nowrap",
                    isCompleted ? "text-green-600 font-semibold" : isActive ? "text-primary font-semibold" : "text-muted-foreground"
                  )}
                >
                  {t(step.title) || step.title}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-12 sm:h-14 flex items-center px-3 sm:px-4">
                  <div className="w-full h-1 bg-border rounded-full overflow-hidden relative">
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full transition-all duration-500 ease-in-out",
                        nextStepCompleted || (isCompleted && currentStep >= step.id + 1) ? "bg-green-500" : "bg-border"
                      )}
                      style={{
                        width: nextStepCompleted || (isCompleted && currentStep >= step.id + 1) ? '100%' : '0%'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
