"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, Loader2, Mail, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"
import { checkUeserEmailValid, register, login } from "@/callAPI/users"
import { getCookie } from "@/callAPI/utiles"
import { baseURL, STANDARD_ROLE_ID } from "@/callAPI/utiles"
import axios from "axios"
import Link from "next/link"

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

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(true)
  const [isCompletingRegistration, setIsCompletingRegistration] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"verifying" | "success" | "error" | "completing">("verifying")
  const [errorMessage, setErrorMessage] = useState("")
  const [userData, setUserData] = useState(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { t } = useTranslations()

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")
      const email = searchParams.get("email")
      const password = searchParams.get("password")
      const firstName = searchParams.get("first_name")
      const redirectTo = searchParams.get("redirect") || searchParams.get("redirect_to")

      if (!token) {
        setVerificationStatus("error")
        setErrorMessage(t("InvalidVerificationLink") || "Invalid verification link. Please check your email and try again.")
        setIsVerifying(false)
        return
      }

      try {
        // Check if email is verified
        const verificationResult = await checkUeserEmailValid(token)

        if (verificationResult.success && verificationResult.verified) {
          setUserData(verificationResult.data)
          setVerificationStatus("success")

          // Email is verified, now complete registration by activating user
          setVerificationStatus("completing")
          setIsCompletingRegistration(true)

          try {
            const userId = verificationResult.data.id
            const verificationToken = searchParams.get("token")
            
            // Activate the user and set role using the verification token
            // If no token available, try to get from cookie (for admin operations)
            let authToken = verificationToken
            if (!authToken) {
              authToken = await getCookie()
            }
            
            // Activate the user and set role
            const activateResponse = await axios.patch(
              `${baseURL}users/${userId}`,
              {
                status: 'active',
                role: STANDARD_ROLE_ID,
              },
              {
                headers: {
                  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                  "Content-Type": "application/json",
                },
              }
            )

            // If we have email and password from query params, try to login
            if (email && password) {
              const loginResult = await login(email, password)

              if (loginResult.success) {
                toast({
                  title: t("successfully") || "Successfully",
                  description: t("EmailVerifiedAndAccountActivated") || "Email verified and account activated successfully!",
                })
                
                // Redirect to custom URL if provided, otherwise to profile settings
                const redirectUrl = redirectTo || "/profile/settings/editProfile"
                setTimeout(() => {
                  router.push(redirectUrl)
                  router.refresh()
                }, 1500)
              } else {
                // User activated but login failed - redirect to login page or custom redirect
                toast({
                  title: t("successfully") || "Successfully",
                  description: t("EmailVerifiedPleaseLogin") || "Email verified! Please login to continue.",
                })
                const redirectUrl = redirectTo || "/auth/login"
                setTimeout(() => {
                  router.push(redirectUrl)
                  router.refresh()
                }, 1500)
              }
            } else {
              // User activated but no login credentials - redirect to login or custom redirect
              toast({
                title: t("successfully") || "Successfully",
                description: t("EmailVerifiedPleaseLogin") || "Email verified! Please login to continue.",
              })
              const redirectUrl = redirectTo || "/auth/login"
              setTimeout(() => {
                router.push(redirectUrl)
                router.refresh()
              }, 1500)
            }
          } catch (error) {
            console.error("Registration completion error:", error)
            setVerificationStatus("error")
            setErrorMessage(
              error.message || t("FailedToCompleteRegistration") || "Failed to complete registration. Please try logging in."
            )
            setIsCompletingRegistration(false)
          }
        } else {
          setVerificationStatus("error")
          setErrorMessage(
            verificationResult.error || t("EmailVerificationFailed") || "Email verification failed. Please try again."
          )
        }
      } catch (error) {
        console.error("Verification error:", error)
        setVerificationStatus("error")
        setErrorMessage(
          error.message || t("AnErrorOccurredDuringVerification") || "An error occurred during verification. Please try again."
        )
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [searchParams, router, toast, t])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <motion.div variants={iconVariants} className="flex justify-center">
              {verificationStatus === "verifying" || verificationStatus === "completing" ? (
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              ) : verificationStatus === "success" ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-destructive" />
              )}
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl font-bold">
                {verificationStatus === "verifying"
                  ? t("VerifyingEmail") || "Verifying Email..."
                  : verificationStatus === "completing"
                  ? t("CompletingRegistration") || "Completing Registration..."
                  : verificationStatus === "success"
                  ? t("EmailVerified") || "Email Verified!"
                  : t("VerificationFailed") || "Verification Failed"}
              </CardTitle>
              <CardDescription className="mt-2">
                {verificationStatus === "verifying"
                  ? t("PleaseWaitWhileWeVerifyYourEmail") || "Please wait while we verify your email address."
                  : verificationStatus === "completing"
                  ? t("SettingUpYourAccount") || "Setting up your account..."
                  : verificationStatus === "success"
                  ? t("YourEmailHasBeenSuccessfullyVerified") || "Your email has been successfully verified."
                  : errorMessage || t("SomethingWentWrong") || "Something went wrong."}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-4">
            <AnimatePresence mode="wait">
              {verificationStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-destructive font-medium">{errorMessage}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {verificationStatus === "success" && !isCompletingRegistration && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      {t("YouCanNowLogInToYourAccount") || "You can now log in to your account."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                      <Link href="/auth/login">
                        {t("GoToLogin") || "Go to Login"}
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/">
                        {t("GoToHome") || "Go to Home"}
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              )}

              {verificationStatus === "completing" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center space-y-4"
                >
                  <p className="text-sm text-muted-foreground">
                    {t("RedirectingToYourProfile") || "Redirecting to your profile..."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

