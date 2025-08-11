"use client"

import { useLanguage } from "@/lib/language-provider"

const RTLWrapper = ({ children, className = "", preserveDirection = false, ...props }) => {
  const { language, isRTL } = useLanguage()
  
  const direction = isRTL ? "rtl" : "ltr"
  const textAlign = isRTL ? "text-right" : "text-left"
  
  const wrapperClasses = [
    className,
    preserveDirection ? "" : textAlign,
    preserveDirection ? "rtl-preserve" : ""
  ].filter(Boolean).join(" ")

  return (
    <div 
      dir={direction}
      className={wrapperClasses}
      {...props}
    >
      {children}
    </div>
  )
}

export default RTLWrapper
