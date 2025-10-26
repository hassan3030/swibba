"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge, Trash2 } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/lib/use-translations"
import Image from "next/image"
import { useLanguage } from "@/lib/language-provider"
import { mediaURL } from "@/callAPI/utiles";
  

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

  
const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: { scale: 0.95 },
  }
  
  
// WishlistCard component
const WishlistCard = ({ item, onRemove }) => {
    // const [bigImage, setBigImage] = useState("")
    const [isRemoving, setIsRemoving] = useState(false)
    const { t } = useTranslations()

    const { isRTL, toggleLanguage } = useLanguage()
    const handleRemove = async () => {
      setIsRemoving(true)
      await onRemove(item.wishlist_id)
    }
  
    return (
      <>
     {/* {isRTL ? translations[1]?.name || name : translations[0]?.name || name} */}


       <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
        <Card className="group hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="p-0">
            <div className="relative overflow-hidden">
             
  
  <Image
              src={`${mediaURL}${item.images[0]?.directus_files_id.id}` || "/placeholder.svg"}
              width={100}
              height={100}
              alt={isRTL ? item.translations[1]?.name || item.name : item.translations[0]?.name || item.name}
              className="w-full h-48 object-cover rounded-t-lg"
               whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
            />
  
              <motion.div className="absolute top-2 right-2" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
                  onClick={handleRemove}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <CardTitle className="text-lg capitalize">{isRTL ? item.translations[1]?.name || item.name : item.translations[0]?.name || item.name}</CardTitle>
              </motion.div>
              <motion.span
                className="text-xs text-primary border border-secondary/90 px-2 py-1 rounded capitalize"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                {t(item.category) || item.category}
              </motion.span>
            </div>
            <motion.p
              className="text-muted-foreground text-sm mb-3 capitalize line-clamp-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isRTL ? item.translations[1]?.description || item.description : item.translations[0]?.description || item.description}
            </motion.p>
            <motion.p
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {t("Saved") || "Saved"}: {item.dateAdded}
            </motion.p>
          </CardContent>
         {
            item.status_swap == "available" && item.quantity > 0 ? (
                <CardFooter className="p-4 pt-0">
            <motion.div className="flex gap-2 w-full" variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                <Link href={`/products/out_offer/${item.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    {t("ViewDetails") || " View Details"}
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                <Link href={`/swap/${item.id}`} className="w-full">
                  <Button className="w-full">{t("StartSwap") || "Start Swap"}</Button>
                </Link>
              </motion.div>
            </motion.div>
          </CardFooter>
            ) : (<>
            <CardFooter className="p-4 pt-0">
            <motion.div className="flex gap-2 w-full" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1"> 
              <p className="text-muted-foreground text-sm mb-3 py-1 capitalize line-clamp-1 text-rose-500">{t("ThisItemIsNotAvailableForSwap") || "This item is not available for swap"}</p>
              </motion.div>
            </motion.div>
            </CardFooter>
            </>)
         }
        </Card>
      </motion.div>
      </>
     
    )
  }
  export default WishlistCard