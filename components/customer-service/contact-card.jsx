"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"


const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  }

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
  },
}

// Supporting component for contact cards
const ContactCard = ({ icon, title, description, actionText, onClick }) => {
    return (
      <motion.div variants={cardVariants} whileHover="hover">
        <Card className="transition-all hover:shadow-md h-full">
          <CardContent className="pt-6">
            <motion.div
              className="rounded-full bg-primary/90 text-muted p-3 w-12 h-12 flex items-center justify-center mb-4"
              variants={iconVariants}
              whileHover="hover"
            >
              <div className="text-primary-foreground ">{icon}</div>
            </motion.div>
            <h3 className="text-xl font-medium mb-2">{title}</h3>
            <p className="text-muted-foreground mb-4">{description}</p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={onClick} variant="outline" className="w-full">
                {actionText}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  export default ContactCard