"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-provider"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -5 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.05,
    rotate: 2,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
}

export function Banner({ title, subtitle, buttonText, href, imageSrc, imageAlt, theme = "light" }) {
  const { isRTL } = useLanguage()

  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg ${theme === "dark" ? "bg-gray-900" : "bg-[#feee00]"}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container relative z-10 flex min-h-[300px] flex-col items-start justify-center py-12 md:min-h-[400px]">
        <motion.h2
          className={`mb-2 max-w-md text-3xl font-bold md:text-4xl lg:text-5xl ${
            theme === "dark" ? "text-white" : "text-[#404553]"
          }`}
          variants={itemVariants}
        >
          {title}
        </motion.h2>

        {subtitle && (
          <motion.p
            className={`mb-6 max-w-md text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
            variants={itemVariants}
          >
            {subtitle}
          </motion.p>
        )}

        <motion.div variants={itemVariants}>
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              asChild
              className={
                theme === "dark"
                  ? "bg-white text-gray-900 hover:bg-gray-100"
                  : "bg-[#404553] text-white hover:bg-[#333]"
              }
            >
              <Link href={href}>{buttonText}</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className={`absolute inset-0 ${isRTL ? "left-0 right-1/3" : "left-1/3 right-0"} hidden md:block`}
        variants={imageVariants}
        whileHover="hover"
      >
        <Image src={imageSrc || "/placeholder.svg"} alt={imageAlt} fill className="object-contain" />
      </motion.div>
    </motion.div>
  )
}
