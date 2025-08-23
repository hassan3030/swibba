"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const imageVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.9,
  }),
}

const thumbnailVariants = {
  inactive: {
    scale: 1,
    opacity: 0.7,
    filter: "brightness(0.8)",
  },
  active: {
    scale: 1.05,
    opacity: 1,
    filter: "brightness(1)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  hover: {
    scale: 1.1,
    opacity: 1,
    filter: "brightness(1.1)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  tap: { scale: 0.9 },
}

export function ProductGallery({ images, productName }) {
  const [currentImage, setCurrentImage] = useState(0)
  const [direction, setDirection] = useState(0)

  const nextImage = () => {
    setDirection(1)
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setDirection(-1)
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  const selectImage = (index) => {
    setDirection(index > currentImage ? 1 : -1)
    setCurrentImage(index)
  }

  return (
    <motion.div
      className="flex flex-col gap-3 sm:gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted shadow-lg max-h-64 sm:max-h-72 md:max-h-80 w-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentImage}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentImage] || "/placeholder.svg"}
              alt={`${productName} - Image ${currentImage + 1}`}
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <motion.div
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 rounded-full hover:rounded-full"
              variants={buttonVariants}
              whileTap="tap"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Previous image</span>
              </Button>
            </motion.div>

            <motion.div
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 rounded-full hover:rounded-full"
              variants={buttonVariants}
              whileTap="tap"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Next image</span>
              </Button>
            </motion.div>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <motion.div
            className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {currentImage + 1} / {images.length}
          </motion.div>
        )}
      </div>

      {images.length > 1 && (
        <motion.div
          className="flex gap-1 sm:gap-2 overflow-auto pb-2 scrollbar-hide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {images.map((image, index) => (
            <motion.button
              key={index}
              className={`relative aspect-square h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-md border-2 transition-all duration-200 flex-shrink-0 ${
                currentImage === index ? "border-primary shadow-lg" : "border-transparent"
              }`}
              onClick={() => selectImage(index)}
              variants={thumbnailVariants}
              initial="inactive"
              animate={currentImage === index ? "active" : "inactive"}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Active indicator */}
              <AnimatePresence>
                {currentImage === index && (
                  <motion.div
                    className="absolute inset-0 bg-primary/20 border-2 border-primary rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Mobile swipe hint */}
      {images.length > 1 && (
        <motion.div
          className="text-center text-xs text-muted-foreground sm:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Swipe to view more images
        </motion.div>
      )}
    </motion.div>
  )
}
