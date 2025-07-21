"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeftRight, DollarSign, MessageCircle, Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

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
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
}

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
}

export function OfferCreator({ targetItem, targetUser, myItems, onCancel, onSubmitOffer }) {
  const [selectedItems, setSelectedItems] = useState([])
  const [cashAdjustment, setCashAdjustment] = useState(0)
  const [message, setMessage] = useState("")

  const handleItemToggle = (itemId) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleCashAdjustmentChange = (e) => {
    const value = Number.parseFloat(e.target.value)
    setCashAdjustment(isNaN(value) ? 0 : value)
  }

  const handleSubmit = () => {
    onSubmitOffer({
      targetItemId: targetItem.id,
      offeredItemIds: selectedItems,
      cashAdjustment,
      message,
    })
  }

  // Calculate total value of selected items
  const selectedItemsValue = myItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.valueEstimate, 0)

  // Calculate value difference
  const valueDifference = targetItem.valueEstimate - selectedItemsValue - cashAdjustment

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <motion.div className="grid gap-6 md:grid-cols-2" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={cardVariants}>
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardTitle className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.3 }}
              >
                <ArrowLeftRight className="h-5 w-5 text-primary" />
              </motion.div>
              You Want
            </CardTitle>
            <CardDescription>Item you're making an offer for</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md shadow-md"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Image
                  src={targetItem.image || "/placeholder.svg?height=100&width=100"}
                  alt={targetItem.name}
                  fill
                  className="object-cover"
                />
              </motion.div>
              <div className="flex flex-col justify-between">
                <div>
                  <motion.h3
                    className="font-semibold text-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {targetItem.name}
                  </motion.h3>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Badge variant="outline" className="mt-1">
                      {targetItem.category}
                    </Badge>
                  </motion.div>
                </div>
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={targetUser.avatar || "/placeholder.svg"} alt={targetUser.name} />
                    <AvatarFallback>{targetUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{targetUser.name}</span>
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              className="mt-4 text-xl font-bold text-primary"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 20 }}
            >
              Value: {formatCurrency(targetItem.valueEstimate)}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardTitle className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.3 }}
              >
                <Plus className="h-5 w-5 text-green-600" />
              </motion.div>
              Your Offer
            </CardTitle>
            <CardDescription>Select items to include in your swap</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-6">
            <ScrollArea className="h-[200px] rounded-md border p-2">
              {myItems.length === 0 ? (
                <motion.div
                  className="flex h-full items-center justify-center text-center text-sm text-muted-foreground"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div>
                    <p>You don't have any items to offer</p>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button variant="link" className="mt-2">
                        <Plus className="mr-1 h-4 w-4" />
                        List an item
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {myItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        custom={index}
                        whileHover={{ scale: 1.02 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => handleItemToggle(item.id)}
                          />
                        </motion.div>
                        <motion.div
                          className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                          <Image
                            src={item.image || "/placeholder.svg?height=50&width=50"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </motion.div>
                        <div className="flex flex-1 items-center justify-between">
                          <label
                            htmlFor={`item-${item.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {item.name}
                          </label>
                          <motion.span
                            className="text-sm font-semibold text-primary"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            {formatCurrency(item.valueEstimate)}
                          </motion.span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label htmlFor="cash-adjustment" className="text-sm font-medium">
                Cash Adjustment (if needed)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                  <Input
                    id="cash-adjustment"
                    type="number"
                    placeholder="0"
                    className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    value={cashAdjustment || ""}
                    onChange={handleCashAdjustmentChange}
                  />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label htmlFor="message" className="text-sm font-medium">
                Message to Seller
              </label>
              <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                <Textarea
                  id="message"
                  placeholder="Introduce yourself and explain why you're interested in this item..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div className="md:col-span-2" variants={cardVariants}>
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardTitle>Offer Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex justify-between">
                <span>Your items total value:</span>
                <motion.span
                  className="font-semibold"
                  key={selectedItemsValue}
                  initial={{ scale: 1.2, color: "#3b82f6" }}
                  animate={{ scale: 1, color: "#000000" }}
                  transition={{ duration: 0.3 }}
                >
                  {formatCurrency(selectedItemsValue)}
                </motion.span>
              </div>
              <div className="flex justify-between">
                <span>Cash adjustment:</span>
                <motion.span
                  className="font-semibold"
                  key={cashAdjustment}
                  initial={{ scale: 1.2, color: "#3b82f6" }}
                  animate={{ scale: 1, color: "#000000" }}
                  transition={{ duration: 0.3 }}
                >
                  {formatCurrency(cashAdjustment)}
                </motion.span>
              </div>
              <div className="flex justify-between">
                <span>Target item value:</span>
                <span className="font-semibold">{formatCurrency(targetItem.valueEstimate)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span>Value difference:</span>
                <motion.span
                  className={`font-bold ${valueDifference === 0 ? "text-green-500" : valueDifference > 0 ? "text-red-500" : "text-yellow-500"}`}
                  key={valueDifference}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {valueDifference === 0
                    ? "Fair trade!"
                    : formatCurrency(Math.abs(valueDifference)) + (valueDifference > 0 ? " short" : " extra")}
                </motion.span>
              </div>
            </motion.div>
          </CardContent>
          <CardFooter className="flex justify-between gap-4 p-6">
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </motion.div>
            <div className="flex gap-2">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button variant="outline" className="gap-1">
                  <MessageCircle className="h-4 w-4" />
                  Chat First
                </Button>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  className="gap-1 bg-[#49c5b6] hover:bg-[#3db6a7]"
                  onClick={handleSubmit}
                  disabled={selectedItems.length === 0}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Submit Offer
                </Button>
              </motion.div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}
