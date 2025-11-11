"use client"
import { List, ListChecks, MessageCircle, PackageSearch, Verified } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BiCartDownload } from "react-icons/bi";
import { TbShoppingCartUp } from "react-icons/tb";
import { PiSwapBold } from "react-icons/pi";
import {
  Heart,
  Search,
  Menu,
  X,
  User,
  Moon,
  Sun,
  Settings,
  LogOut,
  PlusCircle,
  HandPlatter,
  Home,
  BookOpen,
  Laptop,
  Gem,
  Car,
  Smartphone,
  Shirt,
  Sofa,
  Sparkles,
  Gamepad2,
  Dumbbell,
  Stethoscope,
  Armchair,
  Heart as PetIcon
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/lib/language-provider"
import { useTranslations } from "@/lib/use-translations"
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/theme-provider"
import { removeCookie, getCookie, decodedToken, removeTarget } from "@/callAPI/utiles"
import { getOfferById, getOffeReceived, getWishList, getMessage, getMessagesByUserId } from "@/callAPI/swap"
import { getProductSearchFilter } from "@/callAPI/products"
import { categoriesName } from "@/lib/data"
import { getKYC, getUserById } from "@/callAPI/users"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { mediaURL } from "@/callAPI/utiles";
const navVariants = {
  hidden: { 
    opacity: 0, 
    y: -100,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
}

const logoVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10,
      delay: 0.2,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
}

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
}

const badgeVariants = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  exit: { scale: 0 },
  transition: { type: "spring", stiffness: 500, damping: 15 },
}

// Category icons mapping
const categoryIcons = {
  realestate: Home,
  books: BookOpen,
  software: Laptop,
  jewelry: Gem,
  automotive: Car,
  electronics: Smartphone,
  fashion: Shirt,
  home: Sofa,
  beauty: Sparkles,
  toys: Gamepad2,
  sports: Dumbbell,
  health: Stethoscope,
  furniture: Armchair,
  pets: PetIcon
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState()
  const [filter, serFilter] = useState("")
  const [cartLength, setCartLength] = useState(0)
  const [notificationsLength, setNotificationsLength] = useState(0)
  const [offersLength, setOffersLength] = useState(0)
  const [wishlistLength, setWishlistLength] = useState(0)
  const [chatLength, setChatLength] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showCategoriesBar, setShowCategoriesBar] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showHeader, setShowHeader] = useState(true)
  const lastScrollY = useRef(0)

  const router = useRouter()
  const { isRTL, toggleLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslations()
  const pathname = usePathname()

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollDirection = scrollY > lastScrollY.current ? 'down' : 'up';
      
      // Control showHeader: hide after 150px when scrolling down, show when scrolling up
      if (scrollY <= 150) {
        setShowHeader(true);
      } else {
        if (scrollDirection === 'up') {
          setShowHeader(true);
        } else {
          // Hide header when scrolling down AND scrollY > 150px
          if (scrollY > 150) {
            setShowHeader(false);
          }
        }
      }
      
      // Control showCategoriesBar: hide after 100px always
      if (scrollY >= 100) {
        setShowCategoriesBar(false);
      } else {
        setShowCategoriesBar(true);
      }
      
      // Update isScrolled state for styling
      setIsScrolled(scrollY >= 100);
      
      // Update last scroll position
      lastScrollY.current = scrollY;
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  const handlegetProductSearchFilter = () => {
    if (filter && filter.trim()) {
      // RTL-aware search - the filter page will handle RTL logic
      const searchTerm = filter.trim()
      router.push(`/filterItems/${encodeURIComponent(searchTerm)}`)
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

  const getUser = async () => {
    const token = await getCookie()
    if (token) {
      try {
        const { id } = await decodedToken(token)
        const userData = await getUserById(id)
        setUser(userData.data)
      } catch (error) {
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }

  
  const handleKYC= async()=>{
    const decoded = await decodedToken()
    const kyc = await getKYC(decoded.id) 
    if (kyc.data === false) {
      toast({
        title: t("completeYourProfile"),
        description: t("DescFaildSwapKYC") || "Required information for swap. Please complete your information.",
        variant: "default",
      })
      router.push(`/profile/settings/editProfile`)

    }
    else {
        router.push(`/profile/settings/editItem/new`)
      }
  }


  const getWishlist = async () => {
    const token = await getCookie()
    if (!token) {
      setWishlistLength(0)
      return
    }
    const decoded = await decodedToken(token)
    if (!decoded) {
      setWishlistLength(0)
      return
    }
    const { id } = decoded
    const wishList = await getWishList(id)
    setWishlistLength(Array.isArray(wishList.data) ? wishList.count : 0)
  }

  const getChat = async () => {
    const token = await getCookie()
    if (!token) {
      setChatLength(0)
      return
    }
    const decoded = await decodedToken(token)
    if (!decoded) {
      setChatLength(0)
      return
    }
    const { id } = decoded
    const chat = await getMessagesByUserId(id)
    setChatLength( chat?.partnerMessages?.length || 0)
  }

  const getOffers = async () => {
    const token = await getCookie()
    if (token) {
      const decoded = await decodedToken(token)
      if (!decoded) {
        setCartLength(0)
        setNotificationsLength(0)
        return
      }
      const { id } = decoded
      const offers = await getOfferById(id)

      const filteredOffers = Array.isArray(offers.data)
        ? offers.data.filter((offer) => offer.status_offer === "pending" || offer.status_offer === "accepted")
        : []
      const notifications = await getOffeReceived(id)
      const filteredNotifications = Array.isArray(notifications.data)
        ? notifications.data.filter(
            (notifications) => notifications.status_offer === "pending" || notifications.status_offer === "accepted",
          )
        : []
let allOffersCount = filteredOffers.length + filteredNotifications.length
        setOffersLength(allOffersCount)
        
      // setCartLength(filteredOffers.length)
      // setNotificationsLength(filteredNotifications.length)
    } else {
      setOffersLength(0)
    }
  }

  const logout = async () => {
    await removeCookie()
    await removeTarget()
    setUser(null)
    router.push("/auth/login") 
    window.location.reload()
  }

  useEffect(() => {
    getUser()
  }, [pathname]) // Re-fetch when pathname changes (e.g., after login/signup)

  useEffect(() => {
    const dataFetch = () => {
      getOffers()
      getWishlist()
      getChat()
    }

    // Only fetch if user is logged in (not on auth pages)
    if (!pathname?.startsWith('/auth/')) {
      dataFetch()
      
      const interval = setInterval(dataFetch, 5000) // Poll every 5 seconds

      return () => {
        clearInterval(interval)
      }
    } else {
      // Clear data when on auth pages
      setCartLength(0)
      setNotificationsLength(0)
      setWishlistLength(0)
      setChatLength(0)
    }
  }, [pathname]) // Re-fetch when pathname changes (e.g., after login/signup)

  useEffect(() => {
    if (!hasSearched) return
    if (filter === "") {
      router.push("/")
    } else if (filter.trim() !== "") {
      handleRTLSearch(filter)
    }
  }, [filter, hasSearched])

  let objPath = {}  
  useEffect(() => {
    // Check for specific path(s)
    if (router.asPath == '/auth/login' || router.asPath == '/auth/register' ) { 
        objPath.path1 = router.asPath
      }
    if(router.asPath == '') {
               objPath.path2 = router.asPath
               if( (objPath.path1 =='/auth/login' || objPath.path1 == '/auth/register') &&  objPath.path2 =='/' )
            router.refresh()
            window.location.reload()
               objPath = {}     
    }
    }, [objPath]);
  return (
    <>

      <motion.header
        className={`fixed top-0  w-full border-b transition-all duration-300 z-[10000000]${
          isScrolled 
            ? " !bg-white shadow-lg dark:!bg-[#121212]" 
            : " !bg-white shadow-sm dark:!bg-[#121212]"
        } dark:border-[#2a2a2a]`}
        style={{
          backgroundColor: theme === 'dark' ? '#121212' : '#ffffff',
        }}
        variants={navVariants}
        initial="visible"
        animate={showHeader ? "visible" : "hidden"}
      >
       
 
        {/* Main header */}
        <div className={` top-0 container transition-all duration-300 z-[10000000] ${
          isScrolled ? "py-3" : "py-2"
        }`} style={{
          backgroundColor: theme === 'dark' ? '#121212' : '#ffffff'
        }}>
          <motion.div 
            className="flex items-center justify-between gap-4"
            animate={{
              y: isScrolled ? 0 : 0,
              scale: isScrolled ? 0.98 : 1,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Mobile toggles */}
            <motion.div
              className="flex items-center gap-2 lg:hidden"
              custom={0}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleTheme()}
                  className="rounded-full hover:bg-primary/10 dark:hover:bg-white  "
                  aria-label={theme === "light" ? t("darkMode") : t("lightMode")}
                >
                  {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleLanguage()}
                  className="rounded-full hover:bg-primary/10 dark:hover:bg-primary/20 dark:text-white"
                  aria-label={t("language")}
                >
                  <span className="text-sm font-medium">{isRTL ? "EN" : "AR"}</span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Logo */}
            <motion.div 
              variants={logoVariants} 
              initial="hidden" 
              animate="visible" 
              whileHover="hover"
              className={`transition-all duration-300 ${isScrolled ? "scale-95" : "scale-100"}`}
            >
              <Link href="/" className="flex items-center gap-2 mx-2">
                <div className={`flex items-center justify-center bg-transparent transition-all duration-300 ${
                  isScrolled ? "max-h-5 w-28 -my-2" : "max-h-10 w-28 -my-3"
                }`}>
                    <Image 
                   src="/logo.png" 
                   alt="Swibba Logo"
                   width={200} 
                    height={300}
                    className="h-full w-full font-bold"
                     priority
                    />
                    {/* <h1 className="text-2xl font-bold italic text-primary/90  ">{t("swibba")}</h1> */}
                </div>
              </Link>
            </motion.div>


           

            {/* Search */}
<Link href={'/products'} 
              className="relative hidden flex-1 md:block"

>
<motion.div
              className="relative hidden flex-1 md:block"
              custom={1}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
             >
              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div
                    className="absolute inset-0 -m-2 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>
              <Search
                className={`absolute ${
                  isRTL ? "right-3" : "left-3"
                } top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-primary`}
              />
              <Input
                placeholder={t("search")}
                className={`${
                  isRTL ? "pr-12" : "pl-12"
                } rounded-full border-2 border-primary/50 dark:border-primary/30 dark:bg-[#1a1a1a] dark:text-white dark:placeholder:text-gray-400 focus:border-primary`}
                value={filter}
                onChange={(e) => {
                  serFilter(e.target.value)
                  setHasSearched(true)
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    handleRTLSearch(filter)
                    setHasSearched(true)
                  }
                }}
              />
              {filter.trim() && (
                <motion.div >
                  <Button
                    size="xs"
                    className={`absolute top-1/2 -translate-y-1/2 h-full rounded-full ${
                      isRTL ? "right-0 " : "left-0 -mr-2 "
                    } px-3 py-1`}
                    onClick={() => handleRTLSearch(filter)}
                    variant="default"
                  >
                    <Search />
                  </Button>
                </motion.div>
              )}
            </motion.div>
</Link>

           

            {/* Actions */}
            <motion.div
              className="hidden items-center gap-4 md:flex"
              custom={2}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              {user ? (
                <DropdownMenu >
                  <DropdownMenuTrigger asChild className="z-[100000000]">
                    <motion.div variants={buttonVariants} whileHover="hover" >
                    <Button variant="ghost" size="sm" className="gap-2  hover:text-popover/80   border border-none">
                      
                          <Avatar className="h-6 w-6 rounded-full object-cover">
                          <AvatarImage src={`${mediaURL}${user?.avatar}` || "placeholder.svg"} alt={user?.first_name || t("account")} />
                          <AvatarFallback className="bg-primary text-black dark:bg-primary/50 dark:text-black">
                            {String(user?.first_name).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                       
                          {/* <User className="h-4 w-4" /> */}
                        
                        <span>{(String(user?.first_name).length <= 11 ? (String(user?.first_name)) : (String(user?.first_name).slice(0, 10)) )|| t("account")}</span>
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 dark:bg-[#1a1a1a] dark:border-[#2a2a2a] z-[100000000]">
                    <DropdownMenuLabel className="font-normal  ">
                      <div className="flex flex-col space-y-1  italic text-muted">
                        <p className="text-lg font-medium leading-none capitalize dark:text-white">{(String(user?.first_name).length <= 11 ? (String(user?.first_name)) : (String(user?.first_name).slice(0, 10)) )|| t("account")}</p>
                        <p className="text-sm leading-none text-muted dark:text-white">{user?.email || ""}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="dark:bg-[#2a2a2a]" />

                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="hover:bg-primary/10 bg-background/50 hover:shadow-sm ">
                          <User className="mr-2 h-4 w-4" />
                          <span>{t("profile")}</span>
                        </Link>
                      </DropdownMenuItem>

                     
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/profile/settings/editProfile/`}
                          className="hover:bg-primary/10 bg-background/50 hover:shadow-sm"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>{t("settings")}</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/profile/items" className="hover:bg-primary/10 bg-background/50 hover:shadow-sm ">
                          <ListChecks className="mr-2 h-4 w-4" />
                          <span>{t("manageItems")}</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/offers-details" className="hover:bg-primary/10 bg-background/50 hover:shadow-sm ">
                          <PackageSearch  className="mr-2 h-4 w-4" />
                          <span>{t("offersDetails")||"Offers Details"}</span>
                        </Link>
                      </DropdownMenuItem>
                    </>

                    <DropdownMenuSeparator className="dark:bg-[#2a2a2a] text-primary" />
                    <Link href="/">
                      <DropdownMenuItem
                        onClick={() => logout()}
                        className="hover:bg-primary/10 bg-background/50 hover:shadow-sm "
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t("logout")}</span>
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>



              ) : (
                <>
                  <motion.div custom={3} variants={itemVariants}>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="gap-1 text-sm  hover:text-foreground dark:text-foreground dark:hover:text-foreground"
                      >
                        <Link href="/auth/login">{t("signIn")}</Link>
                      </Button>
                    </motion.div>
                  </motion.div>

                  <motion.div custom={4} variants={itemVariants}>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button
                        size="sm"
                        asChild
                        className={cn(
                          "gap-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-black dark:hover:bg-primary/90",
                        )}
                      >
                        <Link href="/auth/register">{t("signUp")}</Link>
                      </Button>
                    </motion.div>
                  </motion.div>

{/* them and lang */}
                  <motion.div custom={5} variants={itemVariants}>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <LanguageToggle />
                    </motion.div>
                  </motion.div>

                  <motion.div custom={6} variants={itemVariants}>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <ThemeToggle />
                    </motion.div>
                  </motion.div>

                    


                    

{/* 

<motion.div className="flex items-center gap-4" variants={navVariants}>
                  <motion.div custom={5} variants={itemVariants}>
                    <LanguageToggle />
                  </motion.div>
                  <motion.div custom={1} variants={itemVariants}>
                    <ThemeToggle />
                  </motion.div>
                </motion.div> */}




                </>
              )}

              {user ? (
                <>
                  {/* Notifications */}
                  {/* <motion.div custom={5} variants={itemVariants}>
                    <Link href="/recived-items" className="relative z-[100000]">
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:bg-primary/80 hover:text-popover/80 group"
                        >
                          <BiCartDownload className="h-5 w-5" />
                          <AnimatePresence>
                            {notificationsLength > 0 && (
                              <motion.span
                                className="absolute animate-bounce -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary/90 text-xs text-primary-foreground dark:text-black"
                                variants={badgeVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                              >
                                {notificationsLength}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          <span className="sr-only">{t("notifications") || "Recived Offers"}</span>
                          <span className="pointer-events-none absolute -bottom-8 right-0 z-50 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 dark:bg-black">
                            {t("notifications") || "Received Offers"}
                          </span>
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div> */}


                  <motion.div custom={5} variants={itemVariants}>
                    <Link href="/offers" className="relative z-[100000]">
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:bg-primary/80 hover:text-popover/80 group"
                        >
                          <PiSwapBold className="h-5 w-5" />
                          <AnimatePresence>
                            {offersLength > 0 && (
                              <motion.span
                                className="absolute animate-bounce -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary/90 text-xs text-primary-foreground dark:text-black"
                                variants={badgeVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                              >
                                {offersLength}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          <span className="sr-only">{t("AllOffers") || "All  Offers"}</span>
                          <span className="pointer-events-none absolute -bottom-8 right-0 z-50 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 dark:bg-black">
                            {t("AllOffers") || "All  Offers"}
                          </span>
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>

                  {/* Cart */}
                  {/* <motion.div custom={6} variants={itemVariants}>
                    <Link href="/send-items" className="relative z-[100000] ">
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:bg-primary/80 hover:text-popover/80 group"
                        >
                          <TbShoppingCartUp className="h-5 w-5" />
                          <AnimatePresence>
                            {cartLength > 0 && (
                              <motion.span
                                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground dark:text-black"
                                variants={badgeVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                              >
                                {cartLength}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          <span className="sr-only">{t("sendoffers") || "Send Offers"}</span>
                          <span className="pointer-events-none absolute -bottom-8 right-0 z-50 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 dark:bg-black">
                            {t("sendoffers") || "Send Offers"}
                          </span>
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div> */}
                  
                  {/* Wishlist */}
                  <motion.div custom={6} variants={itemVariants}>
                      <Link href="/wishList" className="relative z-[100000]">
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:bg-primary/80 hover:text-popover/80 group"
                        >
                          <Heart className="h-5 w-5" />
                          <AnimatePresence>
                            {wishlistLength > 0 && (
                              <motion.span
                                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground dark:text-black"
                                variants={badgeVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                              >
                                {wishlistLength}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          <span className="sr-only">{t("wishlist") || "wishlist"}</span>
                          <span className="pointer-events-none absolute -bottom-8 right-0 z-50 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 dark:bg-black">
                            {t("wishlist") || "Wishlist"}
                          </span>
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>

                  {/* Messages */}
                  <motion.div custom={7} variants={itemVariants}>
                    <Link href="/chat" className="relative z-[100000]">
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:bg-primary/80 hover:text-popover/80 group"
                        >
                          <MessageCircle className="h-5 w-5" />
                          <AnimatePresence>
                            {chatLength > 0 && (
                              <motion.span
                                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground dark:text-black"
                                variants={badgeVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                              >
                                {chatLength}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          <span className="sr-only">{t("messages") || "Messages"}</span>
                          <span className="pointer-events-none absolute -bottom-8 right-0 z-50 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 dark:bg-black">
                            {t("messages") || "Messages"}
                          </span>
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>

                  {/* Add items */}
                  <motion.div custom={8} variants={itemVariants}>
                    <span className="relative z-[100000]">
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:bg-primary/80 hover:text-popover/80 group"
                       
                       onClick={()=>{handleKYC()}}
                       >
                          <PlusCircle className="h-6 w-6" />
                          <span className="pointer-events-none absolute -bottom-8 right-0 z-50 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 dark:bg-black">
                            {t("addanewitem") || "Add a new item"}
                          </span>
                        </Button>
                      </motion.div>
                    </span>
                  </motion.div>

                  {/* lang and theme */}
                  <motion.div custom={9} variants={itemVariants}>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="relative z-[100000]">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:text-popover/80 group"
                        >
                          <LanguageToggle className="h-6 w-6" />
                          
                        </Button>
                      </motion.div>
                  </motion.div>
                  
                  <motion.div custom={10} variants={itemVariants}>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="relative z-[100000]">
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="relative hover:text-popover/80 group"
                        >
                          <ThemeToggle className="h-6 w-6" />
                         
                        </Button>
                      </motion.div>
                  </motion.div>

                </>
              ) : null}
            </motion.div>

            {/* Mobile menu button */}
            <motion.div custom={11} variants={itemVariants} initial="hidden" animate="visible" className="md:hidden">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-popover/80 "
                  onClick={toggleMenu}
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Mobile search */}
          <motion.div
            className="mt-4 md:hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="relative">
              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div
                    className="absolute inset-0 -m-2 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>
              <Search
                className={`absolute ${
                  isRTL ? "right-3" : "left-3"
                } top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-primary`}
              />
              <Input
                placeholder={t("search")}
                className={`${
                  isRTL ? "pr-10" : "pl-10"
                } rounded-full border-2 border-primary/50 dark:border-primary/30 dark:bg-[#1a1a1a] dark:text-white dark:placeholder:text-gray-400 focus:border-primary`}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </motion.div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className="mt-4 border-t pt-4 md:hidden dark:border-[#2a2a2a]"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
               { /* Mobile menu content */}
                        <nav className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary/30">
                          {user ? (
                          <>
                            <Link
                            href="/profile"
                            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary/10 dark:hover:bg-primary/10"
                            onClick={() => setIsMenuOpen(false)}
                            >
                            <div className="flex items-center gap-2 p-2 border border-none">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage
                                src={`${mediaURL}${user?.avatar}` || "placeholder.svg"}
                                alt={user?.first_name || t("account")}
                                />
                                <AvatarFallback className="bg-primary text-black dark:bg-primary dark:text-black">
                                {String(user?.first_name).charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {user?.verified && (
                                <div className="absolute -top-1 -right-1">
                                  <Verified className="h-4 w-4 text-primary/90 bg-background rounded-full p-0.5" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col italic">
                              <p className="text-sm font-medium"> {(String(user?.first_name).length <= 11 ? (String(user?.first_name)) : (String(user?.first_name).slice(0, 10)) )|| t("account")}</p>
                              <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                            </div>
                            </div>
                             
                            </Link>


                           
                            <div className="my-2 border-t dark:border-[#2a2a2a]"></div>
                            {/* Mobile menu items */}
                       <Link
                        href="/profile/settings/editItem/new"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary/10 dark:hover:bg-primary/10 z-[100000]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span className="z-[100000]">{t("addanewitem") || "Add a new item"}</span>
                      </Link>
                      <Link
                        href="/recived-items"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary/10 dark:hover:bg-primary/10"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <BiCartDownload className="h-4 w-4"/>
                        <span>
                          {`${t("notifications") || "Recived Offers"} `}
                          {`${notificationsLength ? notificationsLength : ""}`}
                        </span>
                      </Link>
                     
                      <Link
                        href="/send-items"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary/10 dark:hover:bg-primary/10"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <TbShoppingCartUp className="h-4 w-4" />
                        <span>{`${t("sendoffers")} ${cartLength ? cartLength : ""} `}</span>
                      </Link>
                      <Link
                        href="/chat"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary/10 dark:hover:bg-primary/10 z-[100000]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="z-[100000]">{`${t("messages") || "Messages"}  ${chatLength ? chatLength : ""} `}</span>
                      </Link>
                      <Link
                        href="/wishList"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary/10 dark:hover:bg-primary/10"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Heart className="h-4 w-4" />
                        <span>{`${t("wishList" || "WishList")} ${wishlistLength !== 0 ? wishlistLength : ""} `}</span>
                      </Link>
                     
                      <Link
                        href="/customerService"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary/10 dark:hover:bg-primary/10"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <HandPlatter className="h-4 w-4" />
                        <span>{t("customerService")}</span>
                      </Link>
                   
                       <Link
                        href="/profile/settings/editProfile/"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary/10 dark:hover:bg-primary/10"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>{t("settings")}</span>
                      </Link>
                   
                   
                      <Link
                        href="/"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary/10 dark:hover:bg-primary/10"
                        onClick={() => logout()}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t("logout")}</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="my-2 border-t dark:border-[#2a2a2a]"></div>
                      <Link
                        href="/auth/login"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary/10 dark:hover:bg-primary/10"
                         onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>{t("signIn")}</span>
                      </Link>
                      <Link
                        href="/customerService"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary/10 dark:hover:bg-primary/10"
                         onClick={() => setIsMenuOpen(false)}
                      >
                        <span>{t("customerService")}</span>
                      </Link>
                    </>
                  )}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced Categories navigation */}
        <AnimatePresence>
          {showCategoriesBar && (
            <motion.div
              className="border-t dark:bg-gradient-to-r dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#121212] dark:border-[#2a2a2a] shadow-sm"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
          <div className="container overflow-x-auto scrollbar-hide">
            <nav className="flex space-x-2 py-3">
              {categoriesName.slice(0, 10).map((category, i) => {
                const IconComponent = categoryIcons[category]
                return (
                  <motion.div key={i} custom={i} variants={itemVariants} initial="hidden" animate="visible">
                    <Link
                      href={`/categories/${category}`}
                      className={cn(
                        "relative whitespace-nowrap px-4 py-2 text-sm font-medium capitalize rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2",
                        pathname === `/categories/${category}` 
                          ? "text-primary-foreground bg-primary shadow-md" 
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10 bg-background/50 hover:shadow-sm border border-border/50"
                      )}
                    >
                      {IconComponent && <IconComponent className="w-4 h-4 relative z-10" />}
                      <span className="relative z-10 hidden sm:inline">{t(category)}</span>
                      {pathname === `/categories/${category}` && (
                        <motion.div
                          className="absolute inset-0 bg-primary rounded-full"
                          layoutId="activeCategory"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
              
              {/* View All Categories Link */}
              <motion.div 
                custom={categoriesName.length} 
                variants={itemVariants} 
                initial="hidden" 
                animate="visible"
                className="mt-1"
              >
                <Link
                  href="/categories"
                  className="whitespace-nowrap px-4 py-2 text-sm font-medium capitalize rounded-full transition-all duration-300 hover:scale-105 text-primary hover:bg-primary/10 bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 shadow-sm"
                >
                  <span className="relative z-10 ">{t('viewAll') || 'View All'}</span>
                </Link>
              </motion.div>
            </nav>
          </div>
            </motion.div>
          )}
        </AnimatePresence>
       
      </motion.header>
{/* space for header */}
      <div className="h-28 bg-transparent">

      </div>
      {/* Section toggle controls */}

    </>
  )

  
}
