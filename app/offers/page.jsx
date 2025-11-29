"use client"
import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowRightLeft, Loader, TrendingUp, Package, Eye, Calendar, MapPin, Clock, Handshake, CheckCircle2, XCircle } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import PageHeader from "@/components/general/page-header"
import { StatCard, StatCardGrid } from "@/components/general/stat-card"
import LoadingSpinner from "@/components/loading/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TbShoppingCartUp } from "react-icons/tb"
import { BiCartDownload } from "react-icons/bi"
import { DataTable } from "@/components/ui/data-table/data-table"
import { StatusBadge, UserCell, DateCell, ActionCell, CountCell } from "@/components/ui/data-table/table-cells"
import { ReceivedEmptyState, SentEmptyState } from "@/components/general/modern-empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { mediaURL } from "@/callAPI/utiles"
import { useOffers } from "@/hooks/use-offers"

export default function OffersPage() {
  const { t } = useTranslations()
  const { isRTL } = useLanguage()
  const router = useRouter()

  const {
    activeTab,
    receivedOffers,
    sentOffers,
    receivedSwapItems,
    sentSwapItems,
    receivedUserSwaps,
    sentUserSwaps,
    myUserId,
    isLoading,
    statusFilter,
    setStatusFilter,
    handleTabChange,
  } = useOffers()

  // Transform offers data for the table
  const transformOffers = (offers, swapItems, userSwaps, isReceived) => {
    return offers.map(offer => {
      const otherUserId = isReceived ? offer.from_user_id : offer.to_user_id
      const myId = isReceived ? offer.to_user_id : offer.from_user_id
      const otherUser = userSwaps.find(u => u.id === otherUserId)
      
      const myItems = swapItems.filter(u => u.offered_by === myId && u.offer_id === offer.id)
      const theirItems = swapItems.filter(u => u.offered_by !== myId && u.offer_id === offer.id)
      
      const myItemsCount = myItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
      const theirItemsCount = theirItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

      // Get preview image
      const previewImage = theirItems[0]?.images?.[0] 
        ? `${mediaURL}${theirItems[0].images[0].directus_files_id}`
        : null

      return {
        ...offer,
        otherUser,
        myItemsCount,
        theirItemsCount,
        previewImage,
        isReceived,
      }
    })
  }

  const receivedData = useMemo(() => 
    transformOffers(receivedOffers, receivedSwapItems, receivedUserSwaps, true),
    [receivedOffers, receivedSwapItems, receivedUserSwaps]
  )

  const sentData = useMemo(() => 
    transformOffers(sentOffers, sentSwapItems, sentUserSwaps, false),
    [sentOffers, sentSwapItems, sentUserSwaps]
  )

  // Filter by status
  const filterByStatus = (data) => {
    if (statusFilter === "all") return data
    return data.filter(offer => offer.status_offer === statusFilter)
  }

  // Table columns configuration
  const columns = [
    {
      key: "otherUser",
      header: t("User") || "User",
      width: "200px",
      render: (item) => {
        const user = item.otherUser
        return (
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Avatar className="h-10 w-10 border-2 border-border flex-shrink-0">
              <AvatarImage 
                src={user?.avatar ? `${mediaURL}${user.avatar}` : ""} 
                alt={user?.first_name || "User"} 
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user?.first_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className={`min-w-0 ${isRTL ? "text-right" : ""}`}>
              <p className="font-medium text-foreground truncate">
                {`${user?.first_name || ""} ${user?.last_name || ""}`.trim().slice(0, 20) || t("User")}
              </p>
              <p className={`text-xs text-muted-foreground truncate flex items-center gap-1 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                <MapPin className="h-3 w-3" />
                {user?.city || user?.country || t("noAddress") || "No address"}
              </p>
            </div>
          </div>
        )
      },
      sortable: true,
      sortValue: (item) => item.otherUser?.first_name || "",
    },
    {
      key: "status_offer",
      header: t("Status") || "Status",
      width: "120px",
      align: "center",
      render: (item) => <StatusBadge status={item.status_offer} t={t} />,
      sortable: true,
    },
    {
      key: "items",
      header: t("Items") || "Items",
      width: "150px",
      align: "center",
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {item.myItemsCount}
          </Badge>
          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          <Badge variant="secondary" className="bg-secondary/10 text-secondary">
            {item.theirItemsCount}
          </Badge>
        </div>
      ),
      sortable: false,
    },
    {
      key: "cash_adjustment",
      header: t("Cash") || "Cash",
      width: "120px",
      align: "center",
      render: (item) => {
        const cash = item.cash_adjustment || 0
        if (cash === 0) return <span className="text-muted-foreground">-</span>
        const isPositive = cash > 0
        return (
          <span className={isPositive ? "text-destructive font-medium" : "text-green-500 font-medium"}>
            {isPositive ? "+" : ""}{Math.ceil(cash)} {t("LE") || "LE"}
          </span>
        )
      },
      sortable: true,
      sortValue: (item) => item.cash_adjustment || 0,
    },
    {
      key: "date_created",
      header: t("Date") || "Date",
      width: "120px",
      align: "center",
      render: (item) => <DateCell date={item.date_created} format="short" />,
      sortable: true,
      sortValue: (item) => new Date(item.date_created).getTime(),
    },
    {
      key: "actions",
      header: t("Actions") || "Actions",
      width: "100px",
      align: "center",
      sortable: false,
      render: (item) => (
        <ActionCell
          item={item}
          actions={[
            {
              icon: Eye,
              label: t("View") || "View",
              onClick: () => router.push(`/offers/${item.id}`),
              variant: "ghost",
              className: "text-primary hover:text-primary hover:bg-primary/10",
            },
          ]}
        />
      ),
    },
  ]

  // Mobile card renderer
  const renderOfferCard = (item, index) => (
    <Card 
      className="border-border/50 hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => router.push(`/offers/${item.id}`)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarImage 
                src={item.otherUser?.avatar ? `${mediaURL}${item.otherUser.avatar}` : ""} 
                alt={item.otherUser?.first_name || "User"} 
              />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {item.otherUser?.first_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                {`${item.otherUser?.first_name || ""} ${item.otherUser?.last_name || ""}`.trim().slice(0, 20) || t("User")}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {item.otherUser?.city || item.otherUser?.country || t("noAddress") || "No address"}
              </p>
            </div>
          </div>
          <StatusBadge status={item.status_offer} t={t} />
        </div>

        {/* Items Exchange */}
        <div className="flex items-center justify-between py-3 border-y border-border/50">
          <div className="flex items-center gap-2">
            {item.previewImage && (
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-border">
                <img src={item.previewImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {item.myItemsCount} {t("items") || "items"}
              </Badge>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                {item.theirItemsCount} {t("items") || "items"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(item.date_created).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })}
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 gap-1">
            <Eye className="h-4 w-4" />
            {t("ViewDetails") || "View Details"}
          </Button>
        </div>

        {/* Cash Adjustment */}
        {item.cash_adjustment !== 0 && (
          <div className={`mt-2 text-sm font-medium ${item.cash_adjustment > 0 ? "text-destructive" : "text-green-500"}`}>
            {item.cash_adjustment > 0
              ? `${t("Youpay") || "You pay"}: ${Math.abs(Math.ceil(item.cash_adjustment))} ${t("LE") || "LE"}`
              : `${t("Youget") || "You get"}: ${Math.abs(Math.ceil(item.cash_adjustment))} ${t("LE") || "LE"}`}
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Status filter tabs component
  const StatusFilterTabs = ({ offers }) => {
    const statusCounts = {
      all: offers.length,
      pending: offers.filter(o => o.status_offer === "pending").length,
      accepted: offers.filter(o => o.status_offer === "accepted").length,
      completed: offers.filter(o => o.status_offer === "completed").length,
      rejected: offers.filter(o => o.status_offer === "rejected").length,
    }

    const filters = [
      { key: "all", label: t("All") || "All", icon: Package, color: "primary" },
      { key: "pending", label: t("Pending") || "Pending", icon: Clock, color: "yellow-500" },
      { key: "accepted", label: t("Accepted") || "Accepted", icon: Handshake, color: "green-500" },
      { key: "completed", label: t("Completed") || "Completed", icon: CheckCircle2, color: "blue-500" },
      { key: "rejected", label: t("Rejected") || "Rejected", icon: XCircle, color: "red-500" },
    ]

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map(filter => {
          const Icon = filter.icon
          const isActive = statusFilter === filter.key
          return (
            <Button
              key={filter.key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(filter.key)}
              className={`gap-2 ${isActive ? "" : "hover:bg-muted/50"}`}
            >
              <Icon className="h-4 w-4" />
              {filter.label}
              <Badge variant="secondary" className={`ml-1 ${isActive ? "bg-white/20 text-white" : ""}`}>
                {statusCounts[filter.key]}
              </Badge>
            </Button>
          )
        })}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-4 bg-background dark:bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-gray-950 dark:via-gray-950 dark:to-primary/10">
      {/* Hero Header Section */}
      <PageHeader
        icon={ArrowRightLeft}
        title={isRTL ? "عروضك" : "Your Offers"}
        description={
          isRTL
            ? "إدارة جميع مبادلاتك في مكان واحد. تابع العروض المستلمة والمرسلة وأكمل عمليات التبادل بسهولة."
            : "Manage all your swaps in one place. Track received and sent offers and complete exchanges easily."
        }
        iconAnimation="flip"
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Quick Stats Cards */}
        <StatCardGrid className="mb-8">
          <StatCard
            icon={Package}
            value={receivedOffers.length + sentOffers.length}
            label={t("TotalOffers") || "Total Offers"}
            color="text-primary"
            bgColor="bg-primary/10"
            borderColor="border-primary/20"
            glowColor="from-primary/20 to-primary/10"
          />
          <StatCard
            icon={Loader}
            value={
              [...receivedOffers, ...sentOffers].filter(
                (o) => o.status_offer === "pending"
              ).length
            }
            label={t("Pending") || "Pending"}
            color="text-yellow-500"
            bgColor="bg-yellow-500/10"
            borderColor="border-yellow-500/20"
            glowColor="from-yellow-500/20 to-yellow-500/10"
          />
          <StatCard
            icon={TrendingUp}
            value={
              [...receivedOffers, ...sentOffers].filter(
                (o) => o.status_offer === "accepted"
              ).length
            }
            label={t("Active") || "Active"}
            color="text-green-500"
            bgColor="bg-green-500/10"
            borderColor="border-green-500/20"
            glowColor="from-green-500/20 to-green-500/10"
          />
          <StatCard
            icon={ArrowRightLeft}
            value={
              [...receivedOffers, ...sentOffers].filter(
                (o) => o.status_offer === "completed"
              ).length
            }
            label={t("Completed") || "Completed"}
            color="text-blue-500"
            bgColor="bg-blue-500/10"
            borderColor="border-blue-500/20"
            glowColor="from-blue-500/20 to-blue-500/10"
          />
        </StatCardGrid>

        {/* Tabs with DataTable */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            handleTabChange(val)
            setStatusFilter("all")
          }}
          className="w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 p-1.5 bg-muted/50 backdrop-blur-sm rounded-2xl h-auto border border-border/50">
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

          {/* Received Offers Tab */}
          <TabsContent value="received" className="mt-0 pb-6">
            <StatusFilterTabs offers={receivedData} />
            <DataTable
              data={filterByStatus(receivedData)}
              columns={columns}
              isLoading={isLoading}
              searchable={true}
              searchKeys={["otherUser.first_name", "otherUser.last_name", "otherUser.city"]}
              searchPlaceholder={t("searchOffers") || "Search offers..."}
              sortable={true}
              paginated={true}
              pageSize={10}
              showViewToggle={true}
              renderCard={renderOfferCard}
              onRowClick={(item) => router.push(`/offers/${item.id}`)}
              isRTL={isRTL}
              t={t}
              emptyState={
                <ReceivedEmptyState 
                  statusFilter={statusFilter} 
                  onClearFilter={() => setStatusFilter("all")} 
                />
              }
            />
          </TabsContent>

          {/* Sent Offers Tab */}
          <TabsContent value="sent" className="mt-0 pb-6">
            <StatusFilterTabs offers={sentData} />
            <DataTable
              data={filterByStatus(sentData)}
              columns={columns}
              isLoading={isLoading}
              searchable={true}
              searchKeys={["otherUser.first_name", "otherUser.last_name", "otherUser.city"]}
              searchPlaceholder={t("searchOffers") || "Search offers..."}
              sortable={true}
              paginated={true}
              pageSize={10}
              showViewToggle={true}
              renderCard={renderOfferCard}
              onRowClick={(item) => router.push(`/offers/${item.id}`)}
              isRTL={isRTL}
              t={t}
              emptyState={
                <SentEmptyState 
                  statusFilter={statusFilter} 
                  onClearFilter={() => setStatusFilter("all")} 
                />
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
