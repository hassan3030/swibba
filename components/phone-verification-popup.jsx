"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Phone, Shield, Check, X, AlertCircle } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"
import { useToast } from "@/components/ui/use-toast"
import { countriesWithFlags, validatePhoneNumber } from "@/lib/countries-data"
import FlagIcon from "./flag-icon"

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

  // Generate random verification code (in real app, this would be sent via SMS)
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

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
    
    // Simulate API call
    setTimeout(() => {
      const code = generateVerificationCode()
      const expiry = new Date().getTime() + (5 * 60 * 1000) // 5 minutes from now
      
      setSentCode(code)
      setCodeExpiry(expiry)
      setTimeRemaining(300) // 5 minutes in seconds
      setStep("verify")
      setIsLoading(false)
      
      toast({
        title: t("codeSent") || "Code Sent",
        description: `${t("verificationCodeSent") || "Verification code sent to"} ${selectedCountryCode}${phoneNumber}`,
      })
    }, 2000)
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

    if (verificationCode !== sentCode) {
      toast({
        title: t("error") || "Error",
        description: t("invalidCode") || "Invalid verification code",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    
    // Simulate verification
    setTimeout(() => {
      setIsVerifying(false)
      onVerified(`${selectedCountryCode}${phoneNumber}`)
      onOpenChange(false)
      
      toast({
        title: t("success") || "Success",
        description: t("phoneVerified") || "Phone number verified successfully!",
      })
      
      // Reset form
      setStep("phone")
      setVerificationCode("")
      setSentCode("")
    }, 1500)
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
          <DialogTitle className="flex items-center gap-2">
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
                    {countriesWithFlags.map((country) => (
                      <SelectItem key={`${country.code}-${country.name}`} value={country.code}>
                        <div className="flex items-center gap-2">
                          <FlagIcon flag={country.flag} countryCode={country.iso} className="text-lg" />
                          <span className="font-mono">{country.code}</span>
                          <span className="text-sm">{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number Input */}
              <div className="space-y-2">
                <Label>{t("phoneNumber") || "Phone Number"}</Label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted min-w-0">
                    <FlagIcon flag={selectedCountry.flag} countryCode={selectedCountry.iso} className="text-lg" />
                    <span className="font-mono text-sm">{selectedCountryCode}</span>
                  </div>
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

              {/* Verification Code Display */}
              {sentCode && timeRemaining > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-primary/10 border border-primary/20 rounded-lg"
                >
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("yourVerificationCode") || "Your verification code is"}:
                    </p>
                    <div className="text-2xl font-mono font-bold text-primary tracking-widest">
                      {sentCode}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t("enterCodeBelow") || "Enter this code in the field below"}
                    </p>
                  </div>
                </motion.div>
              )}

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
                onClick={sendVerificationCode}
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
