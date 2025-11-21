"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, CheckCircle2, ShieldCheck, Search } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"
import { countriesWithFlags } from "@/lib/countries-data"
import FlagIcon from "@/components/general/flag-icon"

/**
 * Phone Input Component with Verification Status
 * 
 * @param {string} value - The phone number value
 * @param {function} onChange - Callback when phone number changes
 * @param {boolean} isVerified - Whether the phone is verified (verified_phone field)
 * @param {function} onVerifyClick - Callback when verify button is clicked
 * @param {string} error - Validation error message
 * @param {boolean} disabled - Whether the input is disabled
 * @param {string} countryCode - The country code
 * @param {function} onCountryCodeChange - Callback when country code changes
 * @param {boolean} isRTL - Whether to use RTL direction
 */
const PhoneInputWithVerify = ({ 
  value = "", 
  onChange, 
  isVerified = false,
  onVerifyClick,
  error = "",
  disabled = false,
  countryCode = "+20",
  onCountryCodeChange,
  isRTL = false
}) => {
  const { t } = useTranslations()
  
  // Get selected country info
  const selectedCountry = countriesWithFlags.find(c => c.code === countryCode) || countriesWithFlags[0]

  const handlePhoneChange = (e) => {
    const input = e.target.value
    // Allow only numbers, max 15 characters (no + sign, that's in country code)
    const cleaned = input.replace(/\D/g, "").slice(0, 15)
    onChange?.(cleaned)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="phone-input" className={`text-sm font-medium text-foreground ${isRTL ? 'force-rtl' : ''}`}>
        {t("phoneNumber") || "Phone Number"}
      </Label>
      
      <div className="flex gap-2 items-start">
        {/* Country Code Dropdown */}
        <Select value={countryCode} onValueChange={onCountryCodeChange} disabled={disabled}>
          <SelectTrigger className="w-[120px] h-10">
            <SelectValue>
              <div className="flex items-center gap-2">
                <FlagIcon 
                  flag={selectedCountry.flag} 
                  countryCode={selectedCountry.code}
                  className="text-lg"
                />
                <span className="font-mono text-sm">{countryCode}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <div className="flex items-center gap-2 px-3 py-2 sticky top-0 bg-background border-b z-10">
              <Search className="h-4 w-4 opacity-50" />
              <input
                className="flex h-8 w-full rounded-md bg-background px-3 py-1 text-sm outline-none placeholder:text-muted-foreground"
                placeholder={t("searchCountry") || "Search country..."}
                onChange={(e) => {
                  const searchField = e.target
                  const value = searchField.value.toLowerCase()
                  const items = searchField.closest('[role="listbox"]')?.querySelectorAll('[role="option"]') || []
                  
                  items.forEach(item => {
                    const countryName = item.textContent.toLowerCase()
                    const shouldShow = countryName.includes(value)
                    item.style.display = shouldShow ? '' : 'none'
                  })
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="overflow-y-auto">
              {countriesWithFlags.map((country) => (
                <SelectItem 
                  key={country.code} 
                  value={country.code}
                  className="hover:!bg-primary/20"
                >
                  <div className="flex items-center gap-2">
                    <FlagIcon 
                      flag={country.flag} 
                      countryCode={country.code}
                      className="text-lg"
                    />
                    <span>{country.name}</span>
                    <span className="font-mono text-xs text-muted-foreground ml-auto">{country.code}</span>
                  </div>
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>

        {/* Phone Input */}
        <div className="flex-1 space-y-1">
          <Input
            id="phone-input"
            type="text"
            value={value}
            onChange={handlePhoneChange}
            placeholder={t("enterPhoneNumber") || "1234567890"}
            className={`${error ? 'border-red-500 focus-visible:ring-red-500' : ''} ${
              isVerified ? 'border-green-500 focus-visible:ring-green-500' : ''
            }`}
            disabled={disabled}
            maxLength={15}
          />
          
          {/* Error Message */}
          {error && (
            <p className="text-xs text-red-600 mt-1">
              {error}
            </p>
          )}
        </div>

        {/* Verify Button or Verified Badge */}
        {isVerified ? (
          <Badge 
            variant="success" 
            className="h-10 px-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-300 dark:border-green-700 flex items-center gap-2 whitespace-nowrap"
          >
            <CheckCircle2 className="h-4 w-4" />
            {t("verifiedPhone") || "Verified"}
          </Badge>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onVerifyClick}
            disabled={disabled || !value || value.length < 8}
            className="h-10 px-4 border-primary/50 hover:bg-primary/10 hover:text-primary whitespace-nowrap"
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            {t("verify") || "Verify"}
          </Button>
        )}
      </div>

    
    </div>
  )
}

export default PhoneInputWithVerify
