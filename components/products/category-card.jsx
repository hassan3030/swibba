"use client"

import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { motion} from "framer-motion"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { CategoryLevelsHover } from "./category-levels-hover"
import { List } from "lucide-react"
import { mediaURL } from "@/callAPI/utiles";


const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.05,
    y: -5,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
}

const imageVariants = {
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
}

const textVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      duration: 0.3,
      ease: "easeOut",
    },
  },
  hover: {
    color: "hsl(var(--primary))",
    transition: {
      duration: 0.2,
    },
  },
}

export function CategoryCard({ name, imageSrc, translations, showCategoryLevels = false, catLevels }) {
  const { t } = useTranslations()
  const [src, setSrc] = useState(imageSrc)
  const { isRTL } = useLanguage()

  return (
    <Link href={`categories/${name}`} className="group block">
      <motion.div
        className="flex flex-col items-center gap-3 pr-4 pl-2  rounded-xl bg-gradient-to-b from-background to-muted/30 shadow-sm  hover:shadow-lg transition-all duration-300"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <motion.div
          className="relative aspect-square w-[70px] md:w-[80px] overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg group-hover:shadow-xl transition-all duration-300"
          variants={imageVariants}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
          <Image
            src={src || "/placeholder.svg?height=200&width=200"}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 rounded-full p-2"
            priority
            sizes="(max-width: 768px) 80px, 100px"
            onError={() => {
              // Fallback to JPG copy if WEBP is unavailable or 404 in production
              if (src && src.endsWith(".webp")) {
                const fallback = src.replace("/categories/").replace(".webp", ".jpg")
                setSrc(fallback)
              }
            }}
          />
          <div className="absolute inset-0 rounded-full ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300" />
        </motion.div>
        <motion.span
          className="text-center text-xs md:text-sm font-semibold capitalize transition-colors text-foreground/80 group-hover:text-primary"
          variants={textVariants}
          whileHover="hover"
        >
          {isRTL ? translations?.[1]?.name || name : translations?.[0]?.name || name}
        </motion.span>
        
        {
          showCategoryLevels && (
           <>
             <CategoryLevelsHover 
              catLevels={catLevels} 
              className="inline-block"
            >
              <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 hover:bg-muted rounded-md transition-colors cursor-pointer">
                <List className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Levels</span>
              </div>
            </CategoryLevelsHover>
           </>
          )
        }
        {/* <CategoryLevelsTest catLevels={catLevels} className="inline-block" /> */}
      </motion.div>
    </Link>
  )
}
//-------------