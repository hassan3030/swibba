"use client"

import { useLanguage } from "@/lib/language-provider"

const RTLIcon = ({ 
  children, 
  className = "", 
  flipInRTL = true, 
  preserveDirection = false,
  ...props 
}) => {
  const { isRTL } = useLanguage()
  
  const iconClasses = [
    className,
    flipInRTL && isRTL ? "rtl-flip" : "",
    preserveDirection ? "rtl-preserve" : ""
  ].filter(Boolean).join(" ")

  return (
    <span 
      className={iconClasses}
      {...props}
    >
      {children}
    </span>
  )
}

export default RTLIcon
