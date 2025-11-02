import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, ImageIcon } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslations } from "@/lib/use-translations"

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.2 }
  }
}

export const ImageUploadSection = ({
  existingImages = [],
  imageUrls = [],
  imagesFile = [],
  onImageUpload,
  onRemoveImage,
  bigImage,
  onSetBigImage,
  isMediaDirty
}) => {
  const { t } = useTranslations()
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files)
    }
  }

  const allImages = [
    ...existingImages.map((img, index) => ({ ...img, index, isExisting: true })),
    ...imageUrls.map((url, index) => ({ url, index: existingImages.length + index, isExisting: false }))
  ]

  return (
    <motion.div 
      className="space-y-6"
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
      }}
    >
      {/* Upload Area */}
      <Card className="rounded-xl border-2 border-dashed border-border hover:border-primary transition-all shadow-sm bg-card/50">
        <CardContent className="p-6">
          <div
            className={`relative flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed transition-all ${
              dragActive 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary hover:bg-primary/5"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center text-center">
              <Upload className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-foreground font-medium">
                {t("Draganddropimageshereorclicktoupload") || "Drag and drop images here or click to upload"}
              </p>
              <p className="text-xs text-primary mt-1">
                {t("SupportsJPGPNGWebPformats") || "Supports JPG, PNG, WebP formats"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Grid */}
      {allImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {t("Images") || "Images"} ({allImages.length})
            </h3>
            {isMediaDirty && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20"
              >
                {t("UnsavedChanges") || "Unsaved changes"}
              </motion.div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {allImages.map((image, index) => (
                <motion.div
                  key={`${image.isExisting ? 'existing' : 'new'}-${image.index}`}
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    bigImage === image.url 
                      ? "border-primary ring-2 ring-primary/20 shadow-md" 
                      : "border-border hover:border-primary hover:shadow-md"
                  }`}
                  onClick={() => onSetBigImage(image.url)}
                >
                  <div className="aspect-square relative">
                    <Image
                      src={image.url}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    
                    {/* Remove Button */}
                    <motion.button
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveImage(image.index, image.isExisting)
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-3 w-3" />
                    </motion.button>
                    
                    {/* Existing Image Badge */}
                    {image.isExisting && (
                      <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-md">
                        {t("Existing") || "Existing"}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Large Image Preview */}
      {bigImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-2"
        >
          <h3 className="text-lg font-semibold">
            {t("Preview") || "Preview"}
          </h3>
          <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden border">
            <Image
              src={bigImage}
              alt="Preview"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
