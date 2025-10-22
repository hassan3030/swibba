"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Home, 
  Search, 
  Plus, 
  MessageCircle, 
  User 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/lib/use-translations"
import { getCookie, decodedToken } from "@/callAPI/utiles"
import { getOffeReceived, getMessagesByUserId } from "@/callAPI/swap"

const tabVariants = {
  inactive: {
    scale: 1,
    y: 0,
  },
  active: {
    scale: 1.1,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
}

const iconVariants = {
  inactive: {
    scale: 1,
  },
  active: {
    scale: 1.2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
}

export function MobileFooter() {
  const [user, setUser] = useState(null)
  const [messageCount, setMessageCount] = useState(0)
  const { t } = useTranslations()
  const pathname = usePathname()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await getCookie()
        if (token) {
          const decoded = await decodedToken()
          if (decoded?.id) {
            setUser({ id: decoded.id })
            
            // Fetch messages count
            const messages = await getMessagesByUserId(decoded.id)
            setMessageCount(messages?.data?.length || 0)
          }
        }
      } catch (error) {
        // console.error("Error fetching user data:", error)
      }
    }
    
    fetchUserData()
  }, [])

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: t("Home") || "Home",
      isActive: pathname === "/",
    },
    {
      href: "/products",
      icon: Search,
      label: t("browse") || "Browse",
      isActive: pathname === "/products" || pathname.startsWith("/products"),
    },
    {
      href: user ? "/profile/settings/editItem/new" : "/auth/login",
      icon: Plus,
      label: t("add") || "Add",
      isActive: pathname === "/profile/settings/editItem/new",
      isSpecial: true,
    },
    {
      href: user ? "/chat" : "/auth/login",
      icon: MessageCircle,
      label: t("messages") || "Messages",
      isActive: pathname === "/chat" || pathname.startsWith("/chat"),
      badge: messageCount,
    },
    {
      href: user ? "/profile" : "/auth/login",
      icon: User,
      label: t("profile") || "Profile",
      isActive: pathname === "/profile" || pathname.startsWith("/profile"),
    },
  ]

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t"
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-padding-bottom">
        {navItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="flex flex-col items-center justify-center flex-1"
          >
            <motion.div
              variants={tabVariants}
              animate={item.isActive ? "active" : "inactive"}
              className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                item.isSpecial
                  ? "bg-primary text-white w-10 h-10 rounded-full  "
                  : item.isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <motion.div
                variants={iconVariants}
                animate={item.isActive ? "active" : "inactive"}
                className="relative"
              >
                <item.icon 
                  className={`h-5 w-5 ${
                    item.isSpecial ? "text-white" : ""
                  }`} 
                />
                {item.badge && item.badge > 0 ? (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {item.badge > 9 ? "9+" : item.badge}
                  </Badge>
                ) : ''}
              </motion.div>
              {!item.isSpecial && (
                <span 
                  className={`text-xs mt-1 font-medium  ${
                    item.isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </motion.div>
          </Link>
        ))}
      </div>
      
      {/* Safe area for devices with home indicators */}
      <div className="h-safe-area-inset-bottom bg-background/95" />
    </motion.div>
  )
}
