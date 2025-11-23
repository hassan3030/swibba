import { useState, useEffect } from "react"
import { useInView } from "react-intersection-observer"

/**
 * Custom hook for lazy loading products with intersection observer
 * Follows DRY principle and provides consistent loading behavior
 * 
 * @param {Function} fetchFn - Async function that fetches products
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Intersection observer threshold (0-1)
 * @param {string} options.margin - Intersection observer root margin
 * @returns {Object} Loading state and products data
 */
export function useProductsLoader(fetchFn, options = {}) {
  const {
    threshold = 0.1,
    margin = "-100px",
  } = options

  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [ref, inView] = useInView({ 
    triggerOnce: true, 
    threshold,
    rootMargin: margin,
  })

  useEffect(() => {
    if (inView && !hasLoaded) {
      setIsLoading(true)
      setError(null)
      
      const loadProducts = async () => {
        try {
          const result = await fetchFn()
          setProducts(result.data || [])
          setHasLoaded(true)
        } catch (err) {
          setError(err)
          console.error("Error loading products:", err)
        } finally {
          setIsLoading(false)
        }
      }
      
      loadProducts()
    }
  }, [inView, hasLoaded, fetchFn])

  return {
    ref,
    products,
    isLoading,
    hasLoaded,
    error,
  }
}
