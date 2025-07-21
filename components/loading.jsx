"use client"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const Loading = ({ pageName = "DEELDEAL..." }) => {
  const pathname = usePathname()
  const routeName = pathname?.split("/").filter(Boolean).pop()?.toUpperCase() || pageName || "DEELDEAL..."
  const [visibleLetters, setVisibleLetters] = useState(0)
  const letters = routeName.split("")

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

  const letterVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.5 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
      },
    },
  }

  const backgroundVariants = {
    animate: {
      background: [
        "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
        "linear-gradient(45deg, #4ecdc4, #45b7d1)",
        "linear-gradient(45deg, #45b7d1, #96ceb4)",
        "linear-gradient(45deg, #96ceb4, #feca57)",
        "linear-gradient(45deg, #feca57, #ff9ff3)",
        "linear-gradient(45deg, #ff9ff3, #ff6b6b)",
      ],
      transition: {
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      },
    },
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLetters((prev) => {
        if (prev >= letters.length) {
          setTimeout(() => setVisibleLetters(0), 1000)
          return prev
        }
        return prev + 1
      })
    }, 200)

    return () => clearInterval(timer)
  }, [letters.length])

  return (
    <div className="fixed top-0 right-0 min-w-[100%] z-50">
      <motion.div
        className="min-h-screen flex items-center justify-center"
        variants={backgroundVariants}
        animate="animate"
        style={{
          background: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3)",
          backgroundSize: "300% 300%",
        }}
      >
        <div className="relative">
          {/* Animated border */}
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{
              boxShadow: [
                "0 0 20px rgba(255, 255, 255, 0.5)",
                "0 0 40px rgba(255, 255, 255, 0.8)",
                "0 0 20px rgba(255, 255, 255, 0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          {/* Content */}
          <motion.div
            className="relative flex space-x-2 px-8 py-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {letters.map((letter, index) => (
                <motion.div
                  key={`${letter}-${index}`}
                  className="text-6xl md:text-8xl font-bold"
                  variants={letterVariants}
                  initial="hidden"
                  animate={index < visibleLetters ? "visible" : "hidden"}
                  exit="hidden"
                  style={{
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    background: "linear-gradient(45deg, #fff, #f0f0f0)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.3 },
                  }}
                >
                  {letter}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            className="flex justify-center space-x-2 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-white rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Loading
