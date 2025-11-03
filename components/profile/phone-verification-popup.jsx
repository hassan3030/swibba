"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Phone, Shield, Check, X, AlertCircle, Search } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"
import { useToast } from "@/components/ui/use-toast"
import { countriesWithFlags, validatePhoneNumber } from "@/lib/countries-data"
import FlagIcon from "@/components/general/flag-icon" 

const PhoneVerificationPopup = ({ open, onOpenChange, currentPhone = "", onVerified, isVerified = false }) => {
  const { t } = useTranslations()
  const { toast } = useToast()
  
  const [step, setStep] = useState("phone") // "phone" or "verify"
  const [selectedCountryCode, setSelectedCountryCode] = useState("+20")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [sentCode, setSentCode] = useState("")
  const [codeExpiry, setCodeExpiry] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [validationError, setValidationError] = useState("")
  const [isValidNumber, setIsValidNumber] = useState(true)

  // Get selected country info
  const selectedCountry = countriesWithFlags.find(c => c.code === selectedCountryCode) || countriesWithFlags[0]

  // Initialize phone number from current phone
  useEffect(() => {
    if (currentPhone) {
      // Extract country code and phone number
      const phoneMatch = currentPhone.match(/^(\+\d+)(.*)$/)
      if (phoneMatch) {
        setSelectedCountryCode(phoneMatch[1])
        setPhoneNumber(phoneMatch[2])
      } else {
        setPhoneNumber(currentPhone)
      }
    }
  }, [currentPhone])

  // Timer for code expiry
  useEffect(() => {
    let interval
    if (codeExpiry && timeRemaining > 0) {
      interval = setInterval(() => {
        const now = new Date().getTime()
        const timeLeft = Math.max(0, Math.floor((codeExpiry - now) / 1000))
        setTimeRemaining(timeLeft)
        
        if (timeLeft === 0) {
          setSentCode("")
          setCodeExpiry(null)
          toast({
            title: t("codeExpired") || "Code Expired",
            description: t("verificationCodeExpired") || "Verification code has expired. Please request a new one.",
            variant: "destructive",
          })
        }
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [codeExpiry, timeRemaining, t, toast])

  // Validate phone number when it changes
  useEffect(() => {
    if (phoneNumber) {
      const validation = validatePhoneNumber(selectedCountryCode, phoneNumber)
      setIsValidNumber(validation.isValid)
      setValidationError(validation.error)
    } else {
      setIsValidNumber(true)
      setValidationError("")
    }
  }, [phoneNumber, selectedCountryCode])

  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      toast({
        title: t("error") || "Error",
        description: t("pleaseEnterPhoneNumber") || "Please enter a phone number",
        variant: "destructive",
      })
      return
    }

    if (!isValidNumber) {
      toast({
        title: t("error") || "Error",
        description: validationError || t("invalidPhoneNumber") || "Invalid phone number",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      const fullPhoneNumber = `${selectedCountryCode}${phoneNumber}`
      
      const response = await fetch('/api/sms/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to send verification code')
      }

      // Set up the verification state
      const expiry = new Date().getTime() + (result.data.expiresIn * 1000)
      setCodeExpiry(expiry)
      setTimeRemaining(result.data.expiresIn)
      setStep("verify")
      
      toast({
        title: t("codeSent") || "Code Sent",
        description: `${t("verificationCodeSent") || "Verification code sent to"} ${fullPhoneNumber}`,
      })
    } catch (error) {
      // console.error('SMS send error:', error)
      toast({
        title: t("error") || "Error",
        description: error.message || t("failedToSendCode") || "Failed to send verification code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async () => {
    if (!verificationCode) {
      toast({
        title: t("error") || "Error",
        description: t("pleaseEnterCode") || "Please enter the verification code",
        variant: "destructive",
      })
      return
    }

    if (verificationCode.length !== 6) {
      toast({
        title: t("error") || "Error",
        description: t("codeMustBe6Digits") || "Verification code must be 6 digits",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    
    try {
      const fullPhoneNumber = `${selectedCountryCode}${phoneNumber}`
      
      const response = await fetch('/api/sms/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          code: verificationCode
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to verify code')
      }

      // Verification successful
      setIsVerifying(false)
      onVerified(fullPhoneNumber)
      onOpenChange(false)
      
      toast({
        title: t("success") || "Success",
        description: t("phoneVerified") || "Phone number verified successfully!",
      })
      
      // Reset form
      setStep("phone")
      setVerificationCode("")
      setSentCode("")
    } catch (error) {
      // console.error('SMS verification error:', error)
      toast({
        title: t("error") || "Error",
        description: error.message || t("verificationFailed") || "Verification failed",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const resetForm = () => {
    setStep("phone")
    setVerificationCode("")
    setSentCode("")
    setCodeExpiry(null)
    setTimeRemaining(0)
    // Don't reset phone number - allow users to change it until verified
    if (currentPhone && !isVerified) {
      const phoneMatch = currentPhone.match(/^(\+\d+)(.*)$/)
      if (phoneMatch) {
        setSelectedCountryCode(phoneMatch[1])
        setPhoneNumber(phoneMatch[2])
      } else {
        setPhoneNumber(currentPhone)
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen)
      if (!isOpen) resetForm()
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 mt-4">
            <Shield className="h-5 w-5 text-primary" />
            {t("verifyPhoneNumber") || "Verify Phone Number"}
          </DialogTitle>
          <DialogDescription>
            {step === "phone" 
              ? t("enterPhoneToReceiveCode") || "Enter your phone number to receive a verification code"
              : t("enterCodeSent") || "Enter the verification code sent to your phone"
            }
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "phone" ? (
            <motion.div
              key="phone-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Country Code Selection */}
              <div className="space-y-2">
                <Label>{t("countryCode") || "Country Code"}</Label>
                <Select value={selectedCountryCode} onValueChange={setSelectedCountryCode}>
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
                          const searchField = e.target;
                          const value = searchField.value.toLowerCase();
                          const items = searchField.closest('.select-content')?.querySelectorAll('.country-item') || [];
                          
                          items.forEach(item => {
                            const countryName = item.querySelector('.country-name')?.textContent.toLowerCase() || '';
                            const countryCode = item.querySelector('.country-code')?.textContent.toLowerCase() || '';
                            const shouldShow = countryName.includes(value) || countryCode.includes(value);
                            item.style.display = shouldShow ? '' : 'none';
                          });
                        }}
                      />
                    </div>
                    <div className="overflow-y-auto max-h-[calc(15rem-40px)]">
                      {countriesWithFlags.map((country) => (
                        <SelectItem key={`${country.code}-${country.name}`} value={country.code} className="country-item">
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

              {/* Phone Number Input */}
              <div className="space-y-2">
                <Label>{t("phoneNumber") || "Phone Number"}</Label>
                <div className="flex gap-2">
                  {/* <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted min-w-0">
                    <FlagIcon flag={selectedCountry.flag} countryCode={selectedCountry.iso} className="text-lg" />
                    <span className="font-mono text-sm">{selectedCountryCode}</span>
                  </div> */}
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456789"
                    className={`flex-1 ${!isValidNumber && phoneNumber ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                </div>
                {!isValidNumber && phoneNumber && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              {/* Send Code Button */}
              <Button
                onClick={sendVerificationCode}
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
            </motion.div>
          ) : (
            <motion.div
              key="verify-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Phone Number Display */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{t("codeSentTo") || "Code sent to"}:</p>
                <p className="font-medium flex items-center gap-2">
                  <FlagIcon flag={selectedCountry.flag} countryCode={selectedCountry.iso} className="text-lg" />
                  {selectedCountryCode}{phoneNumber}
                </p>
                {timeRemaining > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {t("codeExpiresIn") || "Code expires in"}:
                    </span>
                    <span className={`text-xs font-mono ${timeRemaining < 60 ? 'text-red-600 animate-pulse' : timeRemaining < 120 ? 'text-orange-600' : 'text-green-600'}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}
                {timeRemaining === 0 && sentCode && (
                  <div className="text-xs text-red-600 mt-2">
                    {t("codeHasExpired") || "Verification code has expired. Please request a new one."}
                  </div>
                )}
              </div>


              {/* Verification Code Input */}
              <div className="space-y-2">
                <Label>{t("verificationCode") || "Verification Code"}</Label>
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("phone")}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  {t("back") || "Back"}
                </Button>
                <Button
                  onClick={verifyCode}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("verifying") || "Verifying..."}
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {t("verify") || "Verify"}
                    </>
                  )}
                </Button>
              </div>

              {/* Resend Code */}
              <Button
                variant="link"
                onClick={async () => {
                  setIsLoading(true)
                  try {
                    const fullPhoneNumber = `${selectedCountryCode}${phoneNumber}`
                    
                    const response = await fetch('/api/sms/resend-code', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        phoneNumber: fullPhoneNumber
                      })
                    })

                    const result = await response.json()

                    if (!result.success) {
                      throw new Error(result.error || 'Failed to resend verification code')
                    }

                    // Update the verification state
                    const expiry = new Date().getTime() + (result.data.expiresIn * 1000)
                    setCodeExpiry(expiry)
                    setTimeRemaining(result.data.expiresIn)
                    
                    toast({
                      title: t("codeResent") || "Code Resent",
                      description: t("verificationCodeResent") || "Verification code resent successfully",
                    })
                  } catch (error) {
                    // console.error('Resend SMS error:', error)
                    toast({
                      title: t("error") || "Error",
                      description: error.message || t("failedToResendCode") || "Failed to resend verification code",
                      variant: "destructive",
                    })
                  } finally {
                    setIsLoading(false)
                  }
                }}
                disabled={isLoading || (timeRemaining > 240)} // Disable resend for first 60 seconds
                className="w-full text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("sendingCode") || "Sending Code..."}
                  </>
                ) : timeRemaining > 240 ? (
                  `${t("resendCodeIn") || "Resend code in"} ${formatTime(timeRemaining - 240)}`
                ) : (
                  t("resendCode") || "Resend Code"
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default PhoneVerificationPopup
