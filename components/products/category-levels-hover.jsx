"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const hoverVariants = {
  hidden: { 
    opacity: 0, 
    y: 10, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: 10, 
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: "easeIn"
    }
  }
}

const levelVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}

export function CategoryLevelsHover({ catLevels, className, children }) {
  const [isHovered, setIsHovered] = useState(false)
  const [expandedLevels, setExpandedLevels] = useState(new Set())

  if (!catLevels || !catLevels.level_1 || !Array.isArray(catLevels.level_1)) {
    return null
  }

  const toggleLevel = (levelIndex) => {
    const newExpanded = new Set(expandedLevels)
    if (newExpanded.has(levelIndex)) {
      newExpanded.delete(levelIndex)
    } else {
      newExpanded.add(levelIndex)
    }
    setExpandedLevels(newExpanded)
  }

  return (
    <div 
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            variants={hoverVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-0 z-50 mt-2 w-80 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4"
          >
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-2">
                Category Levels
              </h4>
              
              {catLevels.level_1.map((level1, index) => (
                <motion.div
                  key={index}
                  variants={levelVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  <button
                    onClick={() => toggleLevel(index)}
                    className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {level1.name_ar || level1.name_en || `Level 1 - ${index + 1}`}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedLevels.has(index) ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="group-hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedLevels.has(index) && level1.level_2 && Array.isArray(level1.level_2) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 space-y-1 border-l-2 border-primary/30 pl-3"
                      >
                        {level1.level_2.map((level2, level2Index) => (
                          <motion.div
                            key={level2Index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: level2Index * 0.05 }}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/30 transition-colors group"
                          >
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                              {level2.name_ar || level2.name_en || `Sub-category ${level2Index + 1}`}
                            </span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
