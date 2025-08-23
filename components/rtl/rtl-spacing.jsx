"use client"
import { useLanguage } from "@/lib/language-provider"
import { cn } from "@/lib/utils"

// RTL-aware margin components
export const RTLMarginStart = ({ children, size = "4", className = "", ...props }) => {
  const { isRTL } = useLanguage()
  
  const marginClasses = isRTL 
    ? `mr-${size} ml-0` 
    : `ml-${size} mr-0`
  
  return (
    <div className={cn(marginClasses, className)} {...props}>
      {children}
    </div>
  )
}

export const RTLMarginEnd = ({ children, size = "4", className = "", ...props }) => {
  const { isRTL } = useLanguage()
  
  const marginClasses = isRTL 
    ? `ml-${size} mr-0` 
    : `mr-${size} ml-0`
  
  return (
    <div className={cn(marginClasses, className)} {...props}>
      {children}
    </div>
  )
}

// RTL-aware padding components
export const RTLPaddingStart = ({ children, size = "4", className = "", ...props }) => {
  const { isRTL } = useLanguage()
  
  const paddingClasses = isRTL 
    ? `pr-${size} pl-0` 
    : `pl-${size} pr-0`
  
  return (
    <div className={cn(paddingClasses, className)} {...props}>
      {children}
    </div>
  )
}

export const RTLPaddingEnd = ({ children, size = "4", className = "", ...props }) => {
  const { isRTL } = useLanguage()
  
  const paddingClasses = isRTL 
    ? `pl-${size} pr-0` 
    : `pr-${size} pl-0`
  
  return (
    <div className={cn(paddingClasses, className)} {...props}>
      {children}
    </div>
  )
}

// RTL-aware spacing utilities
export const RTLSpaceX = ({ children, size = "4", className = "", ...props }) => {
  const { isRTL } = useLanguage()
  
  const spaceClasses = `space-x-${size} ${isRTL ? 'rtl:space-x-reverse' : ''}`
  
  return (
    <div className={cn(spaceClasses, className)} {...props}>
      {children}
    </div>
  )
}

export const RTLSpaceY = ({ children, size = "4", className = "", ...props }) => {
  return (
    <div className={cn(`space-y-${size}`, className)} {...props}>
      {children}
    </div>
  )
}

// RTL-aware positioning
export const RTLPositionStart = ({ children, className = "", ...props }) => {
  const { isRTL } = useLanguage()
  
  const positionClasses = isRTL 
    ? 'right-0 left-auto' 
    : 'left-0 right-auto'
  
  return (
    <div className={cn('absolute', positionClasses, className)} {...props}>
      {children}
    </div>
  )
}

export const RTLPositionEnd = ({ children, className = "", ...props }) => {
  const { isRTL } = useLanguage()
  
  const positionClasses = isRTL 
    ? 'left-0 right-auto' 
    : 'right-0 left-auto'
  
  return (
    <div className={cn('absolute', positionClasses, className)} {...props}>
      {children}
    </div>
  )
}

// RTL-aware border components
export const RTLBorderStart = ({ children, size = "2", color = "border-gray-300", className = "", ...props }) => {
  const { isRTL } = useLanguage()
  
  const borderClasses = isRTL 
    ? `border-r-${size} border-l-0 ${color}` 
    : `border-l-${size} border-r-0 ${color}`
  
  return (
    <div className={cn(borderClasses, className)} {...props}>
      {children}
    </div>
  )
}

export const RTLBorderEnd = ({ children, size = "2", color = "border-gray-300", className = "", ...props }) => {
  const { isRTL } = useLanguage()
  
  const borderClasses = isRTL 
    ? `border-l-${size} border-r-0 ${color}` 
    : `border-r-${size} border-l-0 ${color}`
  
  return (
    <div className={cn(borderClasses, className)} {...props}>
      {children}
    </div>
  )
}

// RTL-aware rounded corners
export const RTLRoundedStart = ({ children, size = "lg", className = "", ...props }) => {
  const { isRTL } = useLanguage()
  
  const roundedClasses = isRTL 
    ? `rounded-r-${size} rounded-l-none` 
    : `rounded-l-${size} rounded-r-none`
  
  return (
    <div className={cn(roundedClasses, className)} {...props}>
      {children}
    </div>
  )
}

export const RTLRoundedEnd = ({ children, size = "lg", className = "", ...props }) => {
  const { isRTL } = useLanguage()
  
  const roundedClasses = isRTL 
    ? `rounded-l-${size} rounded-r-none` 
    : `rounded-r-${size} rounded-l-none`
  
  return (
    <div className={cn(roundedClasses, className)} {...props}>
      {children}
    </div>
  )
}
