"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { getAllBrands } from "@/callAPI/static.js"
import BrandCardSkeleton from "@/components/loading/brand-card-skeleton.jsx"
import LoadingSpinner from "@/components/loading/loading-spinner.jsx"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"

const BrandCard = ({ brand }) => {  
  const { isRTL, toggleLanguage } = useLanguage()
  return (
    <Link href={`/brands/${brand.name}`} className="transform transition-transform duration-300 hover:scale-105">
      <div
        className="text-primary/90 bg-primary/15 flex items-center justify-center cursor-pointer shadow-lg rounded-lg "
        style={{
          height: "60px",
          width: "180px",
        }}
      >
        <h3 className="text-xl font-semibold">
          {isRTL ? (brand.translations?.[1]?.name || brand.name) : (brand.translations?.[0]?.name || brand.name)}
        </h3>
      </div>
    </Link>
  );
};

const BrandsPage = () => {
  const { t } = useTranslations();
  const { isRTL, toggleLanguage } = useLanguage()
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
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-2 text-center gold-text-gradient dark:text-white ">{t('ourBrands')}</h1>
      <div className="bg-card/50 rounded-lg">
        <div className="mb-4 px-2 pt-2">
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

        {filteredBrands.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 place-items-center">
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
