"use client"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getAllCategories } from "@/callAPI/static"
import axios from "axios"
import { baseItemsURL } from "@/callAPI/utiles"
export default function XPage() {

  
 const getAllCategoriess = async () => {
      const categories = await getAllCategories()
      console.log("categories : " , categories)
    }

   
    const hhh = async () => {
      const response = await axios.get(`${baseItemsURL}/Items`  ,
        {params: {
        filter: {
          price: {
            _eq: 200
          },
          value_estimate: {
            _eq: 250
          }
        }}
      })
      console.log("response : " , response)
    }

  useEffect(() => {
    getAllCategoriess()
  }, [])

  
  return <div>XPage
   
    <Button onClick={()=>{hhh()}}>Get All Categories</Button>
  </div>
}