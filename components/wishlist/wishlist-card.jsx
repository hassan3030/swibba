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


       <motion.div 
         whileHover={{ y: -8, scale: 1.02 }} 
         transition={{ type: "spring", stiffness: 300, damping: 20 }}
         className="h-full"
       >
        <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden bg-card dark:bg-gray-900 border-border relative h-full flex flex-col">
          <CardHeader className="p-0">
            <div className="relative overflow-hidden aspect-[4/3]">
             
  
  <Image
              src={`${mediaURL}${item.images[0]?.directus_files_id.id}` || "/placeholder.svg"}
              width={400}
              height={300}
              alt={isRTL ? item.translations[1]?.name || item.name : item.translations[0]?.name || item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  
              <motion.div className="absolute top-3 right-3" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/95 backdrop-blur-md border-none shadow-lg hover:bg-destructive hover:text-destructive-foreground rounded-full"
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
              
              {/* Category badge */}
              <motion.div
                className="absolute top-3 left-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="bg-primary/90 backdrop-blur-md text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-lg capitalize">
                  {t(item.category) || item.category}
                </span>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="p-5 flex-grow">
            <motion.div 
              className="mb-3"
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.1 }}
            >
              <CardTitle className="text-lg font-bold capitalize line-clamp-1 group-hover:text-primary transition-colors">
                {isRTL ? item.translations[1]?.name || item.name : item.translations[0]?.name || item.name}
              </CardTitle>
            </motion.div>
            <motion.p
              className="text-muted-foreground text-sm mb-4 capitalize line-clamp-1 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isRTL ? item.translations[1]?.description || item.description : item.translations[0]?.description || item.description}
            </motion.p>
            <motion.div
              className="flex items-center gap-2 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>{t("Saved") || "Saved"}: {item.dateAdded}</span>
            </motion.div>
          </CardContent>
         {
            item.status_swap == "available" && item.quantity > 0 ? (
                <CardFooter className="p-5 pt-0 flex justify-center">
            <motion.div className="flex gap-3 w-full" variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                <Link href={`/products/out_offer/${item.id}`} className="w-full">
                  <Button variant="outline" className="w-full rounded-full border-2 hover:border-primary transition-all">
                    {t("ViewDetails") || " View Details"}
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                <Link href={`/swap/${item.id}`} className="w-full">
                  <Button className="w-full rounded-full shadow-lg hover:shadow-xl transition-all">{t("StartSwap") || "Start Swap"}</Button>
                </Link>
              </motion.div>
            </motion.div>
          </CardFooter>
            ) : (<>
            <CardFooter className="p-5 pt-0 flex justify-center">
            <motion.div className="flex gap-2 justify-center" variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="text-center"> 
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <p className="text-destructive text-sm font-medium capitalize">{t("ThisItemIsNotAvailableForSwap") || "Not available for swap"}</p>
                </div>
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