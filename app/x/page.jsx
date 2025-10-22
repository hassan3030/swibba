"use client"
import { useEffect } from "react"
import { addCompletedOfferToUser } from "@/callAPI/swap"
import { Button } from "@/components/ui/button"

export default function XPage() {
  useEffect(() => {
   
  }, [])

  const addCompletedOfferToUsers = async () => {
    const response = await addCompletedOfferToUser()
    console.log("response : " , response)
  }
  return <div>XPage

    <Button onClick={()=>{addCompletedOfferToUsers()}}>Add Completed Offer To User</Button>
  </div>
}