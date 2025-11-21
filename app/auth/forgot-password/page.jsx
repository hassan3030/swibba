"use client"

import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Loader2, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { cn } from "@/lib/utils"
import { forgotPassword } from "@/callAPI/users"
import { AnimatedBackground } from "@/components/auth/animated-background"

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

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState({ type: "", message: "" })
  const { toast } = useToast()
  const { t } = useTranslations()
  const { isRTL } = useLanguage()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setFeedback({ type: "", message: "" }) 
    // console.log("on submit data", data.email)

    try {
      const email = data.email.trim()
      const response = await forgotPassword(email)
      // console.log("on submit response", response)
      if (response.success) {
        setFeedback({
          type: "success",
          message: t("passwordResetSuccess") || "If an account with that email exists, a password reset link has been sent.",
        })
        toast({
          title: t("checkYourEmail") || "Check Your Email",
          description: t("passwordResetSuccess"),
        })
      } else {
        // Use a generic message to prevent email enumeration
        setFeedback({
          type: "success", // Still show success to prevent checking if an email exists
          message: t("passwordResetSuccess") || "If an account with that email exists, a password reset link has been sent.",
        })
        // console.error("Forgot password error (API):", response.error)
      }
    } catch (error) {
      setFeedback({
        type: "success", // Still show success
        message: t("passwordResetSuccess") || "If an account with that email exists, a password reset link has been sent.",
      })
      // console.error("Forgot password error (Catch):", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Form (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-16 relative z-10 bg-background dark:bg-gray-950">
        {/* Back to Home - Top Left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-6 left-6"
        >
          <Link 
            href="/" 
            className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </motion.div>

        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 mt-16"
          >
            <h2 className="text-3xl font-bold mb-2">
              {t("forgotPasswordTitle") || "Forgot Your Password?"}
            </h2>
            <p className="text-muted-foreground">
              {t("forgotPasswordDesc") || "No worries! Enter your email and we'll send you a reset link."}
            </p>
          </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div className="space-y-2" variants={itemVariants}>
            <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center">
              <Mail className="ltr:mr-2 rtl:ml-2 h-4 w-4 text-primary" />
              {t("email") || "Email"}
            </label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder") || "you@example.com"}
              className={cn(isRTL ? "text-right" : "", errors.email && "border-destructive")}
              {...register("email", {
                required: t("emailRequired") || "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: t("invalidEmail") || "Please enter a valid email address",
                },
              })}
            />
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  className="text-sm text-destructive"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {errors.email.message}
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
                <p>{t(feedback.message)}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants}>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("sendingLink") || "Sending Link..."}
                  </>
                ) : (
                  t("sendResetLink") || "Send Reset Link"
                )}
              </Button>
            </motion.div>
          </motion.div>
        </form>

        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link 
            href="/auth/login" 
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            {t("backToLogin") || "Back to Login"}
          </Link>
        </motion.div>
        </div>
      </div>

      {/* Right Side - Animated Background (60%) */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        <AnimatedBackground />
        
        {/* Logo in Top Corner */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-8 ltr:right-8 rtl:left-8 z-10"
        >
          <Link href="/" className="inline-block">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
              <img 
                src="/logo.png" 
                alt="Swibba Logo" 
                className="h-10 w-auto"
              />
            </div>
          </Link>
        </motion.div>
        
        {/* Slogan at Bottom */}
        <div className="absolute bottom-12 left-0 right-0 z-10 px-12">
          <div className="text-center mx-auto bg-slate-300/20 rounded-lg p-2">
            <h2 className="text-3xl font-bold drop-shadow-2xl dark:text-white">
              {t("swibbaSlogan") || "Swap. Trade. Connect."}
            </h2>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage