"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Upload, Image as ImageIcon, Play } from "lucide-react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { imageUploadVariants, itemVariants, MAX_IMAGES } from "./constants"
import { getMediaType } from "./helpers"
import { ExistingImage } from "./use-media-upload-update"

interface MediaUploadSectionUpdateProps {
  existingImages: ExistingImage[]
  newImageUrls: string[]
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeImage: (index: number) => void
  t: (key: string) => string
}

export function MediaUploadSectionUpdate({
  existingImages,
  newImageUrls,
  handleImageUpload,
  removeImage,
  t,
}: MediaUploadSectionUpdateProps) {
  const totalCount = existingImages.length + newImageUrls.length

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <ImageIcon className="h-6 w-6 text-primary" />
          {t("itemMedia") || "Item Media"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div className="space-y-4" variants={itemVariants}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {/* Existing Images */}
              {existingImages.map((image, index) => {
                const mediaType = getMediaType(image.type)

                return (
                  <motion.div
                    key={`existing-${image.fileId}`}
                    variants={imageUploadVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    whileHover="hover"
                  >
                    <Card className="relative overflow-hidden rounded-xl shadow-md border border-border bg-card">
                      <div className="aspect-square relative">
                        {mediaType === "video" ? (
                          <div className="relative w-full h-full">
                            <video
                              src={image.url}
                              className="w-full h-full object-cover rounded-xl"
                              muted
                              loop
                              playsInline
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <div className="bg-white/90 rounded-full p-3">
                                <Play className="h-6 w-6 text-gray-800 fill-current" />
                              </div>
                            </div>
                          </div>
                        ) : mediaType === "audio" ? (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center rounded-xl">
                            <div className="text-center text-white">
                              <div className="text-4xl mb-2">🎵</div>
                              <div className="text-sm font-medium">Audio File</div>
                            </div>
                          </div>
                        ) : (
                          <Image
                            src={image.url || "/placeholder.svg"}
                            alt={`Existing Media ${index + 1}`}
                            fill
                            className="object-cover rounded-xl"
                          />
                        )}
                      </div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute right-2 top-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7 rounded-full shadow-md"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      {/* Existing badge */}
                      <div className="absolute left-2 top-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full">
                        {t("existing") || "Existing"}
                      </div>
                    </Card>
                  </motion.div>
                )
              })}

              {/* New Images */}
              {newImageUrls.map((url, index) => {
                const actualIndex = existingImages.length + index

                return (
                  <motion.div
                    key={`new-${index}-${url.slice(-10)}`}
                    variants={imageUploadVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    whileHover="hover"
                  >
                    <Card className="relative overflow-hidden rounded-xl shadow-md border border-border bg-card">
                      <div className="aspect-square relative">
                        <Image
                          src={url || "/placeholder.svg"}
                          alt={`New Media ${index + 1}`}
                          fill
                          className="object-cover rounded-xl"
                        />
                      </div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute right-2 top-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7 rounded-full shadow-md"
                          onClick={() => removeImage(actualIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      {/* New badge */}
                      <div className="absolute left-2 top-2 bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full">
                        {t("new") || "New"}
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Upload button */}
            {totalCount < MAX_IMAGES && (
              <motion.div variants={imageUploadVariants} initial="hidden" animate="visible" whileHover="hover">
                <Card className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 hover:border-primary hover:bg-primary/5 transition-all shadow-sm">
                  <CardContent className="flex h-full w-full flex-col items-center justify-center p-4">
                    <label htmlFor="image-upload" className="cursor-pointer text-center">
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-xs text-primary font-semibold">{t("Clicktoupload") || "Click to upload"}</p>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/mov,video/avi,video/mkv,video/webm,video/flv,video/wmv,video/mpeg,video/mpg,video/m4v,video/m4a,video/m4b,video/m4p,audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/m4b,audio/m4p"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
          <p className="mt-2 text-sm text-foreground/60">
            {t("Uploadupto") || "Upload up to"} <span className="font-bold text-primary">{MAX_IMAGES}</span>{" "}
            {t("images") || "images"} (JPEG, PNG, WebP, {t("max80MBEach") || "max 100MB each"})
          </p>
          {existingImages.length > 0 && (
            <p className="text-sm text-green-600">
              {existingImages.length} {t("existingMedia") || "existing media file(s)"}
            </p>
          )}
        </motion.div>
      </CardContent>
    </Card>
  )
}
