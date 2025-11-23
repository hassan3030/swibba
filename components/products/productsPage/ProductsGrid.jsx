"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ItemCardProfile } from "@/components/products/item-card-profile"
import { pageTransitionVariants } from "./animations"

export function ProductsGrid({ 
  items, 
  page, 
  slideDirection, 
  showbtn, 
  showSwitchHeart, 
  LinkItemOffer 
}) {
  return (
    <AnimatePresence mode="wait" custom={slideDirection}>
      <motion.div
        key={page}
        custom={slideDirection}
        variants={pageTransitionVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 400, damping: 35, mass: 0.8 },
          opacity: { duration: 0.15 },
        }}
        className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6 w-full"
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <ItemCardProfile 
              {...item} 
              showbtn={showbtn} 
              showSwitchHeart={showSwitchHeart} 
              LinkItemOffer={LinkItemOffer} 
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
