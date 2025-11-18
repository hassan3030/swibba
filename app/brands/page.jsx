"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { getAllBrands } from "@/callAPI/static.js"
import BrandCardSkeleton from "@/components/loading/brand-card-skeleton.jsx"
import LoadingSpinner from "@/components/loading/loading-spinner.jsx"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import Image from "next/image"
import { mediaURL } from "@/callAPI/utiles"

const BrandCard = ({ brand }) => {
  const { isRTL } = useLanguage();

  // Compute a safe initial image src depending on the shape of `brand.brand_icon`.
  const computeInitialSrc = () => {
    const icon = brand?.brand_icon;
    if (!icon) return '/default-brand-icon.png';
    if (typeof icon === 'string') return icon.startsWith('http') ? icon : `${mediaURL}${icon}`;
    if (icon?.id) return `${mediaURL}${icon.id}`;
    if (icon?.filename_download) return icon.filename_download.startsWith('http') ? icon.filename_download : `${mediaURL}${icon.filename_download}`;
    return '/default-brand-icon.png';
  };

  const [imgSrc, setImgSrc] = useState(computeInitialSrc());

  return (
    <Link href={`/brands/${brand.name}`} className="transform transition-transform duration-300 hover:scale-105 rounded-lg border hover:border-primary/30 ">
      <div className="text-primary/90 bg-primary/15 flex flex-col items-center justify-center cursor-pointer shadow-lg rounded-lg p-4 space-y-3 w-44">
        <div className="bg-white/80 rounded-full p-2 flex items-center justify-center h-20 w-20">
          <Image
            src={imgSrc}
            alt={brand.name || 'brand'}
            className="object-contain rounded-full"
            width={72}
            height={72}
            unoptimized={true}
            onError={() => setImgSrc('/default-brand-icon.png')}
          />
        </div>

        <h3 className="text-md font-semibold text-center truncate">
          {isRTL ? (brand.translations?.[1]?.name || brand.name) : (brand.translations?.[0]?.name || brand.name)}
        </h3>
      </div>
    </Link>
  );
};

const BrandsPage = () => {
  const { t } = useTranslations();
  const { isRTL, toggleLanguage } = useLanguage()
  const [showSearch, setShowSearch] = useState(false);
  const [brands, setBrands] = useState([]);
  const [displayedBrands, setDisplayedBrands] = useState([]);
  const [limit, setLimit] = useState(10); // Show more initially
  const [filter, setFilter] = useState("");
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      setError(null);
      
      setTimeout(async () => {
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
            setBrands(uniqueBrands);
            setFilteredBrands(uniqueBrands);
            setDisplayedBrands(uniqueBrands.slice(0, limit));
          } else {
            setError(apiError || t('failedToFetchBrands'));
          }
        } catch (err) {
          setError(t('unexpectedError'));
          // console.error(err);
        } finally {
          setLoading(false);
        }
      }, 1000);
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    if (!loading) {
      const lowercasedFilter = filter.toLowerCase();
      const newFilteredBrands = brands.filter((brand) =>
        (brand.name || '').toLowerCase().includes(lowercasedFilter)
      );
      setFilteredBrands(newFilteredBrands);
      setDisplayedBrands(newFilteredBrands.slice(0, limit));
    }
    console.log('Filter applied:', brands);
  }, [filter, brands, limit, loading]);

  const handleLoadMore = () => {
    setIsLoadMoreLoading(true);
    setTimeout(() => {
      setLimit((prevLimit) => prevLimit + 10);
      setIsLoadMoreLoading(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 text-center gold-text-gradient dark:text-white ">{t('ourBrands')}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center">
          {Array.from({ length: 8 }).map((_, index) => (
            <BrandCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-4 bg-background dark:bg-gray-950">
      <div className="flex items-center justify-center gap-3 mb-2">
        <h1 className="text-4xl font-bold text-center gold-text-gradient dark:text-white ">{t('ourBrands')}</h1>
        <button
          type="button"
          aria-label={showSearch ? 'Hide search' : 'Show search'}
          onClick={() => setShowSearch(s => !s)}
          className="p-2 rounded-md hover:bg-primary/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
        </button>
      </div>

      <div className="bg-background dark:bg-gray-950 rounded-lg">
        <div className="mb-4 px-2 pt-2 flex justify-center">
          {showSearch && (
            <div className="w-full max-w-md">
              <input
                type="text"
                placeholder={t('filterBrands')}
                className="w-full p-3 border border-primary outline-none bg-background rounded-lg focus:border-primary hover:border-primary focus:ring-ring focus:ring-1"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setLimit(10);
                }}
              />
            </div>
          )}
        </div>

        {filteredBrands.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 place-items-center ">
              {displayedBrands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>

            {limit < filteredBrands.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="btn-default px-8 py-3 rounded-lg text-lg font-semibold flex items-center justify-center text-white"
                  disabled={isLoadMoreLoading}
                >
                  {isLoadMoreLoading ? <LoadingSpinner size="sm" /> : t('more')}
                </button>
              </div>
            )}
          </>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2 text-red-500">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">{t('noBrandsFound')}</h2>
            <p className="text-muted-foreground">{t('tryAdjustingFilter')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsPage;
