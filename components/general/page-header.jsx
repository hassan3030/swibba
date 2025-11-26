"use client"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-provider"

export default function PageHeader({ 
  icon: Icon, 
  customIcon,
  title, 
  description,
  iconAnimation = "none", // "none" | "flip" | "rotate" | "pulse" | "bounce"
  className = ""
}) {
  const { isRTL } = useLanguage()

  // Icon animation variants based on type
  const getIconAnimation = () => {
    switch (iconAnimation) {
      case "flip":
        return {
          animate: { rotateY: [0, 180, 360] },
          transition: { 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut",
            repeatDelay: 6
          }
        }
      case "rotate":
        return {
          animate: { rotate: 360 },
          transition: { 
            duration: 4, 
            repeat: Infinity, 
            ease: "linear"
          }
        }
      case "pulse":
        return {
          animate: { scale: [1, 1.1, 1] },
          transition: { 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut"
          }
        }
      case "bounce":
        return {
          animate: { y: [0, -8, 0] },
          transition: { 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut"
          }
        }
      case "none":
      default:
        return {
          animate: {},
          transition: {}
        }
    }
  }

  const iconAnimationProps = getIconAnimation()

  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-transparent p-8 sm:p-12 ${className}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className={`max-w-7xl mx-auto flex items-center gap-4 sm:gap-8 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
          className="flex-shrink-0"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-primary to-primary/70 p-4 sm:p-6 rounded-2xl shadow-lg">
              <motion.div
                animate={iconAnimationProps.animate}
                transition={iconAnimationProps.transition}
                style={{ transformStyle: "preserve-3d" }}
              >
                {customIcon ? customIcon : Icon && <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-white" />}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Text Content */}
        <div className={`flex-1 space-y-2 sm:space-y-4`}>
          <motion.h1 
            className={`text-2xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent `}
            initial={{ x: isRTL ? 50 : -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p 
              className={`hidden sm:block text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl `}
              initial={{ x: isRTL ? 50 : -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
