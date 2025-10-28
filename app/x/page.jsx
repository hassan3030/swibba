"use client"
import React from 'react'
import { addCompletedOfferToUser } from '@/callAPI/swap'
import { deleteProduct } from '@/callAPI/products'

const page = () => {

  const deleteProductById =  async () => {
  const deletedProduct = await deleteProduct('d4594eed-5900-45b9-8ca0-7cc2a5bd40c0')
  console.log(deletedProduct)
  };

  return <div>
    <button onClick={() => { deleteProductById() }}>Delete Product By ID</button>
  </div>;
};

export default page;