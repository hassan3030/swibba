"use client"
import { LoginForm } from "@/components/auth/login-form"
import { AnimatedBackground } from "@/components/auth/animated-background"
import Link from "next/link"
import { useTranslations } from "@/lib/use-translations"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const { t } = useTranslations()

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Form (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-16 relative z-10 bg-background dark:bg-gray-950 ">
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
              {t("Signinto") || "Sign in to"} <span className="text-primary">Swibba</span>
            </h2>
            <p className="text-muted-foreground">
              {t("Enteryourcredentialstoaccessyouraccount") || "Enter your credentials to access your account"}
            </p>
          </motion.div>

          {/* Login Form */}
          <LoginForm />
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
          <div className="text-center  mx-auto bg-slate-300/20 rounded-lg p-2">
            <h2 className="text-3xl font-bold drop-shadow-2xl  dark:text-white">
              {t("swibbaSlogan") || "Swap. Trade. Connect."}
            </h2>
          </div>
        </div>
      </div>
    </div>
  )
}
