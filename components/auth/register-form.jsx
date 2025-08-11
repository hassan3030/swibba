"use client"

import { useState } from "react" 
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
import { decodedToken, getCookie } from "@/callAPI/utiles"

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

  const formSchema = z
    .object({
      userName: z
        .string()
        .min(2, t("Namemustbeatleast2characters") || "Name must be at least 2 characters")
        .max(26, t("Namemustbelessthan50characters") || "Name must be less than 50 characters"),
      email: z.string().email(t("Pleaseenteravalidemailaddress") || "Please enter a valid email address"),
      password: z
        .string()
        .min(8, t("Passwordmustbeatleast8characters") || "Password must be at least 8 characters")
        .regex(
          /[A-Z]/,
          t("Passwordmustcontainatleastoneuppercaseletter") || "Password must contain at least one uppercase letter",
        )
        .regex(
          /[a-z]/,
          t("Passwordmustcontainatleastonelowercaseletter") || "Password must contain at least one lowercase letter",
        )
        .regex(/[0-9]/, t("Passwordmustcontainatleastonenumber") || "Password must contain at least one number"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("Passwordsdonotmatch") || "Passwords do not match",
      path: ["confirmPassword"],
    })

  const form = useForm({
    resolver: zodResolver(formSchema),
     defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async () => {
    setIsLoading(true)

    try {
      if (!form.getValues().email || !form.getValues().password  || !form.getValues().confirmPassword || !form.getValues().userName) {
        toast({
          title: t("error") || "ERROR",
          description: t("pleasefilldata") || "please fill data",
          variant: "destructive",
        })
      } else {
        const response = await register(form.getValues().email, form.getValues().password, form.getValues().userName)

        if (!response) {
          toast({
            title: t("successfully") || "Successfully",
            description:
              t("YouraccounthasbeencreatedWelcometoDeelDeal") || "Your account has been created. Welcome to DeelDeal!",
          })
          router.push(`/profile/settings/editItem/new`)
        } else {
          toast({
            title: t("error") || "ERROR",
            description:
              t("TherewasaproblemcreatingyouraccountPleasetryagain") ||
              "There was a problem creating your account. Please try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: t("error") || "ERROR",
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
                  <FormLabel className="flex items-center gap-2">
                    <motion.div variants={iconVariants}>
                      <UserPlus className="h-4 w-4 text-[#f2b230]" />
                    </motion.div>
                    {t("firstName") || "First Name"}
                  </FormLabel>
                  <FormControl>
                    <motion.div variants={inputVariants} whileFocus="focus">
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className="transition-all duration-200 focus:ring-2 focus:ring-[#f2b230]/20 border-gray-200 focus:border-[#f2b230]"
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
                  <FormLabel className="flex items-center gap-2">
                    <motion.div variants={iconVariants}>
                      <Mail className="h-4 w-4 text-[#f2b230]" />
                    </motion.div>
                    {t("email") || "Email"}
                  </FormLabel>
                  <FormControl>
                    <motion.div variants={inputVariants} whileFocus="focus">
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        className="transition-all duration-200 focus:ring-2 focus:ring-[#f2b230]/20 border-gray-200 focus:border-[#f2b230]"
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
                  <FormLabel className="flex items-center gap-2">
                    <motion.div variants={iconVariants}>
                      <Lock className="h-4 w-4 text-[#f2b230]" />
                    </motion.div>
                    {t("password") || "Password"}
                  </FormLabel>
                  <FormControl>
                    <motion.div variants={inputVariants} whileFocus="focus" className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-[#f2b230]/20 border-gray-200 focus:border-[#f2b230]"
                      />
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-0 top-0"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-full px-3 py-2 text-muted-foreground hover:text-[#f2b230]"
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
                    </motion.div>
                  </FormControl>
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
                  <FormLabel className="flex items-center gap-2">
                    <motion.div variants={iconVariants}>
                      <CheckCircle className="h-4 w-4 text-[#f2b230]" />
                    </motion.div>
                    {t("ConfirmPassword") || "Confirm Password"}
                  </FormLabel>
                  <FormControl>
                    <motion.div variants={inputVariants} whileFocus="focus" className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-[#f2b230]/20 border-gray-200 focus:border-[#f2b230]"
                      />
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-0 top-0"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-full px-3 py-2 text-muted-foreground hover:text-[#f2b230]"
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
                    </motion.div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div className="flex flex-col gap-4" variants={itemVariants}>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                type="submit"
                className="w-full bg-[#f2b230] hover:bg-[#eeb74a] text-white font-semibold py-6 text-lg"
                onClick={onSubmit}
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
                <Link href="/auth/login" className="font-medium text-[#f2b230] hover:underline transition-colors mx-1">
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
