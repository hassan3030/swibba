"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormLabel } from "@/components/ui/form"
import { X, Upload, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { imageUploadVariants, itemVariants, MAX_IMAGES } from "./constants"
import { getMediaType } from "./helpers"

interface MediaUploadSectionProps {
  images: File[]
  imageUrls: string[]
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeImage: (index: number) => void
  t: (key: string) => string
}

export function MediaUploadSection({
  images,
  imageUrls,
  handleImageUpload,
  removeImage,
  t,
}: MediaUploadSectionProps) {
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
          {imageUrls.map((url, index) => {
            const file = images[index]
            const mediaType = getMediaType(file?.type)

            return (
              <motion.div
                key={`media-${index}-${file?.name || "unknown"}`}
                variants={imageUploadVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                whileHover="hover"
              >
                <Card className="relative overflow-hidden rounded-xl shadow-md border border-border bg-card">
                  <div className="aspect-square relative">
                    {mediaType === "video" ? (
                      <video
                        src={url}
                        className="w-full h-full object-cover rounded-xl"
                        controls
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          if (e.currentTarget.nextElementSibling) {
                            ;(e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex"
                          }
                        }}
                      />
                    ) : mediaType === "audio" ? (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center rounded-xl">
                        <div className="text-center text-white">
                          <div className="text-4xl mb-2">🎵</div>
                          <div className="text-sm font-medium">Audio File</div>
                        </div>
                        <audio src={url} className="hidden" />
                      </div>
                    ) : (
                      <Image
                        src={url || "/placeholder.svg"}
                        alt={`Item Media ${index + 1}`}
                        fill
                        className="object-cover rounded-xl"
                      />
                    )}
                    {mediaType === "video" && (
                      <div
                        className="absolute inset-0 bg-gray-200 items-center justify-center hidden rounded-xl"
                        style={{ display: "none" }}
                      >
                        <div className="text-center text-gray-600">
                          <div className="text-4xl mb-2">🎥</div>
                          <div className="text-sm">Video not available</div>
                        </div>
                      </div>
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
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {images.length < MAX_IMAGES && (
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
        {t("images") || "images"} (JPEG, PNG, WebP, {t("max80MBEach")})
      </p>
        </motion.div>
      </CardContent>
    </Card>
  )
}
