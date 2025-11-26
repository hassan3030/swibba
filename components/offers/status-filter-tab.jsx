"use client"
import { motion } from "framer-motion"

export default function StatusFilterTab({
  isActive,
  onClick,
  icon: Icon,
  count,
  label,
  activeClasses,
  iconBgClass,
  iconColorClass,
  indicatorClass,
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-300
        ${
          isActive
            ? activeClasses
            : "bg-background/60 border-border/50 hover:bg-muted/50 hover:border-border"
        }
      `}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={`
        w-10 h-10 rounded-xl flex items-center justify-center transition-colors
        ${isActive ? iconBgClass : "bg-muted/50"}
      `}
      >
        <Icon
          className={`w-5 h-5 ${isActive ? iconColorClass : "text-muted-foreground"}`}
        />
      </div>
      <span
        className={`text-lg font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}
      >
        {count}
      </span>
      <span
        className={`text-[10px] sm:text-xs font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="statusIndicator"
          className={`absolute bottom-1 inset-x-0 mx-auto w-8 h-1 ${indicatorClass} rounded-full`}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  )
}
