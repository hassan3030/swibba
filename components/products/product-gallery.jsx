"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, X, ZoomIn, ZoomOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMediaType } from "@/lib/utils"
import { mediaURL } from "@/callAPI/utiles"

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

export function ProductGallery({ images = [], productName }) {
  const [currentImage, setCurrentImage] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [zoomBgPos, setZoomBgPos] = useState({ x: 50, y: 50 })
  const [zoomScale, setZoomScale] = useState(2)
  const [isMainImageLoading, setIsMainImageLoading] = useState(true)
  const [isZoomImageLoaded, setIsZoomImageLoaded] = useState(false)

  const mainImageRef = useRef(null)
  const overlayImageRef = useRef(null)
  const touchStartRef = useRef(null)
  const lastDistanceRef = useRef(null)

  useEffect(() => {
    setIsMainImageLoading(true)
    setIsZoomImageLoaded(false)
  }, [currentImage])

  // Reset current image if images array changes and index is out of bounds
  useEffect(() => {
    if (currentImage >= images.length) {
      setCurrentImage(0)
    }
  }, [images, currentImage])

  // Prefetch adjacent images for smooth navigation
  useEffect(() => {
    if (typeof window === 'undefined' || images.length === 0) return

    const prefetchImage = (index) => {
      const media = images[index]?.directus_files_id
      if (!media?.id) return
      
      const mediaType = getMediaType(media.type || '')
      if (mediaType !== 'image') return

      const url = `${mediaURL}${media.id}`
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)

      return () => {
        try {
          document.head.removeChild(link)
        } catch (e) {
          // Link already removed
        }
      }
    }

    // Prefetch next and previous images
    const nextIndex = (currentImage + 1) % images.length
    const prevIndex = (currentImage - 1 + images.length) % images.length

    const cleanupNext = prefetchImage(nextIndex)
    const cleanupPrev = prefetchImage(prevIndex)

    return () => {
      cleanupNext?.()
      cleanupPrev?.()
    }
  }, [currentImage, images])

  if (images.length === 0) return null


  const nextImage = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Pause current video if playing
    const currentVideoElement = document.querySelector(`#gallery-video-${currentImage}`)
    if (currentVideoElement) {
      currentVideoElement.pause()
    }
    
    setDirection(1)
    setCurrentImage((prev) => (prev + 1) % images.length)
    setIsPlaying(false)
  }

  const prevImage = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Pause current video if playing
    const currentVideoElement = document.querySelector(`#gallery-video-${currentImage}`)
    if (currentVideoElement) {
      currentVideoElement.pause()
    }
    
    setDirection(-1)
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
    setIsPlaying(false)
  }

  const selectImage = (index) => {
    // Pause current video if playing
    const currentVideoElement = document.querySelector(`#gallery-video-${currentImage}`)
    if (currentVideoElement) {
      currentVideoElement.pause()
    }
    
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
    id: images[currentImage]?.directus_files_id?.id || '',
    type: images[currentImage]?.directus_files_id?.type || '',
    url: images[currentImage]?.directus_files_id?.id
      ? `${mediaURL}${images[currentImage]?.directus_files_id.id}`
      : ''
  }
  const currentMediaType = getMediaType(currentMedia.type)

  const handleMouseMove = useCallback((e) => {
    if (!isZoomOpen || zoomScale <= 1) return
    const targetRect = overlayImageRef.current?.getBoundingClientRect()
    if (!targetRect) return
    const x = Math.max(0, Math.min(1, (e.clientX - targetRect.left) / targetRect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - targetRect.top) / targetRect.height))
    setZoomBgPos({ x: x * 100, y: y * 100 })
  }, [isZoomOpen, zoomScale])

  const handleWheel = useCallback((e) => {
    if (!isZoomOpen) return
    e.preventDefault()
    const delta = e.deltaY * -0.01
    const newScale = Math.max(1, Math.min(5, zoomScale + delta))
    setZoomScale(newScale)
  }, [isZoomOpen, zoomScale])


  const handleTouchStart = useCallback((e) => {
    if (!isZoomOpen) return
    if (e.touches.length === 1 && zoomScale > 1) {
      const touch = e.touches[0]
      const targetRect = overlayImageRef.current?.getBoundingClientRect()
      if (!targetRect) return
      const x = Math.max(0, Math.min(1, (touch.clientX - targetRect.left) / targetRect.width))
      const y = Math.max(0, Math.min(1, (touch.clientY - targetRect.top) / targetRect.height))
      setZoomBgPos({ x: x * 100, y: y * 100 })
      
      // Store initial touch position for tap detection
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    } else if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() }
    }
  }, [isZoomOpen, zoomScale])

  const handleTouchMove = useCallback((e) => {
    if (!isZoomOpen) return
    
    // Handle pinch-to-zoom
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      
      // Store initial distance for comparison
      if (!lastDistanceRef.current) {
        lastDistanceRef.current = distance
      }
      
      const scaleChange = distance / lastDistanceRef.current
      const newScale = Math.max(1, Math.min(5, zoomScale * scaleChange))
      setZoomScale(newScale)
      lastDistanceRef.current = distance
    } else if (e.touches.length === 1 && zoomScale > 1) {
      // Handle single touch for panning only when zoomed
      const touch = e.touches[0]
      const targetRect = overlayImageRef.current?.getBoundingClientRect()
      if (!targetRect) return
      const x = Math.max(0, Math.min(1, (touch.clientX - targetRect.left) / targetRect.width))
      const y = Math.max(0, Math.min(1, (touch.clientY - targetRect.top) / targetRect.height))
      setZoomBgPos({ x: x * 100, y: y * 100 })
    }
  }, [isZoomOpen, zoomScale])

  const handleTouchEnd = useCallback((e) => {
    if (!isZoomOpen) return
    lastDistanceRef.current = null
    
    // Detect tap to close zoom (single touch, short duration, minimal movement)
    if (e.touches.length === 0 && touchStartRef.current) {
      const touch = e.changedTouches[0]
      const initialTouch = touchStartRef.current
      const timeDiff = Date.now() - initialTouch.time
      const distance = Math.sqrt(
        Math.pow(touch.clientX - initialTouch.x, 2) + 
        Math.pow(touch.clientY - initialTouch.y, 2)
      )
      
      // If it's a quick tap (less than 300ms) with minimal movement (less than 10px)
      if (timeDiff < 300 && distance < 10) {
        setIsZoomOpen(false)
      }
    }
    
    touchStartRef.current = null
  }, [isZoomOpen])

  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isZoomOpen && e.key === 'Escape') {
        setIsZoomOpen(false)
      }
    }

    if (isZoomOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when zoom is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isZoomOpen])

  if (images.length === 0) return null

  return (
    <motion.div
      className="flex flex-col gap-3 sm:gap-4 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Main Image Container */}
      <div className="bg-gradient-to-br from-primary/5 via-transparent to-secondary2/5 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg">
        <div
          ref={mainImageRef}
          className="relative aspect-square overflow-hidden rounded-lg sm:rounded-xl border shadow-lg w-full cursor-zoom-in hover:shadow-xl transition-shadow duration-300"
          onClick={() => {
            if (currentMediaType === 'image') {
              setZoomScale(2)
              setZoomBgPos({ x: 50, y: 50 })
              setIsZoomOpen(true)
            }
          }}
          onTouchEnd={(e) => {
            if (currentMediaType === 'image' && e.touches.length === 0) {
              setZoomScale(2)
              setZoomBgPos({ x: 50, y: 50 })
              setIsZoomOpen(true)
            }
          }}
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
                const mediaType = currentMediaType
                if (!currentMedia.url) return null
                if (mediaType === 'video') {
                  return (
                    <video
                      key={`video-${currentImage}-${currentMedia.id}`}
                      id={`gallery-video-${currentImage}`}
                      src={currentMedia.url}
                      className="w-full h-full"
                      style={{ objectFit: 'contain', objectPosition: 'center' }}
                      muted={isMuted}
                      playsInline
                      preload="metadata"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onLoadStart={() => setIsMainImageLoading(true)}
                      onLoadedData={() => setIsMainImageLoading(false)}
                    />
                  )
                } else if (mediaType === 'audio') {
                  return (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                      <div className="text-center text-white p-4">
                        <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎵</div>
                        <div className="text-sm sm:text-lg font-medium mb-3 sm:mb-4">Audio File</div>
                        <audio
                          id={`gallery-audio-${currentImage}`}
                          src={currentMedia.url}
                          controls
                          className="w-full max-w-xs"
                        />
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <>
                      {isMainImageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 z-10">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      )}
                      <Image
                        src={currentMedia.url}
                        alt={`${productName} - Image ${currentImage + 1}`}
                        fill
                        className={`transition-opacity duration-300 ${isMainImageLoading ? 'opacity-0' : 'opacity-100'}`}
                        style={{
                          objectFit: 'contain',
                          objectPosition: 'center',
                        }}
                        priority={currentImage === 0}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
                        quality={95}
                        loading={currentImage === 0 ? "eager" : "lazy"}
                        onLoad={() => setIsMainImageLoading(false)}
                        onError={(e) => {
                          console.error('Image load error:', currentMedia.url)
                          setIsMainImageLoading(false)
                        }}
                      />
                    </>
                  )
                }
              })()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background transition-colors"
                  onClick={(e) => prevImage(e)}
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="sr-only">Previous image</span>
                </Button>
              </div>

              <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background transition-colors"
                  onClick={(e) => nextImage(e)}
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="sr-only">Next image</span>
                </Button>
              </div>
            </>
          )}

          {/* Video Controls */}
          {currentMediaType === 'video' && (
            <motion.div 
              className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex gap-1.5 sm:gap-2 z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-black/80 text-white hover:bg-black backdrop-blur-sm"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-black/80 text-white hover:bg-black backdrop-blur-sm"
                onClick={toggleMute}
              >
                <Volume2 className={`h-4 w-4 ${isMuted ? 'opacity-50' : ''}`} />
              </Button>
            </motion.div>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <motion.div
              className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black/80 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium z-10 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {currentImage + 1} / {images.length}
            </motion.div>
          )}

          {/* Thumbnail Circles - Overlaid on main image */}
          {images.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center z-10">
              <motion.div
                className="flex gap-2 sm:gap-2.5 items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
              {images.map((image, index) => {
                const thumbMedia = {
                  id: image?.directus_files_id?.id || '',
                  type: image?.directus_files_id?.type || '',
                  url: image?.directus_files_id?.id
                    ? `${mediaURL}${image.directus_files_id.id}`
                    : ''
                }
                const thumbMediaType = getMediaType(thumbMedia.type)

                return (
                  <motion.button
                    key={index}
                    variants={thumbnailVariants}
                    initial="inactive"
                    animate={currentImage === index ? "active" : "inactive"}
                    whileHover="hover"
                    onClick={(e) => {
                      e.stopPropagation()
                      selectImage(index)
                    }}
                    className={`relative flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                      currentImage === index
                        ? "border-primary shadow-lg ring-2 ring-primary/50 scale-110"
                        : "border-white/60 hover:border-white"
                    }`}
                  >
                    {thumbMediaType === 'video' ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Play className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                    ) : thumbMediaType === 'audio' ? (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                    ) : (
                      <Image
                        src={thumbMedia.url}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="transition-opacity hover:opacity-90"
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                        sizes="48px"
                        quality={70}
                        loading="lazy"
                      />
                    )}
                  </motion.button>
                )
              })}
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Modal - Full Screen with Better Mobile Support */}
      {/* Zoom Modal - Full Screen with Better Mobile Support */}
      {isZoomOpen && currentMediaType === 'image' && (
        <div
          className="fixed inset-0 z-[999999999] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Modal Container - 80% of screen */}
          <div 
            className="relative w-full max-w-[90vw] h-[90vh] bg-white/20 dark:bg-gray-900/20 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Close Button */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/60 to-transparent">
              <div className="text-white text-sm sm:text-base font-medium">
                {currentImage + 1} / {images.length}
              </div>
              <button
                onClick={() => setIsZoomOpen(false)}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage(e)
                  }}
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/90 hover:bg-white text-gray-900 flex items-center justify-center shadow-lg transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage(e)
                  }}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/90 hover:bg-white text-gray-900 flex items-center justify-center shadow-lg transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </>
            )}

            {/* Zoomable Image Container */}
            <div
              ref={overlayImageRef}
              className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black/5"
              style={{ touchAction: 'none' }}
              onMouseMove={handleMouseMove}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {!isZoomImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-white drop-shadow-lg" />
                </div>
              )}
              
              {/* High-resolution image for zooming with proper aspect ratio */}
              <img 
                src={currentMedia.url} 
                className="max-w-full max-h-full transition-opacity duration-300 select-none"
                style={{
                  objectFit: 'contain',
                  objectPosition: `${zoomBgPos.x}% ${zoomBgPos.y}%`,
                  transform: `scale(${zoomScale})`,
                  transformOrigin: `${zoomBgPos.x}% ${zoomBgPos.y}%`,
                  opacity: isZoomImageLoaded ? 1 : 0,
                  cursor: zoomScale > 1 ? 'move' : 'zoom-in',
                  imageRendering: zoomScale > 2 ? 'high-quality' : 'auto',
                }}
                onLoad={() => setIsZoomImageLoaded(true)}
                onError={() => setIsZoomImageLoaded(true)} 
                alt={`${productName} - Zoomed`}
                draggable={false}
              />
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-3 sm:p-4 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                {/* Zoom Out Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setZoomScale(prev => Math.max(1, prev - 0.5))
                  }}
                  disabled={zoomScale <= 1}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/90 hover:bg-white text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                {/* Zoom Level Indicator */}
                <div className="bg-white/90 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                  <span className="text-gray-900 text-sm sm:text-base font-medium">
                    {Math.round(zoomScale * 100)}%
                  </span>
                </div>

                {/* Zoom In Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setZoomScale(prev => Math.min(5, prev + 0.5))
                  }}
                  disabled={zoomScale >= 5}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/90 hover:bg-white text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
