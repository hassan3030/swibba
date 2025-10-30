"use client"
import React from 'react'
import { addCompletedOfferToUser } from '@/callAPI/swap'
import { deleteProduct } from '@/callAPI/products'
import { resetePassword } from '@/callAPI/users'
import { getAllCategories } from '@/callAPI/static'

const page = () => {

  const deleteProductById =  async () => {
  const deletedProduct = await resetePassword('hassan.hamdi.dev@gmail.com')
  console.log(deletedProduct)
  };

  return <div>
    <button onClick={() => { deleteProductById() }}>Delete Product By ID</button>
  </div>;
};

export default page;