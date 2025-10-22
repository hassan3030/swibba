"use client"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
      scale: 1.02,
      y: -5,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  }
  
  
  
  
  
  
  
  // Supporting component for topic cards
  const TopicCard = ({ title, count }) => {
    return (
      <motion.div variants={cardVariants} whileHover="hover">
        <Card className="transition-all hover:shadow-md cursor-pointer hover:bg-secondary/5">
          <CardContent className="flex justify-between items-center p-4">
            <h3 className="font-medium">{title}</h3>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Badge variant="secondary" className="ml-2">
                {count}
              </Badge>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }
  
  export default TopicCard