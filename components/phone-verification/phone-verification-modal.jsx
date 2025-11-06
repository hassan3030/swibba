"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTranslations } from "@/lib/use-translations"
import { useToast } from "@/components/ui/use-toast"
import PhoneInput from "./phone-input"
import OtpInput from "./otp-input"
import { requestVerification, verifyOtp, resendOtp } from "./phone-verification-service"


const PhoneVerificationModal = ({ 
  open, 
  onOpenChange, 
  currentPhone = "", 
  onVerified, 
  isVerified = false 
}) => {
  const { t } = useTranslations()
  const { toast } = useToast()
  
  const [step, setStep] = useState("phone")
  
  const [selectedCountryCode, setSelectedCountryCode] = useState("+20")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [fullPhoneNumber, setFullPhoneNumber] = useState("")
  
  const [otp, setOtp] = useState("")
  const [otpExpiry, setOtpExpiry] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [canResendAfter, setCanResendAfter] = useState(0)
  
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentPhone) {
      const phoneMatch = currentPhone.match(/^(\+\d+)(.*)$/)
      if (phoneMatch) {
        setSelectedCountryCode(phoneMatch[1])
        setPhoneNumber(phoneMatch[2])
      } else {
        setPhoneNumber(currentPhone)
      }
    }
  }, [currentPhone])

  useEffect(() => {
    let interval
    if (step === "otp" && (timeRemaining > 0 || canResendAfter > 0)) {
      interval = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1))
        setCanResendAfter(prev => Math.max(0, prev - 1))
        
        if (timeRemaining === 1) {
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
  }, [step, timeRemaining, canResendAfter, t, toast])


  const handleSendVerificationCode = async (countryCode, phone) => {
    setIsLoading(true)
    
    try {
      const fullPhone = `${countryCode}${phone}`
      setFullPhoneNumber(fullPhone)
      
      const result = await requestVerification(fullPhone, countryCode)

      if (result.success) {
   
        setTimeRemaining(result.data.expires_in || 600) // Default 10 minutes
        setCanResendAfter(result.data.can_resend_after || 60) // Default 60 seconds
        setStep("otp")
        
        toast({
          title: t("codeSent") || "Code Sent",
          description: `${t("verificationCodeSent") || "Verification code sent to"} ${fullPhone}`,
        })
      } else {
        throw new Error(result.message || "Failed to send verification code")
      }
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: error.message || t("failedToSendCode") || "Failed to send verification code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  const handleVerifyOtp = async (otpCode) => {
    setIsLoading(true)
    
    try {
      const result = await verifyOtp(fullPhoneNumber, otpCode)

      if (result.success) {
        toast({
          title: t("success") || "Success",
          description: t("phoneVerified") || "Phone number verified successfully!",
        })
        
        onVerified(result.data.verified_phone || fullPhoneNumber)
        
        onOpenChange(false)
        resetForm()
      } else {
        throw new Error(result.message || "Failed to verify code")
      }
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: error.message || t("verificationFailed") || "Verification failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  const handleResendOtp = async () => {
    if (canResendAfter > 0) {
      toast({
        title: t("pleaseWait") || "Please Wait",
        description: `${t("youCanResendCodeIn") || "You can resend code in"} ${canResendAfter} ${t("seconds") || "seconds"}`,
        variant: "default",
      })
      return
    }

    setIsLoading(true)
    
    try {
      const result = await resendOtp(fullPhoneNumber)

      if (result.success) {
        setTimeRemaining(result.data.expires_in || 600)
        setCanResendAfter(result.data.can_resend_after || 60)
        setOtp("") // Clear OTP input
        
        toast({
          title: t("codeResent") || "Code Resent",
          description: t("verificationCodeResent") || "Verification code resent successfully",
        })
      } else {
        throw new Error(result.message || "Failed to resend verification code")
      }
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: error.message || t("failedToResendCode") || "Failed to resend verification code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  
  const resetForm = () => {
    setStep("phone")
    setOtp("")
    setTimeRemaining(0)
    setCanResendAfter(0)
    setFullPhoneNumber("")
    
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

 
  const handleBack = () => {
    setStep("phone")
    setOtp("")
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
        if (!isOpen) resetForm()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 mt-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🛡️
            </motion.div>
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
              transition={{ duration: 0.3 }}
            >
              <PhoneInput
                countryCode={selectedCountryCode}
                phoneNumber={phoneNumber}
                onCountryCodeChange={setSelectedCountryCode}
                onPhoneNumberChange={setPhoneNumber}
                onSubmit={handleSendVerificationCode}
                isLoading={isLoading}
              />
            </motion.div>
          ) : (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OtpInput
                phoneNumber={fullPhoneNumber}
                countryCode={selectedCountryCode}
                otp={otp}
                onOtpChange={setOtp}
                onSubmit={handleVerifyOtp}
                onBack={handleBack}
                onResend={handleResendOtp}
                timeRemaining={timeRemaining}
                canResendAfter={canResendAfter}
                isLoading={isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default PhoneVerificationModal
