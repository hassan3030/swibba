import {  getProducts} from "@/callAPI/products"
import { ProductsList } from "@/components/products/productsPage";

const FilterItemsCategoryPage = async ({params}) => {
    const {cat} =  await params ;
    
    // Normalize category name to match your categoriesName array format
    const normalizedCat = cat.toLowerCase()
    
        const products = await getProducts({category: { _eq: normalizedCat }})

    const showFilters = products.count > 0
    
    // console.log(`Category page: ${normalizedCat}, found ${products.count} items`)
    
  return (
  <div className="min-h-screen bg-background dark:bg-gray-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductsList items={products.data} showCategoriesFilter={true} showFilters={showFilters} defaultCategory={normalizedCat} /> 
    </div>
  </div>
  )
}

export default FilterItemsCategoryPage