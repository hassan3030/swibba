"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Heart, Loader2, Minus, Plus, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
}

const imageVariants = {
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
}

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
}

const heartVariants = {
  unfavorited: { scale: 1, rotate: 0 },
  favorited: {
    scale: [1, 1.3, 1],
    rotate: [0, -10, 10, 0],
    transition: { duration: 0.6, ease: "easeInOut" },
  },
}

export function ProductCard({
  id,
  name,
  description,
  price,
  originalPrice,
  rating,
  reviewCount,
  imageSrc,
  isNew = false,
  onAddToCart,
}) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (onAddToCart) {
      setIsLoading(true)

      try {
        await new Promise((resolve) => setTimeout(resolve, 800))
        onAddToCart(id)

        setIsAdded(true)
        setTimeout(() => {
          setIsAdded(false)
        }, 2000)
      } catch (error) {
        console.error("Failed to add to cart:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const increaseQuantity = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setQuantity((prev) => Math.min(prev + 1, 10))
  }

  const decreaseQuantity = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <Link href={`/products/${id}`}>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 30 } }}
      >
        <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl border-0 shadow-md">
          <div className="relative aspect-square overflow-hidden">
            <motion.div variants={imageVariants} whileHover="hover" className="w-full h-full">
              <Image
                src={imageSrc || "/placeholder.svg?height=400&width=400"}
                alt={name}
                fill
                className="object-cover"
              />
            </motion.div>

            <div className="absolute right-2 top-2 z-10">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white"
                  onClick={handleToggleFavorite}
                >
                  <motion.div variants={heartVariants} animate={isFavorite ? "favorited" : "unfavorited"}>
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  </motion.div>
                  <span className="sr-only">Add to favorites</span>
                </Button>
              </motion.div>
            </div>

            <AnimatePresence>
              {isNew && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  className="absolute left-2 top-2 z-10"
                >
                  <Badge className="bg-green-500 hover:bg-green-600">New</Badge>
                </motion.div>
              )}

              {discount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  className="absolute left-2 bottom-2 z-10"
                >
                  <Badge variant="destructive" className="animate-pulse">
                    {discount}% OFF
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <CardContent className="grid gap-2 p-4">
            <motion.h3
              className="font-semibold line-clamp-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {name}
            </motion.h3>

            <motion.p
              className="text-sm text-muted-foreground line-clamp-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {description}
            </motion.p>

            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground"
                      }`}
                    />
                  </motion.div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({reviewCount})</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <span className="font-semibold text-lg">${price.toFixed(2)}</span>
              {originalPrice && (
                <span className="text-sm text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
              )}
            </motion.div>
          </CardContent>

          <CardFooter className="p-4 pt-0">
            <div className="flex w-full flex-col gap-2">
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={decreaseQuantity}
                          disabled={quantity <= 1 || isLoading}
                        >
                          <Minus className="h-3 w-3" />
                          <span className="sr-only">Decrease quantity</span>
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>Decrease quantity</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <motion.span
                  className="w-8 text-center font-medium"
                  key={quantity}
                  initial={{ scale: 1.2, color: "#3b82f6" }}
                  animate={{ scale: 1, color: "#000000" }}
                  transition={{ duration: 0.2 }}
                >
                  {quantity}
                </motion.span>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={increaseQuantity}
                          disabled={quantity >= 10 || isLoading}
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Increase quantity</span>
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>Increase quantity</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <motion.div className="ml-auto flex-1" variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    className="w-full gap-2 bg-primary hover:bg-primary/90"
                    onClick={handleAddToCart}
                    disabled={isLoading}
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          >
                            <Loader2 className="h-4 w-4" />
                          </motion.div>
                          Adding...
                        </motion.div>
                      ) : isAdded ? (
                        <motion.div
                          key="added"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <Check className="h-4 w-4" />
                          </motion.div>
                          Added
                        </motion.div>
                      ) : (
                        <motion.div
                          key="default"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to cart
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </div>

              <AnimatePresence>
                {isAdded && (
                  <motion.p
                    className="text-center text-xs text-green-600 font-medium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {quantity} {quantity === 1 ? "item" : "items"} added to your cart
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  )
}
