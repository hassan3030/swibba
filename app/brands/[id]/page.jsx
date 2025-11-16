"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductsEnhanced } from "../../../callAPI/products.js";
import { getAllBrands } from "../../../callAPI/static.js";
import { ItemCardProfile } from "@/components/products/item-card-profile"; // Import ItemCardProfile
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"

// Component for a single brand in the scrollable header
const BrandHeaderCard = ({ brand, currentBrandId }) => {
  const isActive = brand.id === currentBrandId;
  return (
    <Link href={`/brands/${brand.id}`}>
      <div
        className={`flex-shrink-0 px-4 py-2 rounded-full cursor-pointer transition-all duration-200
          ${isActive ? "bg-primary text-primary-foreground shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
      >
        <span className="text-sm font-medium whitespace-nowrap">{brand.name}</span>
      </div>
    </Link>
  );
};

const BrandItemsPage = () => {
  const { t } = useTranslations();
  const { id: brandId } = useParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const [allBrands, setAllBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [brandsError, setBrandsError] = useState(null);

  // Fetch all brands for the header
  useEffect(() => {
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
        console.error(err);
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchAllBrands();
  }, []);

  // Fetch products for the current brand
  useEffect(() => {
    if (!brandId) return;

    const fetchProductsByBrand = async () => {
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
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProductsByBrand();
  }, [brandId, t]);

  // Determine current brand name for display
  const currentBrandName = allBrands.find(brand => brand.id === brandId)?.name || brandId;

  if (loadingBrands || loadingProducts) {
    return <div className="container mx-auto p-4 text-center">{t('loadingText')}</div>;
  }

  if (brandsError || productsError) {
    return <div className="container mx-auto p-4 text-center text-red-500">{t('errorPrefix')}{brandsError || productsError}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Scrollable Brands Header */}
      <div className="mb-6 pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="inline-flex space-x-3 p-1">
          {allBrands.map((brand) => (
            <BrandHeaderCard key={brand.id} brand={brand} currentBrandId={brandId} />
          ))}
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center text-primary">{t('productsFor')}{currentBrandName}</h1>
      
      {products.length === 0 ? (
        <p className="text-center text-gray-500 py-12">{t('noProductsFoundForBrand')}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ItemCardProfile key={product.id} {...product} showbtn={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandItemsPage;
