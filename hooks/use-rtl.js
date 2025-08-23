"use client"
import { useLanguage } from "@/lib/language-provider"
import { rtlUtils, rtlCSS } from "@/lib/rtl-utils"

export const useRTL = () => {
  const { isRTL, language } = useLanguage()
  
  return {
    // Direction state
    isRTL,
    language,
    direction: isRTL ? 'rtl' : 'ltr',
    
    // Utility functions
    utils: rtlUtils,
    css: rtlCSS,
    
    // Common RTL classes
    classes: {
      // Layout
      container: 'flex rtl:flex-row-reverse',
      grid: 'grid rtl:grid-flow-row-dense',
      
      // Spacing
      spaceX: (size) => `space-x-${size} rtl:space-x-reverse`,
      spaceY: (size) => `space-y-${size}`,
      
      // Margins
      marginStart: (size) => isRTL ? `mr-${size} ml-0` : `ml-${size} mr-0`,
      marginEnd: (size) => isRTL ? `ml-${size} mr-0` : `mr-${size} ml-0`,
      
      // Padding
      paddingStart: (size) => isRTL ? `pr-${size} pl-0` : `pl-${size} pr-0`,
      paddingEnd: (size) => isRTL ? `pl-${size} pr-0` : `pr-${size} pl-0`,
      
      // Positioning
      left: (size) => isRTL ? `right-${size} left-auto` : `left-${size} right-auto`,
      right: (size) => isRTL ? `left-${size} right-auto` : `right-${size} left-auto`,
      
      // Borders
      borderStart: (size, color) => isRTL ? `border-r-${size} border-l-0 ${color}` : `border-l-${size} border-r-0 ${color}`,
      borderEnd: (size, color) => isRTL ? `border-l-${size} border-r-0 ${color}` : `border-r-${size} border-l-0 ${color}`,
      
      // Rounded corners
      roundedStart: (size) => isRTL ? `rounded-r-${size} rounded-l-none` : `rounded-l-${size} rounded-r-none`,
      roundedEnd: (size) => isRTL ? `rounded-l-${size} rounded-r-none` : `rounded-r-${size} rounded-l-none`,
      
      // Text alignment
      textStart: 'text-left rtl:text-right',
      textEnd: 'text-right rtl:text-left',
      textCenter: 'text-center',
      
      // Flexbox
      justifyStart: 'justify-start rtl:justify-end',
      justifyEnd: 'justify-end rtl:justify-start',
      justifyCenter: 'justify-center',
      justifyBetween: 'justify-between',
      
      itemsStart: 'items-start rtl:items-end',
      itemsEnd: 'items-end rtl:items-start',
      itemsCenter: 'items-center',
      
      // Self alignment
      selfStart: 'self-start rtl:self-end',
      selfEnd: 'self-end rtl:self-start',
      selfCenter: 'self-center',
    },
    
    // Dynamic styles
    styles: {
      marginStart: (size) => rtlCSS.getSpacing(isRTL ? 'rtl' : 'ltr', size),
      marginEnd: (size) => rtlCSS.getSpacing(isRTL ? 'rtl' : 'ltr', size),
      paddingStart: (size) => rtlCSS.getSpacing(isRTL ? 'rtl' : 'ltr', size),
      paddingEnd: (size) => rtlCSS.getSpacing(isRTL ? 'rtl' : 'ltr', size),
      position: (property, value) => rtlCSS.getPosition(isRTL ? 'rtl' : 'ltr', property, value),
      transform: (value) => rtlCSS.getTransform(isRTL ? 'rtl' : 'ltr', value),
    },
    
    // Helper functions
    getDirectionClass: (ltrClass, rtlClass) => isRTL ? rtlClass : ltrClass,
    getDirectionValue: (ltrValue, rtlValue) => isRTL ? rtlValue : ltrValue,
    
    // Conditional rendering
    renderRTL: (rtlContent, ltrContent) => isRTL ? rtlContent : ltrContent,
    
    // Animation helpers
    getSlideDirection: (from = 'left') => {
      if (from === 'left') return isRTL ? 'right' : 'left'
      if (from === 'right') return isRTL ? 'left' : 'right'
      return from
    },
    
    getTransformDirection: (value) => {
      if (value.includes('translateX')) {
        return isRTL ? value.replace('translateX', '-translateX') : value
      }
      return value
    }
  }
}

export default useRTL
