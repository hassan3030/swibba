"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

const iconMap = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
}

const colorMap = {
  default: "bg-primary/10 text-primary border-primary/20",
  destructive: "bg-red-500/10 text-red-500 border-red-500/20",
  success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant = "default", ...props }) => {
        const Icon = iconMap[variant as keyof typeof iconMap] || iconMap.default
        const iconColorClass = colorMap[variant as keyof typeof colorMap] || colorMap.default
        
        return (
          <Toast key={id} variant={variant as any} {...props}>
            <div className="flex items-start gap-3 w-full">
              {/* Icon */}
              <div className={cn(
                "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border",
                iconColorClass
              )}>
                <Icon className="h-4 w-4" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                {title && (
                  <ToastTitle className="font-semibold text-foreground">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-muted-foreground mt-0.5 leading-relaxed">
                    {description}
                  </ToastDescription>
                )}
              </div>
              
              {/* Action */}
              {action && (
                <div className="flex-shrink-0">
                  {action}
                </div>
              )}
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
