'use client'

import React from 'react'
import FlagIcon from '@/components/flag-icon'

const page = () => {
  return (
    <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Flag Display Test</h1>
        <div className="flex flex-wrap gap-4 items-center">
          <FlagIcon flag="eg" countryCode="EG" />
          <FlagIcon flag="us" countryCode="US" />
          <FlagIcon flag="gb" countryCode="GB" />
          <FlagIcon flag="fr" countryCode="FR" />
          <FlagIcon flag="de" countryCode="DE" />
          <FlagIcon flag="gr" countryCode="GR" />
          <FlagIcon flag="dk" countryCode="DK" />
          <FlagIcon flag="cz" countryCode="CZ" />
          <FlagIcon flag="sa" countryCode="SA" />
          <FlagIcon flag="ae" countryCode="AE" />
        </div>
    </div>
  )
}

export default page

