"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Plus, ArrowRightLeft, Star, ShoppingBag } from "lucide-react"
import { TbShoppingCartUp } from "react-icons/tb"
import { BiCartDownload } from "react-icons/bi"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/lib/use-translations"

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
}

// Preset configurations for common use cases
const presets = {
  // Offers page - Received offers empty state
  receivedOffers: {
    icon: BiCartDownload,
    accentIcon: Package,
    colorScheme: "primary",
    titleKey: "noRecivedOffers",
    titleFallback: "No Received Offers Yet",
    descriptionKey: "NoReceivedOffersDescription",
    descriptionFallback: "You're all caught up! New received offers will appear here when someone sends you a swap offer.",
    buttonTextKey: "BrowseProducts",
    buttonTextFallback: "Browse Products",
    buttonIcon: Package,
    buttonLink: "/products",
  },
  // Offers page - Sent offers empty state
  sentOffers: {
    icon: TbShoppingCartUp,
    accentIcon: ArrowRightLeft,
    colorScheme: "secondary",
    titleKey: "NoSwapYet",
    titleFallback: "No Swaps Yet",
    descriptionKey: "StartSwappingDescription",
    descriptionFallback: "Browse our products, find something you like, and make your first swap offer!",
    buttonTextKey: "BrowseProducts",
    buttonTextFallback: "Browse Products",
    buttonIcon: Package,
    buttonLink: "/products",
  },
  // Profile page - Available items empty state
  availableItems: {
    icon: Package,
    accentIcon: Plus,
    colorScheme: "primary",
    titleKey: "noAvailableItems",
    titleFallback: "No Items Yet",
    descriptionKey: "noAvailableItemsDesc",
    descriptionFallback: "Start by adding your first item to swap with others. Your items will appear here once added.",
    buttonTextKey: "addNewItem",
    buttonTextFallback: "Add Your First Item",
    buttonIcon: Plus,
    buttonLink: "/profile/my-items/new",
  },
  // Profile page - Items in offers empty state
  itemsInOffers: {
    icon: Star,
    accentIcon: ArrowRightLeft,
    colorScheme: "primary",
    titleKey: "noItemsInOffers",
    titleFallback: "No Items In Offers",
    descriptionKey: "noItemsInOffersDesc",
    descriptionFallback: "Your items will appear here when they're part of active swap offers. Start swapping to see your items here!",
    buttonTextKey: "BrowseProducts",
    buttonTextFallback: "Browse Products",
    buttonIcon: Package,
    buttonLink: "/products",
  },
  // Profile page - Swaps empty state
  swaps: {
    icon: ArrowRightLeft,
    accentIcon: Package,
    colorScheme: "primary",
    titleKey: "NoSwapYet",
    titleFallback: "No Swaps Yet",
    descriptionKey: "StartSwappingDescription",
    descriptionFallback: "Browse our products, find something you like, and make your first swap offer!",
    buttonTextKey: "BrowseProducts",
    buttonTextFallback: "Browse Products",
    buttonIcon: Package,
    buttonLink: "/products",
  },
}

// Color scheme configurations
const colorSchemes = {
  primary: {
    borderClass: "border-primary/20",
    bgGradient: "from-background to-primary/5",
    glowClass: "bg-primary/20",
    iconBgGradient: "from-primary/20 to-primary/5",
    iconBorderClass: "border-primary/20",
    iconColorClass: "text-primary",
    accentBgClass: "bg-primary/10",
    accentBorderClass: "border-primary/20",
    accentColorClass: "text-primary",
    buttonClass: "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25",
  },
  secondary: {
    borderClass: "border-secondary/20",
    bgGradient: "from-background to-secondary/5",
    glowClass: "bg-secondary/20",
    iconBgGradient: "from-secondary/20 to-secondary/5",
    iconBorderClass: "border-secondary/20",
    iconColorClass: "text-secondary",
    accentBgClass: "bg-secondary/10",
    accentBorderClass: "border-secondary/20",
    accentColorClass: "text-secondary",
    buttonClass: "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25",
  },
  amber: {
    borderClass: "border-amber-500/20",
    bgGradient: "from-background to-amber-500/5",
    glowClass: "bg-amber-500/20",
    iconBgGradient: "from-amber-500/20 to-amber-500/5",
    iconBorderClass: "border-amber-500/20",
    iconColorClass: "text-amber-500",
    accentBgClass: "bg-amber-500/10",
    accentBorderClass: "border-amber-500/20",
    accentColorClass: "text-amber-500",
    buttonClass: "border-primary/30 text-primary hover:bg-primary/10",
  },
  emerald: {
    borderClass: "border-emerald-500/20",
    bgGradient: "from-background to-emerald-500/5",
    glowClass: "bg-emerald-500/20",
    iconBgGradient: "from-emerald-500/20 to-emerald-500/5",
    iconBorderClass: "border-emerald-500/20",
    iconColorClass: "text-emerald-500",
    accentBgClass: "bg-emerald-500/10",
    accentBorderClass: "border-emerald-500/20",
    accentColorClass: "text-emerald-500",
    buttonClass: "bg-gradient-to-r from-emerald-500 to-emerald-500/80 hover:from-emerald-500/90 hover:to-emerald-500/70 shadow-lg shadow-emerald-500/25",
  },
}

/**
 * ModernEmptyState - A reusable empty state component with modern styling
 * 
 * @param {string} preset - Use a predefined configuration ('receivedOffers', 'sentOffers', 'availableItems', 'itemsInOffers', 'swaps')
 * @param {React.ComponentType} icon - Main icon component (overrides preset)
 * @param {React.ComponentType} accentIcon - Small accent icon (overrides preset)
 * @param {string} colorScheme - Color scheme ('primary', 'secondary', 'amber', 'emerald') (overrides preset)
 * @param {string} title - Title text (overrides preset)
 * @param {string} description - Description text (overrides preset)
 * @param {string} buttonText - Button text (overrides preset)
 * @param {React.ComponentType} buttonIcon - Button icon (overrides preset)
 * @param {string} buttonLink - Button link URL (overrides preset)
 * @param {string} buttonVariant - Button variant ('default', 'outline') (overrides preset)
 * @param {function} onButtonClick - Custom button click handler (overrides link)
 * @param {boolean} showButton - Whether to show the button (default: true)
 * @param {string} statusFilter - Status filter for conditional rendering (used in offers page)
 * @param {function} onClearFilter - Callback when clearing filter
 * @param {string} className - Additional CSS classes
 */
export function ModernEmptyState({
  preset,
  icon: iconProp,
  accentIcon: accentIconProp,
  colorScheme: colorSchemeProp,
  title: titleProp,
  description: descriptionProp,
  buttonText: buttonTextProp,
  buttonIcon: buttonIconProp,
  buttonLink: buttonLinkProp,
  buttonVariant: buttonVariantProp,
  onButtonClick,
  showButton = true,
  statusFilter,
  onClearFilter,
  className = "",
}) {
  const { t } = useTranslations()
  const router = useRouter()

  // Get preset configuration if provided
  const presetConfig = preset ? presets[preset] : {}

  // Merge preset with custom props (custom props override preset)
  const Icon = iconProp || presetConfig.icon || Package
  const AccentIcon = accentIconProp || presetConfig.accentIcon || Plus
  const colorScheme = colorSchemeProp || presetConfig.colorScheme || "primary"
  const colors = colorSchemes[colorScheme]

  // Handle title
  const getStatusLabel = (status) => {
    // Use translation keys that match the status
    const statusKey = status.charAt(0).toUpperCase() + status.slice(1)
    return t(statusKey) || status
  }

  const title = titleProp || (
    statusFilter && statusFilter !== "all"
      ? t("noOffersWithStatus") || `No ${getStatusLabel(statusFilter)} Offers`
      : t(presetConfig.titleKey) || presetConfig.titleFallback || "No Items Found"
  )

  // Handle description
  const description = descriptionProp || (
    statusFilter && statusFilter !== "all"
      ? t("noOffersMatchingFilter") || `You don't have any offers with "${getStatusLabel(statusFilter)}" status. Try selecting a different filter.`
      : t(presetConfig.descriptionKey) || presetConfig.descriptionFallback || "No items to display at the moment."
  )

  // Handle button
  const buttonText = buttonTextProp || t(presetConfig.buttonTextKey) || presetConfig.buttonTextFallback || "Browse Products"
  const ButtonIcon = buttonIconProp || presetConfig.buttonIcon || Package
  const buttonLink = buttonLinkProp || presetConfig.buttonLink || "/products"
  const buttonVariant = buttonVariantProp || presetConfig.buttonVariant || "default"

  // Determine if we should show filter clear button
  const showFilterClearButton = statusFilter && statusFilter !== "all" && onClearFilter
  const showMainButton = showButton && !showFilterClearButton

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick()
    } else if (buttonLink) {
      router.push(buttonLink)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={className}
    >
      <Card className={`relative overflow-hidden border-2 border-dashed ${colors.borderClass} bg-gradient-to-br ${colors.bgGradient}`}>
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="relative p-8 sm:p-12 text-center">
          {/* Animated Icon Container */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 ${colors.glowClass} rounded-full blur-2xl`} />
            
            {/* Main icon container */}
            <div className={`relative w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${colors.iconBgGradient} flex items-center justify-center border-2 ${colors.iconBorderClass}`}>
              <Icon className={`h-12 w-12 ${colors.iconColorClass}`} />
            </div>
            
            {/* Accent icon */}
            <motion.div
              className={`absolute -top-1 -right-1 sm:right-[calc(50%-4rem)] w-8 h-8 rounded-full ${colors.accentBgClass} flex items-center justify-center border ${colors.accentBorderClass}`}
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <AccentIcon className={`h-4 w-4 ${colors.accentColorClass}`} />
            </motion.div>
          </motion.div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
            {description}
          </p>

          {/* Main Action Button */}
          {showMainButton && (
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              {buttonVariant === "outline" ? (
                <Button
                  variant="outline"
                  size="lg"
                  className={colors.buttonClass}
                  onClick={handleButtonClick}
                >
                  <ButtonIcon className="w-5 h-5 mr-2" />
                  {buttonText}
                </Button>
              ) : buttonLink ? (
                <Button
                  size="lg"
                  className={colors.buttonClass}
                  onClick={handleButtonClick}
                >
                  <ButtonIcon className="w-5 h-5 mr-2" />
                  {buttonText}
                </Button>
              ) : (
                <Button
                  size="lg"
                  className={colors.buttonClass}
                  onClick={handleButtonClick}
                >
                  <ButtonIcon className="w-5 h-5 mr-2" />
                  {buttonText}
                </Button>
              )}
            </motion.div>
          )}

          {/* Filter Clear Button */}
          {showFilterClearButton && (
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button variant="outline" size="lg" onClick={onClearFilter}>
                {t("ViewAllOffers") || "View All Offers"}
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// Named exports for backward compatibility with existing imports
export function ReceivedEmptyState({ statusFilter, onClearFilter }) {
  return (
    <ModernEmptyState
      preset="receivedOffers"
      statusFilter={statusFilter}
      onClearFilter={onClearFilter}
    />
  )
}

export function SentEmptyState({ statusFilter, onClearFilter }) {
  return (
    <ModernEmptyState
      preset="sentOffers"
      statusFilter={statusFilter}
      onClearFilter={onClearFilter}
    />
  )
}

export function AvailableItemsEmptyState() {
  return <ModernEmptyState preset="availableItems" />
}

export function ItemsInOffersEmptyState() {
  return <ModernEmptyState preset="itemsInOffers" />
}

export function SwapsEmptyState() {
  return <ModernEmptyState preset="swaps" />
}

export default ModernEmptyState
