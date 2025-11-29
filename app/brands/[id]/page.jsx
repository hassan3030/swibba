"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getProductsEnhanced } from "../../../callAPI/products.js";
import { getAllBrands } from "../../../callAPI/static.js";
import { ItemCardProfile } from "@/components/products/item-card-profile"; // Import ItemCardProfile
import LoadingSpinner from "@/components/loading/loading-spinner";
import ErrorDisplay from "@/components/general/error-display";
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { ProductsList } from "@/components/products/productsPage";
import { Button } from "@/components/ui/button";
import { Tag, ArrowLeft, ShoppingBag } from "lucide-react";

// Component for a single brand in the scrollable header
const BrandHeaderCard = ({ brand, currentBrandId }) => {
  const { isRTL, toggleLanguage } = useLanguage()

  const isActive = brand.id === currentBrandId;
  return (
    <Link href={`/brands/${brand.name}`}>
      <div
        className={`flex-shrink-0 px-4 py-2 rounded-full cursor-pointer transition-all duration-200
          ${isActive ? "bg-primary text-primary-foreground shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
      >
        <span className="text-sm font-medium whitespace-nowrap">{isRTL ? brand.translations?.[1]?.name : brand.translations?.[0]?.name || brand.name}</span>
      </div>
    </Link>
  );
};

const BrandItemsPage = () => {
  const { t } = useTranslations();
  const { id: brandId } = useParams();
  const router = useRouter();
  const { isRTL, toggleLanguage } = useLanguage()
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [allBrands, setAllBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [brandsError, setBrandsError] = useState(null);

  const fetchAllBrands = async () => {
    setLoadingBrands(true);
    setBrandsError(null);
    try {
      const { success, data, error: apiError } = await getAllBrands();
      if (success) {
        const uniqueBrands = [];
        const seenNames = new Set();
        for (const brand of data) {
          if (brand.name && !seenNames.has(brand.name)) {
            seenNames.add(brand.name);
            uniqueBrands.push(brand);
          }
        }
        setAllBrands(uniqueBrands);
      } else {
        setBrandsError(apiError || t('failedToFetchAllBrands'));
      }
    } catch (err) {
      setBrandsError(t('unexpectedErrorFetchingBrands'));
      // console.error(err);
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchProductsByBrand = async () => {
    if (!brandId) return;
    setLoadingProducts(true);
    setProductsError(null);
    try {
      const { success, data, error: apiError } = await getProductsEnhanced({ brand: brandId });
      if (success) {
        setProducts(data);
      } else {
        setProductsError(apiError || t('failedToFetchProductsForBrand'));
      }
    } catch (err) {
      setProductsError(t('unexpectedErrorFetchingProducts'));
      // console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchAllBrands();
  }, []);

  useEffect(() => {
    fetchProductsByBrand();
  }, [brandId]);

  const handleRetry = () => {
    fetchAllBrands();
    fetchProductsByBrand();
  };

  // Determine current brand name for display
  const currentBrandName = allBrands.find(brand => brand.id === brandId)?.name || brandId;

  if (loadingBrands || loadingProducts) {
    return (
      <div className="container mx-auto p-4 text-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (brandsError || productsError) {
    const errorMessage = brandsError || productsError;
    const isAuthError = errorMessage?.toLowerCase().includes('auth') || 
                        errorMessage?.toLowerCase().includes('login') ||
                        errorMessage?.toLowerCase().includes('unauthorized');
    
    return (
      <div className="container mx-auto p-4">
        <ErrorDisplay 
          message={errorMessage} 
          onRetry={handleRetry}
          type={isAuthError ? "auth" : "error"}
          showHomeButton={true}
          showBackButton={true}
        />
      </div>
    );
  }

  return (
    <div className="container  p-4">
      {/* Scrollable Brands Header */}
      <div className="mb-6 pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex justify-center  space-x-3 p-1">
          {allBrands.slice(0, 12).map((brand) => (
            <BrandHeaderCard key={brand.id} brand={brand} currentBrandId={brandId} />
          ))}
          {/* View All Button */}
          <Link href="/brands">
            <div className="flex-shrink-0 px-4 py-2 rounded-full cursor-pointer transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
              <span className="text-sm font-medium whitespace-nowrap">{t('viewAll')}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* <h1 className="text-3xl font-bold mb-6 text-center text-primary">{t('productsFor')}{currentBrandName}</h1> */}
      
      {products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-20 px-4"
        >
          {/* Empty State Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
              <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-8 rounded-full">
                <Tag className="w-24 h-24 text-primary/60" strokeWidth={1.5} />
              </div>
            </div>
          </motion.div>

          {/* Empty State Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-3 max-w-md"
          >
            <h3 className="text-2xl font-bold text-foreground">
              {t("noProductsFoundForBrand") || "No Products Found"}
            </h3>
            <p className="text-base text-muted-foreground">
              {isRTL 
                ? `لا توجد منتجات متاحة حالياً لعلامة "${brandId}" التجارية.`
                : `There are no products available for the "${brandId}" brand at the moment.`
              }
            </p>
            <p className="text-sm text-muted-foreground/80">
              {isRTL
                ? "تحقق لاحقاً أو استكشف علامات تجارية أخرى."
                : "Check back later or explore other brands."
              }
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => router.push("/brands")}
                variant="default"
                size="lg"
                className="px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {isRTL ? "استكشف العلامات التجارية" : "Explore Brands"}
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => router.push("/products")}
                variant="outline"
                size="lg"
                className="px-6 py-3 rounded-full font-medium transition-all duration-300"
              >
                <ArrowLeft className={`w-4 h-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`} />
                {isRTL ? "تصفح جميع المنتجات" : "Browse All Products"}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        <div>
          {/* {products.map((product) => (
            <ItemCardProfile key={product.id} {...product} showbtn={true} />
          ))} */}
          <ProductsList items={products} showbtn={true} showFilters={false} hideOwnItems={true} />
        </div>
      )}
    </div>
  );
};


export default BrandItemsPage;
