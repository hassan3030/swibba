"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Phone, AlertCircle, Search } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"
import { countriesWithFlags, validatePhoneNumber } from "@/lib/countries-data"
import FlagIcon from "@/components/general/flag-icon"

const PhoneInput = ({ 
  countryCode, 
  phoneNumber, 
  onCountryCodeChange, 
  onPhoneNumberChange,
  onSubmit,
  isLoading 
}) => {
  const { t } = useTranslations()
  const [validationError, setValidationError] = useState("")
  const [isValidNumber, setIsValidNumber] = useState(true)

  const selectedCountry = countriesWithFlags.find(c => c.code === countryCode) || countriesWithFlags[0]

  useEffect(() => {
    if (phoneNumber) {
      const validation = validatePhoneNumber(countryCode, phoneNumber)
      setIsValidNumber(validation.isValid)
      setValidationError(validation.error)
    } else {
      setIsValidNumber(true)
      setValidationError("")
    }
  }, [phoneNumber, countryCode])

  const handleSubmit = () => {
    if (!phoneNumber) {
      setValidationError(t("pleaseEnterPhoneNumber") || "Please enter a phone number")
      setIsValidNumber(false)
      return
    }

    if (!isValidNumber) {
      return
    }

    onSubmit(countryCode, phoneNumber)
  }

  return (
    <div className="space-y-4">
      
      <div className="space-y-2">
        <Label>{t("countryCode") || "Country Code"}</Label>
        <Select value={countryCode} onValueChange={onCountryCodeChange}>
          <SelectTrigger>
            <SelectValue>
              <div className="flex items-center gap-2">
                <FlagIcon flag={selectedCountry.flag} countryCode={selectedCountry.iso} className="text-lg" />
                <span>{selectedCountry.code}</span>
                <span className="text-muted-foreground text-sm">({selectedCountry.name})</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <div className="flex items-center gap-2 px-3 py-2 sticky top-0 bg-background border-b">
              <Search className="h-4 w-4 opacity-50" />
              <input 
                className="flex h-8 w-full rounded-md bg-background px-3 py-1 text-sm outline-none placeholder:text-muted-foreground"
                placeholder={t("Search country...") || "Search country..."}
                onChange={(e) => {
                  const searchField = e.target
                  const value = searchField.value.toLowerCase()
                  const items = searchField.closest('.select-content')?.querySelectorAll('.country-item') || []
                  
                  items.forEach(item => {
                    const countryName = item.querySelector('.country-name')?.textContent.toLowerCase() || ''
                    const countryCode = item.querySelector('.country-code')?.textContent.toLowerCase() || ''
                    const shouldShow = countryName.includes(value) || countryCode.includes(value)
                    item.style.display = shouldShow ? '' : 'none'
                  })
                }}
              />
            </div>
            <div className="overflow-y-auto max-h-[calc(15rem-40px)]">
              {countriesWithFlags.map((country) => (
                <SelectItem 
                  key={`${country.code}-${country.name}`} 
                  value={country.code} 
                  className="country-item hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <FlagIcon flag={country.flag} countryCode={country.iso} className="text-lg" />
                    <span className="font-mono country-code">{country.code}</span>
                    <span className="text-sm country-name">{country.name}</span>
                  </div>
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>
      </div>

  
      <div className="space-y-2">
        <Label>{t("phoneNumber") || "Phone Number"}</Label>
        <Input
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange(e.target.value.replace(/\D/g, ""))}
          placeholder="1234567890"
          className={`${!isValidNumber && phoneNumber ? 'border-destructive focus:border-destructive' : ''}`}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && phoneNumber && isValidNumber) {
              handleSubmit()
            }
          }}
        />
        {!isValidNumber && phoneNumber && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || !phoneNumber || !isValidNumber}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("sendingCode") || "Sending Code..."}
          </>
        ) : (
          <>
            <Phone className="mr-2 h-4 w-4" />
            {t("sendVerificationCode") || "Send Verification Code"}
          </>
        )}
      </Button>
    </div>
  )
}

export default PhoneInput
