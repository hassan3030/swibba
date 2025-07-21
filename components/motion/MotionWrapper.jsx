
"use client"
// components/MotionWrapper.jsx
import { motion } from "framer-motion";
// 
export  function MotionWrapper({ children , rtl=0 , ltr=0  , utd=0 , dtu=0 , scale=100}) {
  return (
    <motion.div
      initial={{opacity: 0, y: 50}}
      animate={{opacity: 1, y: 0}}
      whileHover={{scale:scale}}
      transition={{duration: 0.7, ease: "easeOut"}}
    >
      {children}
    </motion.div>
  );
}
