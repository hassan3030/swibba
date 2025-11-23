"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Filter, ShoppingBag, Package, MapPin, Calendar, Banknote, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { categoriesName, itemsStatus, countriesList } from "@/lib/data"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { getTranslatedName, extractId } from "./utils"
import { sidebarVariants, overlayVariants } from "./animations"

export function FilterSidebar({
  showFilterSidebar,
  setShowFilterSidebar,
  filters,
  updateFilter,
  toggleArrayFilter,
  toggleAllCategories,
  clearAllFilters,
  getActiveFiltersCount,
  allCategoriesData,
  allSubCategoriesData,
  allBrandsData,
  allModelsData,
  subCategoriesOpen,
  setSubCategoriesOpen,
  brandsOpen,
  setBrandsOpen,
  modelsOpen,
  setModelsOpen,
  allowedCategoriesOpen,
  setAllowedCategoriesOpen,
}) {
  const { t } = useTranslations()
  const { isRTL } = useLanguage()

  return (
    <AnimatePresence>
      {showFilterSidebar && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000000]"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowFilterSidebar(false)}
          />
          
          {/* Sidebar */}
          <motion.div
            className={`fixed top-0 bottom-0 w-80 max-w-full bg-background border-border shadow-2xl z-[10000001] flex flex-col ${
              isRTL ? 'border-l right-0' : 'border-r left-0'
            }`}
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Sidebar Header - Fixed */}
            <motion.div 
              className="flex items-center justify-between p-4 border-b border-border flex-shrink-0 bg-background"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                {t("advancedFilters") || "Advanced Filters"}
              </h3>
              <motion.button
                onClick={() => setShowFilterSidebar(false)}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </motion.div>

            {/* Filter Content - Scrollable */}
            <motion.div 
              className="flex-1 overflow-y-auto p-4 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Name Filter */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="text-sm font-medium flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  {t("itemName") || "Item Name"}
                </label>
                <Input
                  placeholder={t("searchByName") || "Search by name..."}
                  value={filters.name}
                  onChange={(e) => updateFilter("name", e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                />
              </motion.div>

              {/* Category Filter */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  {t("category") || "Category"}
                </label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => updateFilter("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCategory") || "Select Category"} />
                  </SelectTrigger>
                  <SelectContent className="z-[10000020]">
                    <SelectItem value="all" className="hover:!bg-primary/40">
                      {t("allCategories") || "All Categories"}
                    </SelectItem>
                    {categoriesName.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize hover:!bg-primary/40">
                        {t(cat) || cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* SubCategories Filter */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
              >
                <label className="text-sm font-medium flex items-center gap-2">
                  <Package className="inline h-4 w-4 text-primary" />
                  {t("subCategories") || "Sub Categories"}
                </label>
                <Popover open={subCategoriesOpen} onOpenChange={setSubCategoriesOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={subCategoriesOpen}
                      className="w-full justify-between"
                    >
                      {filters.subCategories.length > 0
                        ? `${filters.subCategories.length} selected`
                        : t("selectSubCategories") || "Select sub categories..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 z-[10000020]" align="start">
                    <Command className="max-h-[400px]">
                      <CommandInput placeholder={t("searchSubCategories") || "Search sub categories..."} />
                      <CommandEmpty>{t("noSubCategoriesFound") || "No sub categories found."}</CommandEmpty>
                      <CommandList className="max-h-[350px] overflow-y-auto">
                        <CommandGroup>
                          {allSubCategoriesData.map((subCat) => {
                            const subCatId = extractId(subCat.id)
                            const subCatName = getTranslatedName(subCat, isRTL)
                            const isSelected = filters.subCategories.some(id => {
                              const filterId = extractId(id)
                              return String(subCatId) === String(filterId)
                            })
                            return (
                              <CommandItem
                                key={subCatId}
                                onSelect={() => toggleArrayFilter("subCategories", subCatId)}
                                className="cursor-pointer hover:!bg-primary/40"
                              >
                                <div className="flex items-center space-x-2 w-full">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleArrayFilter("subCategories", subCatId)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <span>{subCatName}</span>
                                </div>
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {filters.subCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.subCategories.map((subCatId) => {
                      const subCat = allSubCategoriesData.find(sc => {
                        const scId = extractId(sc.id)
                        return String(scId) === String(subCatId)
                      })
                      const label = subCat ? getTranslatedName(subCat, isRTL) : subCatId
                      return (
                        <Badge key={subCatId} variant="secondary" className="text-xs">
                          {label}
                          <button
                            onClick={() => toggleArrayFilter("subCategories", subCatId)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </motion.div>

              {/* Brands Filter */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.47 }}
              >
                <label className="text-sm font-medium flex items-center gap-2">
                  {t("brands") || "Brands"}
                </label>
                <Popover open={brandsOpen} onOpenChange={setBrandsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={brandsOpen}
                      className="w-full justify-between"
                    >
                      {filters.brands.length > 0
                        ? `${filters.brands.length} selected`
                        : t("selectBrands") || "Select brands..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 z-[10000020]" align="start">
                    <Command className="max-h-[400px]">
                      <CommandInput placeholder={t("searchBrands") || "Search brands..."} />
                      <CommandEmpty>{t("noBrandsFound") || "No brands found."}</CommandEmpty>
                      <CommandList className="max-h-[350px] overflow-y-auto">
                        <CommandGroup>
                          {allBrandsData.map((brand) => {
                            const brandId = extractId(brand.id)
                            const brandName = getTranslatedName(brand, isRTL)
                            const isSelected = filters.brands.some(id => {
                              const filterId = extractId(id)
                              return String(brandId) === String(filterId)
                            })
                            return (
                              <CommandItem
                                key={brandId}
                                onSelect={() => toggleArrayFilter("brands", brandId)}
                                className="cursor-pointer hover:!bg-primary/40"
                              >
                                <div className="flex items-center space-x-2 w-full">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleArrayFilter("brands", brandId)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <span>{brandName}</span>
                                </div>
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {filters.brands.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.brands.map((brandId) => {
                      const brand = allBrandsData.find(b => {
                        const bId = extractId(b.id)
                        return String(bId) === String(brandId)
                      })
                      const label = brand ? getTranslatedName(brand, isRTL) : brandId
                      return (
                        <Badge key={brandId} variant="secondary" className="text-xs">
                          {label}
                          <button
                            onClick={() => toggleArrayFilter("brands", brandId)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </motion.div>

              {/* Models Filter */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.49 }}
              >
                <label className="text-sm font-medium">
                  {t("models") || "Models"}
                </label>
                <Popover open={modelsOpen} onOpenChange={setModelsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={modelsOpen}
                      className="w-full justify-between"
                    >
                      {filters.models.length > 0
                        ? `${filters.models.length} selected`
                        : t("selectModels") || "Select models..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 z-[10000020]" align="start">
                    <Command className="max-h-[400px]">
                      <CommandInput placeholder={t("searchModels") || "Search models..."} />
                      <CommandEmpty>{t("noModelsFound") || "No models found."}</CommandEmpty>
                      <CommandList className="max-h-[350px] overflow-y-auto">
                        <CommandGroup>
                          {allModelsData.map((model) => {
                            const modelId = extractId(model.id)
                            const modelName = getTranslatedName(model, isRTL)
                            const isSelected = filters.models.some(id => {
                              const filterId = extractId(id)
                              return String(modelId) === String(filterId)
                            })
                            return (
                              <CommandItem
                                key={modelId}
                                onSelect={() => toggleArrayFilter("models", modelId)}
                                className="cursor-pointer hover:!bg-primary/40"
                              >
                                <div className="flex items-center space-x-2 w-full">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleArrayFilter("models", modelId)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <span>{modelName}</span>
                                </div>
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {filters.models.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.models.map((modelId) => {
                      const model = allModelsData.find(m => {
                        const mId = extractId(m.id)
                        return String(mId) === String(modelId)
                      })
                      const label = model ? getTranslatedName(model, isRTL) : modelId
                      return (
                        <Badge key={modelId} variant="secondary" className="text-xs">
                          {label}
                          <button
                            onClick={() => toggleArrayFilter("models", modelId)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </motion.div>

              {/* Allowed Categories Filter */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.51 }}
              >
                <label className="text-sm font-medium">
                  {t("allowedCategories") || "Allowed Categories for Exchange"}
                </label>
                <Popover open={allowedCategoriesOpen} onOpenChange={setAllowedCategoriesOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={allowedCategoriesOpen}
                      className="w-full justify-between"
                    >
                      {filters.allowedCategories.includes("all")
                        ? t("allCategories") || "All Categories"
                        : filters.allowedCategories.length > 0
                        ? `${filters.allowedCategories.length} selected`
                        : t("selectAllowedCategories") || "Select allowed categories..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 z-[10000020]" align="start">
                    <Command className="max-h-[400px]">
                      <CommandInput placeholder={t("searchCategories") || "Search categories..."} />
                      <CommandEmpty>{t("noCategoriesFound") || "No categories found."}</CommandEmpty>
                      <CommandList className="max-h-[350px] overflow-y-auto">
                        <CommandGroup>
                          <CommandItem
                            key="all-categories"
                            onSelect={() => toggleAllCategories("allowedCategories")}
                            className="cursor-pointer border-b border-gray-200 mb-1"
                          >
                            <div className="flex items-center space-x-2 w-full">
                              <input
                                type="checkbox"
                                checked={filters.allowedCategories.includes("all")}
                                onChange={() => toggleAllCategories("allowedCategories")}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <span className="font-semibold hover:!bg-primary/40">
                                {t("allCategories") || "All Categories"}
                              </span>
                            </div>
                          </CommandItem>
                          {categoriesName.map((cat) => (
                            <CommandItem
                              key={cat}
                              onSelect={() => toggleArrayFilter("allowedCategories", cat)}
                              className="cursor-pointer hover:!bg-primary/40"
                            >
                              <div className="flex items-center space-x-2 w-full">
                                <input
                                  type="checkbox"
                                  checked={filters.allowedCategories.includes(cat)}
                                  onChange={() => toggleArrayFilter("allowedCategories", cat)}
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="capitalize">{t(cat) || cat}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {filters.allowedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.allowedCategories.includes("all") ? (
                      <Badge key="all" variant="secondary" className="text-xs font-semibold">
                        {t("allCategories") || "All Categories"}
                        <button
                          onClick={() => toggleAllCategories("allowedCategories")}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : (
                      filters.allowedCategories.map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {t(cat) || cat}
                          <button
                            onClick={() => toggleArrayFilter("allowedCategories", cat)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                )}
              </motion.div>

              {/* Location Filter */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.52 }}
              >
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {t("location") || "Location"}
                </label>
                
                {filters.location.useCurrentLocation && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {filters.location.latitude && filters.location.longitude 
                        ? `${t("currentLocation") || "Current location"}: ${filters.location.latitude.toFixed(4)}, ${filters.location.longitude.toFixed(4)}`
                        : t("gettingLocation") || "Getting your location..."}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        {t("searchRadius") || "Search Radius (km)"}
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={filters.location.radius}
                        onChange={(e) => updateFilter("location.radius", parseInt(e.target.value) || 10)}
                        placeholder="10"
                      />
                    </div>
                  </div>
                )}

                {!filters.location.useCurrentLocation && (
                  <div className="space-y-2">
                    <Select 
                      value={filters.location.country} 
                      onValueChange={(value) => updateFilter("location.country", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectCountry") || "Select Country"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto z-[10000020]">
                        <SelectItem value="all" className="hover:!bg-primary/40">
                          {t("allCountries") || "All Countries"}
                        </SelectItem>
                        {countriesList.map((country) => (
                          <SelectItem key={country} value={country} className="hover:!bg-primary/40">
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder={t("city") || "City"}
                      value={filters.location.city}
                      onChange={(e) => updateFilter("location.city", e.target.value)}
                    />
                  </div>
                )}
              </motion.div>

              {/* Date Range Filter */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.53 }}
              >
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {t("dateRange") || "Date Range"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    placeholder={t("from") || "From"}
                    value={filters.dateRange.from}
                    onChange={(e) => updateFilter("dateRange.from", e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder={t("to") || "To"}
                    value={filters.dateRange.to}
                    onChange={(e) => updateFilter("dateRange.to", e.target.value)}
                  />
                </div>
              </motion.div>

              {/* Item Status Filter */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.54 }}
              >
                <label className="text-sm font-medium">
                  {t("itemStatus") || "Item Condition"}
                </label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => updateFilter("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectStatus") || "Select Status"} />
                  </SelectTrigger>
                  <SelectContent className="z-[10000020]">
                    <SelectItem value="all" className="hover:!bg-primary/20">
                      {t("allStatuses") || "All Conditions"}
                    </SelectItem>
                    {itemsStatus.map((status) => (
                      <SelectItem key={status} value={status} className="capitalize hover:!bg-primary/40">
                        {t(status) || status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Price Range Filter */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
              >
                <label className="text-sm font-medium flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-primary" />
                  {t("priceRange") || "Price Range"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder={t("minPrice") || "Min Price"}
                    value={filters.priceRange.min}
                    onChange={(e) => updateFilter("priceRange.min", e.target.value)}
                    min="0"
                  />
                  <Input
                    type="number"
                    placeholder={t("maxPrice") || "Max Price"}
                    value={filters.priceRange.max}
                    onChange={(e) => updateFilter("priceRange.max", e.target.value)}
                    min="0"
                  />
                </div>
              </motion.div>

              {/* Action Buttons - Fixed at bottom */}
              <motion.div 
                className="flex gap-2 pt-4 mt-2 border-t border-border sticky bottom-0 bg-background"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.56 }}
              >
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="flex-1"
                >
                  {t("clearAll") || "Clear All"}
                </Button>
                <Button
                  onClick={() => setShowFilterSidebar(false)}
                  className="flex-1"
                >
                  {t("applyFilters") || "Apply Filters"}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
