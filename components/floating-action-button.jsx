"use client"
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation"
import {
     Plus, MessageSquare, Heart, User,
  Settings,
  PlusCircle,
 
} from "lucide-react"
import { BiCartDownload } from "react-icons/bi";
import { TbShoppingCartUp } from "react-icons/tb";
import { Button } from "@/components/ui/button";
const fabVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: 1
    }
  },
  hover: { 
    scale: 1.1,
    boxShadow: "0 10px 25px -5px rgba(66, 133, 244, 0.4)",
    transition: {
      duration: 0.3
    }
  },
  tap: { scale: 0.95 }
};

const menuVariants = {
  closed: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  },
  open: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  closed: {
    opacity: 0,
    y: 20,
    scale: 0,
    transition: {
      duration: 0.3
    }
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};
const menuItems = [
  { icon: MessageSquare, label: "Messages", color: "bg-blue-500",  href:"/chat"},
  { icon: Heart, label: "Favorites", color: "bg-red-500" , href:"/wishList"},
  { icon: User, label: "Profile", color: "bg-green-500" , href:"/profile"},
  { icon:TbShoppingCartUp , label: "Send offers", color: "bg-blue-500", href:"/cart" },
  { icon: BiCartDownload, label: "Received offers", color: "bg-red-500" , href:"/notifications"},
  { icon: Settings, label: "Settings Profile", color: "bg-green-500", href:"/profile/settings/editProfile" },
  { icon: PlusCircle, label: "Add Item", color: "bg-blue-500", href:"/profile/settings/editItem/new" },
];

export default  function  FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
    const router = useRouter()
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
 
  return (
  <div className="fixed bottom-6 right-6 z-50">
      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 right-0 flex flex-col gap-3"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              
              return (
                <motion.div
                  key={item.label}
                  variants={itemVariants}
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="icon"
                    className={`w-12 h-12 rounded-full ${item.color} hover:opacity-90 shadow-lg`}
                    onClick={() => {

                      console.log(`${item.label} clicked`);
                      setIsOpen(false);
                      router.push(item.href)
                    }}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="sr-only">{item.label}</span>
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div
        variants={fabVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          size="icon"
          className="w-14 h-14 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-lg animate-float"
          onClick={toggleMenu}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Plus className="w-6 h-6" />
          </motion.div>
          <span className="sr-only">Quick actions</span>
        </Button>
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>) 

 
  
}
