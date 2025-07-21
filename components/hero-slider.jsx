"use client"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/language-provider"
import { useTranslations } from "@/lib/use-translations"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      staggerChildren: 0.2,
    },
  },
}

const textVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
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
      duration: 1,
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
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.95,
  },
}

const floatingVariants = {
  float: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

export function HeroSlider() {
  const { isRTL } = useLanguage()
  const { t } = useTranslations()

  const [imageReal, setImageReal] = useState("/home/pexels-binyaminmellish-106399.jpg")
  const [imageCar, setImageCar] = useState("/home/pexels-pixabay-39501.jpg")
  const [imageTools, setImageTools] = useState("/home/pexels-adonyi-foto-1409216.jpg")
  const [currentImageSet, setCurrentImageSet] = useState(0)

  const imageSets = [
    {
      real: "/home/pexels-binyaminmellish-106399.jpg",
      car: "/home/pexels-pixabay-39501.jpg",
      tools: "/home/pexels-adonyi-foto-1409216.jpg",
    },
    {
      real: "/home/pexels-expect-best-79873-323780.jpg",
      car: "/home/pexels-mayday-1545743.jpg",
      tools: "/home/pexels-cottonbro-4480453.jpg",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageSet((prev) => (prev + 1) % imageSets.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const currentSet = imageSets[currentImageSet]
    setImageReal(currentSet.real)
    setImageCar(currentSet.car)
    setImageTools(currentSet.tools)
  }, [currentImageSet])

  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden"></div>

      <motion.div
        className="relative overflow-hidden rounded-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative">
          <div className="relative h-[500px] w-full overflow-hidden rounded-lg bg-gradient-to-br from-[#f5f2fc] to-[#fff1e8] dark:bg-gradient-to-br dark:from-[#2a2438] dark:to-[#352e1b] md:h-[600px]">
            <div className="container relative z-10 flex h-full flex-col items-start justify-center py-12">
              <motion.h1
                className="mb-2 max-w-xl text-4xl font-bold text-dark-accent dark:text-dark-accent md:text-5xl lg:text-6xl bg-gradient-to-r from-yellow-300 via-yellow-600 to-yellow-900 text-transparent bg-clip-text"
                variants={textVariants}
              >
                {t("deelDeal")}
              </motion.h1>

              <motion.h2
                className="mb-4 max-w-xl text-3xl font-bold text-foreground dark:text-foreground md:text-4xl lg:text-5xl"
                variants={textVariants}
              >
                {t("deelDealSlogan")}
              </motion.h2>

              <motion.p
                className="mb-8 max-w-xl text-lg text-foreground dark:text-foreground md:text-xl"
                variants={textVariants}
              >
                {t("deelDealDescription")}
              </motion.p>

              <motion.div className="flex flex-wrap gap-4" variants={textVariants}>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-dark-accent text-lg text-dark-accent hover:bg-dark-accent/10 dark:border-dark-accent dark:text-dark-accent dark:hover:bg-dark-accent/10"
                    asChild
                  >
                    <a
                      href="/#items"
                      className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text"
                    >
                      {t("browseItems")}
                    </a>
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            <div
              className="absolute inset-0 hidden md:block"
              style={{ [isRTL ? "left" : "right"]: 0, [isRTL ? "right" : "left"]: "50%" }}
            >
              <div className="relative h-full w-full">
                {/* Main image */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`main-${currentImageSet}`}
                    className="absolute right-[10%] top-[20%] h-[250px] w-[250px] overflow-hidden rounded-lg shadow-xl"
                    variants={imageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    whileHover="hover"
                  >
                    <motion.div
                    //  variants={floatingVariants} 
                     animate="float">
                      <Image src={imageReal || "/placeholder.svg"} alt="Real Estate" fill className="object-cover" />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {/* Secondary images */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`car-${currentImageSet}`}
                    className="absolute right-[30%] top-[50%] h-[180px] w-[180px] overflow-hidden rounded-lg shadow-xl"
                    variants={imageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    whileHover="hover"
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      // variants={floatingVariants}
                      animate="float"
                      transition={{ delay: 1, duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    >
                      <Image src={imageCar || "/placeholder.svg"} alt="Cars" fill className="object-cover" />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`tools-${currentImageSet}`}
                    className="absolute right-[15%] top-[60%] h-[150px] w-[150px] overflow-hidden rounded-lg shadow-xl"
                    variants={imageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    whileHover="hover"
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div
                      // variants={floatingVariants}
                      animate="float"
                      transition={{ delay: 2, duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    >
                      <Image src={imageTools || "/placeholder.svg"} alt="Home Tools" fill className="object-cover" />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
