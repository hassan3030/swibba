"use client"

import { useState } from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Card, CardContent } from "@/components/ui/card"
import { Search, FolderTree } from "lucide-react"
import { motion } from "framer-motion"
import { itemVariants } from "./constants"

interface CategorySelectorProps {
  form: any
  t: (key: string) => string
  isRTL: boolean
  allCategories: any[]
  filteredSubCategories: any[]
  filteredBrands: any[]
  filteredModels: any[]
  selectedCategoryId: string | null
  selectedSubCategoryId: string | null
  selectedBrandId: string | null
  handleCategorySelect: (categoryName: string) => void
  handleSubCategorySelect: (subCategoryId: string) => void
  handleBrandSelect: (brandId: string) => void
}

export function CategorySelector({
  form,
  t,
  isRTL,
  allCategories,
  filteredSubCategories,
  filteredBrands,
  filteredModels,
  selectedCategoryId,
  selectedSubCategoryId,
  selectedBrandId,
  handleCategorySelect,
  handleSubCategorySelect,
  handleBrandSelect,
}: CategorySelectorProps) {
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false)
  const [isSubCategoryPopoverOpen, setIsSubCategoryPopoverOpen] = useState(false)
  const [isBrandPopoverOpen, setIsBrandPopoverOpen] = useState(false)
  const [isModelPopoverOpen, setIsModelPopoverOpen] = useState(false)

  const parentCategories = allCategories.filter((cat) => !cat.parent_category)

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <motion.div className="space-y-6" variants={itemVariants}>
          <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground flex items-center gap-2 font-semibold">
                <FolderTree className="h-4 w-4 text-primary" />
                {t("categories") || "Category"}
              </FormLabel>
              <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between bg-background border-input text-foreground"
                    >
                      {field.value
                        ? parentCategories.find((category) => category.name === field.value)?.translations?.[
                            isRTL ? 1 : 0
                          ]?.name || field.value
                        : t("SelectCategory") || "Select category"}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 bg-background border-input">
                  <Command>
                    <CommandInput placeholder={t("Search Categories") || "Search categories..."} />
                    <CommandList>
                      <CommandEmpty>{t("No categories found") || "No categories found."}</CommandEmpty>
                      <CommandGroup>
                        {parentCategories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={category.name}
                            onSelect={() => {
                              field.onChange(category.name)
                              handleCategorySelect(category.name)
                              setIsCategoryPopoverOpen(false)
                            }}
                          >
                            {isRTL ? category.translations?.[1]?.name : category.translations?.[0]?.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sub_category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground flex items-center gap-2 font-semibold ">{t("SubCategories") || "Sub Categories"}</FormLabel>
              <Popover open={isSubCategoryPopoverOpen} onOpenChange={setIsSubCategoryPopoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl className=" ">
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="w-full   justify-between bg-background border-input text-foreground"
                      disabled={!selectedCategoryId || selectedCategoryId === "none"}
                    >
                      {field.value && field.value !== "none"
                        ? filteredSubCategories.find((subCat) => {
                            const subCatId =
                              typeof subCat.id === "string" ? subCat.id : subCat.id?.id || subCat.id
                            return subCatId === field.value
                          })?.name || field.value
                        : t("SelectSubCategory") || "Select Sub Category"}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 bg-background border-input">
                  <Command>
                    <CommandInput placeholder={t("SearchSubCategories") || "Search sub categories..."} />
                    <CommandList>
                      <CommandEmpty>{t("Nosubcategoriesfound") || "No sub categories found."}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => {
                            field.onChange("none")
                            handleSubCategorySelect("none")
                            setIsSubCategoryPopoverOpen(false)
                          }}
                        >
                          {t("None") || "None"}
                        </CommandItem>
                        {filteredSubCategories.map((subCat) => {
                          const subCatId = typeof subCat.id === "string" ? subCat.id : subCat.id?.id || subCat.id
                          return (
                            <CommandItem
                              key={subCatId}
                              value={subCatId}
                              onSelect={() => {
                                field.onChange(subCatId)
                                handleSubCategorySelect(subCatId)
                                setIsSubCategoryPopoverOpen(false)
                              }}
                            >
                              {!isRTL ? subCat.translations[0]?.name : subCat.translations[1]?.name || subCat.name}
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">{t("Brands") || "Brands"}</FormLabel>
              <Popover open={isBrandPopoverOpen} onOpenChange={setIsBrandPopoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between bg-background border-input text-foreground"
                      disabled={!selectedSubCategoryId || selectedSubCategoryId === "none"}
                    >
                      {field.value && field.value !== "none"
                        ? filteredBrands.find((brand) => {
                            const brandId = typeof brand.id === "string" ? brand.id : brand.id?.id || brand.id
                            return brandId === field.value
                          })?.name || field.value
                        : t("SelectBrand") || "Select Brand"}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 bg-background border-input">
                  <Command>
                    <CommandInput placeholder={t("SearchBrands") || "Search brands..."} />
                    <CommandList>
                      <CommandEmpty>{t("Nobrandsfound") || "No brands found."}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => {
                            field.onChange("none")
                            handleBrandSelect("none")
                            setIsBrandPopoverOpen(false)
                          }}
                        >
                          {t("None") || "None"}
                        </CommandItem>
                        {filteredBrands.map((brand) => {
                          const brandId = typeof brand.id === "string" ? brand.id : brand.id?.id || brand.id
                          return (
                            <CommandItem
                              key={brandId}
                              value={brandId}
                              onSelect={() => {
                                field.onChange(brandId)
                                handleBrandSelect(brandId)
                                setIsBrandPopoverOpen(false)
                              }}
                            >
                              {!isRTL ? brand.translations[0]?.name : brand.translations[1]?.name || brand.name}
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">{t("Models") || "Models"}</FormLabel>
              <Popover open={isModelPopoverOpen} onOpenChange={setIsModelPopoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between bg-background border-input text-foreground"
                      disabled={!selectedBrandId || selectedBrandId === "none"}
                    >
                      {field.value && field.value !== "none"
                        ? filteredModels.find((model) => {
                            const modelId = typeof model.id === "string" ? model.id : model.id?.id || model.id
                            return modelId === field.value
                          })?.name || field.value
                        : t("SelectModel") || "Select Model"}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 bg-background border-input">
                  <Command>
                    <CommandInput placeholder={t("SearchModels") || "Search models..."} />
                    <CommandList>
                      <CommandEmpty>{t("Nomodelsfound") || "No models found."}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => {
                            field.onChange("none")
                            setIsModelPopoverOpen(false)
                          }}
                        >
                          {t("None") || "None"}
                        </CommandItem>
                        {filteredModels.map((model) => {
                          const modelId = typeof model.id === "string" ? model.id : model.id?.id || model.id
                          return (
                            <CommandItem
                              key={modelId}
                              value={modelId}
                              onSelect={() => {
                                field.onChange(modelId)
                                setIsModelPopoverOpen(false)
                              }}
                            >
                              {!isRTL ? model.translations[0]?.name : model.translations[1]?.name || model.name}
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
