"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeftRight, ChevronRight, Heart, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils"

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
}

const imageVariants = {
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
}

const heartVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.2 },
  tap: { scale: 0.9 },
  liked: {
    scale: [1, 1.3, 1],
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.95,
  },
}

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

export function ItemCard({ item }) {
  const [isSaved, setIsSaved] = useState(false)
  const router = useRouter()

  const handleSaveClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSaved(!isSaved)
    // In a real app, you would save this to the user's favorites
    console.log(`Item ${item.id} ${!isSaved ? "saved" : "unsaved"}`)
  }

  const handleMakeOffer = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // In a real app, this would navigate to the offer creation page
    console.log(`Make offer for item ${item.id}`)
    router.push(`/offers/create?itemId=${item.id}`)
  }

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover" className="group">
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="relative">
          <Link href={`/items/${item.id}`}>
            <motion.div className="relative aspect-square overflow-hidden" variants={imageVariants}>
              <Image
                src="/placeholder.svg?height=400&width=400"
                alt={item.name}
                fill
                className="object-cover transition-transform duration-300"
              />
            </motion.div>
          </Link>

          <motion.div
            className="absolute right-2 top-2"
            variants={heartVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            animate={isSaved ? "liked" : "initial"}
          >
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm dark:bg-gray-800/80"
              onClick={handleSaveClick}
            >
              <Heart className={cn("h-4 w-4", isSaved ? "fill-primary text-primary" : "")} />
              <span className="sr-only">{isSaved ? "Unsave" : "Save"} item</span>
            </Button>
          </motion.div>

          <motion.div
            className="absolute left-2 top-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">{item.category}</Badge>
          </motion.div>
        </div>

        <motion.div variants={contentVariants} initial="hidden" animate="visible">
          <CardContent className="p-4">
            <motion.div className="mb-2 flex items-start justify-between gap-2" variants={itemVariants}>
              <Link href={`/items/${item.id}`} className="group">
                <h3 className="line-clamp-1 font-semibold group-hover:text-primary transition-colors">{item.name}</h3>
              </Link>
              <motion.div
                className="flex items-center whitespace-nowrap text-sm font-semibold text-foreground"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {formatCurrency(item?.valueEstimate)}
              </motion.div>
            </motion.div>

            <motion.p className="mb-3 line-clamp-2 text-sm text-muted-foreground" variants={itemVariants}>
              {item.description}
            </motion.p>

            <motion.div className="mb-3" variants={itemVariants}>
              <div className="text-xs text-muted-foreground">Will swap for:</div>
              <div className="mt-1 flex flex-wrap gap-1">{/* Placeholder for allowed categories */}</div>
            </motion.div>

            <motion.div className="flex items-center justify-between" variants={itemVariants}>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={item?.avatar || "/placeholder.svg"} alt={item.name} />
                  <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{(item?.ratings ?? 0).toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{formatRelativeTime(item?.date_created)}</div>
            </motion.div>
          </CardContent>

          <CardFooter className="flex gap-2 border-t p-3">
            <motion.div className="flex-1" variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button variant="outline" size="sm" className="w-full gap-1" onClick={handleMakeOffer}>
                <ArrowLeftRight className="h-4 w-4" />
                Make Offer
              </Button>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <Link href={`/items/${item.id}`}>
                  Details
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </CardFooter>
        </motion.div>
      </Card>
    </motion.div>
  )
}
