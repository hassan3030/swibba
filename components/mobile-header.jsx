"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, 
  X, 
  Search, 
  MessageCircle, 
  Bell,
  Home,
  Info,
  Shield,
  Settings,
  LogOut,
  User,
  Verified
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/lib/use-translations"
import { useRouter } from "next/navigation"
import { getCookie, decodedToken, removeCookie } from "@/callAPI/utiles"
import { getUserById } from "@/callAPI/users"
import { getOffersNotifications, getMessagesByUserId } from "@/callAPI/swap"
import Image from "next/image"

const slideVariants = {
  closed: {
    x: "-100%",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40
    }
  },
  open: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40
    }
  }
}

const overlayVariants = {
  closed: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  },
  open: {
    opacity: 1,
    transition: {
      duration: 0.2
    }
  }
}

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)
  const { t } = useTranslations()
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await getCookie()
        if (token) {
          const decoded = await decodedToken()
          if (decoded?.id) {
            const userData = await getUserById(decoded.id)
            setUser(userData.data)
            
            // Fetch notifications
            const notifications = await getOffersNotifications(decoded.id)
            setNotificationCount(notifications?.data?.length || 0)
            
            // Fetch messages
            const messages = await getMessagesByUserId(decoded.id)
            setMessageCount(messages?.data?.length || 0)
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }
    
    fetchUserData()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/filterItems/${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  const handleLogout = async () => {
    await removeCookie()
    setUser(null)
    setIsMenuOpen(false)
    router.push("/")
    router.refresh()
  }

  const menuItems = [
    { icon: Home, label: t("home") || "Home", href: "/" },
    { icon: Info, label: t("howItWorks") || "How it Works", href: "/about" },
    { icon: Shield, label: t("safety") || "Safety", href: "/about" },
    { icon: Info, label: t("about") || "About", href: "/about" },
  ]

  return (
    <>
      {/* Mobile Header */}
      <motion.header 
        className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="container flex h-14 items-center justify-between px-4">
          {/* Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            className="h-10 w-10"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-[#f5b014] flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-lg ml-2 text-[#f5b014]">Swibba</span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/products")}
              className="h-10 w-10"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/notifications")}
                className="relative h-10 w-10"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-[#f5b014] text-white text-xs">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Side Menu */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={slideVariants}
              className="fixed left-0 top-0 z-50 h-full w-80 bg-background border-r shadow-lg"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-[#f5b014] flex items-center justify-center">
                      <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="font-bold text-lg text-[#f5b014]">Swibba</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* User Section */}
                {user ? (
                  <div className="p-4 border-b">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={user?.avatar ? `https://deel-deal-directus.csiwm3.easypanel.host/assets/${user.avatar}` : "/placeholder.svg"}
                            alt={user?.first_name || t("account")}
                          />
                          <AvatarFallback className="bg-[#f5b014] text-white">
                            {String(user?.first_name).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {user?.verified && (
                          <div className="absolute -top-1 -right-1">
                            <Verified className="h-4 w-4 text-[#49c5b6] bg-background rounded-full p-0.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-medium">
                          {user?.first_name || t("account")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user?.email || ""}
                        </p>
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 border-b space-y-3">
                    <Button
                      className="w-full bg-[#f5b014] hover:bg-[#e09d0f] text-white"
                      onClick={() => {
                        setIsMenuOpen(false)
                        router.push("/auth/login")
                      }}
                    >
                      {t("signIn") || "Sign In"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-[#f5b014] text-[#f5b014] hover:bg-[#f5b014] hover:text-white"
                      onClick={() => {
                        setIsMenuOpen(false)
                        router.push("/auth/register")
                      }}
                    >
                      {t("getStarted") || "Get Started"}
                    </Button>
                  </div>
                )}

                {/* Menu Items */}
                <div className="flex-1 p-4 space-y-2">
                  {menuItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 text-[#f5b014]" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}

                  {user && (
                    <>
                      <Link
                        href="/profile/settings"
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5 text-[#f5b014]" />
                        <span className="font-medium">{t("settings") || "Settings"}</span>
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors w-full text-left"
                      >
                        <LogOut className="h-5 w-5 text-red-500" />
                        <span className="font-medium text-red-500">{t("logout") || "Logout"}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
