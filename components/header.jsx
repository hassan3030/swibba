"use client"
import { MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BiCartDownload } from "react-icons/bi";
import { TbShoppingCartUp } from "react-icons/tb";
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
  Maximize2,
  Minimize2
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
import { removeCookie, getCookie, decodedToken } from "@/callAPI/utiles"
import { getOfferById, getOffersNotifications, getWishList, getMessage, getMessagesByUserId } from "@/callAPI/swap"
import { categoriesName } from "@/lib/data"
import { getUserById } from "@/callAPI/users"
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

const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
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

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState()
  const [filter, serFilter] = useState("")
  const [cartLength, setCartLength] = useState(0)
  const [notificationsLength, setNotificationsLength] = useState(0)
  const [wishlistLength, setWishlistLength] = useState(0)
  const [chatLength, setChatLength] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showTopBar, setShowTopBar] = useState(true)
  const [showCategoriesBar, setShowCategoriesBar] = useState(true)

  const router = useRouter()
  const { isRTL, toggleLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslations()
  const pathname = usePathname()

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  const handlegetProductSearchFilter = () => {
    const filterTrim = filter.trim()
    if (filterTrim) {
      router.push(`/filterItems/${filterTrim}`)
    }
  }

  const getUser = async () => {
    const token = await getCookie()
    if (token) {
      const { id } = await decodedToken(token)
      const userData = await getUserById(id)
      setUser(userData.data)
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
    setChatLength(Array.isArray(chat.data) ? chat.data.length : 0)
  }

  const getOffers = async () => {
    const token = await getCookie()
    if (token) {
      const decoded = await decodedToken(token)
      if (!decoded) return
      const { id } = decoded
      const offers = await getOfferById(id)

      const filteredOffers = Array.isArray(offers.data)
        ? offers.data.filter((offer) => offer.status_offer === "pending" || offer.status_offer === "accepted")
        : []

      const notifications = await getOffersNotifications(id)

      const filteredNotifications = Array.isArray(notifications.data)
        ? notifications.data.filter(
            (notifications) => notifications.status_offer === "pending" || notifications.status_offer === "accepted",
          )
        : []

      setCartLength(filteredOffers.length)
      setNotificationsLength(filteredNotifications.length)
    }
  }

  const logout = async () => {
    await removeCookie()
    setUser(null)
    router.push("/auth/login")
    window.location.reload()
  }

  useEffect(() => {
    getUser()
    getOffers()
    getWishlist()
    getChat()
  }, [])

  useEffect(() => {
    if (!hasSearched) return
    if (filter === "") {
      router.push("/")
    } else if (filter.trim() !== "") {
      handlegetProductSearchFilter()
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
        className="sticky top-0 z-50 w-full border-b bg-background shadow-sm dark:bg-[#121212] dark:border-[#2a2a2a]"
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top bar */}
        <AnimatePresence>
          {showTopBar && (
            <motion.div
              className="hidden lg:block bg-primary text-primary-foreground px-4 py-1 dark:bg-[#1a1a1a]"
              variants={navVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="container flex items-center justify-between">
                <motion.div className="flex items-center gap-4" variants={navVariants}>
                  <motion.div custom={0} variants={itemVariants}>
                    <LanguageToggle />
                  </motion.div>
                  <motion.div custom={1} variants={itemVariants}>
                    <ThemeToggle />
                  </motion.div>
                </motion.div>
                <motion.div className="flex items-center gap-4" custom={2} variants={itemVariants}>
                  <Link href="/customerService" className="text-xs hover:underline dark:text-white dark:hover:text-[#f2b230]">
                    {t("customerService")}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main header */}
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4">
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
 <motion.div variants={logoVariants} initial="hidden" animate="visible" whileHover="hover">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-10 w-16 items-center justify-center bg-transparent -my-3  ">
                    <Image 
                   src="/logoheader.png" 
                   alt="Swibba Logo"
                   width={200} 
                    height={300}
                    className="h-full w-full font-bold   "
                     priority
                    />

                  {/* <span className="text-2xl font-black gold-text-gradient">
                  </span> */}
                </div>
              </Link>
            </motion.div>


            {/* <motion.div variants={logoVariants} initial="hidden" animate="visible" whileHover="hover">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-10 w-32 items-center justify-center rounded-md font-bold text-black dark:text-[#f5b014] shadow-md bg-transparent">
                  <span className="text-2xl font-black gold-text-gradient">DeelDeal</span>
                </div>
              </Link>
            </motion.div> */}

            {/* Search */}
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
                    handlegetProductSearchFilter()
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
                    onClick={() => handlegetProductSearchFilter()}
                    variant="default"
                  >
                    <Search />
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              className="hidden items-center gap-4 md:flex"
              custom={2}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button variant="ghost" size="sm" className="gap-2 hover:text-primary dark:hover:text-primary">
                        {user?.avatar ? (
                          <Image
                            width={100}
                            height={100}
                            src={
                              `https://deel-deal-directus.csiwm3.easypanel.host/assets/${user.avatar || "/placeholder.svg"}` || "/placeholder.svg"
                            }
                            alt={user?.first_name || t("account")}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        <span>{(String(user?.first_name).length <= 11 ? (String(user?.first_name)) : (String(user?.first_name).slice(0, 10)) )|| t("account")}</span>
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{(String(user?.first_name).length <= 11 ? (String(user?.first_name)) : (String(user?.first_name).slice(0, 10)) )|| t("account")}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="dark:bg-[#2a2a2a]" />

                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="dark:hover:bg-[#2a2a2a] dark:focus:bg-[#2a2a2a]">
                          <User className="mr-2 h-4 w-4" />
                          <span>{t("profile")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/profile/settings/editProfile/`}
                          className="dark:hover:bg-[#2a2a2a] dark:focus:bg-[#2a2a2a]"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>{t("settings")}</span>
                        </Link>
                      </DropdownMenuItem>
                    </>

                    <DropdownMenuSeparator className="dark:bg-[#2a2a2a]" />
                    <Link href="/">
                      <DropdownMenuItem
                        onClick={() => logout()}
                        className="dark:hover:bg-[#2a2a2a] dark:focus:bg-[#2a2a2a]"
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
                        className="gap-1 text-sm hover:text-primary dark:hover:text-primary"
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


                </>
              )}

              {user ? (
                <>
                  {/* Notifications */}
                  <motion.div custom={5} variants={itemVariants}>
                    <Link href="/notifications" className="relative">
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:text-primary dark:hover:text-primary"
                        >
                          <BiCartDownload  className="h-5 w-5" />
                          <AnimatePresence>
                            {notificationsLength > 0 && (
                              <motion.span
                                className="absolute animate-bounce -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground dark:text-black"
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
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>

                  {/* Cart */}
                  <motion.div custom={6} variants={itemVariants}>
                    <Link href="/cart" className="relative">
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:text-primary dark:hover:text-primary"
                        >
                        
                          <TbShoppingCartUp className="h-5 w-5" />
                          <AnimatePresence>
                            {cartLength > 0 && (
                              <motion.span
                                className="absolute  -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground dark:text-black"
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
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                  {/* Wishlist */}
                  <motion.div custom={7} variants={itemVariants}>
                    <Link href="/wishList" className="relative">
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:text-primary dark:hover:text-primary"
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
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>

                  {/* Messages */}
                  <motion.div custom={8} variants={itemVariants}>
                    <Link href="/chat" className="relative">
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:text-primary dark:hover:text-primary group"
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
                          <span className="pointer-events-none absolute -bottom-8 right-0 z-10 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 dark:bg-black">
                            {t("messages") || "Messages"}
                          </span>
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>

                  {/* Add items */}
                  <motion.div custom={9} variants={itemVariants}>
                    <Link href="/profile/settings/editItem/new" className="relative">
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:text-primary dark:hover:text-primary group"
                        >
                          <PlusCircle className="h-6 w-6" />
                          <span className="pointer-events-none absolute -bottom-8 right-0 z-10 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 dark:bg-black">
                            {t("addanewitem") || "  Add a new item"}
                          </span>
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>


                   <Button 
      variant="" 
      size="sm" 
      onClick={() => {setShowTopBar(!showTopBar) ;  setShowCategoriesBar(!showCategoriesBar)}}
      className="flex items-center text-xs bg-transparent hover:bg-transparent hover:text-[#f2b230] hover:scale-105 dark:text-white dark:hover:text-[#f2b230] transition-transform duration-300"
    >
      {showTopBar ? <Minimize2 className="h-5 w-5" /> : < Maximize2 className="h-5 w-5" />}
    </Button>
                </>
              ) : null}
            </motion.div>

            {/* Mobile menu button */}
            <motion.div custom={10} variants={itemVariants} initial="hidden" animate="visible" className="md:hidden">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary dark:hover:text-primary"
                  onClick={toggleMenu}
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </motion.div>
            </motion.div>
          </div>

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
                            <div className="flex items-center gap-2 p-2">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                              src={user?.avatar || "/placeholder.svg"}
                              alt={user?.first_name || t("account")}
                              />
                              <AvatarFallback className="bg-primary text-black dark:bg-primary dark:text-black">
                              {String(user?.first_name).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <p className="text-sm font-medium"> {(String(user?.first_name).length <= 11 ? (String(user?.first_name)) : (String(user?.first_name).slice(0, 10)) )|| t("account")}</p>
                              <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                            </div>
                            </div>
                             
                            </Link>


                           
                            <div className="my-2 border-t dark:border-[#2a2a2a]"></div>
                            {/* Mobile menu items */}
                       <Link
                        href="/profile/settings/editItem/new"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary/10 dark:hover:bg-primary/10"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>{t("addanewitem") || "Add a new item"}</span>
                      </Link>
                      <Link
                        href="/notifications"
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
                        href="/cart"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary/10 dark:hover:bg-primary/10"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <TbShoppingCartUp className="h-4 w-4" />
                        <span>{`${t("sendoffers")} ${cartLength ? cartLength : ""} `}</span>
                      </Link>
                      <Link
                        href="/chat"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary/10 dark:hover:bg-primary/10"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{`${t("messages") || "Messages"}  ${chatLength ? chatLength : ""} `}</span>
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

        {/* Categories navigation */}
        {
          showCategoriesBar?( <motion.div
          className="border-t bg-background dark:bg-[#121212] dark:border-[#2a2a2a]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="container overflow-x-auto scrollbar-hide">
            <nav className="flex space-x-4 py-2">
              {categoriesName.map((category, i) => (
                <motion.div key={i} custom={i} variants={itemVariants} initial="hidden" animate="visible">
                  <Link
                    href={`/categories/${category}`}
                    className={cn(
                      "whitespace-nowrap px-3 py-1 text-sm capitalize transition-colors hover:text-primary",
                      pathname === category ? "text-primary font-medium" : "text-muted-foreground",
                    )}
                  >
                    {t(category)}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>
        </motion.div>):''
        }
       
      </motion.header>

      {/* Section toggle controls */}

    </>
  )

  
}
