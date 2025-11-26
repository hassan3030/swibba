"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader, Handshake, CheckCheck, XCircle } from "lucide-react"
import { TbShoppingCartUp } from "react-icons/tb"
import { BiCartDownload } from "react-icons/bi"
import { useTranslations } from "@/lib/use-translations"
import StatusFilterTab from "./status-filter-tab"
import { ReceivedEmptyState, SentEmptyState } from "./offer-empty-states"

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

export default function OffersTabs({
  activeTab,
  onTabChange,
  statusFilter,
  onStatusFilterChange,
  receivedOffers,
  sentOffers,
  renderOfferCard,
}) {
  const { t } = useTranslations()

  const currentOffers = activeTab === "received" ? receivedOffers : sentOffers

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => {
        onTabChange(val)
        onStatusFilterChange("all")
      }}
      className="w-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <TabsList className="grid w-full grid-cols-2 mb-4 p-1.5 bg-muted/50 backdrop-blur-sm rounded-2xl h-auto border border-border/50">
          <TabsTrigger
            value="received"
            className="flex items-center gap-2 py-3 px-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-primary/10 transition-all duration-300"
          >
            <motion.div
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10"
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <BiCartDownload className="h-4 w-4 text-primary" />
            </motion.div>
            <div className="flex flex-col items-start">
              <span className="font-semibold">{t("Received") || "Received"}</span>
              <span className="text-xs text-muted-foreground">
                {receivedOffers.length} {t("offers") || "offers"}
              </span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="sent"
            className="flex items-center gap-2 py-3 px-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-primary/10 transition-all duration-300"
          >
            <motion.div
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/10"
              whileHover={{ rotate: -10 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <TbShoppingCartUp className="h-4 w-4 text-secondary" />
            </motion.div>
            <div className="flex flex-col items-start">
              <span className="font-semibold">{t("Sent") || "Sent"}</span>
              <span className="text-xs text-muted-foreground">
                {sentOffers.length} {t("offers") || "offers"}
              </span>
            </div>
          </TabsTrigger>
        </TabsList>
      </motion.div>

      {/* Status Filter Tabs - Only show when there are offers */}
      {currentOffers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {/* All Status */}
            <StatusFilterTab
              isActive={statusFilter === "all"}
              onClick={() => onStatusFilterChange("all")}
              icon={activeTab === "received" ? BiCartDownload : TbShoppingCartUp}
              count={currentOffers.length}
              label={t("All") || "All"}
              activeClasses="bg-primary/10 border-primary/30 shadow-lg shadow-primary/10"
              iconBgClass="bg-primary/20"
              iconColorClass="text-primary"
              indicatorClass="bg-primary"
            />
            {/* Pending Status */}
            <StatusFilterTab
              isActive={statusFilter === "pending"}
              onClick={() => onStatusFilterChange("pending")}
              icon={Loader}
              count={currentOffers.filter((o) => o.status_offer === "pending").length}
              label={t("Pending") || "Pending"}
              activeClasses="bg-yellow-500/10 border-yellow-500/30 shadow-lg shadow-yellow-500/10"
              iconBgClass="bg-yellow-500/20"
              iconColorClass="text-yellow-500"
              indicatorClass="bg-yellow-500"
            />
            {/* Accepted Status */}
            <StatusFilterTab
              isActive={statusFilter === "accepted"}
              onClick={() => onStatusFilterChange("accepted")}
              icon={Handshake}
              count={currentOffers.filter((o) => o.status_offer === "accepted").length}
              label={t("Accepted") || "Accepted"}
              activeClasses="bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/10"
              iconBgClass="bg-green-500/20"
              iconColorClass="text-green-500"
              indicatorClass="bg-green-500"
            />
            {/* Completed Status */}
            <StatusFilterTab
              isActive={statusFilter === "completed"}
              onClick={() => onStatusFilterChange("completed")}
              icon={CheckCheck}
              count={currentOffers.filter((o) => o.status_offer === "completed").length}
              label={t("Completed") || "Completed"}
              activeClasses="bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/10"
              iconBgClass="bg-blue-500/20"
              iconColorClass="text-blue-500"
              indicatorClass="bg-blue-500"
            />
            {/* Rejected Status */}
            <StatusFilterTab
              isActive={statusFilter === "rejected"}
              onClick={() => onStatusFilterChange("rejected")}
              icon={XCircle}
              count={currentOffers.filter((o) => o.status_offer === "rejected").length}
              label={t("Rejected") || "Rejected"}
              activeClasses="bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/10"
              iconBgClass="bg-red-500/20"
              iconColorClass="text-red-500"
              indicatorClass="bg-red-500"
            />
          </div>
        </motion.div>
      )}

      {/* Received Offers Tab */}
      <TabsContent value="received" className="mt-0 pb-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <AnimatePresence mode="popLayout">
            {[...receivedOffers]
              .filter(
                (offer) =>
                  statusFilter === "all" || offer.status_offer === statusFilter
              )
              .sort((a, b) => new Date(b.date_created) - new Date(a.date_created))
              .map((offer, index) => renderOfferCard(offer, index, true))}
          </AnimatePresence>

          {receivedOffers.filter(
            (offer) =>
              statusFilter === "all" || offer.status_offer === statusFilter
          ).length === 0 && (
            <ReceivedEmptyState
              statusFilter={statusFilter}
              onClearFilter={() => onStatusFilterChange("all")}
            />
          )}
        </motion.div>
      </TabsContent>

      {/* Sent Offers Tab */}
      <TabsContent value="sent" className="mt-0 pb-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <AnimatePresence mode="popLayout">
            {[...sentOffers]
              .filter(
                (offer) =>
                  statusFilter === "all" || offer.status_offer === statusFilter
              )
              .sort((a, b) => new Date(b.date_created) - new Date(a.date_created))
              .map((offer, index) => renderOfferCard(offer, index, false))}
          </AnimatePresence>

          {sentOffers.filter(
            (offer) =>
              statusFilter === "all" || offer.status_offer === statusFilter
          ).length === 0 && (
            <SentEmptyState
              statusFilter={statusFilter}
              onClearFilter={() => onStatusFilterChange("all")}
            />
          )}
        </motion.div>
      </TabsContent>
    </Tabs>
  )
}
