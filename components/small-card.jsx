"use client"

import { useState , useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useLanguage } from "@/lib/language-provider"
import { useTranslations } from "@/lib/use-translations"
import { getImageProducts } from "@/callAPI/products"



export default function SmallCard({item}) {
  const [selectedUserItems, setSelectedUserItems] = useState([])
  const [selectedAvailableItem, setSelectedAvailableItem] = useState(null)
  const [swapStep, setSwapStep] = useState(1)
  const { isRTL } = useLanguage()
  const { t } = useTranslations()
const [bigImage , setBigImage] =  useState('')
// console.log("product" , product  )

  const getDataImage = async () => {
  const images2 = await getImageProducts(item?.images)
  setBigImage(images2.data[0].directus_files_id)
  console.log('i am in single product ' , images)
}

   useEffect(() => {
    getDataImage()
  }
  )

  return (
    <div className="container py-8">
      

      <Tabs defaultValue="swap">
      

        <TabsContent value="swap">
   
            <div className="grid gap-8 md:grid-cols-2">
           
              <Card>
              
                <CardContent>
                  <div className="space-y-4">
      
                      <div
                        key={item.id}
                        // className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                        //   selectedAvailableItem === item.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        // }`}
                        // onClick={() => handleAvailableItemSelect(item.id)}
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                          <Image
                          src={`http://localhost:8055/assets/${bigImage}` || "/placeholder.svg"}
                         alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{item.name}</h3>
                            {/* {selectedAvailableItem === item.id && <Check className="h-5 w-5 text-primary" />} */}
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <div className="mt-1 flex items-center justify-between">
                            <p className="font-semibold">${item.price}</p>
        
                          </div>
                        </div>
                      </div>
         
                  </div>
                </CardContent>
              </Card>
            </div>


        
        </TabsContent>

  
      </Tabs>
    </div>
  )
}
