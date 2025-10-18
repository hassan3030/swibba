"use client"
import {  useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, MoreHorizontal, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { deleteProduct } from "@/callAPI/products"
import { useTranslations } from "@/lib/use-translations"
import { getMediaType } from "@/lib/utils"
import { useLanguage } from "@/lib/language-provider"

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
}

const imageVariants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.3 },
  },
}

const ItemCard = ({ item }) => {
  const { toast } = useToast()
  // const [bigImage, setBigImage] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { t } = useTranslations()
  const router = useRouter()
  const { isRTL, toggleLanguage } = useLanguage()
  const [imageLoaded, setImageLoaded] = useState(false)



  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteProduct(item.id)
      toast({
        title: t("itemDeleted") || "Item Deleted",
        description: t("itemDeletedDesc") || "The item has been successfully deleted.",
        variant: "default",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: t("deleteError") || "Failed to delete item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // useEffect(() => {
  //   getDataImage()
  // }, [item.images])

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex flex-col rounded-lg border sm:flex-row hover:shadow-lg transition-shadow">
        <motion.div
          className="relative h-40 w-full sm:h-auto sm:w-40 overflow-hidden"
          variants={imageVariants}
          whileHover="hover"
        >
          {(() => {
                    const mediaUrl = {
                      id: item.images[0]?.directus_files_id.id,
                      type: item.images[0]?.directus_files_id.type,
                      url: `https://deel-deal-directus.csiwm3.easypanel.host/assets/${item.images[0]?.directus_files_id.id}`
                    }
                    const mediaType = getMediaType(mediaUrl.type)
                    
                    if (mediaType === 'video') {
                      return (
                        <motion.div variants={imageVariants} className="w-full h-full relative">
                          <video
                            src={mediaUrl.url}
                            className="w-full h-full object-cover transition-transform duration-300"
                            muted
                            loop
                            playsInline
                            onLoadedData={() => setImageLoaded(true)}
                          />
                          {/* Video play overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                            <div className="bg-white/90 rounded-full p-2 group-hover:scale-110 transition-transform">
                              <Play className="h-6 w-6 text-gray-800 fill-current" />
                            </div>
                          </div>
                        </motion.div>
                      )
                    } else if (mediaType === 'audio') {
                      return (
                        <motion.div variants={imageVariants} className="w-full h-full relative bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="text-4xl mb-2">🎵</div>
                            <div className="text-sm font-medium">Audio File</div>
                          </div>
                          <audio
                            src={mediaUrl.url}
                            className="hidden"
                            onLoadedData={() => setImageLoaded(true)}
                          />
                        </motion.div>
                      )
                    } else {
                      return (
                        <motion.div variants={imageVariants} className="w-full h-full">
                          <Image
                            src={mediaUrl.url || "/placeholder.svg"}
                            alt={!isRTL ? item.translations[0]?.name: item.translations[1]?.name || item.name}
                            fill
                            className="transition-transform duration-300 object-fill"
                            placeholder="blur"
                            blurDataURL="/placeholder.svg?height=300&width=300"
                            priority
                            onLoad={() => setImageLoaded(true)}
                          />
                        </motion.div>
                      )
                    }
                  })()}
          {/* <Image
            src={`https://deel-deal-directus.csiwm3.easypanel.host/assets/${item.images[0]?.directus_files_id.id}` || "/placeholder.svg"}
            alt={item.name}
            fill
            className="rounded-t-lg object-cover sm:rounded-l-lg sm:rounded-tr-none"
          /> */}
        </motion.div>
        <div className="flex flex-1 flex-col p-4">
          <motion.div
            className="mb-2 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div>
              <motion.h3
                className="font-medium capitalize"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
              {(!isRTL ? item.translations[0]?.name: item.translations[1]?.name) || item.name}

            
              </motion.h3>
              <motion.div
                className="mt-1 flex items-center gap-2 capitalize"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge>{t(item.category)}</Badge>
                <Badge variant={item.status_item === "available" ? "outline" : "secondary"}>
                  {t(item.status_item)}
                </Badge>
              </motion.div>
              <motion.div
                className="mt-1 flex items-center gap-2 capitalize"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Badge>
                  {t("statusSwap")}: {t(item.status_swap)}
                </Badge>
              </motion.div>
            </div>

            <motion.div
              className=""
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col items-start gap-1">
                <motion.span
                  className="inline-flex items-center gap-2 rounded bg-background  px-2 py-1 text-base font-bold text-secondary2 shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {t("aIExpectedPrice")}:
                  <span className="text-lg font-extrabold text-secondary2">
                    {item.value_estimate} {t("currencyLE") || "LE"}
                  </span>
                </motion.span>
                <span className="text-xs text-muted-foreground">
                  {t("listedOn")} {new Date(item.date_created).toISOString().split("T")[0]}
                </span>

                <span className="text-sm text-muted-foreground">
                  {t("quantity")||"Quantity"}: {item.quantity}
                </span>
              </div>
            </motion.div>
          </motion.div>

          <motion.p
            className="text-sm text-muted-foreground line-clamp-1 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
             {(!isRTL ? item.translations[0]?.description: item.translations[1]?.description) || item.description}
          </motion.p>

          <motion.div
            className="mt-auto flex justify-end pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost"  className="text-primary border border-primary font-bold hover:text-white">
                    {t("more")||"More"}  <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/products/${item.id}`} className="flex items-center w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      {t("view")}
                    </Link>
                  </DropdownMenuItem>
                  {item.status_swap === "available" && (
                  <DropdownMenuItem asChild>
                    <Link href={`settings/editItem/${item.id}`} className="flex items-center w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      {t("edit")}
                    </Link>
                  </DropdownMenuItem>
                  )}
                  {item.status_swap === "available" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("soldOut")||"Sold Out"}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogContent>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <DialogHeader>
                    <DialogTitle>{t("deleteOneItem") || "Delete Item"}</DialogTitle>
                    <DialogDescription>
                      {t("deleteDialogDesc") ||
                        "Are you sure you want to delete this item? This action cannot be undone."}
                    </DialogDescription>
                  </DialogHeader>
                  <p>
                    {t("areYouSureDelete") ||
                      "This will permanently remove the item from your listings."}
                  </p>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">{t("cancel") || "Cancel"}</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          {t("deleting") || "Deleting..."}
                        </>
                      ) : (
                        t("delete") || "Delete"
                      )}
                    </Button>
                  </DialogFooter>
                </motion.div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default ItemCard
