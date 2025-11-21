"use client"
import { motion } from "framer-motion"
import { Loader, Handshake, CheckCheck, BadgeX } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"

const statsVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
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
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export default function OfferStats({ offers, icon: Icon, label }) {
  const { t } = useTranslations()

  const stats = [
    {
      count: offers.length,
      icon: Icon,
      label: label,
      color: "text-blue-500",
    },
    {
      count: offers.filter((o) => o.status_offer === "pending").length,
      icon: Loader,
      label: t("pending") || "Pending",
      color: "text-yellow-500",
    },
    {
      count: offers.filter((o) => o.status_offer === "accepted").length,
      icon: Handshake,
      label: t("accepted") || "Accepted",
      color: "text-green-500",
    },
    {
      count: offers.filter((o) => o.status_offer === "completed").length,
      icon: CheckCheck,
      label: t("completed") || "Completed",
      color: "text-blue-500",
    },
    {
      count: offers.filter((o) => o.status_offer === "rejected").length,
      icon: BadgeX,
      label: t("rejected") || "Rejected",
      color: "text-destructive",
    },
  ]

  return (
    <motion.div
      className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          variants={statsVariants}
          className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow"
          whileHover={{ y: -2 }}
        >
          <span className="text-lg font-bold">{stat.count === 0 ? t("no") || "No" : stat.count}</span>
          <stat.icon className={`w-5 h-5 ${stat.color}`} />
          <span className="text-xs text-muted-foreground">{stat.label}</span>
        </motion.div>
      ))}
    </motion.div>
  )
}

