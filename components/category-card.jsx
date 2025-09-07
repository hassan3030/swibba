"use client"

import Image from "next/image"
import Link from "next/link"
import { motion} from "framer-motion"
import { useTranslations } from "@/lib/use-translations"


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

export function CategoryCard({ name, imageSrc }) {
  const { t } = useTranslations()
  

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
            src={imageSrc || "/placeholder.svg?height=200&width=200"}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 rounded-full p-2"
          />
          <div className="absolute inset-0 rounded-full ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300" />
        </motion.div>
        <motion.span
          className="text-center text-xs md:text-sm font-semibold capitalize transition-colors text-foreground/80 group-hover:text-primary"
          variants={textVariants}
          whileHover="hover"
        >
          {t(`${name}`)}
        </motion.span>
      </motion.div>
    </Link>
  )
}
