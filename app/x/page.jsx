
"use client"
import { getTarget } from '@/callAPI/utiles'
import React, { useEffect } from 'react'

 const page = () => {
    const x =async ()=>{
    const y = await getTarget()
  console.log("getTarget", y)
    } 
    useEffect(async ()=>{
        await x()
    } )
  return (
    <div>page</div>
  )
}

export default page;