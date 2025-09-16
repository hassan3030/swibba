"use client"
import { countriesWithFlags } from "@/lib/countries-data"

const FlagSimpleTest = () => {
  return (
    <div className="p-4 space-y-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Flag Display Test</h3>
      
      {/* Test 1: Direct emoji display */}
      <div>
        <p className="text-sm font-medium mb-2">Direct Emoji Test:</p>
        <div className="flex gap-2 text-2xl">
          <span>🇪🇬</span>
          <span>🇺🇸</span>
          <span>🇨🇦</span>
          <span>🇬🇧</span>
          <span>🇫🇷</span>
        </div>
      </div>

      {/* Test 2: Countries from data */}
      <div>
        <p className="text-sm font-medium mb-2">Countries Data Test (first 5):</p>
        <div className="flex flex-wrap gap-2 text-xl">
          {countriesWithFlags.slice(0, 5).map((country) => (
            <div key={country.code} className="flex items-center gap-1 border rounded px-2 py-1">
              <span className="text-2xl">{country.flag}</span>
              <span className="text-sm">{country.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Test 3: Different sizes */}
      <div>
        <p className="text-sm font-medium mb-2">Different Sizes:</p>
        <div className="flex items-center gap-4">
          <span className="text-sm">🇪🇬</span>
          <span className="text-lg">🇪🇬</span>
          <span className="text-2xl">🇪🇬</span>
          <span className="text-4xl">🇪🇬</span>
        </div>
      </div>

      {/* Test 4: Browser info */}
      <div>
        <p className="text-sm font-medium mb-2">Browser Info:</p>
        <div className="text-xs text-gray-600">
          <p>User Agent: {navigator.userAgent}</p>
          <p>Platform: {navigator.platform}</p>
        </div>
      </div>
    </div>
  )
}

export default FlagSimpleTest
