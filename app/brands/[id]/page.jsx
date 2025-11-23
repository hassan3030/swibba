"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductsEnhanced } from "../../../callAPI/products.js";
import { getAllBrands } from "../../../callAPI/static.js";
import { ItemCardProfile } from "@/components/products/item-card-profile"; // Import ItemCardProfile
import LoadingSpinner from "@/components/loading/loading-spinner";
import ErrorDisplay from "@/components/general/error-display";
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { ProductsList } from "@/components/products/productsPage";

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
    return (
      <div className="container mx-auto p-4">
        <ErrorDisplay message={brandsError || productsError} onRetry={handleRetry} />
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
        <p className="text-center text-gray-500 py-12">{t('noProductsFoundForBrand')}</p>
      ) : (
        <div>
          {/* {products.map((product) => (
            <ItemCardProfile key={product.id} {...product} showbtn={true} />
          ))} */}
          <ProductsList items={products} showbtn={true} />
        </div>
      )}
    </div>
  );
};


export default BrandItemsPage;
