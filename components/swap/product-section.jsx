"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { User, AlertCircle } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"
import { useRTL } from "@/hooks/use-rtl"
import ItemCard from "./item-card"

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
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
}

const ProductSection = ({
  type, // 'my' | 'other'
  items,
  selectedItems,
  onItemSelect,
  itemQuantities,
  onQuantityChange,
  allowedCategories = [],
  onAddNewItem,
  onNavigate,
}) => {
  const { t } = useTranslations()
  const { isRTL } = useRTL()

  const isMyProducts = type === 'my'
  const title = isMyProducts ? (t("YourProducts") || "Your Products") : (t("AvailableProducts") || "Available Products")
  const subtitle = isMyProducts ? (t("Select items to swap") || "Select items to swap") : (t("Choose items to receive") || "Choose items to receive")
  const emptyMessage = isMyProducts 
    ? (t("NoProductsFound") || "You haven't any Items yet.") 
    : (t("NoOtherProductsFound") || "He hasn't made any Items yet.")
  const emptyButtonText = isMyProducts 
    ? (t("AddNewItem") || "Add New Item") 
    : (t("StartSwapping") || "Start Swapping")

  const isOtherItemSelectable = (item) => {
    if (isMyProducts) return true
    if (selectedItems.length === 0 && type === 'other') return false
    return (
      (Array.isArray(item.allowed_categories) &&
        item.allowed_categories.some((cat) => allowedCategories.includes(cat))) ||
      allowedCategories.length === 0
    )
  }

  const hasOtherItemsSelected = !isMyProducts || selectedItems.length > 0

  return (
    <motion.div variants={cardVariants}>
      {items.length !== 0 ? (
        <div>
          <motion.div
            className="flex flex-row rtl:flex-row-reverse items-center gap-4 mb-6"
            style={{ alignItems: 'center' }}
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: isMyProducts ? 0.3 : 0.4 }}
          >
            <div className={`flex-shrink-0 w-12 h-12 ${isMyProducts ? 'bg-primary/10' : 'bg-accent/10'} rounded-full flex items-center justify-center`}>
              <User className={`h-6 w-6 ${isMyProducts ? 'text-primary' : 'text-accent'}`} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground text-start">{title}</h2>
              <p className="text-foreground/70">{subtitle}</p>
            </div>
            <motion.div transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {selectedItems.reduce((sum, item) => sum + (item?.quantity || 1), 0)} {t("selected") || "selected"}
              </Badge>
            </motion.div>
          </motion.div>

          <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
            <AnimatePresence>
              {items.map((product, index) => {
                const isSelectable = isMyProducts ? true : isOtherItemSelectable(product)
                const isSelected = selectedItems.includes(product.id)

                return (
                  <motion.div
                    key={product.id}
                    variants={cardVariants}
                    layout
                    layoutId={`${type}-item-${product.id}`}
                    custom={index}
                    whileHover={isSelectable ? { scale: 1.02, y: -2 } : {}}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card
                      className={`transition-all duration-300 ${
                        isSelected
                          ? isMyProducts
                            ? "ring-2 ring-primary shadow-xl bg-primary/5 border-primary/20"
                            : "ring-2 ring-accent shadow-xl bg-accent/5 border-accent/20"
                          : isSelectable
                            ? "hover:shadow-lg hover:bg-card/50"
                            : "opacity-50 cursor-not-allowed bg-card/30"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-row rtl:flex-row-reverse items-start gap-4">
                          <div className="flex items-center flex-shrink-0">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => isSelectable && onItemSelect(product.id)}
                                disabled={!isSelectable}
                              />
                            </motion.div>
                          </div>
                          <ItemCard
                            {...product}
                            onQuantityChange={onQuantityChange}
                            selectedQuantity={itemQuantities[product.id] || 1}
                            hasOtherItemsSelected={hasOtherItemsSelected}
                          />
                          {!isSelectable && !isMyProducts && (
                            <div className="flex-shrink-0">
                              <AlertCircle className="h-5 w-5 text-destructive" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      ) : (
        <motion.div
          className="rounded-lg border-2 border-dashed border-border p-12 text-center hover:border-primary/30 transition-colors duration-300"
          variants={cardVariants}
          whileHover={{ scale: 1.02 }}
        >
          <User className="h-16 w-16 text-foreground/70 mx-auto mb-4" />
          <p className="text-foreground/70 text-lg mb-4">{emptyMessage}</p>
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              onClick={isMyProducts ? onAddNewItem : onNavigate}
              className={`${
                isMyProducts
                  ? "bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary"
                  : "bg-gradient-to-r from-accent to-secondary hover:from-secondary hover:to-accent"
              } text-white px-6 py-3`}
            >
              {emptyButtonText}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ProductSection
