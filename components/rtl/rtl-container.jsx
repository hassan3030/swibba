"use client"
import { useLanguage } from "@/lib/language-provider"
import { rtlUtils } from "@/lib/rtl-utils"
import { cn } from "@/lib/utils"

export const RTLContainer = ({ 
  children, 
  className = "", 
  direction = "auto",
  spacing = "default",
  ...props 
}) => {
  const { isRTL } = useLanguage()
  const currentDirection = direction === "auto" ? (isRTL ? "rtl" : "ltr") : direction
  
  const baseClasses = "w-full"
  const directionClasses = rtlUtils.flexDirection.row
  
  const spacingClasses = {
    default: "space-x-4 rtl:space-x-reverse",
    tight: "space-x-2 rtl:space-x-reverse", 
    loose: "space-x-6 rtl:space-x-reverse",
    none: ""
  }[spacing]
  
  return (
    <div 
      className={cn(
        baseClasses,
        directionClasses,
        spacingClasses,
        className
      )}
      dir={currentDirection}
      {...props}
    >
      {children}
    </div>
  )
}

export const RTLFlexContainer = ({ 
  children, 
  className = "", 
  justify = "start",
  items = "center",
  direction = "auto",
  ...props 
}) => {
  const { isRTL } = useLanguage()
  const currentDirection = direction === "auto" ? (isRTL ? "rtl" : "ltr") : direction
  
  const baseClasses = "flex w-full"
  const justifyClasses = rtlUtils.justify[justify]
  const itemsClasses = rtlUtils.items[items]
  const directionClasses = rtlUtils.flexDirection.row
  
  return (
    <div 
      className={cn(
        baseClasses,
        justifyClasses,
        itemsClasses,
        directionClasses,
        className
      )}
      dir={currentDirection}
      {...props}
    >
      {children}
    </div>
  )
}

export const RTLGridContainer = ({ 
  children, 
  className = "", 
  cols = 1,
  gap = "default",
  direction = "auto",
  ...props 
}) => {
  const { isRTL } = useLanguage()
  const currentDirection = direction === "auto" ? (isRTL ? "rtl" : "ltr") : direction
  
  const baseClasses = "grid w-full"
  const colsClasses = `grid-cols-${cols}`
  const gapClasses = {
    default: "gap-4",
    tight: "gap-2",
    loose: "gap-6",
    none: ""
  }[gap]
  
  return (
    <div 
      className={cn(
        baseClasses,
        colsClasses,
        gapClasses,
        className
      )}
      dir={currentDirection}
      {...props}
    >
      {children}
    </div>
  )
}
