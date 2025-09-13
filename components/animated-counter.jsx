"use client"
import { useState, useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"

// Animation variants
const statsItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

// Enhanced Counter animation component
export const AnimatedCounter = ({ value, duration = 2, className , shape=true}) => {
    const [count, setCount] = useState(0)
    const controls = useAnimation()
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.1 })
  
    useEffect(() => {
      if (isInView) {
        let startTime
        const startValue = 0
        const endValue = value
  
        const step = (timestamp) => {
          if (!startTime) startTime = timestamp
          const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
          const currentCount = Math.floor(progress * (endValue - startValue) + startValue)
  
          setCount(currentCount)
  
          if (progress < 1) {
            window.requestAnimationFrame(step)
          }
        }
  
        window.requestAnimationFrame(step)
        controls.start("visible")
      }
    }, [isInView, value, duration, controls])
  
  
    return (
      <>
        <motion.div 
        ref={ref}
        animate={controls}
        initial="hidden"
        variants={statsItemVariants}
        className={className}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.span
          key={count}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {shape?`${count>=1000?`${count/1000}K+`:count>=1000000?`${count/1000000}M+`:count}`:`${value === 99.9 ? `${value}%` : "K+"}`}
          
          {/*  */}
        </motion.span>
      </motion.div>
      </>
    
    )
  }
  