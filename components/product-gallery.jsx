"use client"

import { useRef, useState, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Pause, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMediaType } from "@/lib/utils"

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
  },
  active: {
    scale: 1.05,
    opacity: 1,
  },
  hover: {
    scale: 1.1,
    opacity: 1,
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
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [zoomBgPos, setZoomBgPos] = useState({ x: 50, y: 50 })
  const mainImageRef = useRef(null)
  const overlayImageRef = useRef(null)

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
    // Reset video controls when switching media
    setIsPlaying(false)
  }

  const togglePlayPause = () => {
    const videoElement = document.querySelector(`#gallery-video-${currentImage}`)
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause()
      } else {
        videoElement.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    const videoElement = document.querySelector(`#gallery-video-${currentImage}`)
    if (videoElement) {
      videoElement.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Resolve current media once for reuse
  const currentMedia = {
    id: images[currentImage]?.directus_files_id.id || '',
    type: images[currentImage]?.directus_files_id.type || '',
    url: images[currentImage]?.directus_files_id?.id
      ? `https://deel-deal-directus.csiwm3.easypanel.host/assets/${images[currentImage]?.directus_files_id.id}`
      : ''
  }
  const currentMediaType = getMediaType(currentMedia.type)

  const handleMouseMove = useCallback((e) => {
    if (!isZoomOpen) return
    const targetRect = overlayImageRef.current?.getBoundingClientRect()
    if (!targetRect) return
    const x = Math.max(0, Math.min(1, (e.clientX - targetRect.left) / targetRect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - targetRect.top) / targetRect.height))
    setZoomBgPos({ x: x * 100, y: y * 100 })
  }, [isZoomOpen])

  return (
    <motion.div
      className="flex flex-col gap-3 sm:gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div
        ref={mainImageRef}
        className="relative aspect-square overflow-hidden rounded-lg border bg-muted shadow-lg max-h-64 sm:max-h-72 md:max-h-80 w-full cursor-pointer"
        onClick={() => currentMediaType === 'image' && setIsZoomOpen(true)}
      >
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
{(() => {
              // Determine media type based on URL
              const mediaType = currentMediaType
              if (mediaType === 'video') {
                return (
                  <video
                    id={`gallery-video-${currentImage}`}
                    src={currentMedia.url}
                    className="w-full h-full object-contain"
                    muted={isMuted}
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                )
              } else if (mediaType === 'audio') {
                return (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">🎵</div>
                      <div className="text-lg font-medium mb-4">Audio File</div>
                      <audio
                        id={`gallery-audio-${currentImage}`}
                        src={currentMedia.url}
                        controls
                        className="w-64"
                      />
                    </div>
                  </div>
                )
              } else {
                return (
                  <Image
                    src={currentMedia.url}
                    alt={`${productName} - Image ${currentImage + 1}`}
                    fill
                    className="object-contain"
                    priority
                  />
                )
              }
            })()}
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

        {/* Video controls */}
        {(() => {
          const currentMedia = {
            id: images[currentImage]?.directus_files_id.id || '',
            type: images[currentImage]?.directus_files_id.type || '',
            url: `https://deel-deal-directus.csiwm3.easypanel.host/assets/${images[currentImage]?.directus_files_id.id}`
          }
          // console.log("currentMedia", currentMedia)
          // Determine media type based on URL
          const mediaType = getMediaType(currentMedia.type)
          // console.log("mediaType", mediaType)
          if (mediaType === 'video') {
            return (
              <motion.div 
                className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 flex gap-1 z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-black/70 text-white hover:bg-black/90"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-black/70 text-white hover:bg-black/90"
                  onClick={toggleMute}
                >
                  <Volume2 className={`h-4 w-4 ${isMuted ? 'opacity-50' : ''}`} />
                </Button>
              </motion.div>
            )
          }
          return null
        })()}

        {/* Image counter */}
        {images.length > 1 && (
          <motion.div
            className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {currentImage + 1} / {images.length}
          </motion.div>
        )}
      </div>

      {/* Centered zoom overlay */}
      {isZoomOpen && currentMediaType === 'image' && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          aria-modal="true"
          role="dialog"
          onMouseMove={handleMouseMove}
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            ref={overlayImageRef}
            className="relative h:[70vh] w-[70vw] max-w-5xl overflow-hidden rounded-lg border bg-background shadow-2xl h-[70vh]"
          >
            <div
              className="absolute inset-0 bg-no-repeat"
              style={{
                backgroundImage: `url(${currentMedia.url})`,
                backgroundSize: "200% 200%",
                backgroundPosition: `${zoomBgPos.x}% ${zoomBgPos.y}%`,
              }}
            />
          </div>
        </div>
      )}

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
{(() => {
                const imageUrl = {
                  id: image.directus_files_id.id,
                  type: image.directus_files_id.type,
                  url: `https://deel-deal-directus.csiwm3.easypanel.host/assets/${image.directus_files_id.id}`
                }
                const mediaType = getMediaType(imageUrl.type)
                
                if (mediaType === 'video') {
                  return (
                    <>
                      <video
                        src={imageUrl.url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-4 w-4 text-white fill-current" />
                      </div>
                    </>
                  )
                } else if (mediaType === 'audio') {
                  return (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <div className="text-white text-lg">🎵</div>
                    </div>
                  )
                } else {
                  return (
                    <Image
                      src={imageUrl.url || "/placeholder.svg"}
                      alt={`${productName} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  )
                }
              })()}

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
