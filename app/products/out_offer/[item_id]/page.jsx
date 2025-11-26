"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { notFound, useRouter, useParams } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { ProductGallery } from "@/components/products/product-gallery"
import { ProductHeader } from "@/components/products/productView/ProductHeader"
import { ProductTitle } from "@/components/products/productView/ProductTitle"
import { ProductPrice } from "@/components/products/productView/ProductPrice"
import { ProductDescription } from "@/components/products/productView/ProductDescription"
import { SellerInfo } from "@/components/products/productView/SellerInfo"
import { SwapButton } from "@/components/products/productView/SwapButton"
import { ProductTabs } from "@/components/products/productView/ProductTabs"
import { MapModal } from "@/components/general/map-modal"
import { useTranslations } from "@/lib/use-translations"
import { getProductById } from "@/callAPI/products"
import { decodedToken, getCookie, validateAuth, setTarget, removeTarget } from "@/callAPI/utiles"
import { getKYC, getUserByProductId, checkUserHasProducts } from "@/callAPI/users"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/lib/language-provider"
import { getCompletedOffer, getReview, getWishList, deleteWishList, addWishList } from "@/callAPI/swap"
import { mediaURL } from "@/callAPI/utiles"
import LoadingSpinner from "@/components/loading/loading-spinner"
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
}

const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
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
  const [completedOffersCount, setCompletedOffersCount] = useState(0)
  const [rate, setRate] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSwapping, setIsSwapping] = useState(false)
  const [switchHeart, setSwitchHeart] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const { t } = useTranslations()
  const params = useParams()
  const router = useRouter()
  const id = params.item_id
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

  const handleGetWishItem = async () => {
    try {
      const user = await decodedToken()
      if (!user?.id) return
      const WishItem = await getWishList(user.id)
      if (WishItem?.success && Array.isArray(WishItem.data)) {
        const isItem = WishItem.data.some((i) => i.item_id == id)
        setSwitchHeart(isItem)
      }
    } catch (error) {
      // console.error("Error getting wish item:", error)
    }
  }

  const handleAddWishItem = async () => {
    try {
      const user = await decodedToken()
      if (!user?.id) {
        toast({
          title: t("faildWish") || "Login required",
          description: t("pleaseLoginWish") || "Please login to manage your wishlist.",
          variant: "destructive",
        })
        return
      }
      const WishItem = await getWishList(user.id)
      const items = Array.isArray(WishItem?.data) ? WishItem.data : []
      const existing = items.find((i) => i.item_id == id)

      if (existing) {
        await deleteWishList(existing.id)
        setSwitchHeart(false)
        toast({
          title: t("successAddWish") || "Success",
          description: t("deletedWishDesc") || "Removed from wishlist",
        })
      } else {
        const res = await addWishList(id, user.id)
        if (res?.success) {
          setSwitchHeart(true)
          toast({
            title: t("successAddWish") || "Success",
            description: t("successAddWishDesc") || "Added to wishlist successfully.",
          })
        }
      }
    } catch (error) {
      //  console.error("Error handling wish item:", error)
    }
  }

  useEffect(() => {
    handleGetWishItem()
  }, [switchHeart])

  

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
    setQuantity(q => q + 1);
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
      setIsLoading(true)
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
          setAvatar(userData.data?.avatar ? `${mediaURL}${userData.data.avatar}` : "")
        } else {
          setUser(null)
          setName("")
          setAvatar("")
        }
      } catch (err) {
        notFound()
      } finally {
        setIsLoading(false)
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
  const getCompletedOffers = async () => {
    try {
      const userId = user?.id
      if (!userId) {
        return
      } else {
      const completedOffers = await getCompletedOffer(userId)
      setCompletedOffersCount(completedOffers.count)
    }
  } catch (error) {
    // console.error("Error fetching completed offers:", error)
    setCompletedOffersCount(0)
  }
  }

  const handleGetBreviousRating = async (id) => {
    try {
      const response = await getCompletedOffer(id) 
      if (!response) {
        setRate(0)
      } else {
        const rates = response.rate
        setRate(rates)
      }
    } catch (error) {
      // console.error("Error fetching rating:", error)
      setRate(0)
    }
  }

  useEffect(() => {
    getCompletedOffers()
    if (user?.id) {
      handleGetBreviousRating(user.id)
    }
  }, [user])


  const makeSwap = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isSwapping) return
    setIsSwapping(true)
    
    const token = await getCookie()
    const decoded = await decodedToken()
    await setTarget(id)

    try{
      // check user exsit
      if (token) {
        const kyc = await getKYC(decoded.id) /// ------------- take id user
        const makeCheckUserHasProducts = await checkUserHasProducts(decoded.id)
        if (kyc.data === false) {
          toast({
            title: t("faildSwap") || "Failed Swap",
            description: t("DescFaildSwapKYC") || "Required information for swap. Please complete your information.",
            variant: "default",
          })
          router.push(`/profile/settings/editProfile`)
        }
        else {
          if(makeCheckUserHasProducts.count > 0){
            router.push(`/swap/${id}`)
            await removeTarget()
          }
          else{
            toast({
              title: t("addItem") || "Add Item",
              description: t("addItemToMakeSwapSesc") || "Please add new product to make swap with it",
              variant: "default",
            })
            router.push(`/profile/settings/editItem/new`)
          }
        }
      } else {
        toast({
          title: t("faildSwap") || "Failed Swap",
          description: t("DescFaildSwapLogin") ||   "Invalid swap without login. Please try to login.",
          variant: "default",
        })
        router.push(`/auth/login`)
      }
    }catch(error){
      toast({
        title: t("error") || "Error",
        description: t("somethingWentWrong") || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSwapping(false)
    }
  }


  if (isLoading) {
    return (
       <div className="min-h-screen py-4 bg-background dark:bg-gray-950 flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
         
        />
      </div>
    )
  }

  if (!product) {
    return null
  }

  // Share handler
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: t("linkCopied") || "Link copied!",
        description: t("linkCopiedDesc") || "Product link copied to clipboard",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 ">
      <motion.div
        className="container max-w-[1400px] mx-auto py-4 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-12"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Header Component */}
        <ProductHeader 
          product={product}
          isRTL={isRTL}
          t={t}
          switchHeart={switchHeart}
          onWishlistClick={handleAddWishItem}
          onShareClick={handleShare}
        />

        <div className="grid gap-6 sm:gap-8 lg:gap-12 xl:gap-16 lg:grid-cols-[1fr_1.1fr]" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Product Gallery */}
          <motion.div 
            variants={fadeInUp}
            className={`${isRTL ? 'lg:order-2' : 'lg:order-1'}`}
          >
            <ProductGallery images={images} productName={product.name} />
          </motion.div>

          {/* Product Details */}
          <motion.div 
            variants={fadeInUp}
            className={`flex flex-col gap-5 ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}
          >
            {/* Title Component */}
            <ProductTitle 
              product={product}
              isRTL={isRTL}
              t={t}
              onMapOpen={() => setIsMapOpen(true)}
            />

            {/* Price Component */}
            <ProductPrice 
              product={product}
              t={t}
            />

            {/* Description Component */}
            <ProductDescription 
              product={product}
              isRTL={isRTL}
              t={t}
            />

            {/* Swap Button Component */}
            <SwapButton 
              product={product}
              tokenId={tokenId}
              isSwapping={isSwapping}
              onSwap={makeSwap}
              t={t}
            />

          

            <Separator />

            {/* Product Tabs Component */}
            <ProductTabs 
              product={product}
              isRTL={isRTL}
              t={t}
            />

              <Separator />

            {/* Seller Info Component */}
            <SellerInfo 
              user={user}
              name={name}
              avatar={avatar}
              rate={rate}
              completedOffersCount={completedOffersCount}
              t={t}
            />
          </motion.div>
        </div>

        {/* Map Modal Component */}
        <MapModal 
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          geoLocation={product.geo_location}
          title={t("productLocation") || "Product Location"}
        />
      </motion.div>
    </div>
  )
}
