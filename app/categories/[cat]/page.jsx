import {  getProducts} from "@/callAPI/products"
import { ItemsList } from "@/components/items-list";

const FilterItemsCategoryPage = async ({params}) => {
    const {cat} =  await params ;
    
    // Normalize category name to match your categoriesName array format
    const normalizedCat = cat.toLowerCase()
    
        const products = await getProducts({category: { _eq: normalizedCat }})

    const showFilters = products.count > 0
    
    // console.log(`Category page: ${normalizedCat}, found ${products.count} items`)
    
  return (
  <div className="my-3 mx-3">
      <ItemsList items={products.data} showCategoriesFilter={true} showFilters={showFilters} defaultCategory={normalizedCat}/> 
 </div>
  )
}

export default FilterItemsCategoryPage