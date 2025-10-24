"use client"
import { useState, useEffect, useRef, memo, useCallback } from "react"
import { motion, useInView } from "framer-motion"

// Simplified animation variants for better performance
const counterVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

// Optimized Counter animation component
export const AnimatedCounter = memo(({ value, duration = 1.5, className, shape = true }) => {
    const [count, setCount] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.1 })
    const animationRef = useRef(null)
    
    // Debug logging (commented out for performance)
    // console.log("AnimatedCounter received value:", value, "type:", typeof value)
  
    // Optimized counter animation using useCallback
    const animateCounter = useCallback(() => {
      if (!isInView || isAnimating) return
      
      // Ensure value is a valid number
      const validValue = Number(value) || 0
      if (validValue <= 0) {
        setCount(0)
        return
      }
      
      setIsAnimating(true)
      const startTime = performance.now()
      const startValue = 0
      const endValue = validValue
  
      const step = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / (duration * 1000), 1)
        
        // Use easing function for smoother animation
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const currentCount = Math.floor(easeOut * (endValue - startValue) + startValue)
        
        setCount(currentCount)
  
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(step)
        } else {
          setIsAnimating(false)
        }
      }
  
      animationRef.current = requestAnimationFrame(step)
    }, [isInView, value, duration, isAnimating])
  
    useEffect(() => {
      animateCounter()
      
      // Cleanup animation on unmount
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }, [animateCounter])
  
    // Format number for display
    const formatNumber = useCallback((num) => {
      if (shape) {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`
        return num.toString()
      }
      return value === 99.9 ? `${value}%` : "K+"
    }, [shape, value])
  
    return (
      <motion.div 
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={counterVariants}
        className={className}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <span className="inline-block">
          {formatNumber(count)}
        </span>
      </motion.div>
    )
})

AnimatedCounter.displayName = 'AnimatedCounter'
export default AnimatedCounter