"use client"
import { motion } from "framer-motion"
import { Loader, Handshake, CheckCheck, BadgeX, TrendingUp } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"

const statsVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const iconColors = {
  total: {
    bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/10",
    icon: "text-blue-500",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/10",
  },
  pending: {
    bg: "bg-gradient-to-br from-yellow-500/20 to-amber-500/10",
    icon: "text-yellow-500",
    border: "border-yellow-500/20",
    glow: "shadow-yellow-500/10",
  },
  accepted: {
    bg: "bg-gradient-to-br from-green-500/20 to-emerald-500/10",
    icon: "text-green-500",
    border: "border-green-500/20",
    glow: "shadow-green-500/10",
  },
  completed: {
    bg: "bg-gradient-to-br from-sky-500/20 to-cyan-500/10",
    icon: "text-sky-500",
    border: "border-sky-500/20",
    glow: "shadow-sky-500/10",
  },
  rejected: {
    bg: "bg-gradient-to-br from-red-500/20 to-rose-500/10",
    icon: "text-red-500",
    border: "border-red-500/20",
    glow: "shadow-red-500/10",
  },
}

export default function OfferStats({ offers, icon: Icon, label }) {
  const { t } = useTranslations()

  const stats = [
    {
      count: offers.length,
      icon: Icon,
      label: label,
      colorKey: "total",
    },
    {
      count: offers.filter((o) => o.status_offer === "pending").length,
      icon: Loader,
      label: t("pending") || "Pending",
      colorKey: "pending",
    },
    {
      count: offers.filter((o) => o.status_offer === "accepted").length,
      icon: Handshake,
      label: t("accepted") || "Accepted",
      colorKey: "accepted",
    },
    {
      count: offers.filter((o) => o.status_offer === "completed").length,
      icon: CheckCheck,
      label: t("completed") || "Completed",
      colorKey: "completed",
    },
    {
      count: offers.filter((o) => o.status_offer === "rejected").length,
      icon: BadgeX,
      label: t("rejected") || "Rejected",
      colorKey: "rejected",
    },
  ]

  return (
    <motion.div
      className="mb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => {
        const colors = iconColors[stat.colorKey]
        return (
          <motion.div
            key={index}
            variants={statsVariants}
            className={`
              relative group cursor-pointer
              bg-background/60 backdrop-blur-sm 
              rounded-2xl border ${colors.border}
              p-4 flex flex-col items-center 
              hover:shadow-xl ${colors.glow}
              transition-all duration-300
              overflow-hidden
            `}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
              <motion.div 
                className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center mb-2`}
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <stat.icon className={`w-5 h-5 ${colors.icon}`} />
              </motion.div>
              
              <motion.span 
                className="text-2xl font-bold text-foreground"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {stat.count === 0 ? "0" : stat.count}
              </motion.span>
              
              <span className="text-xs text-muted-foreground font-medium text-center mt-1 line-clamp-1">
                {stat.label}
              </span>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

