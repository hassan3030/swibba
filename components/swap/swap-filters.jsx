"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Search, Filter, X, ChevronDown } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"
import { useRTL } from "@/hooks/use-rtl"
import { categoriesName } from "@/lib/data"

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

const SwapFilters = ({
  searchTerm,
  setSearchTerm,
  priceRange,
  setPriceRange,
  showFilters,
  setShowFilters,
  filtersSub,
  setFiltersSub,
  allCategories,
  allSubCategories,
  allBrands,
  allModels,
  chainCategoryId,
  setChainCategoryId,
  chainSubCategoryId,
  setChainSubCategoryId,
  chainBrandId,
  setChainBrandId,
  chainModelId,
  setChainModelId,
  hasActiveFilters,
  clearFilters,
  visibleOtherItemsCount,
}) => {
  const { t } = useTranslations()
  const { isRTL } = useRTL()
  
  const [openCat, setOpenCat] = useState(false)
  const [openSubCat, setOpenSubCat] = useState(false)
  const [openBrand, setOpenBrand] = useState(false)
  const [openModel, setOpenModel] = useState(false)

  return (
    <div className="mb-6">
      <motion.div 
        className="bg-card/30 rounded-lg p-4 space-y-4"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-foreground/70" />
            <span className="font-medium">{t("Filters") || "Filters"}</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {visibleOtherItemsCount} {t("results") || "results"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                {t("Clear") || "Clear"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs"
            >
              {showFilters ? t("Hide") || "Hide" : t("Show") || "Show"} {t("Filters") || "Filters"}
            </Button>
          </div>
        </div>

        {showFilters && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">
                {t("Search") || "Search"}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/70" />
                <Input
                  placeholder={t("Search by name or description") || "Search by name or description"}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">
                {t("category") || "Category"}
              </label>
              <Popover open={openCat} onOpenChange={setOpenCat}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {(() => {
                      const cat = (allCategories.length > 0 ? allCategories : categoriesName.map(n => ({ id: n, name: n })))
                        .find(c => String((typeof c.id === 'object' ? c.id?.id : c.id)) === String(chainCategoryId))
                      const name = cat ? (isRTL ? (cat?.translations?.[1]?.name || cat?.name) : (cat?.translations?.[0]?.name || cat?.name)) : (t("SelectCategory") || "Select Category")
                      return name
                    })()}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0">
                  <Command>
                    <CommandInput placeholder={t("searchCategory") || "Search category ..."} />
                    <CommandList className="max-h-64 overflow-y-auto">
                      <CommandEmpty>{t("NoResults") || "No results found."}</CommandEmpty>
                      <CommandGroup>
                        {(allCategories.length > 0 ? allCategories : categoriesName.map(n => ({ id: n, name: n }))).map(cat => {
                          const id = typeof cat.id === 'object' ? cat.id?.id : cat.id
                          const name = isRTL ? (cat?.translations?.[1]?.name || cat?.name) : (cat?.translations?.[0]?.name || cat?.name)
                          return (
                            <CommandItem
                              key={id}
                              onSelect={() => {
                                setChainCategoryId(String(id))
                                setChainSubCategoryId("")
                                setChainBrandId("")
                                setChainModelId("")
                                setOpenCat(false)
                              }}
                            >
                              {name}
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Sub Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">
                {t("subCategories") || "Sub Categories"}
              </label>
              <Popover open={openSubCat} onOpenChange={setOpenSubCat}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between" disabled={!chainCategoryId}>
                    {(() => {
                      const sc = allSubCategories.find(s => String((typeof s.id === 'object' ? s.id?.id : s.id)) === String(chainSubCategoryId))
                      const name = sc ? (isRTL ? (sc?.translations?.[1]?.name || sc?.name) : (sc?.translations?.[0]?.name || sc?.name)) : (t("SelectSubCategory") || "Select Sub Category")
                      return name
                    })()}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0">
                  <Command>
                    <CommandInput placeholder={t("searchSubCategories") || "Search sub categories ..."} />
                    <CommandList className="max-h-64 overflow-y-auto">
                      <CommandEmpty>{t("NoResults") || "No results found."}</CommandEmpty>
                      <CommandGroup>
                        {allSubCategories
                          .filter(sc => {
                            const parent = typeof sc.parent_category === 'object' ? sc.parent_category?.id : sc.parent_category
                            return chainCategoryId ? String(parent) === String(chainCategoryId) : true
                          })
                          .map(sc => {
                            const id = typeof sc.id === 'object' ? sc.id?.id : sc.id
                            const name = isRTL ? (sc?.translations?.[1]?.name || sc?.name) : (sc?.translations?.[0]?.name || sc?.name)
                            return (
                              <CommandItem
                                key={id}
                                onSelect={() => {
                                  setChainSubCategoryId(String(id))
                                  setChainBrandId("")
                                  setChainModelId("")
                                  setOpenSubCat(false)
                                }}
                              >
                                {name}
                              </CommandItem>
                            )
                          })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">
                {t("brands") || "Brands"}
              </label>
              <Popover open={openBrand} onOpenChange={setOpenBrand}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between" disabled={!chainSubCategoryId}>
                    {(() => {
                      const b = allBrands.find(s => String((typeof s.id === 'object' ? s.id?.id : s.id)) === String(chainBrandId))
                      const name = b ? (isRTL ? (b?.translations?.[1]?.name || b?.name) : (b?.translations?.[0]?.name || b?.name)) : (t("SelectBrand") || "Select Brand")
                      return name
                    })()}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0">
                  <Command>
                    <CommandInput placeholder={t("searchBrands") || "Search brands ..."} />
                    <CommandList className="max-h-64 overflow-y-auto">
                      <CommandEmpty>{t("NoResults") || "No results found."}</CommandEmpty>
                      <CommandGroup>
                        {allBrands
                          .filter(b => {
                            const pc = typeof b.parent_category === 'object' ? b.parent_category?.id : b.parent_category
                            const sc = typeof b.sub_category === 'object' ? b.sub_category?.id : b.sub_category
                            return (chainCategoryId ? String(pc) === String(chainCategoryId) : true)
                              && (chainSubCategoryId ? String(sc) === String(chainSubCategoryId) : true)
                          })
                          .map(b => {
                            const id = typeof b.id === 'object' ? b.id?.id : b.id
                            const name = isRTL ? (b?.translations?.[1]?.name || b?.name) : (b?.translations?.[0]?.name || b?.name)
                            return (
                              <CommandItem
                                key={id}
                                onSelect={() => {
                                  setChainBrandId(String(id))
                                  setChainModelId("")
                                  setOpenBrand(false)
                                }}
                              >
                                {name}
                              </CommandItem>
                            )
                          })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Model Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">
                {t("models") || "Models"}
              </label>
              <Popover open={openModel} onOpenChange={setOpenModel}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between" disabled={!chainBrandId}>
                    {(() => {
                      const m = allModels.find(s => String((typeof s.id === 'object' ? s.id?.id : s.id)) === String(chainModelId))
                      const name = m ? (isRTL ? (m?.translations?.[1]?.name || m?.name) : (m?.translations?.[0]?.name || m?.name)) : (t("SelectModel") || "Select Model")
                      return name
                    })()}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0">
                  <Command>
                    <CommandInput placeholder={t("searchModels") || "Search models ..."} />
                    <CommandList className="max-h-64 overflow-y-auto">
                      <CommandEmpty>{t("NoResults") || "No results found."}</CommandEmpty>
                      <CommandGroup>
                        {allModels
                          .filter(m => {
                            const pb = typeof m.parent_brand === 'object' ? m.parent_brand?.id : m.parent_brand
                            const sc = typeof m.sub_category === 'object' ? m.sub_category?.id : m.sub_category
                            return (chainBrandId ? String(pb) === String(chainBrandId) : true)
                              && (chainSubCategoryId ? String(sc) === String(chainSubCategoryId) : true)
                          })
                          .map(m => {
                            const id = typeof m.id === 'object' ? m.id?.id : m.id
                            const name = isRTL ? (m?.translations?.[1]?.name || m?.name) : (m?.translations?.[0]?.name || m?.name)
                            return (
                              <CommandItem
                                key={id}
                                onSelect={() => {
                                  setChainModelId(String(id))
                                  setOpenModel(false)
                                }}
                              >
                                {name}
                              </CommandItem>
                            )
                          })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">
                {t("Price Range") || "Price Range"}
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  placeholder={t("Min") || "Min"}
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="text-sm"
                />
                <Input
                  type="number"
                  min={1}
                  placeholder={t("Max") || "Max"}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="text-sm"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Filter Badges */}
        {(((filtersSub.mainList || []).length) > 0 || ((filtersSub.level1List || []).length) > 0 || ((filtersSub.level2List || []).length) > 0) && (
          <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-scroll">
            {(filtersSub.mainList || []).map((key) => (
              <Badge key={`main-${key}`} variant="secondary" className="text-xs">
                {key}
                <button className="ml-1" onClick={() => setFiltersSub(prev => ({...prev, mainList: (prev.mainList||[]).filter(x=>x!==key)}))}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {(filtersSub.level1List || []).map((key) => (
              <Badge key={`l1-${key}`} variant="secondary" className="text-xs">
                {key}
                <button className="ml-1" onClick={() => setFiltersSub(prev => ({...prev, level1List: (prev.level1List||[]).filter(x=>x!==key)}))}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {(filtersSub.level2List || []).map((key) => (
              <Badge key={`l2-${key}`} variant="secondary" className="text-xs">
                {key}
                <button className="ml-1" onClick={() => setFiltersSub(prev => ({...prev, level2List: (prev.level2List||[]).filter(x=>x!==key)}))}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default SwapFilters
