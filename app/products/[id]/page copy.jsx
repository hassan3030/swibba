"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useRouter, useParams } from "next/navigation";
import { ArrowLeft, ArrowLeftRight, Repeat, Star, Verified } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/product-gallery";
import { useTranslations } from "@/lib/use-translations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProductById, getImageProducts } from '@/callAPI/products';
import { getCookie , decodedToken } from '@/callAPI/utiles';
import { getUserByProductId } from '@/callAPI/users';
import { useToast } from "@/components/ui/use-toast";
import LoadinpPage  from "../loading";

export default  function  ProductPage() {
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [tokenId, setTokenId] = useState();
  const [avatar, setAvatar] = useState('');
  const { t } = useTranslations();
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  
  const getToken = async ()=>{
     const fullToken = await decodedToken();
     setTokenId(fullToken.id);
  }
  // Fetch product and related data
  useEffect(() => {
    getToken()
    const fetchData = async () => {
      try {
        const prod = await getProductById(id);
        if (!prod) {
          notFound();
          return;
        }
        setProduct(prod);

        // Images
        if (prod.images && prod.images.length > 0) {
          const images2 = await getImageProducts(prod.images);
          const filesArray = images2.map(item => `http://localhost:8055/assets/${item.directus_files_id}`);
          setImages(filesArray);
        } else {
          setImages([]);
        }

        // User
        if (id) {
          const userData = await getUserByProductId(id);
          setUser(userData);
          setName(`${userData?.first_name || ""} ${userData?.last_name || ""}`.trim());
          setAvatar(userData?.avatar ? `http://localhost:8055/assets/${userData.avatar}` : "");
        } else {
          setUser(null);
          setName("");
          setAvatar("");
        }
      } catch (err) {
        notFound();
      }
    };
    fetchData();
  }, [id]);

  const makeSwap = async () => {
    const token = await getCookie();
    if (token) {
      router.push(`/swap/${id}`);
    } else {
      toast({
        title: t("faildSwap") || "Failed Swap",
        description: t("DescFaildSwapLogin")|| "Invalid swap without login. Please try to login."  ,
        variant: "destructive",
      });
      router.push(`/auth/login`);
    }
  };

  if (!product) {
    return <LoadinpPage loadin={t('loading')} />;
  }

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Gallery */}
        <ProductGallery images={images} productName={product.name} />

        {/* Product Info */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold capitalize">{product.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {t(product.category)}
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-[#49c5b6] text-white border-[#49c5b6] hover:bg-[#3db6a7] hover:text-white hover:border-[#3db6a7]"
              >
                {t(product.status_item)}
              </Badge>
            </div>
          </div>

          {/* Price */}
          <div className="mt-2 flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="flex items-baseline">
                <span className="text-sm font-medium text-[#404553]">LE</span>
                <span className="text-4xl font-bold text-[#404553]">{product.price}</span>
              </div>
            </div>
            <div className="text-xs text-[#49c5b6]">
              {t('searcAboutProdPrice')||"Search About Product Or More With The Same Price"}: LE{product.price}
            </div>
          </div>

          <p className="text-muted-foreground line-clamp-2">{t("description")} : {product.description}</p>

          <Separator />

          {/* Owner */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatar || "/placeholder.svg"} alt={name || "User"} />
                <AvatarFallback>{name? name.charAt(0) : "U"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{name || "Unknown"}</span>
                  {user?.Verified && <Verified className="h-4 w-4 text-[#49c5b6]" />}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{(user?.ratings ?? 0).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowLeftRight className="h-4 w-4" />
                    <span className="px-1">{user?.completedSwaps ?? 0}
        
                    </span>
                    <span className="px-1">{t("swaps")} </span>

                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Add to Cart Section */}
          <div className="grid gap-4">
            <div className="flex gap-4">
              {(product.status_swap === 'available' && product.user_id !== tokenId)?
                 (<Button className="flex-1" onClick={makeSwap}>
                    <Repeat className="h-4 w-4" />
                {t("swap")}
              </Button>):null
              }
              <Link href={`/products`}>
                <Button variant="secondary" className="flex-1">
                  {t("goBack")}
                </Button>
              </Link>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Product Details Tabs */}
          <Tabs defaultValue="features">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="features">{t("features")}</TabsTrigger>
              <TabsTrigger value="Category">{t("category")}</TabsTrigger>
              <TabsTrigger value="swap_status">{t("statusSwap")}</TabsTrigger>
            </TabsList>
            <TabsContent value="features" className="mt-4">
              {product.description}
            </TabsContent>
            <TabsContent value="Category" className="mt-4">
              <div className="grid gap-2">
                {t(product.category)}
              </div>
            </TabsContent>
            <TabsContent value="swap_status" className="mt-4">
              {product.status_swap === 'available' ?
                <p className="text-green-600">{t("statusSwap")}:  <span className="capitalize">{t(product?.status_swap)}</span> - {t("availableItems")}</p>
                :
                <p className="text-red-600">{t("statusSwap")}: <span className="capitalize">{t(product?.status_swap)}</span> - {t("unAvailableItems")}</p>
              }
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}