import { Clock, CheckCircle2, XCircle, Handshake } from "lucide-react"

export function getStatusConfig(status, t) {
  const configs = {
    accepted: { 
      color: "bg-emerald-500", 
      icon: Handshake, 
      label: t("Accepted") || "Accepted",
      bgClass: "from-emerald-500/10 to-green-500/10",
      borderClass: "border-emerald-500/30",
      textClass: "text-emerald-600 dark:text-emerald-400"
    },
    pending: { 
      color: "bg-amber-500", 
      icon: Clock, 
      label: t("Pending") || "Pending",
      bgClass: "from-amber-500/10 to-yellow-500/10",
      borderClass: "border-amber-500/30",
      textClass: "text-amber-600 dark:text-amber-400"
    },
    completed: { 
      color: "bg-blue-500", 
      icon: CheckCircle2, 
      label: t("Completed") || "Completed",
      bgClass: "from-blue-500/10 to-cyan-500/10",
      borderClass: "border-blue-500/30",
      textClass: "text-blue-600 dark:text-blue-400"
    },
    rejected: { 
      color: "bg-red-500", 
      icon: XCircle, 
      label: t("Rejected") || "Rejected",
      bgClass: "from-red-500/10 to-rose-500/10",
      borderClass: "border-red-500/30",
      textClass: "text-red-600 dark:text-red-400"
    }
  }
  return configs[status] || configs.pending
}

export function getPriceDifference(offer, isReceived, t) {
  const cash = offer?.cash_adjustment || 0
  if (cash === 0) return { text: t("Thepriceisequal") || "Equal value", colorClass: "text-muted-foreground" }
  
  const isPositive = cash > 0
  const amount = Math.abs(Math.ceil(cash))
  
  if (isReceived) {
    return isPositive 
      ? { text: `${t("Youpay") || "You pay"}: ${amount} ${t("LE") || "LE"}`, colorClass: "text-red-500" }
      : { text: `${t("Youget") || "You receive"}: ${amount} ${t("LE") || "LE"}`, colorClass: "text-emerald-500" }
  }
  return isPositive 
    ? { text: `${t("Youget") || "You receive"}: ${amount} ${t("LE") || "LE"}`, colorClass: "text-emerald-500" }
    : { text: `${t("Youpay") || "You pay"}: ${amount} ${t("LE") || "LE"}`, colorClass: "text-red-500" }
}
