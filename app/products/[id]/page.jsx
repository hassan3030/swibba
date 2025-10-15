"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { notFound, useRouter, useParams } from "next/navigation"
import {  ArrowLeftRight, Repeat, Star, Verified, Plus, Minus, BadgeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ProductGallery } from "@/components/product-gallery"
import { useTranslations } from "@/lib/use-translations"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getProductById } from "@/callAPI/products"
import { decodedToken, getCookie, validateAuth ,setTarget } from "@/callAPI/utiles"
import { getKYC, getUserByProductId } from "@/callAPI/users"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/lib/language-provider"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
}

export default function ProductPage() {
  const { toast } = useToast()
  const [product, setProduct] = useState(null)
  const [images, setImages] = useState([])
  const [user, setUser] = useState(null)
  const [name, setName] = useState("")
  const [tokenId, setTokenId] = useState()
  const [avatar, setAvatar] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [originalquantity, setOriginalquantity] = useState(1)
  const [totalPrice, setTotalPrice] = useState(0)
  const { t } = useTranslations()
  const params = useParams()
  const router = useRouter()
  const id = params.id
  const { isRTL, toggleLanguage } = useLanguage()
  const getToken = async () => {
    try {
      const { userId } = await validateAuth()
      setTokenId(userId)
    } catch (error) {
      // User is not authenticated, tokenId will remain undefined
      // This is expected for public visitors, so we can ignore the error.
    }
  }

  // Set original quantity from product and initialize selected quantity
  useEffect(() => {
    if (product) {
      const stock = product.quantity || 0;
      setOriginalquantity(stock);
      setQuantity(stock > 0 ? 1 : 0);
    }
  }, [product]);

  // Calculate total price whenever quantity or product price changes
  useEffect(() => {
    if (product?.price) {
      const price = parseFloat(product.price) || 0;
      setTotalPrice(price * quantity);
    }
  }, [quantity, product?.price]);

  // Quantity handlers
  const increaseQuantity = () => {
    if (quantity < originalquantity) {
      setQuantity(q => q + 1);
    } else {
      toast({
        title: t("quantityExceeded") || "Maximum quantity reached",
        description: t("quantityExceededDescription") || `You cannot add more than the available stock of ${originalquantity}.`,
        variant: "destructive",
      });
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  // Fetch product and related data
  useEffect(() => {
    getToken()
    const fetchData = async () => {
      try {
        const prod = await getProductById(id)
        if (!prod.data) {
         return notFound()
          
        }
        setProduct(prod.data)

        // Images
        if (prod.data.images && prod.data.images.length > 0) {
          // const filesArray = prod.data.images.map((item ) => `https://deel-deal-directus.csiwm3.easypanel.host/assets/${item.directus_files_id}`)
          setImages(prod.data.images)
        } else {
          setImages([])
        }

        // User
        if (id) {
          const userData = await getUserByProductId(id)
          setUser(userData.data)
          setName(
            `${(String(userData.data?.first_name).length <= 11 ? (String(userData.data?.first_name)) : (String(userData.data?.first_name).slice(0, 10)) )|| t("account")} 
            ${(String(userData.data?.last_name).length <= 11 ? (String(userData.data?.last_name)) : (String(userData.data?.last_name).slice(0, 10)) )|| ""}`.trim()
          
          )
          setAvatar(userData.data?.avatar ? `https://deel-deal-directus.csiwm3.easypanel.host/assets/${userData.data.avatar}` : "")
        } else {
          setUser(null)
          setName("")
          setAvatar("")
        }
      } catch (err) {
        notFound()
      }
    }
    fetchData()
  }, [id])

  // const makeSwap = async (e) => {
  //   e.preventDefault()
  //   e.stopPropagation()
  //   const token = await getCookie()
  //   const decoded = await decodedToken(token)

  //   if (token) {
  //     const kyc = await getKYC(decoded.id) /// ------------- take id user
  //     if (kyc.data === false || kyc.data == "false") {
  //       toast({
  //         title: t("faildSwap") || "Failed Swap",
  //         description: t("DescFaildSwapKYC") || "KYC is required for swap. Please complete your KYC.",
  //         variant: "destructive",
  //       })
  //     }
  //     else {
  //       router.push(`/swap/${id}`)
  //     }
  //   } else {
  //     toast({
  //       title: t("faildSwap") || "Failed Swap",
  //       description: t("DescFaildSwapLogin") || "Invalid swap without login. Please try to login.",
  //       variant: "destructive",
  //     })
  //     router.push(`/auth/login`)
  //   }
  // }

  const makeSwap = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const token = await getCookie()
    const decoded = await decodedToken(token)
    if (token) {
      const kyc = await getKYC(decoded.id) /// ------------- take id user
      if (kyc.data === false) {
        toast({
          title: t("faildSwap") || "Failed Swap",
          description: t("DescFaildSwapKYC") || "Required information for swap. Please complete your information.",
          variant: "default",
        })
      }
      else {
        router.push(`/swap/${id}`)
      }
    } else {
    await setTarget(id)
      toast({
        title: t("faildSwap") || "Failed Swap",
        description: t("DescFaildSwapLogin") ||   "Invalid swap without login. Please try to login.",
        variant: "default",
      })
      router.push(`/auth/login`)
    }
  }


  if (!product) {
    return null
  }

  return (
    <motion.div
      className="container py-3 sm:py-5 px-4 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
     

      <motion.div className="grid gap-4 md:gap-6 md:grid-cols-2" variants={containerVariants} initial="hidden" animate="visible">
        {/* Product Gallery */}
        <motion.div variants={itemVariants} className="order-1 md:order-1">
          <ProductGallery images={images} productName={product.name} />
        </motion.div>

        {/* Product Info */}
        <motion.div className="flex flex-col gap-3 sm:gap-4 order-2 md:order-2" variants={itemVariants}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold capitalize break-words line-clamp-2 sm:line-clamp-3">
                  {(!isRTL ? product.translations[0]?.name: product.translations[1]?.name) || product.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {t(product.category)}
                </p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                className="flex-shrink-0"
              >
                <Badge
                  variant="outline"
                  className="text-primary border-primary/90 hover:cursor-pointer hover:scale-105 text-xs sm:text-sm px-2 py-1"
                >
                  {t(product.status_item)}
                </Badge>
              </motion.div>
            </div>
          </motion.div>

          {/* Price */}
          <motion.div
            className="mt-2 flex flex-col gap-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 sm:gap-3 text-secondary2/90">
              <div className="flex items-baseline min-w-0">
                <span className="text-xs sm:text-sm font-medium flex-shrink-0">{t("le")}</span>
                <motion.span
                  className="text-2xl sm:text-3xl md:text-4xl font-bold truncate ml-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                  title={Number(product.price).toLocaleString('en-US')}
                >
                  {Number(product.price).toLocaleString('en-US')}
                </motion.span>
              </div>
            </div>
            <div className="text-xs text-secondary2/85 line-clamp-2">
              {t("searcAboutProdPrice") || "Search About Product Or More With The Same Price"}: {Number(product.price).toLocaleString('en-US')} {t("le")}
            </div>
            <div className="text-xs text-secondary2/85 line-clamp-2">
              {t("quantity")}: {Number(originalquantity).toLocaleString('en-US')}
            </div>
          </motion.div>

          {/* Quantity Selector */}
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("quantity") || "Quantity"}:</span>
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={()=>{decreaseQuantity()}}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.span
                  className="text-lg font-semibold min-w-[2rem] text-center"
                  key={quantity}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {quantity}
                </motion.span>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={()=>{increaseQuantity()}}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Total Price Display */}
            {totalPrice > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t("totalPrice") || "Total Price"}:
                  </span>
                  <motion.span
                    className="text-xl font-bold text-primary"
                    key={totalPrice}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {totalPrice.toLocaleString('en-US')} {t("le") || "EGP"}
                  </motion.span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Number(product.price).toLocaleString('en-US')} × {quantity} = {totalPrice.toLocaleString('en-US')}
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="text-muted-foreground text-sm sm:text-base leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="font-medium block mb-1">{t("description")}:</span>
            <div className="text-break-responsive whitespace-pre-wrap leading-relaxed line-clamp-1 overflow-ellipsis">
              {(!isRTL ? product.translations[0]?.description: product.translations[1]?.description) || product.description}
            </div>
          </motion.div>

          <Separator />

          {/* Owner */}
          <motion.div
            className="flex items-start gap-2 sm:gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400 }} className="flex-shrink-0 relative">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarImage src={avatar || "/placeholder.svg"} alt={name || "User"} />
                  <AvatarFallback className="text-xs sm:text-sm">{name ? name.charAt(0) : "U"}</AvatarFallback>
                </Avatar>
                {user?.Verified === "true" || user?.Verified === true ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 400 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Verified className="h-4 w-4 text-primary bg-background rounded-full p-0.5 shadow-sm" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 400 }}
                    className="absolute -top-1 -right-1"
                  >
                    <BadgeX className="h-4 w-4 text-red-500 bg-background rounded-full p-0.5 shadow-sm" />
                  </motion.div>
                )}
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-sm sm:text-base truncate" title={name || "Unknown"}>
                    {name || "Unknown"}
                  </span>
                
                </div>
                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    <span>{(user?.ratings ?? 0).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <ArrowLeftRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="px-1">{user?.completedSwaps ?? 0}</span>
                    <span className="px-1 truncate">{t("swaps")}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Add to Cart Section */}
          <motion.div
            className="grid gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {product.status_swap === "available" && product.user_id !== tokenId && (
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                  <Button className="w-full text-sm sm:text-base" onClick={(e)=>{makeSwap(e)}}>
                    <Repeat className="h-4 w-4 mr-2" />
                    {t("swap")}
                  </Button>
                </motion.div>
              )}
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                <Link href={`/`} className="block w-full">
                  <Button variant="secondary" className="w-full text-sm sm:text-base">
                    {t("goBack")}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <Separator className="my-3 sm:my-4" />

          {/* Product Details Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Tabs defaultValue="features" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                <TabsTrigger value="features" className="text-xs  sm:text-sm px-2 py-2 h-auto">
                  {t("features")}
                </TabsTrigger>
                <TabsTrigger value="Category" className="text-xs sm:text-sm px-2 py-2 h-auto">
                  {t("category")}
                </TabsTrigger>
                <TabsTrigger value="swap_status" className="text-xs sm:text-sm px-2 py-2 h-auto">
                  {t("statusSwap")}
                </TabsTrigger>
              </TabsList>
                <TabsContent value="features" className="mt-3 sm:mt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm sm:text-base w-full"
                  >
                    <h2 className="text-lg sm:text-xl font-bold mb-1">{t("name")}:</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full">
                      {(!isRTL ? product.translations[0]?.name: product.translations[1]?.name) || product.name}
                    </div>
                    <Separator />
                    <h2 className="text-lg sm:text-xl font-bold mb-1">{t("location")}:</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full">
                      {t(product.country)} - {(!isRTL ? product.translations[0]?.city: product.translations[1]?.city) || product.city} - {(!isRTL ? product.translations[0]?.street: product.translations[1]?.street) || product.street}
                    </div>
                    <Separator />
                    <h2 className="text-lg sm:text-xl font-bold mb-1">{t("listedOn")|| "Listed on"}:</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full">
                      {new Date(product.date_created).toLocaleDateString('en-US')}
                    </div>
                    <Separator />
                    <h2 className="text-lg sm:text-xl font-bold mb-1">{t("category")}:</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full">
                      {t(product.category)}
                    </div>
                    <Separator />
                    <h2 className="text-lg sm:text-xl font-bold mb-1">{t("price")}:</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full text-secondary2">
                      {Number(product.price).toLocaleString('en-US')} {t("le")}
                    </div>
                    <Separator />
                    <h2 className="text-lg sm:text-xl font-bold mb-1">{t("quantity")}:</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full">
                      {Number(product.quantity).toLocaleString('en-US')}
                    </div>
                    <Separator />
                    <h2 className="text-lg sm:text-xl font-bold mb-1">{t("status")}:</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full text-primary">
                      {t(product.status_item)}
                    </div>
                    
                    
                    <Separator />

                    <h2 className="text-lg sm:text-xl font-bold mb-1">{t("description")}:</h2>
                    <div className="text-break-responsive whitespace-pre-wrap leading-relaxed max-w-full ">
                      {(!isRTL ? product.translations[0]?.description: product.translations[1]?.description) || product.description}
                    </div>
                    <Separator />
                  </motion.div>
                </TabsContent>
                <TabsContent value="Category" className="mt-3 sm:mt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid gap-2 text-primary text-sm sm:text-base"
                  >
                    {t(product.category)}
                  </motion.div>
                </TabsContent>
                <TabsContent value="swap_status" className="mt-3 sm:mt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm sm:text-base"
                  >
                    {product.status_swap === "available" ? (
                      <p className="text-primary/85 mx-1 line-clamp-2">
                        {t("statusSwap")}: 
                        {t("availableItems")}
                      </p>
                    ) : (
                      <p className="text-destructive mx-1 line-clamp-2">
                        {t("statusSwap")}:
                        {t("unAvailableItems")}
                      </p>
                    )}
                  </motion.div>
                </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
