"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-provider"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

/**
 * StatCard - A reusable stat card component
 * @param {Object} props
 * @param {React.ElementType} props.icon - Lucide icon component
 * @param {string|number} props.value - The stat value to display
 * @param {string} props.label - The label text
 * @param {string} props.color - Tailwind text color class (e.g., "text-primary", "text-blue-500")
 * @param {string} props.bgColor - Tailwind background color class for icon container
 * @param {string} props.borderColor - Tailwind border color class
 * @param {string} props.glowColor - Tailwind gradient color for glow effect
 * @param {boolean} props.isRating - If true, formats value as rating (e.g., 5.0)
 */
export function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  color = "text-primary",
  bgColor = "bg-primary/10",
  borderColor = "border-primary/20",
  glowColor = "from-primary/20 to-primary/10",
  isRating = false
}) {
  const { isRTL } = useLanguage()

  const displayValue = isRating && typeof value === 'number' && value > 0 
    ? value.toFixed(1) 
    : value

  return (
    <motion.div
      className="relative group"
      variants={fadeInUp}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${glowColor} rounded-2xl blur-xl group-hover:blur-2xl transition-all`} />
      <div className={`relative bg-background/80 backdrop-blur-sm border ${borderColor} rounded-2xl p-4 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
          {Icon && <Icon className={`w-6 h-6 ${color}`} />}
        </div>
        <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
          <div className={`text-2xl font-bold text-foreground leading-tight ${isRating ? color : ''}`}>
            {displayValue}
          </div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * StatCardGrid - A container for stat cards with stagger animation
 * @param {Object} props
 * @param {React.ReactNode} props.children - StatCard components
 * @param {string} props.className - Additional classes
 */
export function StatCardGrid({ children, className = "" }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}
    >
      {children}
    </motion.div>
  )
}
