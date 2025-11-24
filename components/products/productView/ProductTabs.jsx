"use client"
import { motion } from "framer-motion"
import { MapPin, Calendar, Package, ShieldCheck, BadgeX, DollarSign, Hash, Tag } from "lucide-react"
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

export function ProductTabs({ product, isRTL, t }) {
  return (
    <motion.div variants={fadeInUp} className="mt-8">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-2 bg-muted/40 dark:bg-muted/20 rounded-2xl border border-border/50">
          <TabsTrigger 
            value="details" 
            className="text-sm font-semibold rounded-xl py-3 data-[state=active]:bg-background dark:data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary transition-all duration-200"
          >
            {t("details") || "Details"}
          </TabsTrigger>
          <TabsTrigger 
            value="specs" 
            className="text-sm font-semibold rounded-xl py-3 data-[state=active]:bg-background dark:data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary transition-all duration-200"
          >
            {t("specifications") || "Specs"}
          </TabsTrigger>
          <TabsTrigger 
            value="swap" 
            className="text-sm font-semibold rounded-xl py-3 data-[state=active]:bg-background dark:data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary transition-all duration-200"
          >
            {t("swapInfo") || "Swap"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-5">
          <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
            <table className="w-full">
              <tbody>
                {/* Row 1 - Gradient Green Background */}
                <tr className="bg-gradient-to-r from-green-500/20 via-green-400/15 to-green-500/20">
                  {isRTL ? (
                    <>
                      <td className="py-4 px-4 text-sm text-foreground font-medium capitalize border-l border-border/30">
                        {(!isRTL ? product.translations[0]?.name : product.translations[1]?.name) || product.name}
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground">
                        <div className="flex items-center gap-2 justify-end">
                          <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                          {t("productName") || "Product"}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground border-r border-border/30">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                          {t("productName") || "Product"}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-foreground font-medium capitalize">
                        {(!isRTL ? product.translations[0]?.name : product.translations[1]?.name) || product.name}
                      </td>
                    </>
                  )}
                </tr>

                {/* Row 2 - No Background */}
                <tr className="bg-transparent hover:bg-muted/20 transition-colors">
                  {isRTL ? (
                    <>
                      <td className="py-4 px-4 text-sm text-foreground font-medium border-l border-border/30">
                        {`${t(product.country)} - ${(!isRTL ? product.translations[0]?.city : product.translations[1]?.city) || product.city}`}
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground">
                        <div className="flex items-center gap-2 justify-end">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {t("location") || "Location"}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground border-r border-border/30">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {t("location") || "Location"}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-foreground font-medium">
                        {`${t(product.country)} - ${(!isRTL ? product.translations[0]?.city : product.translations[1]?.city) || product.city}`}
                      </td>
                    </>
                  )}
                </tr>

                {/* Row 3 - Gradient Green Background */}
                <tr className="bg-gradient-to-r from-green-500/20 via-green-400/15 to-green-500/20">
                  {isRTL ? (
                    <>
                      <td className="py-4 px-4 text-sm text-foreground font-medium border-l border-border/30">
                        {new Date(product.date_created).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground">
                        <div className="flex items-center gap-2 justify-end">
                          <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                          {t("listedOn") || "Listed"}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground border-r border-border/30">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                          {t("listedOn") || "Listed"}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-foreground font-medium">
                        {new Date(product.date_created).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </td>
                    </>
                  )}
                </tr>

                {/* Row 4 - No Background */}
                <tr className="bg-transparent hover:bg-muted/20 transition-colors">
                  {isRTL ? (
                    <>
                      <td className="py-4 px-4 text-sm font-medium capitalize border-l border-border/30">
                        <span className="text-primary font-semibold">{t(product.status_item)}</span>
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground">
                        <div className="flex items-center gap-2 justify-end">
                          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                          {t("condition") || "Condition"}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground border-r border-border/30">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                          {t("condition") || "Condition"}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium capitalize">
                        <span className="text-primary font-semibold">{t(product.status_item)}</span>
                      </td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Description Section Below Table */}
          <div className="mt-6 p-4 rounded-xl border border-border/50 bg-muted/10">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t("fullDescription") || "Description"}:
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {(!isRTL ? product.translations[0]?.description : product.translations[1]?.description) || product.description}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="mt-5">
          <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
            <table className="w-full">
              <tbody>
                {/* Row 1 - Gradient Green Background */}
                <tr className="bg-gradient-to-r from-green-500/20 via-green-400/15 to-green-500/20">
                  {isRTL ? (
                    <>
                      <td className="py-4 px-4 text-sm text-foreground font-medium capitalize border-l border-border/30">
                        {isRTL ? product.translations[0]?.category : product.translations[1]?.category || product.category}
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground">
                        <div className="flex items-center gap-2 justify-end">
                          <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                          {t("category") || "Category"}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground border-r border-border/30">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                          {t("category") || "Category"}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-foreground font-medium capitalize">
                        {isRTL ? product.translations[0]?.category : product.translations[1]?.category || product.category}
                      </td>
                    </>
                  )}
                </tr>

                {/* Row 2 - Sub Category (conditional) */}
                {product.sub_category && (
                  <tr className="bg-transparent hover:bg-muted/20 transition-colors">
                    {isRTL ? (
                      <>
                        <td className="py-4 px-4 text-sm text-foreground font-medium capitalize border-l border-border/30">
                          {!isRTL ? product.translations[0]?.sub_category : product.translations[1]?.sub_category || product.sub_category}
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-foreground">
                          <div className="flex items-center gap-2 justify-end">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            {t("subCategory") || "Sub-category"}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-4 text-sm font-semibold text-foreground border-r border-border/30">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            {t("subCategory") || "Sub-category"}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-foreground font-medium capitalize">
                          {!isRTL ? product.translations[0]?.sub_category : product.translations[1]?.sub_category || product.sub_category}
                        </td>
                      </>
                    )}
                  </tr>
                )}

                {/* Row 3 - Brand (conditional) - Gradient Green Background */}
                {product.brand && product.brand !== 'no_brand' && product.brand !== 'none' && (
                  <tr className="bg-gradient-to-r from-green-500/20 via-green-400/15 to-green-500/20">
                    {isRTL ? (
                      <>
                        <td className="py-4 px-4 text-sm text-foreground font-medium capitalize border-l border-border/30">
                          {!isRTL ? product.translations[0]?.brand : product.translations[1]?.brand || product.brand}
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-foreground">
                          <div className="flex items-center gap-2 justify-end">
                            <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                            {t("brand") || "Brand"}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-4 text-sm font-semibold text-foreground border-r border-border/30">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                            {t("brand") || "Brand"}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-foreground font-medium capitalize">
                          {!isRTL ? product.translations[0]?.brand : product.translations[1]?.brand || product.brand}
                        </td>
                      </>
                    )}
                  </tr>
                )}

                {/* Row 4 - Model (conditional) */}
                {product.model && (
                  <tr className={`${product.brand && product.brand !== 'no_brand' && product.brand !== 'none' ? 'bg-transparent' : 'bg-gradient-to-r from-green-500/20 via-green-400/15 to-green-500/20'} hover:bg-muted/20 transition-colors`}>
                    {isRTL ? (
                      <>
                        <td className="py-4 px-4 text-sm text-foreground font-medium capitalize border-l border-border/30">
                          {!isRTL ? product.translations[0]?.model : product.translations[1]?.model || product.model}
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-foreground">
                          <div className="flex items-center gap-2 justify-end">
                            <Package className={`h-4 w-4 ${product.brand && product.brand !== 'no_brand' && product.brand !== 'none' ? 'text-muted-foreground' : 'text-green-600 dark:text-green-400'}`} />
                            {t("model") || "Model"}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-4 text-sm font-semibold text-foreground border-r border-border/30">
                          <div className="flex items-center gap-2">
                            <Package className={`h-4 w-4 ${product.brand && product.brand !== 'no_brand' && product.brand !== 'none' ? 'text-muted-foreground' : 'text-green-600 dark:text-green-400'}`} />
                            {t("model") || "Model"}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-foreground font-medium capitalize">
                          {!isRTL ? product.translations[0]?.model : product.translations[1]?.model || product.model}
                        </td>
                      </>
                    )}
                  </tr>
                )}

                {/* Price Row - Dynamic gradient based on previous rows */}
                <tr className={`${
                  (product.model || (product.brand && product.brand !== 'no_brand' && product.brand !== 'none')) 
                    ? 'bg-gradient-to-r from-green-500/20 via-green-400/15 to-green-500/20' 
                    : product.sub_category 
                      ? 'bg-transparent' 
                      : 'bg-gradient-to-r from-green-500/20 via-green-400/15 to-green-500/20'
                }`}>
                  {isRTL ? (
                    <>
                      <td className="py-4 px-4 text-sm font-medium border-l border-border/30">
                        <span className="text-secondary2 font-bold">
                          {Number(product.price).toLocaleString('en-US')} {t("le") || "LE"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground">
                        <div className="flex items-center gap-2 justify-end">
                          <DollarSign className={`h-4 w-4 ${
                            (product.model || (product.brand && product.brand !== 'no_brand' && product.brand !== 'none')) 
                              ? 'text-green-600 dark:text-green-400' 
                              : product.sub_category 
                                ? 'text-muted-foreground' 
                                : 'text-green-600 dark:text-green-400'
                          }`} />
                          {t("price") || "Price"}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground border-r border-border/30">
                        <div className="flex items-center gap-2">
                          <DollarSign className={`h-4 w-4 ${
                            (product.model || (product.brand && product.brand !== 'no_brand' && product.brand !== 'none')) 
                              ? 'text-green-600 dark:text-green-400' 
                              : product.sub_category 
                                ? 'text-muted-foreground' 
                                : 'text-green-600 dark:text-green-400'
                          }`} />
                          {t("price") || "Price"}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">
                        <span className="text-secondary2 font-bold">
                          {Number(product.price).toLocaleString('en-US')} {t("le") || "LE"}
                        </span>
                      </td>
                    </>
                  )}
                </tr>

                {/* Quantity Row */}
                {/* <tr className="bg-transparent hover:bg-muted/20 transition-colors">
                  {isRTL ? (
                    <>
                      <td className="py-4 px-4 text-sm text-foreground font-medium border-l border-border/30">
                        {Number(product.quantity).toLocaleString('en-US')}
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground">
                        <div className="flex items-center gap-2 justify-end">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          {t("availableQuantity") || "Stock"}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground border-r border-border/30">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          {t("availableQuantity") || "Stock"}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-foreground font-medium">
                        {Number(product.quantity).toLocaleString('en-US')}
                      </td>
                    </>
                  )}
                </tr> */}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="swap" className="mt-5">
          <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
            <table className="w-full">
              <tbody>
                {/* Row 1 - Swap Status - Gradient Green Background */}
                <tr className="bg-gradient-to-r from-green-500/20 via-green-400/15 to-green-500/20">
                  {isRTL ? (
                    <>
                      <td className="py-4 px-4 border-l border-border/30">
                        {product.status_swap === "available" ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary">
                              {t("availableForSwap") || "Available for Swap"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-destructive">
                              {t("notAvailableForSwap") || "Not Available"}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground">
                        <div className="flex items-center gap-2 justify-end">
                          {product.status_swap === "available" ? (
                            <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <BadgeX className="h-4 w-4 text-green-600 dark:text-green-400" />
                          )}
                          {t("swapStatus") || "Swap Status"}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground border-r border-border/30">
                        <div className="flex items-center gap-2">
                          {product.status_swap === "available" ? (
                            <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <BadgeX className="h-4 w-4 text-green-600 dark:text-green-400" />
                          )}
                          {t("swapStatus") || "Swap Status"}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {product.status_swap === "available" ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary">
                              {t("availableForSwap") || "Available for Swap"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-destructive">
                              {t("notAvailableForSwap") || "Not Available"}
                            </span>
                          </div>
                        )}
                      </td>
                    </>
                  )}
                </tr>

                {/* Row 2 - Swap Description */}
                <tr className="bg-transparent hover:bg-muted/20 transition-colors">
                  {isRTL ? (
                    <>
                      <td className="py-4 px-4 text-sm text-muted-foreground border-l border-border/30">
                        {product.status_swap === "available" 
                          ? (t("swapDescription") || "This item is available for swapping. Make an offer now!")
                          : (t("notAvailableDescription") || "This item is currently not available for swapping.")
                        }
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground">
                        <div className="flex items-center gap-2 justify-end">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {t("fullDescription") || "Description"}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground border-r border-border/30">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {t("fullDescription") || "Description"}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {product.status_swap === "available" 
                          ? (t("swapDescription") || "This item is available for swapping. Make an offer now!")
                          : (t("notAvailableDescription") || "This item is currently not available for swapping.")
                        }
                      </td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Accepted Categories Section */}
          {product.allowed_categories && product.allowed_categories.length > 0 && (
            <div className="mt-6 p-4 rounded-xl border border-border/50 bg-muted/10">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />
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
