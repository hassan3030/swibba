"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Check, X, RefreshCw } from "lucide-react"
import { useTranslations } from "@/lib/use-translations"
import { countriesWithFlags } from "@/lib/countries-data"
import FlagIcon from "@/components/general/flag-icon"


const OtpInput = ({ 
  phoneNumber,
  countryCode,
  otp, 
  onOtpChange, 
  onSubmit,
  onBack,
  onResend,
  timeRemaining,
  canResendAfter,
  isLoading 
}) => {
  const { t } = useTranslations()

  const selectedCountry = countriesWithFlags.find(c => c.code === countryCode) || countriesWithFlags[0]

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = () => {
    if (otp.length === 4) {
      onSubmit(otp)
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">{t("codeSentTo") || "Code sent to"}:</p>
        <p className="font-medium flex items-center gap-2">
          <FlagIcon flag={selectedCountry.flag} countryCode={selectedCountry.iso} className="text-lg" />
          {phoneNumber}
        </p>
        {timeRemaining > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-muted-foreground">
              {t("codeExpiresIn") || "Code expires in"}:
            </span>
            <span className={`text-xs font-mono font-semibold ${
              timeRemaining < 60 
                ? 'text-destructive animate-pulse' 
                : timeRemaining < 120 
                  ? 'text-orange-600' 
                  : 'text-green-600'
            }`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
        {timeRemaining === 0 && (
          <div className="text-xs text-destructive mt-2">
            {t("codeHasExpired") || "Verification code has expired. Please request a new one."}
          </div>
        )}
      </div>

     
      <div className="space-y-2">
        <Label>{t("verificationCode") || "Verification Code"}</Label>
        <Input
          value={otp}
          onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="1234"
          className="text-center text-lg tracking-widest font-mono"
          maxLength={4}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && otp.length === 4) {
              handleSubmit()
            }
          }}
        />
        <p className="text-xs text-muted-foreground text-center">
          {t("enterThe4DigitCode") || "Enter the 4-digit code sent to your phone"}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1"
        >
          <X className="mr-2 h-4 w-4" />
          {t("back") || "Back"}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || otp.length !== 4 || timeRemaining === 0}
          className="flex-1"
        >
          {isLoading ? (
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

      
      <Button
        variant="link"
        onClick={onResend}
        disabled={isLoading || canResendAfter > 0}
        className="w-full text-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("sendingCode") || "Sending Code..."}
          </>
        ) : canResendAfter > 0 ? (
          `${t("resendCodeIn") || "Resend code in"} ${formatTime(canResendAfter)}`
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("resendCode") || "Resend Code"}
          </>
        )}
      </Button>
    </div>
  )
}

export default OtpInput
