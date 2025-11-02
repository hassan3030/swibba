
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Loader2, CheckCircle, AlertTriangle, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { cn } from "@/lib/utils"
import { resetPassword } from "@/callAPI/users"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.02,
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
}

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState({ type: "", message: "" })
  const [token, setToken] = useState(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslations()
  const { isRTL } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const watchPassword = watch("password", "")

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) return 0
    
    let strength = 0
    
    // Length check
    if (password.length >= 8) strength += 20
    if (password.length >= 12) strength += 10
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 20 // Has uppercase
    if (/[a-z]/.test(password)) strength += 15 // Has lowercase
    if (/[0-9]/.test(password)) strength += 15 // Has number
    if (/[^A-Za-z0-9]/.test(password)) strength += 20 // Has special char
    
    return Math.min(100, strength)
  }

  // Get strength text and color
  const getStrengthDetails = (strength) => {
    if (strength === 0) return { text: t("passwordStrengthNone") || "None", color: "bg-gray-300" }
    if (strength < 40) return { text: t("passwordStrengthWeak") || "Weak", color: "bg-red-500" }
    if (strength < 70) return { text: t("passwordStrengthMedium") || "Medium", color: "bg-yellow-500" }
    return { text: t("passwordStrengthStrong") || "Strong", color: "bg-green-500" }
  }

  // Update password strength when password changes
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value
    setPasswordStrength(calculatePasswordStrength(newPassword))
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    setFeedback({ type: "", message: "" })

    if (!token) {
      setFeedback({
        type: "error",
        message: t("resetTokenMissing") || "Password reset token is missing.",
      })
      setIsLoading(false)
      return
    }

    // Check password strength
    const strength = calculatePasswordStrength(data.password)
    if (strength < 70) {
      setFeedback({
        type: "error",
        message: t("passwordTooWeak") || "Password is too weak. Please choose a stronger password.",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await resetPassword(data.password, token)
      if (response.success) {
        setFeedback({
          type: "success",
          message: t("passwordResetSuccess") || "Your password has been reset successfully.",
        })
        toast({
          title: t("passwordResetSuccessTitle") || "Success",
          description: t("passwordResetSuccess"),
        })
        router.push("/auth/login")
      } else {
        setFeedback({
          type: "error",
          message: response.error || t("passwordResetFailed") || "Failed to reset password.",
        })
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message: t("passwordResetFailed") || "Failed to reset password.",
      })
      console.error("Reset password error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        className="w-full max-w-md space-y-6 rounded-2xl bg-card p-8 shadow-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center" variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("resetPasswordTitle") || "Reset Your Password"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("resetPasswordDesc") || "Enter your new password below."}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div className="space-y-2" variants={itemVariants}>
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              <Lock className="mr-2 inline-block h-4 w-4 text-primary" />
              {t("newPassword") || "New Password"}
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("newPasswordPlaceholder") || "********"}
                className={cn(isRTL ? "text-right" : "", errors.password && "border-destructive")}
                {...register("password", {
                  required: t("passwordRequired") || "Password is required",
                  minLength: {
                    value: 8,
                    message: t("passwordMinLength") || "Password must be at least 8 characters",
                  },
                  onChange: handlePasswordChange
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.p
                  className="text-sm text-destructive"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
            
            {/* Password strength meter */}
             {watchPassword && (
               <div className="space-y-1">
                 <div className="flex items-center justify-between">
                   <span className="text-xs text-muted-foreground">
                     {t("passwordStrength") || "Password Strength"}:
                   </span>
                   <span className="text-xs font-medium">
                     {getStrengthDetails(passwordStrength).text} ({passwordStrength}%)
                   </span>
                 </div>
                 <Progress 
                   value={passwordStrength} 
                   className={cn("h-1", getStrengthDetails(passwordStrength).color)} 
                 />
                 
                 {/* Password requirements */}
                 <div className="mt-2 space-y-1">
                   <ul className="text-xs text-muted-foreground">
                     <li className={cn(watchPassword.length >= 8 ? "text-green-500" : "")}>
                       • {t("passwordReqLength") || "Be at least 8 characters long"}
                     </li>
                     <li className={cn(/[A-Z]/.test(watchPassword) ? "text-green-500" : "")}>
                       • {t("passwordReqUppercase") || "Include at least one uppercase letter"}
                     </li>
                     <li className={cn(/[a-z]/.test(watchPassword) ? "text-green-500" : "")}>
                       • {t("passwordReqLowercase") || "Include at least one lowercase letter"}
                     </li>
                     <li className={cn(/[0-9]/.test(watchPassword) ? "text-green-500" : "")}>
                       • {t("passwordReqNumber") || "Include at least one number"}
                     </li>
                     <li className={cn(/[^A-Za-z0-9]/.test(watchPassword) ? "text-green-500" : "")}>
                       • {t("passwordReqSpecial") || "Include at least one special character"}
                     </li>
                   </ul>
                 </div>
               </div>
             )}
          </motion.div>

          <motion.div className="space-y-2" variants={itemVariants}>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-foreground"
            >
              <Lock className="mr-2 inline-block h-4 w-4 text-primary" />
              {t("confirmNewPassword") || "Confirm New Password"}
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("confirmNewPasswordPlaceholder") || "********"}
                className={cn(isRTL ? "text-right" : "", errors.confirmPassword && "border-destructive")}
                {...register("confirmPassword", {
                  required: t("confirmPasswordRequired") || "Please confirm your password",
                  validate: (value) =>
                    value === watchPassword || (t("passwordsDoNotMatch") || "Passwords do not match"),
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <AnimatePresence>
              {errors.confirmPassword && (
                <motion.p
                  className="text-sm text-destructive"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {feedback.message && (
              <motion.div
                className={cn(
                  "flex items-center space-x-3 rounded-lg p-3 text-sm",
                  feedback.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                  isRTL ? "space-x-reverse" : ""
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {feedback.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
                <p>{feedback.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants}>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("resettingPassword") || "Resetting Password..."}
                  </>
                ) : (
                  t("resetPassword") || "Reset Password"
                )}
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  )
}

export default ResetPasswordPage
