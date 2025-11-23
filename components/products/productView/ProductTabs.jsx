"use client"
import { motion } from "framer-motion"
import { MapPin, Calendar, Package, ShieldCheck, BadgeX } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

function DetailRow({ icon, label, value, valueClassName = "", capitalize = false }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-4 py-4 px-4 rounded-xl hover:bg-muted/30 transition-all duration-200 group border border-transparent hover:border-border/50"
    >
      {icon && (
        <div className="text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors duration-200">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className={`text-base text-foreground break-words leading-relaxed font-medium ${capitalize ? 'capitalize' : ''} ${valueClassName}`}>
          {value}
        </p>
      </div>
    </motion.div>
  )
}

export function ProductTabs({ product, isRTL, t }) {
  return (
    <motion.div variants={fadeInUp} className="mt-8">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-2 bg-muted/30 rounded-2xl border">
          <TabsTrigger 
            value="details" 
            className="text-sm font-semibold rounded-xl py-3 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all duration-200"
          >
            {t("details") || "Details"}
          </TabsTrigger>
          <TabsTrigger 
            value="specs" 
            className="text-sm font-semibold rounded-xl py-3 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all duration-200"
          >
            {t("specifications") || "Specs"}
          </TabsTrigger>
          <TabsTrigger 
            value="swap" 
            className="text-sm font-semibold rounded-xl py-3 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all duration-200"
          >
            {t("swapInfo") || "Swap"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-5 space-y-4">
          <DetailRow
            icon={<Package className="h-5 w-5" />}
            label={t("productName") || "Product"}
            value={(!isRTL ? product.translations[0]?.name : product.translations[1]?.name) || product.name}
            capitalize
          />
          <DetailRow
            icon={<MapPin className="h-5 w-5" />}
            label={t("location") || "Location"}
            value={`${t(product.country)} - ${(!isRTL ? product.translations[0]?.city : product.translations[1]?.city) || product.city}`}
          />
          <DetailRow
            icon={<Calendar className="h-5 w-5" />}
            label={t("listedOn") || "Listed"}
            value={new Date(product.date_created).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          />
          <DetailRow
            icon={<ShieldCheck className="h-5 w-5" />}
            label={t("condition") || "Condition"}
            value={t(product.status_item)}
            valueClassName="text-primary font-semibold"
            capitalize
          />
          <div className="pt-4 border-t">
            <p className="text-sm font-semibold text-foreground mb-2">{t("fullDescription") || "Description"}:</p>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {(!isRTL ? product.translations[0]?.description : product.translations[1]?.description) || product.description}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="mt-5 space-y-4">
          <DetailRow
            label={t("category") || "Category"}
            value={isRTL ? product.translations[0]?.category : product.translations[1]?.category || product.category}
            capitalize
          />
          {product.sub_category && (
            <DetailRow
              label={t("subCategory") || "Sub-category"}
              value={!isRTL ? product.translations[0]?.sub_category : product.translations[1]?.sub_category || product.sub_category}
              capitalize
            />
          )}
          {product.brand && product.brand !== 'no_brand' && product.brand !== 'none' && (
            <DetailRow
              label={t("brand") || "Brand"}
              value={!isRTL ? product.translations[0]?.brand : product.translations[1]?.brand || product.brand}
              capitalize
            />
          )}
          {product.model && (
            <DetailRow
              label={t("model") || "Model"}
              value={!isRTL ? product.translations[0]?.model : product.translations[1]?.model || product.model}
              capitalize
            />
          )}
          <DetailRow
            label={t("price") || "Price"}
            value={`${Number(product.price).toLocaleString('en-US')} ${t("le")}`}
            valueClassName="text-secondary2 font-bold"
          />
          <DetailRow
            label={t("availableQuantity") || "Stock"}
            value={Number(product.quantity).toLocaleString('en-US')}
          />
        </TabsContent>

        <TabsContent value="swap" className="mt-5 space-y-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              {product.status_swap === "available" ? (
                <>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-1">
                      {t("availableForSwap") || "Available for Swap"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("swapDescription") || "This item is available for swapping. Make an offer now!"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <BadgeX className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-destructive mb-1">
                      {t("notAvailableForSwap") || "Not Available"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("notAvailableDescription") || "This item is currently not available for swapping."}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {product.allowed_categories && product.allowed_categories.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">
                {t("acceptedCategories") || "Accepted Categories"}:
              </p>
              <div className="flex flex-wrap gap-2">
                {product.allowed_categories.map((cat, index) => (
                  <Badge key={index} variant="outline" className="capitalize">
                    {cat === "all" ? t("allCategories") : t(cat)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
