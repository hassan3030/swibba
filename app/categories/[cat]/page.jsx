
import { removeCookie ,getCookie , decodedToken } from "@/callAPI/utiles"
import { getProductByCategory} from "@/callAPI/products"
// import { getProducts} from "@/callAPI/products"
import { ItemsList } from "@/components/items-list";

const FilterItemsPage = async ({params}) => {
  let showFilters = true
    const {cat} =  await params ;
    let products = await  getProductByCategory(cat)
    if(products.count === 0) showFilters=false
    // let products = await  getProducts()
      
  return (
  <div className="my-3 mx-3">
<ItemsList items={products.data} showCategoriesFilter={false} showFilters={showFilters}/> 
 </div>
  )
}

export default FilterItemsPage