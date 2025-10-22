"use client"
import { useEffect } from "react"
import { addCompletedOfferToUser } from "@/callAPI/swap"
import { Button } from "@/components/ui/button"

export default function XPage() {
  useEffect(() => {
   
  }, [])

  const addCompletedOfferToUsers = async () => {
    const response = await addCompletedOfferToUser("ac3e8c52-62a0-47c8-b96a-5b6736814cc5" ,"f684eab7-8e73-4caf-b663-1366c5939eef")
    console.log("response : " , response)
  }
  return <div>XPage

    <Button onClick={()=>{addCompletedOfferToUsers()}}>Add Completed Offer To User</Button>
  </div>
}