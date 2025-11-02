"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, 
  X, 
  Search, 
  Home,
  Info,
  User,
  Shield,
  Settings,
  LogOut,
  Verified,
  Wallet,
  Plus,
  MessageCircle,
  Moon,
  Sun,
  HandPlatter,
  ListChecks,
  Heart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTranslations } from "@/lib/use-translations"
import { useRouter } from "next/navigation"
import { getCookie, decodedToken, removeCookie } from "@/callAPI/utiles"
import { getUserById } from "@/callAPI/users"
import { getOffeReceived, getMessagesByUserId } from "@/callAPI/swap"
import Image from "next/image"
import { BiCartDownload } from "react-icons/bi";
import { TbShoppingCartUp } from "react-icons/tb";
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useTheme } from "@/lib/theme-provider"
import { useLanguage } from "@/lib/language-provider"
import { getProductSearchFilter } from "@/callAPI/products"
import { mediaURL } from "@/callAPI/utiles"
const slideVariants = {
  closed: {
    // x: "-100%",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40
    }
  },
  open: {
    // x: 0,
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
  const { isRTL, toggleLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()


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
            
            // Fetch offersReceived
            const offersReceived = await getOffeReceived(decoded.id)
            setNotificationCount(offersReceived?.data?.length || 0)
            
            // Fetch messages
            const messages = await getMessagesByUserId(decoded.id)
            setMessageCount(messages?.partnerMessages?.length || 0)
          }
        }
      } catch (error) {
        // console.error("Error fetching user data:", error)
      }
    }
    
    fetchUserData()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // RTL-aware search - the filter page will handle RTL logic
      const searchTerm = searchQuery.trim()
      router.push(`/filterItems/${encodeURIComponent(searchTerm)}`)
      setSearchQuery("")
    }
  }

  // Enhanced RTL-aware search function
  const handleRTLSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return
    
    try {
      // Use the RTL-aware API search function
      const results = await getProductSearchFilter(searchTerm.trim())
      if (results.success && results.data.length > 0) {
        // Redirect to filter page with results
        router.push(`/filterItems/${encodeURIComponent(searchTerm.trim())}`)
      } else {
        // Still redirect to filter page for "no results" display
        router.push(`/filterItems/${encodeURIComponent(searchTerm.trim())}`)
      }
    } catch (error) {
      console.error("Search error:", error)
      // Fallback to simple redirect
      router.push(`/filterItems/${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const handleLogout = async () => {
    await removeCookie()
    setUser(null)
    setIsMenuOpen(false)
    router.push("/")
    router.refresh()
  }

 

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
              {/* <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-lg ml-2 text-primary">Swibba</span> */}
              <Image src="/logo.png" alt="Swibba" width={100} height={100} className="h-full" />
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
              title={t("search") || "Search"}
            >
              <Search className="h-5 w-5" />
            </Button>

        
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/recived-items")}
                className="relative h-10 w-10"
              >
                <BiCartDownload className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-white text-xs">
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
              className={`fixed  top-0 z-[10000000] h-full w-80 bg-background ${isRTL?'border-l right-0':'border-r left-0'}  shadow-lg`}

              // className="fixed left-0 top-0 z-50 h-full w-80 bg-background border-r shadow-lg"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-2">
                   
                      
                    <p className="font-bold text-lg text-primary first-letter:inline-block "> 
              <Image src="/logo.png" alt="Swibba" width={100} height={100} className="h-full" />

                        </p>
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
                      className="flex items-center space-x-3 p-2 rounded-lg bg-primary/10  hover:dark:bg-primary/15  hover:shadow-sm   text-primary hover:text-primary/80
 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={user?.avatar ? `${mediaURL}${user.avatar}` : "/placeholder.svg"}
                            alt={user?.first_name || t("account")}
                          />
                          <AvatarFallback className="bg-primary text-white">
                            {String(user?.first_name).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {user?.verified == "true" || user?.verified == true && (
                          <div className="absolute -top-1 -right-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Verified className="h-4 w-4 text-primary bg-background rounded-full p-0.5" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="bg-primary text-primary-foreground">
                                  <p className="text-sm">
                                    {t("verified") || "Verified Account"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
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
                      className="w-full bg-primary hover:bg-primary/80 text-white"
                      onClick={() => {
                        setIsMenuOpen(false)
                        router.push("/auth/login")
                      }}
                    >
                      {t("signIn") || "Sign In"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                      onClick={() => {
                        setIsMenuOpen(false)
                        router.push("/auth/register")
                      }}
                    >
                      {t("signUp") || "Sign Up"}
                    </Button>
                  </div>
                )}

                {/* Menu Items - Scrollable */}
                <div className="flex-1 relative overflow-hidden">
                  <div className="h-full overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
                    {/* {menuItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5 text-primary" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ))} */}

                    {user ? (
                      <>
                        {/* <Link
                          href="/payment"
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Wallet className="h-5 w-5 text-primary" />
                          <span className="font-medium">{t("payment") || "Payment & Wallet"}</span>
                        </Link> */}
                        
                       
                        <Link
                          href="/"
                          className="flex items-center space-x-3 p-1 px-3  rounded-lg text-primary hover:bg-primary/20 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Home className="h-5 w-5" />
                          <span className="font-medium">{t("Home") || "Home"}</span>
                        </Link>

                        <Link
                          href="/profile/settings/editItem/new"
                          className="flex items-center space-x-3 p-1 px-3 rounded-lg text-primary hover:bg-primary/20 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Plus className="h-5 w-5 " />
                          <span className="font-medium">{t("add") || "Add"}</span>
                        </Link>

                        <Link
                          href="/products"
                          className="flex items-center space-x-3 p-1 px-3 rounded-lg text-primary hover:bg-primary/20 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Search className="h-5 w-5 " />
                          <span className="font-medium">{t("browse") || "Browse"}</span>
                        </Link>

                        <Link
                          href="/send-items"
                          className="flex items-center space-x-3 p-1 px-3 rounded-lg text-primary hover:bg-primary/20 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <TbShoppingCartUp className="h-5 w-5 " />
                          <span className="font-medium">{t("sendItems") || "Send Items"}</span>
                        </Link>

                        <Link
                          href="/recived-items"
                          className="flex items-center space-x-3 p-1 px-3 rounded-lg text-primary hover:bg-primary/20 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <BiCartDownload className="h-5 w-5 " />
                          <span className="font-medium">{t("receivedItems") || "Received Items"}</span>
                        </Link>

                        <Link
                          href="/chat"
                          className="flex items-center space-x-3 p-1 px-3 rounded-lg text-primary hover:bg-primary/20 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <MessageCircle className="h-5 w-5 " />
                          <span className="font-medium">{t("messages") || "Messages"}</span>
                        </Link>

                        <Link
                          href="/profile/items"
                          className="flex items-center space-x-3 p-1 px-3 rounded-lg text-primary hover:bg-primary/20 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ListChecks className="h-5 w-5 " />
                          <span className="font-medium">{t("manageItems") || "Manage Items"}</span>
                        </Link>

                        <Link
                          href="/wishList"
                            className="flex items-center space-x-3 p-1 px-3 rounded-lg text-primary hover:bg-primary/20 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Heart className="h-5 w-5 " />
                          <span className="font-medium">{t("MyWishlist") || "My Wishlist"}</span>
                        </Link>
                        
                        <Link
                          href="/customerService"
                          className="flex items-center space-x-3 p-1 px-3 rounded-lg text-primary hover:bg-primary/20 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <HandPlatter className="h-5 w-5 " />
                          <span className="font-medium">{t("customerService") || "Customer Service"}</span>
                        </Link>

                        <Link
                          href="/about"
                          className="flex items-center space-x-3 p-1 px-3 rounded-lg text-primary hover:bg-primary/20 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Info className="h-5 w-5 " />
                          <span className="font-medium">{t("about") || "About"}</span>
                        </Link>


                        <button 
                          onClick={handleLogout}
                          className="flex items-center space-x-3 p-1 px-3 rounded-lg text-primary hover:bg-primary/20 transition-colors w-full text-left"
                        >
                          <LogOut className="h-5 w-5 text-red-500" />
                          <span className="font-medium text-red-500">{t("logout") || "Logout"}</span>
                        </button>


                        <button  className="flex items-center space-x-3 p-1 px-3 rounded-lg text-primary hover:bg-primary/20 transition-colors w-full text-left"
                        >
                        <LanguageToggle />
                        <ThemeToggle />
                        </button>

                      

                      </>
                    ):(
                      <>

                        <Link
                          href="/customerService"
                          className="flex items-center space-x-3 p-3 rounded-lg text-primary hover:text-primary/80 hover:dark:bg-primary/15  hover:bg-primary/10 bg-background/50 hover:shadow-sm transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <HandPlatter className="h-5 w-5 text-primary" />
                          <span className="font-medium">{t("customerService") || "Customer Service"}</span>
                        </Link>

                        <Link
                          href="/about"
                          className="flex items-center space-x-3 p-3 rounded-lg text-primary hover:text-primary/80 hover:dark:bg-primary/15  hover:bg-primary/10 bg-background/50 hover:shadow-sm transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Info className="h-5 w-5 text-primary" />
                          <span className="font-medium">{t("about") || "About"}</span>
                        </Link>

                        <button  className="flex items-center space-x-3 p-2 rounded-lg text-primary hover:text-primary/80 hover:dark:bg-primary/15  hover:bg-primary/10 bg-background/50 hover:shadow-sm transition-colors w-full text-left"
                        >
                        <LanguageToggle />
                        <ThemeToggle />
                        </button>

                      </>
                    )}
                  </div>
                  
                  {/* Bottom fade effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
