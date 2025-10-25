"use client"

import { useState , useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMediaType } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useLanguage } from "@/lib/language-provider"
import { useTranslations } from "@/lib/use-translations"
import { mediaURL } from "@/callAPI/utiles";



export default function SmallCard({item}) {
 
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
                          {(() => {
                            const mediaUrl = {
                              id: item.images[0]?.directus_files_id.id,
                              type: item.images[0]?.directus_files_id.type,
                              url: `${mediaURL}${item.images[0]?.directus_files_id.id}`
                            }
                            const mediaType = getMediaType(mediaUrl.type)
                            
                            if (mediaType === 'video') {
                              return (
                                <div className="relative w-full h-full">
                                  <video
                                    src={mediaUrl.url}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <Play className="h-3 w-3 text-white fill-current" />
                                  </div>
                                </div>
                              )
                            } else if (mediaType === 'audio') {
                              return (
                                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                  <div className="text-white text-sm">🎵</div>
                                </div>
                              )
                            } else {
                              return (
                                <Image
                                  src={mediaUrl.url}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              )
                            }
                          })()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{item.name}</h3>
                            {/* {selectedAvailableItem === item.id && <Check className="h-5 w-5 text-primary" />} */}
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <div className="mt-1 flex items-center justify-between">
                            <p className="font-semibold">${Number(item.price).toLocaleString('en-US')}</p>

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
