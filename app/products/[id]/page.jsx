"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { notFound, useRouter, useParams } from "next/navigation"
import { ArrowLeft, ArrowLeftRight, Repeat, Star, Verified } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ProductGallery } from "@/components/product-gallery"
import { useTranslations } from "@/lib/use-translations"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getProductById, getImageProducts } from "@/callAPI/products"
import { getCookie, decodedToken } from "@/callAPI/utiles"
import { getUserByProductId } from "@/callAPI/users"
import { useToast } from "@/components/ui/use-toast"


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
  const { t } = useTranslations()
  const params = useParams()
  const router = useRouter()
  const id = params.id

  const getToken = async () => {
    const fullToken = await decodedToken()
    setTokenId(fullToken.id)
  }

  // Fetch product and related data
  useEffect(() => {
    getToken()
    const fetchData = async () => {
      try {
        const prod = await getProductById(id)
        if (!prod.data) {
          notFound()
          return null
        }
        setProduct(prod.data)

        // Images
        if (prod.data.images && prod.data.images.length > 0) {
          const images2 = await getImageProducts(prod.data.images)
          const filesArray = images2.data.map((item) => `https://deel-deal-directus.csiwm3.easypanel.host/assets/${item.directus_files_id}`)
          setImages(filesArray)
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

  const makeSwap = async () => {
    const token = await getCookie()
    if (token) {
      router.push(`/swap/${id}`)
    } else {
      toast({
        title: t("faildSwap") || "Failed Swap",
        description: t("DescFaildSwapLogin") || "Invalid swap without login. Please try to login.",
        variant: "destructive",
      })
      router.push(`/auth/login`)
    }
  }

  if (!product) {
    return null
  }

  return (
    <motion.div
      className="container py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="mb-6 flex items-center gap-2"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div className="grid gap-8 md:grid-cols-2" variants={containerVariants} initial="hidden" animate="visible">
        {/* Product Gallery */}
        <motion.div variants={itemVariants}>
          <ProductGallery images={images} productName={product.name} />
        </motion.div>

        {/* Product Info */}
        <motion.div className="flex flex-col gap-4" variants={itemVariants}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold capitalize">{product.name}</h1>
                <p className="text-sm text-muted-foreground">{t(product.category)}</p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
              >
                <Badge
                  variant="outline"
                  className="bg-[#49c5b6] text-white border-[#49c5b6] hover:bg-[#3db6a7] hover:text-white hover:border-[#3db6a7]"
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
            <div className="flex items-center gap-3">
              <div className="flex items-baseline">
                <span className="text-sm font-medium text-[#404553]">LE</span>
                <motion.span
                  className="text-4xl font-bold text-[#404553]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                >
                  {Number(product.price).toLocaleString()}
                </motion.span>
              </div>
            </div>
            <div className="text-xs text-[#49c5b6]">
              {t("searcAboutProdPrice") || "Search About Product Or More With The Same Price"}: LE{Number(product.price).toLocaleString()}
            </div>
          </motion.div>

          <motion.p
            className="text-muted-foreground line-clamp-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t("description")} : {product.description}
          </motion.p>

          <Separator />

          {/* Owner */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400 }}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatar || "/placeholder.svg"} alt={name || "User"} />
                  <AvatarFallback>{name ? name.charAt(0) : "U"}</AvatarFallback>
                </Avatar>
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{name || "Unknown"}</span>
                  {user?.Verified && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: "spring", stiffness: 400 }}
                    >
                      <Verified className="h-4 w-4 text-[#49c5b6]" />
                    </motion.div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{(user?.ratings ?? 0).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowLeftRight className="h-4 w-4" />
                    <span className="px-1">{user?.completedSwaps ?? 0}</span>
                    <span className="px-1">{t("swaps")}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Add to Cart Section */}
          <motion.div
            className="grid gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex gap-4">
              {product.status_swap === "available" && product.user_id !== tokenId && (
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                  <Button className="w-full" onClick={makeSwap}>
                    <Repeat className="h-4 w-4 mr-2" />
                    {t("swap")}
                  </Button>
                </motion.div>
              )}
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="flex-1">
                <Link href={`/products`}>
                  <Button variant="secondary" className="w-full">
                    {t("goBack")}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <Separator className="my-4" />

          {/* Product Details Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Tabs defaultValue="features">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="features">{t("features")}</TabsTrigger>
                <TabsTrigger value="Category">{t("category")}</TabsTrigger>
                <TabsTrigger value="swap_status">{t("statusSwap")}</TabsTrigger>
              </TabsList>
              <AnimatePresence mode="wait"  >
                <TabsContent value="features" className="mt-4" key={crypto.randomUUID()}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {product.description}
                  </motion.div>
                </TabsContent>
                <TabsContent value="Category" className="mt-4" key={crypto.randomUUID()}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid gap-2"
                  >
                    {t(product.category)}
                  </motion.div>
                </TabsContent>
                <TabsContent value="swap_status" className="mt-4" key={crypto.randomUUID()}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {product.status_swap === "available" ? (
                      <p className="text-green-600">
                        {t("statusSwap")}: <span className="capitalize">{t(product?.status_swap)}</span> -{" "}
                        {t("availableItems")}
                      </p>
                    ) : (
                      <p className="text-red-600">
                        {t("statusSwap")}: <span className="capitalize">{t(product?.status_swap)}</span> -{" "}
                        {t("unAvailableItems")}
                      </p>
                    )}
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
