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
        className="flex flex-col items-center gap-2"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <motion.div
          className="relative aspect-square w-full overflow-hidden rounded-md bg-muted transition-all group-hover:shadow-md"
          variants={imageVariants}
        >
          <Image
            src={imageSrc || "/placeholder.svg?height=200&width=200"}
            alt={name}
            fill
            className="object-cover transition-transform duration-300"
          />
        </motion.div>
        <motion.span
          className="text-center text-sm font-medium capitalize transition-colors"
          variants={textVariants}
          whileHover="hover"
        >
          {t(`${name}`)}
        </motion.span>
      </motion.div>
    </Link>
  )
}
