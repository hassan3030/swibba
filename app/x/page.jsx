"use client"

import { addReviewCompletedRateOffer } from '@/callAPI/swap'
import { Button } from '@/components/ui/button'
import React , {useState , useEffect} from 'react'

const page = () => {

    const addReview = async()=>{
        const adding = await addReviewCompletedRateOffer("8299526d-bb32-49c6-aae7-cb55999c2376",5)
        console.log("adding", adding)
    }
  return (
    <div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <Button onClick={()=>{addReview()}}>add review</Button>
    </div>
  )
}

export default page