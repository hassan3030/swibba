"use client"

import { useState, useEffect, useCallback, useMemo } from "react" 
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Loader2, UserPlus, Mail, Lock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"
import { register } from "@/callAPI/users"
import { Progress } from "@/components/ui/progress"


// Animation variants
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
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.02,
    boxShadow: "0 4px 12px rgba(73, 197, 182, 0.3)",
  },
  tap: { scale: 0.98 },
}

const inputVariants = {
  focus: {
    scale: 1.02,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
}

const iconVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
}

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslations()

  // Memoize form schema to prevent recreation on every render
  const formSchema = useMemo(
    () =>
      z
        .object({
          userName: z
            .string()
            .trim()
            .min(2, t("Namemustbeatleast2characters") || "Name must be at least 2 characters")
            .max(50, t("Namemustbelessthan50characters") || "Name must be less than 50 characters")
            .regex(
              /^[a-zA-Z\s'-]+$/,
              t("Namecanonlycontainlettersspacesandhyphens") || "Name can only contain letters, spaces, apostrophes and hyphens"
            ),
          email: z
            .string()
            .trim()
            .toLowerCase()
            .email(t("Pleaseenteravalidemailaddress") || "Please enter a valid email address")
            .max(254, t("Emailistoolong") || "Email is too long"),
          password: z
            .string()
            .min(8, t("Passwordmustbeatleast8characters") || "Password must be at least 8 characters")
            .max(128, t("Passwordistoolong") || "Password is too long")
            .regex(
              /[A-Z]/,
              t("Passwordmustcontainatleastoneuppercaseletter") || "Password must contain at least one uppercase letter"
            )
            .regex(
              /[a-z]/,
              t("Passwordmustcontainatleastonelowercaseletter") || "Password must contain at least one lowercase letter"
            )
            .regex(
              /[0-9]/,
              t("Passwordmustcontainatleastonenumber") || "Password must contain at least one number"
            )
            .regex(
              /[^A-Za-z0-9]/,
              t("Passwordmustcontainatleastonespecialcharacter") || "Password must contain at least one special character"
            ),
          confirmPassword: z.string().min(1, t("Pleaseconfirmyourpassword") || "Please confirm your password"),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t("Passwordsdonotmatch") || "Passwords do not match",
          path: ["confirmPassword"],
        }),
    [t]
  )

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onBlur", // Validate on blur for better UX
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // Calculate password strength - memoized for performance
  const calculatePasswordStrength = useCallback((password) => {
    if (!password) return 0
    
    let strength = 0
    
    // Length checks
    if (password.length >= 8) strength += 15
    if (password.length >= 12) strength += 15
    if (password.length >= 16) strength += 10
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 15 // Has uppercase
    if (/[a-z]/.test(password)) strength += 15 // Has lowercase
    if (/[0-9]/.test(password)) strength += 15 // Has number
    if (/[^A-Za-z0-9]/.test(password)) strength += 15 // Has special char
    
    return Math.min(100, strength) 
  }, [])

  // Get strength text and color - memoized for performance
  const getStrengthDetails = useCallback(
    (strength) => {
      if (strength === 0) return { text: t("passwordStrengthNone") || "None", color: "bg-gray-300" }
      if (strength < 50) return { text: t("passwordStrengthWeak") || "Weak", color: "bg-red-500" }
      if (strength < 75) return { text: t("passwordStrengthMedium") || "Medium", color: "bg-yellow-500" }
      return { text: t("passwordStrengthStrong") || "Strong", color: "bg-green-500" }
    },
    [t]
  )

  // Watch password field for strength calculation
  const watchPassword = form.watch("password", "")
  
  // Calculate password strength in real-time
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(watchPassword),
    [watchPassword, calculatePasswordStrength]
  )
  
  const strengthDetails = useMemo(
    () => getStrengthDetails(passwordStrength),
    [passwordStrength, getStrengthDetails]
  )


  const onSubmit = async (data) => {
    // Form is already validated by Zod schema, no need for manual checks
    setIsLoading(true)

    try {
      // Trim and sanitize data
      const sanitizedData = {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        userName: data.userName.trim(),
      }

      const response = await register(
        sanitizedData.email,
        sanitizedData.password,
        sanitizedData.userName
      )

      if (response?.success) {
        toast({
          title: t("successfully") || "Success",
          description:
            t("RegistrationSuccessfulPleaseCheckYourEmail") ||
            "Registration successful! Please check your email to verify your account.",
        })
        
        // Clear form for security
        form.reset()
        
        // Redirect to login with message
        router.push("/auth/login?message=verify-email")
      } else {
        // Handle specific error cases
        const errorMessage = response?.error || 
          t("TherewasaproblemcreatingyouraccountPleasetryagain") ||
          "There was a problem creating your account. Please try again."
        
        toast({
          title: t("error") || "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      
      toast({
        title: t("error") || "Error",
        description:
          t("TherewasaproblemcreatingyouraccountPleasetryagain") ||
          "There was a problem creating your account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }




  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-primary/90">
                    <motion.div variants={iconVariants}>
                      <UserPlus className="h-4 w-4 " />
                    </motion.div>
                    {t("firstName") || "First Name"}
                  </FormLabel>
                  <FormControl>
                    <motion.div variants={inputVariants} whileFocus="focus">
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-gray-200 focus:border-primary"
                      />
                    </motion.div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-primary/90">
                    <motion.div variants={iconVariants}>
                      <Mail className="h-4 w-4 " />
                    </motion.div>
                    {t("email") || "Email"}
                  </FormLabel>
                  <FormControl>
                    <motion.div variants={inputVariants} whileFocus="focus">
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-gray-200 focus:border-primary"
                      />
                    </motion.div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-primary/90">
                    <motion.div variants={iconVariants}>
                      <Lock className="h-4 w-4 " />
                    </motion.div>
                    {t("password") || "Password"}
                  </FormLabel>
                  <FormControl>
                    <motion.div variants={inputVariants} whileFocus="focus" className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-gray-200 focus:border-primary"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 h-auto px-3 py-2 text-muted-foreground hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <AnimatePresence mode="wait">
                          {showPassword ? (
                            <motion.div
                              key="hide"
                              initial={{ opacity: 0, rotate: -90 }}
                              animate={{ opacity: 1, rotate: 0 }}
                              exit={{ opacity: 0, rotate: 90 }}
                              transition={{ duration: 0.2 }}
                            >
                              <EyeOff className="h-4 w-4" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="show"
                              initial={{ opacity: 0, rotate: -90 }}
                              animate={{ opacity: 1, rotate: 0 }}
                              exit={{ opacity: 0, rotate: 90 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Eye className="h-4 w-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <span className="sr-only">
                          {showPassword ? t("Hidepassword") || "Hide password" : t("Showpassword") || "Show password"}
                        </span>
                      </Button>
                    </motion.div>
                  </FormControl>
                  
                  {/* Password strength meter */}
                  {watchPassword && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {t("passwordStrength") || "Password Strength"}:
                        </span>
                        <span className="text-xs font-medium">
                          {strengthDetails.text} ({passwordStrength}%)
                        </span>
                      </div>
                      <Progress 
                        value={passwordStrength} 
                        className={`h-1 ${strengthDetails.color}`} 
                      />
                      
                      {/* Password requirements */}
                      <div className="mt-2 space-y-1">
                        <ul className="text-xs text-muted-foreground">
                          <li className={watchPassword.length >= 8 ? "text-green-500" : ""}>
                            • {t("passwordReqLength") || "Be at least 8 characters long"}
                          </li>
                          <li className={/[A-Z]/.test(watchPassword) ? "text-green-500" : ""}>
                            • {t("passwordReqUppercase") || "Include at least one uppercase letter"}
                          </li>
                          <li className={/[a-z]/.test(watchPassword) ? "text-green-500" : ""}>
                            • {t("passwordReqLowercase") || "Include at least one lowercase letter"}
                          </li>
                          <li className={/[0-9]/.test(watchPassword) ? "text-green-500" : ""}>
                            • {t("passwordReqNumber") || "Include at least one number"}
                          </li>
                          <li className={/[^A-Za-z0-9]/.test(watchPassword) ? "text-green-500" : ""}>
                            • {t("passwordReqSpecial") || "Include at least one special character"}
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                  
                  <FormDescription className="text-xs">
                    {t("Passwordmustbeatleast8charactersandincludeuppercaselowercaseandnumbers") ||
                      "Password must be at least 8 characters and include uppercase, lowercase, and numbers."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-primary/90">
                    <motion.div variants={iconVariants}>
                      <CheckCircle className="h-4 w-4 " />
                    </motion.div>
                    {t("ConfirmPassword") || "Confirm Password"}
                  </FormLabel>
                  <FormControl>
                    <motion.div variants={inputVariants} whileFocus="focus" className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-gray-200 focus:border-primary"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 h-auto px-3 py-2 text-muted-foreground hover:text-white"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <AnimatePresence mode="wait">
                          {showConfirmPassword ? (
                            <motion.div
                              key="hide"
                              initial={{ opacity: 0, rotate: -90 }}
                              animate={{ opacity: 1, rotate: 0 }}
                              exit={{ opacity: 0, rotate: 90 }}
                              transition={{ duration: 0.2 }}
                            >
                              <EyeOff className="h-4 w-4" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="show"
                              initial={{ opacity: 0, rotate: -90 }}
                              animate={{ opacity: 1, rotate: 0 }}
                              exit={{ opacity: 0, rotate: 90 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Eye className="h-4 w-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <span className="sr-only">
                          {showConfirmPassword
                            ? t("Hidepassword") || "Hide password"
                            : t("Showpassword") || "Show password"}
                        </span>
                      </Button>
                    </motion.div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div className="flex flex-col gap-4" variants={itemVariants}>
            <motion.div variants={buttonVariants}>
              <Button
                whileHover="hover" 
                whileTap="tap"
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg"
                disabled={isLoading}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="mr-2"
                      >
                        <Loader2 className="h-4 w-4" />
                      </motion.div>
                      {t("CreatingAccount") || "Creating Account..."}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="create"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <UserPlus className="mr-2 h-4 w-4 mx-1" />
                      {t("CreateAccount") || "Create Account"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            <motion.div
              className="text-center text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {t("Alreadyhaveanaccount") || "Already have an account?"}{" "}
              <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                <Link href="/auth/login" className="font-medium text-primary hover:underline transition-colors mx-1">
                  {t("Signin") || "Sign in"}
                </Link>
              </motion.span>
            </motion.div>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  )
}
