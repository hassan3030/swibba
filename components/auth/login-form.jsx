"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"

import { Eye, EyeOff, Loader2 , Mail , Lock, Target} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import { cn } from "@/lib/utils"
import { checkUserHasProducts, login, loginByGoogle } from "@/callAPI/users"
import { FaGoogle } from "react-icons/fa6";
import { getTarget, decodedToken, removeTarget } from "@/callAPI/utiles"
import { jwtDecode } from "jwt-decode"
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

const inputVariants = {
  focus: {
    scale: 1.02,
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    facebook: false,
  })
  const [formError, setFormError] = useState({
    email: "",
    password: "",
  })
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { t } = useTranslations()
  const { isRTL } = useLanguage()
  
  

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  })


  const validateForm = (data) => {
    let isValid = true
    const newErrors = {
      email: "",
      password: "",
    }

    if (!data.email) {
      newErrors.email = t("emailRequired") || "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = t("invalidEmail") || "Please enter a valid email address"
      isValid = false
    }

    if (!data.password) {
      newErrors.password = t("passwordRequired") || "Password is required"
      isValid = false
    }

    setFormError(newErrors)
    return isValid
  }

  useEffect(() => {
    if (!searchParams) {
      return
    }

    const token = searchParams.get("token")
    if (token) {
      try {
        const decoded = jwtDecode(token)
        const tokenEmail =
          decoded?.email ||
          decoded?.Email ||
          decoded?.user?.email ||
          decoded?.data?.email

        if (typeof tokenEmail === "string" && tokenEmail.includes("@")) {
          setValue("email", tokenEmail, { shouldValidate: true, shouldDirty: false })
        }

        if (!token && !tokenEmail) {
          toast({
            title: t("fillData") || "Fill Data",
            description: t("fillDataLogin") || "Please enter your email address and password to login",
            variant: "default",
          })
        }
        
      } catch (error) {
        console.error("Failed to decode login token:", error)
      }
    }


   
  }, [searchParams])


  const onSubmit = async (data) => {
    // console.log("data on submit in login ", data)

    if (!validateForm(data)) return
    setIsLoading(true)
    const getTargetSwap = await getTarget()

    try {
      const response = await login(data.email, data.password)
      // console.log('loginloginloginloginloginloginlogin',response)
      if (response.success) {
        toast({
          title: t("loginSuccessful") || "Login successful!",
          description: t("welcomeBack") || "Welcome back to Swibba!",
        })

        // Check target if found
        if (getTargetSwap) {
          const decoded = await decodedToken()
          if (!decoded?.id) {
            router.push("/")
            return
          }

          // Check if user has products
          const productRes = await checkUserHasProducts(decoded.id)

          // If no products, go to add item page
          if (productRes.count === 0 || !productRes.data || productRes.data.length === 0) {
            toast({
              title: t("addItem") || "Add Item",
              description: t("addItemToMakeSwapSesc") || "Please add new product to make swap with it",
              variant: "default",
            })
            router.push(`/profile/settings/editItem/new`)
            router.refresh()

          } else {
            // Has products: go to swap page
            router.push(`/swap/${getTargetSwap}`)
            await removeTarget()
          router.refresh()
          }
        } else {
          // No target: go to home
          router.push("/")
          router.refresh()
        }
      } else {
        // Login failed - check for email verification error
        const errorMessage = response.error || response.message || ""
        const lowerErrorMessage = errorMessage.toLowerCase()
        
        // Check if error is related to email verification
        const isEmailUnverified = 
          lowerErrorMessage.includes("email not verified") ||
          lowerErrorMessage.includes("unverified") ||
          lowerErrorMessage.includes("verify your email") ||
          lowerErrorMessage.includes("email verification") ||
          lowerErrorMessage.includes("verification required") ||
          lowerErrorMessage.includes("please verify")

        if (isEmailUnverified) {
          toast({
            title: t("emailUnverified") || "Email not verified",
            description: t("pleaseVerifyEmail") || "Please verify your email address before logging in. Check your inbox for the verification link.",
            variant: "destructive",
          })
        } else {
          toast({
            title: t("loginFailed") || "Login failed",
            description: t(errorMessage) || t("invalidCredentials") || "Invalid email or password. Please try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || ""
      const lowerErrorMessage = errorMessage.toLowerCase()
      
      // Check if error is related to email verification
      const isEmailUnverified = 
        lowerErrorMessage.includes("email not verified") ||
        lowerErrorMessage.includes("unverified") ||
        lowerErrorMessage.includes("verify your email") ||
        lowerErrorMessage.includes("email verification") ||
        lowerErrorMessage.includes("verification required") ||
        lowerErrorMessage.includes("please verify")

      if (isEmailUnverified) {
        toast({
          title: t("emailUnverified") || "Email not verified",
          description: t("pleaseVerifyEmail") || "Please verify your email address before logging in. Check your inbox for the verification link.",
          variant: "destructive",
        })
      } else {
        toast({
          title: t("loginFailed") || "Login failed",
          description: errorMessage || t("invalidCredentials") || "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      }
      // console.error("Login error:", error)
    } finally {
      setIsLoading(false)

    }
  }
// login by google 
  const handleLoginByGoogle = async ()=>{


  }

  return (
    <motion.div className="w-full" variants={containerVariants} initial="hidden" animate="visible">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div className="space-y-2" variants={itemVariants}>
          <label htmlFor="email" className="text-sm font-medium text-primary/90">
           <Mail className="h-4 w-4  inline-block mx-1" />
            {t("email") || "Email"}
          </label>
          <motion.div variants={inputVariants} animate={isFocused.email ? "focus" : ""} transition={{ duration: 0.2 }}>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder") || "you@example.com"}
              className={isRTL ? "text-right" : ""}
              {...register("email")}
              onFocus={() => setIsFocused((prev) => ({ ...prev, email: true }))}
              onBlur={() => setIsFocused((prev) => ({ ...prev, email: false }))}
            />
          </motion.div>
          <AnimatePresence>
            {formError.email && (
              <motion.p
                className="text-sm text-red-500"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {formError.email}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div className="space-y-2" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-primary/90">
                <Lock className="h-4 w-4 inline-block mx-1" />
              {t("password") || "Password"}
            </label>
            <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
              {t("forgotPassword") || "Forgot password?"}
            </Link>
          </div>
          <motion.div
            className="relative"
            variants={inputVariants}
            animate={isFocused.password ? "focus" : ""}
            transition={{ duration: 0.2 }}
          >
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`pr-10 ${isRTL ? "text-right" : ""}`}
              {...register("password")}
              onFocus={() => setIsFocused((prev) => ({ ...prev, password: true }))}
              onBlur={() => setIsFocused((prev) => ({ ...prev, password: false }))}
            />
            <motion.div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground "
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">
                  {showPassword ? t("hidePassword") || "Hide password" : t("showPassword") || "Show password"}
                </span>
              </Button>
            </motion.div>
          </motion.div>
          <AnimatePresence>
            {formError.password && (
              <motion.p
                className="text-sm text-red-500"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {formError.password}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div className="flex items-center space-x-2" variants={itemVariants}>
          <Checkbox id="rememberMe" {...register("rememberMe")} className="mx-1" />
          <label htmlFor="rememberMe" className="text-sm font-normal mx-1">
            {t("rememberMe") || "Remember me for 30 days"}
          </label>
        </motion.div>

        <motion.div className="flex flex-col gap-4" variants={itemVariants}>
          <motion.div variants={buttonVariants} className="flex flex-row gap-4">
         

            <Button
              type="submit"
               whileHover="hover" whileTap="tap"
              className={cn("w-full bg-primary text-primary-foreground hover:bg-primary/90")}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("signingIn") || "Signing in..."}
                </>
              ) : (
                t("signIn") || "Sign In"
              )}
            </Button>


{/* 
            <Button
             whileHover="hover" whileTap="tap" 
              // type="submit"
              className={cn("w-full bg-primary text-primary-foreground hover:bg-primary/90")}
              disabled={isLoading}
              onClick={()=>{handleLoginByGoogle()}}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <FaGoogle  className="w-5 h-5"/>
              )}
            </Button> */}
          </motion.div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <span className="relative bg-background px-2 text-xs text-muted-foreground">
              {t("orContinueWith") || "Or continue with"}
            </span>
          </div>

          <motion.div className="text-center text-sm" variants={itemVariants}>
            {t("noAccount") || "Don't have an account?"}{" "}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              {t("signUp") || "Sign up"}
            </Link>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  )
}
