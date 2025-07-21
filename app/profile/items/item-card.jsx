"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { deleteProduct, getImageProducts } from "@/callAPI/products"
import { useTranslations } from "@/lib/use-translations"

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
  const [bigImage, setBigImage] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const { t } = useTranslations()
  const router = useRouter()

  const getDataImage = async () => {
    if (item.images) {
      const images2 = await getImageProducts(item.images)
      setBigImage(images2.data[0]?.directus_files_id || "")
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteProduct(item.id)
      toast({
        title: t("itemDeleted") || "Item Deleted",
        description: t("itemDeletedDesc") || "The item has been successfully deleted.",
        variant: "success",
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

  useEffect(() => {
    getDataImage()
  }, [item.images])

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
          <Image
            src={`http://localhost:8055/assets/${bigImage}` || "/placeholder.svg"}
            alt={item.name}
            fill
            className="rounded-t-lg object-cover sm:rounded-l-lg sm:rounded-tr-none"
          />
        </motion.div>
        <div className="flex flex-1 flex-col p-4">
          <motion.div
            className="mb-2 flex sm:flex-col justify-between"
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
                {item.name}
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
              className="text-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col items-end gap-1">
                <motion.span
                  className="inline-flex items-center gap-2 rounded bg-orange-50 px-2 py-1 text-base font-bold text-orange-700 shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {t("aIExpectedPrice")}:
                  <span className="text-lg font-extrabold text-orange-900">
                    {item.value_estimate} {t("currencyLE") || "LE"}
                  </span>
                </motion.span>
                <span className="text-xs text-muted-foreground">
                  {t("listedOn")} {new Date(item.date_created).toISOString().split("T")[0]}
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
            {item.description}
          </motion.p>

          <motion.div
            className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2">{/* Future feature */}</div>
            <div className="flex gap-2">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/products/${item.id}`}>
                    <Eye className="mr-1 h-4 w-4" />
                    {t("view")}
                  </Link>
                </Button>
              </motion.div>

              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button asChild variant="outline" size="sm">
                  <Link href={`settings/editItem/${item.id}`}>
                    <Edit className="mr-1 h-4 w-4" />
                    {t("edit")}
                  </Link>
                </Button>
              </motion.div>

            {item.status_swap === "available" && (
              <Dialog>
                <DialogTrigger asChild>
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button variant="destructive" size="sm" disabled={isDeleting}>
                      <Trash2 className="mr-1 h-4 w-4" />
                      {isDeleting ? t("deleting") || "Deleting..." : t("delete")}
                    </Button>
                  </motion.div>
                </DialogTrigger>

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
                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                          <Button variant="outline">{t("cancel") || "Cancel"}</Button>
                        </motion.div>
                      </DialogClose>

                      <DialogClose asChild>
                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
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
                        </motion.div>
                      </DialogClose>
                    </DialogFooter>
                  </motion.div>
                </DialogContent>
              </Dialog>
            )}

            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default ItemCard
